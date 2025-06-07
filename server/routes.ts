import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import WebSocketManager from "./websocket";
import { 
  trainingSchedule,
  type User
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Training schedule endpoint for drill management
  app.post("/api/training-schedule", isAuthenticated, async (req: any, res) => {
    try {
      const scheduleEntry = req.body;
      const userId = req.user.claims.sub;
      
      // Store training schedule entry in database
      const result = await db.insert(trainingSchedule).values({
        userId: userId,
        drillName: scheduleEntry.drillName,
        sport: scheduleEntry.sport,
        targetArea: scheduleEntry.targetArea,
        priority: scheduleEntry.priority,
        scheduledDate: new Date(scheduleEntry.scheduledDate),
        status: 'scheduled',
        estimatedDuration: scheduleEntry.estimatedDuration,
        drillData: JSON.stringify(scheduleEntry)
      }).returning();

      res.json({ success: true, entry: result[0] });
    } catch (error) {
      console.error('Training schedule error:', error);
      res.status(500).json({ error: 'Failed to add drill to schedule' });
    }
  });

  // Get training schedule for authenticated user
  app.get("/api/training-schedule", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const schedule = await db.select().from(trainingSchedule).where(eq(trainingSchedule.userId, userId));
      res.json({ schedule });
    } catch (error) {
      console.error('Get schedule error:', error);
      res.status(500).json({ error: 'Failed to fetch training schedule' });
    }
  });

  // Protected route example for other authenticated endpoints
  app.get("/api/protected", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    res.json({ message: "Authenticated user", userId });
  });

  // Start WebSocket manager
  const httpServer = createServer(app);
  
  const wsManager = new WebSocketManager(httpServer);

  return httpServer;
}