const express = require("express");
const mysql = require("mysql2/promise");
const app = express();
const port = 3000;

// Database configuration
const dbConfig = {
  host: "localhost", // user ev for production
  user: "practice_user", //user ev for production
  password: "SecurePass123!", //user ev for production
  database: "practice_app", //user ev for production
};

let dbConnection;

// Create database connection pool
async function initDb() {
  try {
    dbConnection = await mysql.createConnection(dbConfig);
    console.log("Connected to MySQL database");
  } catch (err) {
    console.error("Database connection failed:", err);
    process.exit(1);
  }
}

// Health endpoint
app.get("/health", async (req, res) => {
  try {
    await dbConnection.ping();
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", database: "disconnected" });
  }
});

// Users endpoint
app.get("/users", async (req, res) => {
  try {
    const [rows] = await dbConnection.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Initialize and start server
initDb().then(() => {
  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
});

// Handle shutdown gracefully
process.on("SIGTERM", async () => {
  if (dbConnection) {
    await dbConnection.end();
    console.log("Database connection closed");
  }
  process.exit(1);
});
