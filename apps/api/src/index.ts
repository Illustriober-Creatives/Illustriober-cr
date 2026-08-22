/**
 * API Server Entry Point
 * Initializes Express server and database connections
 */

import { createServer } from "node:http";
import app from "./app";
import { initializeRealtime } from "./lib/realtime";

const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || "development";

if (NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET must be set in production");
  process.exit(1);
}

/**
 * Start the API server
 * Listen on configured port and log startup information
 */
const httpServer = createServer(app);
initializeRealtime(httpServer);

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                   🚀 API Server Ready                     ║
╠════════════════════════════════════════════════════════════╣
║ Environment:     ${NODE_ENV.padEnd(49)}║
║ Port:            ${String(PORT).padEnd(49)}║
║ URL:             http://localhost:${String(PORT).padEnd(39)}║
╚════════════════════════════════════════════════════════════╝
  `);
});
