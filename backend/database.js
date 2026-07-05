const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

// ============================================================
// FILE OPERATIONS
// ============================================================
function readJsonFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error(`❌ Error reading ${filePath}:`, error.message);
    return [];
  }
}

function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`❌ Error writing ${filePath}:`, error.message);
    return false;
  }
}

// ============================================================
// ARTICLE OPERATIONS
// ============================================================
function getAllArticles() {
  return readJsonFile(ARTICLES_FILE);
}

function getUnsyncedArticles() {
  const articles = getAllArticles();
  return articles.filter(a => a.synced === false);
}

function saveOrUpdateArticle(article) {
  const articles = readJsonFile(ARTICLES_FILE);
  const articleId = article.id;

  if (!articleId) {
    throw new Error("Article must have an 'id' field");
  }

  const index = articles.findIndex(a => a.id === articleId);
  const newRecord = {
    ...article,
    server_timestamp: new Date().toISOString()
  };

  if (index !== -1) {
    // Update existing
    const existingRecord = articles[index];
    const incomingTime = new Date(article.client_timestamp || 0).getTime();
    const existingTime = new Date(existingRecord.client_timestamp || 0).getTime();

    if (incomingTime >= existingTime) {
      articles[index] = { ...existingRecord, ...newRecord };
      console.log(`✅ [DB] Updated: ${articleId}`);
    } else {
      console.log(`⏳ [DB] Ignored stale update: ${articleId}`);
    }
  } else {
    // Insert new
    articles.push(newRecord);
    console.log(`🆕 [DB] Inserted: ${articleId}`);
  }

  writeJsonFile(ARTICLES_FILE, articles);
}

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  readJsonFile,
  writeJsonFile,
  getAllArticles,
  getUnsyncedArticles,
  saveOrUpdateArticle
};