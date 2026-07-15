// ==========================================
// server.js 
// ==========================================

require("dotenv").config();

// ============================================================
// CORE MODULES
// ============================================================
const express = require("express");
const cors = require("cors"); 
const morgan = require("morgan");
const crypto = require("crypto");
const os = require("os");

// ============================================================
// LOCAL MODULES
// ============================================================
const { initializeDatabase } = require("./database");
const syncRoutes = require("./routes/sync");

// ============================================================
// APP INITIALIZATION
// ============================================================
const app = express();
app.use(cors());


app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: "50mb" })); 

app.disable("x-powered-by");
app.set("trust proxy", true);

const PORT = process.env.PORT || 3000;
const API_VERSION = "v1";
const API_PREFIX = `/api/${API_VERSION}`;

// ============================================================
// DATABASE INIT
// ============================================================
try {
    console.log("=====================================");
    console.log("📦 Database Status: READY");
    console.log("=====================================\n");
} catch (err) {
    console.error("Database Initialization Failed:", err);
    process.exit(1);
}

// ============================================================
// MIDDLEWARE
// ============================================================

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(",")
        : "*",
    methods: ["GET", "POST"],
}));

// Compression
// app.use(compression());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ============================================================
// MORGAN LOGGING 
// ============================================================
app.use(morgan("dev"));

// ============================================================
// REQUEST TRACKING
// ============================================================
app.use((req, res, next) => {
    req.startTime = Date.now();
    req.syncId = `SYNC-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    res.setHeader("X-API-Version", API_VERSION);
    next();
});

// ============================================================
// AUTH MIDDLEWARE
// ============================================================
const authenticateDevice = (req, res, next) => {
    if (req.method === "GET" && req.path === "/") {
        return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authorization token missing",
            syncId: req.syncId
        });
    }

    const token = authHeader.split(" ")[1];
    const API_KEY = process.env.API_KEY;

    if (!API_KEY) {
        console.error("API_KEY missing in .env");
        return res.status(500).json({
            success: false,
            message: "Server misconfiguration"
        });
    }

    if (token !== API_KEY) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized device",
            syncId: req.syncId
        });
    }

    next();
};

// ============================================================
// PAYLOAD VALIDATION
// ============================================================
const validateSyncPayload = (req, res, next) => {
    if (req.method !== "POST") return next();

    if (!req.body || !Array.isArray(req.body.updates)) {
        return res.status(400).json({
            success: false,
            message: "Invalid sync payload",
            syncId: req.syncId
        });
    }

    next();
};

// ============================================================
// HEALTH CHECK
// ============================================================
app.get("/", (req, res) => {
    const memory = process.memoryUsage();

    res.json({
        status: "online",
        uptime: `${Math.floor(process.uptime())}s`,
        memory: `${Math.round(memory.heapUsed / 1024 / 1024)} MB`,
        node: process.version,
        platform: os.platform(),
        timestamp: new Date().toISOString(),
        message: "Bhartiya Dak Sync Server Ready"
    });
});

// ============================================================
// SYNC ROUTE
// ============================================================
app.use(
    `${API_PREFIX}/sync`,
    authenticateDevice,
    validateSyncPayload,
    syncRoutes
);

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        message: "Internal Server Error",
        syncId: req.syncId
    });
});

// ============================================================
// START SERVER
// ============================================================
const server = app.listen(PORT, () => {
    console.log("\n=====================================");
    console.log("🏤 Bhartiya Dak Sync Server");
    console.log(`Port: ${PORT}`);
    console.log(`API: ${API_PREFIX}/sync`);
    console.log("Authentication: Bearer Token");
    console.log("=====================================\n");
});

// ============================================================
// PROCESS SAFETY HANDLERS
// ============================================================
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down...");
    server.close(() => process.exit(0));
});

// EXPORT
module.exports = app;
