import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { INITIAL_PRODUCTS } from "./src/data";

import crypto from "crypto";

const app = express();
const PORT = 3000;
const PRODUCTS_FILE = path.join(process.cwd(), "products.json");
const FIREBASE_CONFIG_PATH = path.join(process.cwd(), "firebase-applet-config.json");

// Secure runtime session token generated on boot
const ADMIN_SESSION_TOKEN = crypto.randomUUID 
  ? crypto.randomUUID() 
  : crypto.randomBytes(32).toString("hex");

const DEFAULT_PASSWORD = "Dukkanda2Ali*Var";

app.use(express.json({ limit: "15mb" }));

// In-memory cache to preserve products during container scale-downs until Firestore is ready
let inMemoryProductsCache: any[] = [];

// Firestore DB reference (via firebase-admin)
let db: any = null;

async function initializeFirebase() {
  if (fs.existsSync(FIREBASE_CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, "utf-8"));
      
      // Initialize configuration parameters for firestore database
      const appInstance = admin.apps.length === 0 
        ? admin.initializeApp({ projectId: config.projectId })
        : admin.apps[0]!;
      
      if (config.firestoreDatabaseId) {
        db = getFirestore(appInstance, config.firestoreDatabaseId);
      } else {
        db = getFirestore(appInstance);
      }
      
      console.log("🔥 Successfully connected to Firebase Cloud Firestore for persistent storage via Admin SDK.");
      
      // Perform initial sync if needed
      await syncDatabaseOnStartup();
    } catch (err) {
      console.error("⚠️ Failed to initialize Firebase Firestore Admin SDK:", err);
    }
  } else {
    console.log("ℹ️ No Firebase config found. Running with local filesystem fallback.");
  }
}

async function syncDatabaseOnStartup() {
  if (db) {
    try {
      const docRef = db.collection("app_data").doc("products_catalog");
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        console.log("Database catalog is empty. Migrating local data to cloud...");
        let seedData = INITIAL_PRODUCTS;
        if (fs.existsSync(PRODUCTS_FILE)) {
          const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            seedData = parsed;
          }
        }
        await saveProductsToCloudAndLocal(seedData);
      } else {
        const data = docSnap.data();
        if (data && Array.isArray(data.products)) {
          inMemoryProductsCache = data.products;
          // Sync back to local file so backups are kept matching the cloud.
          fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data.products, null, 2), "utf-8");
          console.log(`Loaded ${data.products.length} products successfully from Cloud Firestore.`);
        }
      }
    } catch (e) {
      console.error("Startup database sync failed:", e);
    }
  }
}

// Read products
async function getProducts() {
  if (db) {
    try {
      const docRef = db.collection("app_data").doc("products_catalog");
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data && Array.isArray(data.products)) {
          inMemoryProductsCache = data.products;
          return data.products;
        }
      }
    } catch (err) {
      console.error("Error reading from Firestore via Admin SDK:", err);
    }
  }

  // Memory fallback
  if (inMemoryProductsCache.length > 0) {
    return inMemoryProductsCache;
  }

  // File fallback
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryProductsCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading products file:", err);
  }

  // Default seed fallback
  inMemoryProductsCache = INITIAL_PRODUCTS;
  return INITIAL_PRODUCTS;
}

// Save products
async function saveProductsToCloudAndLocal(products: any[]) {
  inMemoryProductsCache = products;

  // Cloud
  if (db) {
    try {
      const docRef = db.collection("app_data").doc("products_catalog");
      await docRef.set({ products, updatedAt: new Date().toISOString() });
      console.log("Cloud Firestore synchronized successfully using Admin SDK.");
    } catch (err) {
      console.error("Error saving to Firestore via Admin SDK:", err);
    }
  }

  // Local
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error writing products file:", err);
    return false;
  }
}

// API Routes
app.get("/api/products", async (req, res) => {
  const currentCatalog = await getProducts();
  res.json(currentCatalog);
});

// Admin login verification with secure env-backed authentication
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const targetPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  
  if (password === targetPassword) {
    res.json({ success: true, token: ADMIN_SESSION_TOKEN });
  } else {
    res.status(401).json({ success: false, error: "Şifre hatalı! Lütfen doğru şifreyi giriniz veya sistem yöneticinizle irtibata geçiniz." });
  }
});

// Admin session token verification
app.get("/api/admin/verify", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${ADMIN_SESSION_TOKEN}`) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

app.post("/api/products", async (req, res) => {
  // Validate token payload before handling catalogs
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SESSION_TOKEN}`) {
    return res.status(401).json({ error: "Yetkisiz işlem! Lütfen admin paneline tekrar giriş yapınız." });
  }

  const products = req.body;
  if (!Array.isArray(products)) {
    return res.status(400).json({ error: "Invalid products list" });
  }
  const success = await saveProductsToCloudAndLocal(products);
  if (success) {
    res.json({ message: "Products updated successfully", products });
  } else {
    res.status(500).json({ error: "Failed to save products" });
  }
});

async function startServer() {
  await initializeFirebase();

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
