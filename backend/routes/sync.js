const express = require("express");
const router = express.Router();
const { getAllArticles, saveOrUpdateArticle, getUnsyncedArticles } = require("../database");

// ============================================================
// MIDDLEWARE: Authentication
// ============================================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const expectedToken = process.env.API_KEY || "bhartiya_dak_demo_token_2024";

  if (!token) {
    return res.status(401).json({ success: false, message: "Authorization token missing" });
  }

  if (token !== expectedToken) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }

  next();
};

// ============================================================
// GET ARTICLES (Frontend downloads articles on login)
// ============================================================
router.get("/articles", (req, res) => {
  try {
    const articles = getAllArticles();
    res.json({
        success: true,
        data: articles 
    });
  } catch (error) {
    console.error("❌ Failed to load articles:", error.message);
    res.status(500).json({ success: false, message: "Failed to load articles" });
  }
});

// ============================================================
// POST SYNC (Frontend uploads offline deliveries)
// ============================================================
router.post("/", authenticateToken, (req, res) => {
  try {
    const { updates } = req.body;

    if (!Array.isArray(updates)) {
      return res.status(400).json({ success: false, message: "Updates must be an array" });
    }

    console.log(`📦 Sync batch received: ${updates.length} items`);

    let successCount = 0;
    let failedCount = 0;

    for (const update of updates) {
      try {
        saveOrUpdateArticle(update);
        successCount++;
        console.log(`✅ Synced: ${update.id}`);
      } catch (err) {
        failedCount++;
        console.error(`❌ Failed to sync ${update.id}:`, err.message);
      }
    }

    res.json({
      success: true,
      message: "Sync completed",
      successCount,
      failedCount
    });
  } catch (error) {
    console.error("❌ Sync error:", error.message);
    res.status(500).json({ success: false, message: "Sync failed" });
  }
});

module.exports = router;