// ==========================================
// db.js — Data Layer (IndexedDB)
// Acts as the Local Backend for Offline-First operations
// ==========================================

const DB_NAME = "IndiaPostDB";
const DB_VERSION = 2;
const STORE_NAME = "Articles";

let dbInstance = null;

// ── 1. CORE DATABASE CONNECTION & MIGRATION ────────────────
function openDB() {
    return new Promise((resolve, reject) => {
        if (dbInstance) return resolve(dbInstance);

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Fresh installation
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                store.createIndex("status", "status", { unique: false });
                store.createIndex("synced", "synced", { unique: false });
            } else {
                // Migration for existing users upgrading to Phase 5
                const store = event.target.transaction.objectStore(STORE_NAME);
                if (!store.indexNames.contains("synced")) {
                    store.createIndex("synced", "synced", { unique: false });
                }
            }
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            resolve(dbInstance);
        };
        
        request.onerror = (event) => reject(event.target.error);
    });
}

// Called once by app.js on startup.
async function initDB() {
    try {
        dbInstance = await openDB();
        console.log("✅ IndiaPostDB ready");
    } catch (err) {
        console.error("❌ Database failed to open:", err);
    }
}

// ── 2. CRUD OPERATIONS ───────────────────────────────────────
async function saveArticle(article) {
        // Add the timestamp right before saving
    article.client_timestamp = new Date().toISOString();

    // Automatic sync flag normalization
    if (typeof article.synced !== "boolean") {
        article.synced = false;
    }
 

    const db = dbInstance || await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(article);
        tx.oncomplete = () => resolve(true);
        tx.onerror    = (e) => reject(e.target.error);
    });
}

async function getAllArticles() {
    const db = dbInstance || await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).getAll();
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror   = (e) => reject(e.target.error);
    });
}

async function getArticleById(id) {
    const db = dbInstance || await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(id);
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror   = (e) => reject(e.target.error);
    });
}

async function updateArticleStatus(id, newStatus, extra = {}) {
    const db = dbInstance || await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
            const article = getReq.result;
            if (!article) return reject(new Error("Article not found: " + id));
            
            article.status = newStatus;
            Object.assign(article, extra); 
            
            // 🟢 CORRECT: Add the timestamp here, right before saving!
            article.client_timestamp = new Date().toISOString();
            
            store.put(article);
        };

        tx.oncomplete = () => resolve(true);
        tx.onerror    = (e) => reject(e.target.error);
    });
}

// Required for Phase 5 Background Synchronization
async function getUnsyncedArticles() {
    const db = dbInstance || await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).getAll();

        request.onsuccess = (e) => {
            const records = e.target.result.filter(
                article => article.synced !== true
            );
            resolve(records);
        };

        request.onerror = (e) => reject(e.target.error);
    });
}

// Administrative / Cleanup function
async function deleteArticle(id) {
    const db = dbInstance || await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
    });
}

// ── 3. DATA SEEDING ──────────────────────────────────────────
async function seedDatabase() {
    try {
        const existingArticles = await getAllArticles();
        if (existingArticles.length === 0) {
            console.log("🌱 Database is empty. Injecting mock articles...");
            
            const mockArticles = [
                { id: "RN123456789IN", recipientName: "Rahul Sharma", address: "12 MG Road, Guwahati", status: "Pending", articleType: "Parcel", synced: false },
                { id: "RN987654321IN", recipientName: "Priya Das", address: "45 Hill View, Assam", status: "Pending", articleType: "Speed Post", synced: false },
                { id: "RN555555555IN", recipientName: "Amit Kumar", address: "78 River Side", status: "Delivered", articleType: "Letter", deliveryTime: new Date().toLocaleString(), synced: false }
            ];

            for (const article of mockArticles) {
                await saveArticle(article);
            }
            console.log("✅ Mock data seeded successfully!");
        } else {
            // console.log("⚡ Database already contains data. Skipping seed.");
        }
    } catch (error) {
        console.error("❌ Error seeding database:", error);
    }
}

// ── 4. GLOBAL EXPORTS ────────────────────────────────────────
window.initDB = initDB;
window.saveArticle = saveArticle;
window.getAllArticles = getAllArticles;
window.getArticleById = getArticleById;
window.updateArticleStatus = updateArticleStatus;
window.getUnsyncedArticles = getUnsyncedArticles;
window.deleteArticle = deleteArticle;
window.seedDatabase = seedDatabase;

// ── 5. AUTH TOKEN MANAGEMENT (new) ───────────────────────────
function initializeAuthToken() {
    let token = localStorage.getItem('apiToken');
    if (!token) {
        token = 'bhartiya_dak_demo_token_1010';
        localStorage.setItem('apiToken', token);
        console.log('✅ Auth token initialized');
    }
    return token;
}

function getAuthToken() {
    return localStorage.getItem('apiToken') || 'bhartiya_dak_demo_token_1010';
}

function setAuthToken(token) {
    if (token) {
        localStorage.setItem('apiToken', token);
    }
}

window.initializeAuthToken = initializeAuthToken;
window.getAuthToken = getAuthToken;
window.setAuthToken = setAuthToken;