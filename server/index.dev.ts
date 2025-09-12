import { createServer } from "http";
import { WebSocketServer } from "ws";
import express from "express";

const port = parseInt(process.env.PORT || "5001", 10);
const dev = process.env.NODE_ENV !== "production";

async function startServer() {
  try {
    console.log(`Starting development server on port ${port}...`);
    
    const app = express();
    app.use(express.json());
    app.use(express.static('dist/public'));
    
    const server = createServer(app);
    
    // Add WebSocket support for real-time AR
    const wss = new WebSocketServer({ server });
    
    wss.on("connection", (ws) => {
      console.log("WebSocket connection established for AR analysis");
      
      ws.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.type === "ar_analysis") {
            // Echo back for development
            ws.send(JSON.stringify({
              type: "analysis_result",
              sport: message.sport,
              score: Math.random() * 100,
              timestamp: new Date().toISOString()
            }));
          }
        } catch (error) {
          console.error("WebSocket message error:", error);
        }
      });
      
      ws.on("close", () => {
        console.log("WebSocket connection closed");
      });
    });

    server.listen(port, "0.0.0.0", () => {
      console.log(`> Ready on http://0.0.0.0:${port}`);
      console.log(`> WebSocket server ready for AR analysis`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1);
  }
}

startServer();