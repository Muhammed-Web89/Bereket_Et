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
const SETTINGS_FILE = path.join(process.cwd(), "settings.json");
const FIREBASE_CONFIG_PATH = path.join(process.cwd(), "firebase-applet-config.json");

// Secure runtime session token generated on boot
const ADMIN_SESSION_TOKEN = crypto.randomUUID 
  ? crypto.randomUUID() 
  : crypto.randomBytes(32).toString("hex");

const DEFAULT_PASSWORD = "Dukkanda2Ali*Var";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));

// Robust, concurrency-safe lazy Firebase initializer for serverless/Vercel environments
let isFirebaseInitialized = false;
let firebaseInitializationPromise: Promise<void> | null = null;

app.use(async (req, res, next) => {
  // Only intercept requests starting with /api
  if (req.path.startsWith("/api") && !isFirebaseInitialized) {
    if (!firebaseInitializationPromise) {
      console.log("🔄 Lazy-initializing Firebase on first request...");
      firebaseInitializationPromise = initializeFirebase()
        .then(() => {
          isFirebaseInitialized = true;
          console.log("✅ Lazy Firebase initialization completed successfully.");
        })
        .catch((err) => {
          console.error("⚠️ Lazy Firebase initialization failed:", err);
          firebaseInitializationPromise = null; // Reset to allow retry on next request
        });
    }
    await firebaseInitializationPromise;
  }
  next();
});

// In-memory cache to preserve products
let inMemoryProductsCache: any[] = [];
let googleSheetsUrl = "https://docs.google.com/spreadsheets/d/1GUwZi9B0wURZko69hHtMWpSFjOOfFleOHz18iDTJ8T8/export?format=csv";
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute automatic cache TTL

// Firestore DB reference (via firebase-admin)
let db: any = null;

// Robust CSV parser supporting quotes, languages, and regional settings
function parseCSV(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/);
  if (lines.length === 0) return [];

  // Find the header row
  let headerIndex = -1;
  let headers: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = splitCSVLine(line).map(c => c.toLowerCase().trim());
    const isHeader = cols.some(col => 
      col === 'id' || col === 'name' || col === 'price' || col === 'category' || col === 'instock' || col === 'unit' || col === 'description' || col === 'image' ||
      col === 'adı' || col === 'fiyat' || col === 'kategori' || col === 'stok' || col === 'resim' || col === 'açıklama' || col === 'birim' ||
      col === 'название' || col === 'цена' || col === 'категория' || col === 'в наличии' || col === 'описание' || col === 'единица'
    );
    
    if (isHeader) {
      headerIndex = i;
      headers = cols;
      break;
    }
  }

  let startIndex = 0;
  if (headerIndex !== -1) {
    startIndex = headerIndex + 1;
  } else {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() && lines[i].replace(/,/g, '').trim()) {
        startIndex = i;
        break;
      }
    }
  }

  const products: any[] = [];

  const getColIndex = (names: string[], defaultIdx: number): number => {
    if (headerIndex === -1) return defaultIdx;
    for (const name of names) {
      const idx = headers.findIndex(h => h.includes(name));
      if (idx !== -1) return idx;
    }
    return defaultIdx;
  };

  const idIdx = getColIndex(['id'], 0);
  const nameIdx = getColIndex(['name', 'adı', 'название', 'ürün'], 1);
  const priceIdx = getColIndex(['price', 'fiyat', 'цена', 'tutar'], 2);
  const categoryIdx = getColIndex(['category', 'kategori', 'категория', 'bölüm'], 3);
  const imageIdx = getColIndex(['image', 'resim', 'картинка', 'görsel', 'foto'], 4);
  const inStockIdx = getColIndex(['instock', 'stok', 'в наличии', 'stokta'], 5);
  const unitIdx = getColIndex(['unit', 'birim', 'единица', 'ölçü'], 6);
  const descIdx = getColIndex(['description', 'açıklama', 'описание', 'detay'], 7);

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || !line.replace(/,/g, '').trim()) continue;

    const cleanedValues = splitCSVLine(line);
    if (cleanedValues.length < 2) continue;

    const name = cleanedValues[nameIdx] || "";
    if (!name) continue;

    const rawId = cleanedValues[idIdx] || "";
    const id = rawId ? rawId.toLowerCase().replace(/\s+/g, '_') : `gs_${i}`;
    
    let rawPrice = cleanedValues[priceIdx] || "0";
    rawPrice = rawPrice.replace(/\s/g, '').replace(/,/g, '.');
    const price = parseFloat(rawPrice.replace(/[^0-9.]/g, "")) || 0;
    
    const category = cleanedValues[categoryIdx]?.toLowerCase().trim() || "diğer";
    
    let image = cleanedValues[imageIdx] || "";
    if (!image) {
      const n = name.toLowerCase();
      if (n.includes("kıyma") || n.includes("kiym")) {
        image = "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80";
      } else if (n.includes("kuşbaşı") || n.includes("kusbasi")) {
        image = "https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80";
      } else if (n.includes("antrikot") || n.includes("antrecot")) {
        image = "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=600&auto=format&fit=crop&q=80";
      } else if (n.includes("bonfile")) {
        image = "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80";
      } else if (n.includes("köfte") || n.includes("kofte")) {
        image = "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&auto=format&fit=crop&q=80";
      } else if (n.includes("sucuk")) {
        image = "https://images.unsplash.com/photo-1534124414484-14d9e076151d?w=600&auto=format&fit=crop&q=80";
      } else if (n.includes("kuzu") || n.includes("lamb")) {
        image = "https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=600&auto=format&fit=crop&q=80";
      } else if (n.includes("tavuk") || n.includes("piliç") || n.includes("chicken")) {
        image = "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=600&auto=format&fit=crop&q=80";
      } else {
        image = "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80";
      }
    }

    const rawInStock = cleanedValues[inStockIdx]?.toLowerCase().trim();
    const inStock = rawInStock === undefined || rawInStock === "" || 
                    rawInStock === "var" || rawInStock === "да" || rawInStock === "yes" || rawInStock === "true" || rawInStock === "1" || rawInStock === "aktif";
    
    const unit = cleanedValues[unitIdx] || "Kg";
    const description = cleanedValues[descIdx] || `${name} - taze helal et dünyası kalitesiyle kapınızda.`;

    products.push({
      id,
      name,
      price,
      category,
      image,
      inStock,
      unit,
      description
    });
  }

  return products;
}

function splitCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentVal = "";
  let inQuotes = false;
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(currentVal.trim());
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  values.push(currentVal.trim());

  return values.map(v => {
    let val = v;
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    return val.trim();
  });
}

async function loadSettingsOnStartup() {
  // Load local file fallback
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      googleSheetsUrl = data.googleSheetsUrl || "";
    } catch (e) {
      console.error("⚠️ Failed to read local settings.json:", e);
    }
  }

  // Load from firestore
  if (db) {
    try {
      const docRef = db.collection("app_data").doc("settings");
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        const data = docSnap.data();
        if (data && data.googleSheetsUrl !== undefined) {
          googleSheetsUrl = data.googleSheetsUrl;
          // sync to local file
          fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ googleSheetsUrl }, null, 2), "utf-8");
          console.log("🔥 Loaded configurations from Firestore. Google Sheets URL length:", googleSheetsUrl.length);
        }
      }
    } catch (e) {
      console.error("⚠️ Failed to load settings from Firestore:", e);
    }
  }
}

async function saveSettings(url: string) {
  googleSheetsUrl = url;
  
  // Save local
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ googleSheetsUrl }, null, 2), "utf-8");
  } catch (e) {
    console.error("⚠️ Error writing local settings file:", e);
  }

  // Save cloud
  if (db) {
    try {
      const docRef = db.collection("app_data").doc("settings");
      await docRef.set({ googleSheetsUrl, updatedAt: new Date().toISOString() });
      console.log("🔥 Persistent configuration saved successfully in Cloud Firestore.");
    } catch (e) {
      console.error("⚠️ Error saving settings to Firestore:", e);
    }
  }
  
  // Flush products cache so it pulls fresh on next request
  inMemoryProductsCache = [];
  lastFetchTime = 0;
}

async function initializeFirebase() {
  if (fs.existsSync(FIREBASE_CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(FIREBASE_CONFIG_PATH, "utf-8"));
      
      let adminConfig: admin.AppOptions = {
        projectId: config.projectId,
      };

      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
          const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
          adminConfig.credential = admin.credential.cert(serviceAccount);
          console.log("🔑 Using service account credentials from FIREBASE_SERVICE_ACCOUNT environment variable.");
        } catch (e) {
          console.error("⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", e);
        }
      }

      const appInstance = admin.apps.length === 0 
        ? admin.initializeApp(adminConfig)
        : admin.apps[0]!;
      
      if (config.firestoreDatabaseId) {
        db = getFirestore(appInstance, config.firestoreDatabaseId);
      } else {
        db = getFirestore(appInstance);
      }
      
      console.log("🔥 Successfully connected to Firebase Cloud Firestore for persistent storage.");
    } catch (err) {
      console.error("⚠️ Failed to initialize Firebase Firestore Admin SDK:", err);
    }
  } else {
    console.log("ℹ️ No Firebase config found. Running with local filesystem fallback.");
  }

  // Load configuration and sync on startup
  await loadSettingsOnStartup();
  await syncDatabaseOnStartup();
}

async function syncDatabaseOnStartup() {
  // Try to pull Google Sheets immediately if configured
  if (googleSheetsUrl) {
    try {
      console.log("🔄 Startup sync: Fetching products from Google Sheets...");
      const response = await fetch(googleSheetsUrl);
      if (response.ok) {
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        if (parsed.length > 0) {
          inMemoryProductsCache = parsed;
          lastFetchTime = Date.now();
          await saveProductsToCloudAndLocal(parsed);
          console.log(`✅ Loaded ${parsed.length} products on startup from Google Sheets.`);
          return;
        }
      }
    } catch (e) {
      console.error("⚠️ Failed startup fetch from Google Sheets:", e);
    }
  }

  // Fallback to local files or Cloud Firestore
  if (db) {
    try {
      const docRef = db.collection("app_data").doc("products_catalog");
      const docSnap = await docRef.get();
      if (!docSnap.exists) {
        console.log("Database catalog is empty. Migrating local seed catalog...");
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
          fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(data.products, null, 2), "utf-8");
          console.log(`Loaded ${data.products.length} products successfully from Cloud Firestore Cache.`);
        }
      }
    } catch (e) {
      console.error("Startup database sync failed:", e);
    }
  } else {
    // Local filesystem sync only
    if (fs.existsSync(PRODUCTS_FILE)) {
      try {
        const data = fs.readFileSync(PRODUCTS_FILE, "utf-8");
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          inMemoryProductsCache = parsed;
          console.log(`Loaded ${parsed.length} products successfully from local fallback file.`);
        }
      } catch (e) {
        console.error("Local file startup read failed:", e);
      }
    }
  }

  if (inMemoryProductsCache.length === 0) {
    inMemoryProductsCache = INITIAL_PRODUCTS;
  }
}

// Fetch products logic
async function getProducts() {
  const now = Date.now();
  const isCacheExpired = (now - lastFetchTime) > CACHE_TTL_MS;

  if (googleSheetsUrl && (inMemoryProductsCache.length === 0 || isCacheExpired)) {
    try {
      console.log("🔄 Fetching products catalog from Google Sheets...");
      const response = await fetch(googleSheetsUrl);
      if (response.ok) {
        const csvText = await response.text();
        const parsed = parseCSV(csvText);
        if (parsed.length > 0) {
          inMemoryProductsCache = parsed;
          lastFetchTime = now;
          await saveProductsToCloudAndLocal(parsed);
          return parsed;
        }
      }
    } catch (err) {
      console.error("⚠️ Failed to fetch products from Google Sheets, using cache fallback:", err);
    }
  }

  if (inMemoryProductsCache.length > 0) {
    return inMemoryProductsCache;
  }

  // Database fallback
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
      console.error("Error reading from Firestore:", err);
    }
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

  inMemoryProductsCache = INITIAL_PRODUCTS;
  return INITIAL_PRODUCTS;
}

// Save products to local & Cloud
async function saveProductsToCloudAndLocal(products: any[]) {
  inMemoryProductsCache = products;

  // Cloud
  if (db) {
    try {
      const docRef = db.collection("app_data").doc("products_catalog");
      await docRef.set({ products, updatedAt: new Date().toISOString() });
    } catch (err) {
      console.error("Error saving to Firestore:", err);
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

// Admin login verification
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;
  const targetPassword = process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
  
  if (password === targetPassword) {
    res.json({ success: true, token: ADMIN_SESSION_TOKEN });
  } else {
    res.status(401).json({ success: false, error: "Şifre hatalı! Lütfen doğru şifreyi giriniz." });
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

// GET configuration settings
app.get("/api/admin/config", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SESSION_TOKEN}`) {
    return res.status(401).json({ error: "Yetkisiz işlem!" });
  }
  res.json({ googleSheetsUrl });
});

// POST configuration settings
app.post("/api/admin/config", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SESSION_TOKEN}`) {
    return res.status(401).json({ error: "Yetkisiz işlem!" });
  }

  const { googleSheetsUrl: newUrl } = req.body;
  await saveSettings(newUrl || "");
  res.json({ success: true, googleSheetsUrl });
});

// POST upload image
app.post("/api/admin/upload-image", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SESSION_TOKEN}`) {
    return res.status(401).json({ error: "Yetkisiz işlem!" });
  }

  const { image, name } = req.body;
  if (!image) {
    return res.status(400).json({ error: "Görsel verisi eksik!" });
  }

  try {
    // Expecting base64 string: "data:image/jpeg;base64,..."
    const matches = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: "Geçersiz görsel biçimi!" });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    // Determine extension
    let extension = "jpg";
    if (mimeType.includes("png")) extension = "png";
    else if (mimeType.includes("webp")) extension = "webp";
    else if (mimeType.includes("gif")) extension = "gif";
    else if (mimeType.includes("svg")) extension = "svg";

    // Clean name
    const cleanName = (name || "product")
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 30);
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const filename = `${cleanName}_${Date.now()}_${uniqueId}.${extension}`;
    const filePath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    // Return the relative URL (will work perfectly on current host)
    const relativeUrl = `/uploads/${filename}`;
    res.json({ success: true, url: relativeUrl, filename });
  } catch (err: any) {
    console.error("❌ Image upload failed:", err);
    res.status(500).json({ error: "Görsel kaydedilirken bir hata oluştu!" });
  }
});

// POST manual synchronization trigger
app.post("/api/admin/sync", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SESSION_TOKEN}`) {
    return res.status(401).json({ error: "Yetkisiz işlem!" });
  }

  try {
    if (!googleSheetsUrl) {
      return res.status(400).json({ error: "Google Sheets URL'si henüz yapılandırılmamış!" });
    }

    console.log("🔄 Manual trigger sync initiated...");
    const response = await fetch(googleSheetsUrl);
    if (!response.ok) {
      throw new Error(`Google Sheets HTTP Error: ${response.statusText}`);
    }
    const csvText = await response.text();
    const parsed = parseCSV(csvText);
    if (parsed.length === 0) {
      throw new Error("Tablodan hiçbir ürün ayrıştırılamadı. Sütun adlarını kontrol edin.");
    }
    
    inMemoryProductsCache = parsed;
    lastFetchTime = Date.now();
    await saveProductsToCloudAndLocal(parsed);

    res.json({ success: true, count: parsed.length, products: parsed });
  } catch (err: any) {
    console.error("❌ Sync trigger failed:", err);
    res.status(500).json({ error: err.message || "Eşitleme sırasında bilinmeyen bir hata oluştu." });
  }
});

app.post("/api/products", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${ADMIN_SESSION_TOKEN}`) {
    return res.status(401).json({ error: "Yetkisiz işlem!" });
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
  isFirebaseInitialized = true;

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

if (!process.env.VERCEL) {
  startServer();
}

export default app;
