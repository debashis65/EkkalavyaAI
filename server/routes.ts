import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertSessionSchema, 
  insertReviewSchema,
  insertPerformanceMetricSchema,
  insertTrainingSessionSchema,
  insertARMetricSchema,
  insertAchievementSchema
} from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handler for Zod validation errors
  const handleZodError = (error: unknown) => {
    if (error instanceof ZodError) {
      return { message: "Validation error", errors: error.errors };
    }
    
    if (error instanceof Error) {
      return { message: error.message };
    }
    
    return { message: "An unknown error occurred" };
  };

  // ===== User Routes =====
  
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Create new user
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // Update user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // ===== Session Routes =====
  
  // Get all sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });
  
  // Get sessions by user ID (either coach or athlete)
  app.get("/api/users/:userId/sessions", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const role = req.query.role as string;
      
      if (role === 'coach') {
        const sessions = await storage.getSessionsByCoach(userId);
        return res.json(sessions);
      } else if (role === 'athlete') {
        const sessions = await storage.getSessionsByAthlete(userId);
        return res.json(sessions);
      }
      
      const sessions = await storage.getSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });
  
  // Create new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const newSession = await storage.createSession(sessionData);
      res.status(201).json(newSession);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // Update session status
  app.patch("/api/sessions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = z.object({ status: z.enum(['upcoming', 'completed', 'cancelled']) }).parse(req.body);
      
      const updatedSession = await storage.updateSessionStatus(id, status);
      
      if (!updatedSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(updatedSession);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // ===== Review Routes =====
  
  // Get reviews for a coach
  app.get("/api/coaches/:coachId/reviews", async (req, res) => {
    try {
      const coachId = parseInt(req.params.coachId);
      const reviews = await storage.getReviewsByCoach(coachId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });
  
  // Create a new review
  app.post("/api/reviews", async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const newReview = await storage.createReview(reviewData);
      res.status(201).json(newReview);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // ===== Performance Metrics Routes =====
  
  // Get performance metrics for an athlete
  app.get("/api/athletes/:athleteId/metrics", async (req, res) => {
    try {
      const athleteId = parseInt(req.params.athleteId);
      const metrics = await storage.getPerformanceMetricsByAthlete(athleteId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });
  
  // Create a new performance metric
  app.post("/api/metrics", async (req, res) => {
    try {
      const metricData = insertPerformanceMetricSchema.parse(req.body);
      const newMetric = await storage.createPerformanceMetric(metricData);
      res.status(201).json(newMetric);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // ===== Training Session Routes =====
  
  // Get training sessions for an athlete
  app.get("/api/athletes/:athleteId/training", async (req, res) => {
    try {
      const athleteId = parseInt(req.params.athleteId);
      const trainingSessions = await storage.getTrainingSessionsByAthlete(athleteId);
      res.json(trainingSessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training sessions" });
    }
  });
  
  // Create a new training session
  app.post("/api/training", async (req, res) => {
    try {
      const trainingData = insertTrainingSessionSchema.parse(req.body);
      const newTraining = await storage.createTrainingSession(trainingData);
      res.status(201).json(newTraining);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // ===== AR Metrics Routes =====
  
  // Get AR metrics for a user
  app.get("/api/users/:userId/ar-metrics", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const arMetrics = await storage.getARMetricsByUser(userId);
      res.json(arMetrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AR metrics" });
    }
  });
  
  // Create a new AR metric
  app.post("/api/ar-metrics", async (req, res) => {
    try {
      const arMetricData = insertARMetricSchema.parse(req.body);
      const newARMetric = await storage.createARMetric(arMetricData);
      res.status(201).json(newARMetric);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // ===== Achievement Routes =====
  
  // Get achievements for a user
  app.get("/api/users/:userId/achievements", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getAchievementsByUser(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });
  
  // Create a new achievement
  app.post("/api/achievements", async (req, res) => {
    try {
      const achievementData = insertAchievementSchema.parse(req.body);
      const newAchievement = await storage.createAchievement(achievementData);
      res.status(201).json(newAchievement);
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // ===== Authentication Routes =====
  
  // Login route
  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string().min(6)
      }).parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would create a session or JWT token here
      
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });
  
  // Register route
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists with this email" });
      }
      
      const newUser = await storage.createUser(userData);
      
      res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });
    } catch (error) {
      res.status(400).json(handleZodError(error));
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
