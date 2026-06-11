import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to read DB state
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return null;
  }
  try {
    const content = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading db file, using default:", err);
    return null;
  }
}

// Helper to write DB state
function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing db file:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set rich content limits for file and gallery base64 image streams
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Get synced state
  app.get("/api/state", (req, res) => {
    const db = readDb();
    res.json(db || { status: "empty" });
  });

  // Save/Update synced state
  app.post("/api/state", (req, res) => {
    const currentState = readDb() || {};
    const newState = {
      ...currentState,
      ...req.body,
    };
    writeDb(newState);
    res.json({ success: true });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

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
    console.log(`Label Swati live server running on port ${PORT}`);
  });
}

startServer();
