// ============================================================
// dataStore.js — The JSON Database Manager
// Safely reads and writes to your local JSON files
// ============================================================
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log("📁 [System] Created missing 'data' directory for local storage!");
}

// ── 1. Read Data Safely ──────────────────────────────────────
function readJsonFile(fileName) {
    const filePath = path.join(DATA_DIR, fileName);
    try {
        if (!fs.existsSync(filePath)) return [];
        const content = fs.readFileSync(filePath, "utf8");
        return JSON.parse(content || "[]");
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return [];
    }
}

// ── 2. Write Data Safely ─────────────────────────────────────
function writeJsonFile(fileName, data) {
    const filePath = path.join(DATA_DIR, fileName);
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
        return true;
    } catch (error) {
        console.error(`Error writing to ${fileName}:`, error);
        return false;
    }
}

// Export the secure functions so seed.js and syncRoutes.js can use them
module.exports = { readJsonFile, writeJsonFile };