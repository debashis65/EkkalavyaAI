import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import WebSocketManager from "./websocket";
import { eq, desc, and } from "drizzle-orm";
import { unityArRouter } from "./routes/unity-ar";
import { adminUnityArRouter } from "./routes/admin-unity-ar";
import roomModeSyncRouter from "./routes/room-mode-sync";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for Render
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // API Health check
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      service: 'Ekkalavya Web Platform',
      backend_connected: true,
      timestamp: new Date().toISOString() 
    });
  });

  // ============ AI BACKEND PROXY ROUTES ============
  
  // Sports listing from AI backend
  app.get('/api/sports', async (req, res) => {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('http://localhost:8000/sports');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching sports from AI backend:", error);
      res.status(503).json({ error: "AI backend unavailable" });
    }
  });

  // Analysis endpoint proxy
  app.post('/api/analyze', async (req: any, res) => {
    try {
      const fetch = (await import('node-fetch')).default;
      const FormData = (await import('form-data')).default;
      
      const formData = new FormData();
      if (req.body.sport) formData.append('sport', req.body.sport);
      if (req.body.analysis_type) formData.append('analysis_type', req.body.analysis_type);
      if (req.file && req.file.buffer) formData.append('file', req.file.buffer, req.file.originalname);
      
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error analyzing with AI backend:", error);
      res.status(503).json({ error: "Analysis service unavailable" });
    }
  });

  // WebSocket analysis proxy
  app.get('/api/analyze-websocket', async (req, res) => {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('http://localhost:8000/ws/analyze');
      res.json({ websocket_url: 'ws://localhost:8000/ws/analyze' });
    } catch (error) {
      console.error("Error connecting to AI backend websocket:", error);
      res.status(503).json({ error: "WebSocket service unavailable" });
    }
  });

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

  // Traditional authentication endpoints (complement OAuth)
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Note: In a real app, use bcrypt to verify password hash
      // For now, comparing directly (implement proper password hashing)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Create session data mimicking OAuth structure
      req.session.user = {
        claims: { sub: user.id, email: user.email, name: user.name },
        access_token: `traditional_auth_${Date.now()}`,
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      };

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        message: "Login successful"
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post('/api/auth/register', async (req: any, res) => {
    try {
      const { name, email, password, role } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email, and password are required" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }

      // Create new user
      const newUser = await storage.upsertUser({
        name,
        username: email.split('@')[0], // Use email prefix as username
        email,
        password, // Note: In production, hash this with bcrypt
        role: role || 'athlete',
        profileImageUrl: null,
      });

      // Create session
      req.session.user = {
        claims: { sub: newUser.id, email: newUser.email, name: newUser.name },
        access_token: `traditional_auth_${Date.now()}`,
        expires_at: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
      };

      res.status(201).json({
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        },
        message: "Registration successful"
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post('/api/auth/logout', async (req: any, res) => {
    try {
      req.session.destroy((err: any) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "Logout successful" });
      });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Logout failed" });
    }
  });

  app.post('/api/auth/verify-2fa', async (req: any, res) => {
    try {
      const { code, userId } = req.body;
      
      if (!code || !userId) {
        return res.status(400).json({ message: "Code and user ID are required" });
      }

      // For now, accept any 6-digit code (implement real 2FA later)
      if (!/^\d{6}$/.test(code)) {
        return res.status(400).json({ message: "Invalid code format" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        success: true,
        message: "2FA verification successful",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Error during 2FA verification:", error);
      res.status(500).json({ message: "2FA verification failed" });
    }
  });

  // ============ USER ROUTES ============
  
  // Get all users (for coaches and athletes listing)
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const sanitizedUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        rating: user.rating,
        students: user.students,
        experience: user.experience,
        bio: user.bio,
        profileImageUrl: user.profileImageUrl,
        primarySport: user.primarySport,
        createdAt: user.createdAt
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get coaches only
  app.get('/api/coaches', async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      const coaches = users.filter(user => user.role === 'coach').map(coach => ({
        id: coach.id,
        name: coach.name,
        email: coach.email,
        role: coach.role,
        rating: coach.rating || 0,
        students: coach.students || 0,
        experience: coach.experience || 'New Coach',
        bio: coach.bio,
        profileImageUrl: coach.profileImageUrl,
        primarySport: coach.primarySport,
        createdAt: coach.createdAt
      }));
      res.json(coaches);
    } catch (error) {
      console.error("Error fetching coaches:", error);
      res.status(500).json({ error: "Failed to fetch coaches" });
    }
  });

  // Update user profile
  app.put('/api/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Ensure user can only update their own profile or admin can update any
      if (req.user.id !== id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized to update this profile' });
      }

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Return sanitized user data
      const sanitized = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        rating: updatedUser.rating,
        students: updatedUser.students,
        experience: updatedUser.experience,
        bio: updatedUser.bio,
        profileImageUrl: updatedUser.profileImageUrl,
        primarySport: updatedUser.primarySport,
        updatedAt: updatedUser.updatedAt
      };

      res.json(sanitized);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // ============ SESSION ROUTES ============

  // Get all sessions for authenticated user
  app.get('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      let sessions;
      if (req.user.role === 'coach') {
        sessions = await storage.getSessionsByCoach(req.user.id);
      } else {
        sessions = await storage.getSessionsByAthlete(req.user.id);
      }
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Create new session
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = {
        ...req.body,
        id: undefined, // Let database generate ID
        createdAt: undefined,
        updatedAt: undefined
      };

      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  // Update session status
  app.patch('/api/sessions/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['upcoming', 'completed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const session = await storage.updateSessionStatus(id, status);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error("Error updating session status:", error);
      res.status(500).json({ error: "Failed to update session status" });
    }
  });

  // ============ TRAINING SESSION ROUTES ============

  // Get training sessions for athlete
  app.get('/api/training-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getTrainingSessionsByAthlete(req.user.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching training sessions:", error);
      res.status(500).json({ error: "Failed to fetch training sessions" });
    }
  });

  // Create training session
  app.post('/api/training-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = {
        ...req.body,
        athleteId: req.user.id,
        id: undefined,
        date: undefined
      };

      const session = await storage.createTrainingSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(500).json({ error: "Failed to create training session" });
    }
  });

  // ============ PERFORMANCE METRICS ROUTES ============

  // Get performance metrics for athlete
  app.get('/api/performance-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const metrics = await storage.getPerformanceMetricsByAthlete(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ error: "Failed to fetch performance metrics" });
    }
  });

  // Create performance metric
  app.post('/api/performance-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const metricData = {
        ...req.body,
        athleteId: req.user.id,
        id: undefined,
        date: undefined
      };

      const metric = await storage.createPerformanceMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error creating performance metric:", error);
      res.status(500).json({ error: "Failed to create performance metric" });
    }
  });

  // ============ AR METRICS ROUTES ============

  // Get AR metrics for user
  app.get('/api/ar-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const metrics = await storage.getARMetricsByUser(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching AR metrics:", error);
      res.status(500).json({ error: "Failed to fetch AR metrics" });
    }
  });

  // Create AR metric
  app.post('/api/ar-metrics', isAuthenticated, async (req: any, res) => {
    try {
      const metricData = {
        ...req.body,
        userId: req.user.id,
        id: undefined,
        timestamp: undefined
      };

      const metric = await storage.createARMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error creating AR metric:", error);
      res.status(500).json({ error: "Failed to create AR metric" });
    }
  });

  // ============ ACHIEVEMENTS ROUTES ============

  // Get achievements for user
  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const achievements = await storage.getAchievementsByUser(req.user.id);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  // Create achievement
  app.post('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const achievementData = {
        ...req.body,
        userId: req.user.id,
        id: undefined
      };

      const achievement = await storage.createAchievement(achievementData);
      res.status(201).json(achievement);
    } catch (error) {
      console.error("Error creating achievement:", error);
      res.status(500).json({ error: "Failed to create achievement" });
    }
  });

  // ============ REVIEWS ROUTES ============

  // Get reviews for coach
  app.get('/api/reviews/coach/:coachId', isAuthenticated, async (req: any, res) => {
    try {
      const { coachId } = req.params;
      const reviews = await storage.getReviewsByCoach(coachId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  // Create review
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviewData = {
        ...req.body,
        reviewerId: req.user.id,
        id: undefined,
        date: undefined
      };

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  // ============ VIRTUAL VENUES ROUTES ============

  // Get all venues
  app.get('/api/venues', isAuthenticated, async (req: any, res) => {
    try {
      const venues = await storage.getAllVenues();
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ error: "Failed to fetch venues" });
    }
  });

  // Get venues by sport
  app.get('/api/venues/sport/:sport', isAuthenticated, async (req: any, res) => {
    try {
      const { sport } = req.params;
      const venues = await storage.getVenuesBySport(sport);
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues by sport:", error);
      res.status(500).json({ error: "Failed to fetch venues by sport" });
    }
  });

  // Get single venue
  app.get('/api/venues/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const venue = await storage.getVenue(parseInt(id));
      if (!venue) {
        return res.status(404).json({ error: 'Venue not found' });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ error: "Failed to fetch venue" });
    }
  });

  // Create venue (Admin only)
  app.post('/api/venues', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const venueData = {
        ...req.body,
        id: undefined,
        createdAt: undefined,
        updatedAt: undefined
      };

      const venue = await storage.createVenue(venueData);
      res.status(201).json(venue);
    } catch (error) {
      console.error("Error creating venue:", error);
      res.status(500).json({ error: "Failed to create venue" });
    }
  });

  // Update venue (Admin only)
  app.put('/api/venues/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const updateData = req.body;
      
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const venue = await storage.updateVenue(parseInt(id), updateData);
      if (!venue) {
        return res.status(404).json({ error: 'Venue not found' });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error updating venue:", error);
      res.status(500).json({ error: "Failed to update venue" });
    }
  });

  // Delete venue (Admin only)
  app.delete('/api/venues/:id', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const { id } = req.params;
      const success = await storage.deleteVenue(parseInt(id));
      
      if (!success) {
        return res.status(404).json({ error: 'Venue not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting venue:", error);
      res.status(500).json({ error: "Failed to delete venue" });
    }
  });

  // ============ USER VENUE PREFERENCES ROUTES ============

  // Get user venue preferences
  app.get('/api/user-venues', isAuthenticated, async (req: any, res) => {
    try {
      const { sport } = req.query;
      const preferences = await storage.getUserVenuePreferences(req.user.id, sport);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user venue preferences:", error);
      res.status(500).json({ error: "Failed to fetch user venue preferences" });
    }
  });

  // Unlock venue for user
  app.post('/api/user-venues/unlock/:venueId', isAuthenticated, async (req: any, res) => {
    try {
      const { venueId } = req.params;
      const preference = await storage.unlockVenueForUser(req.user.id, parseInt(venueId));
      res.status(201).json(preference);
    } catch (error) {
      console.error("Error unlocking venue:", error);
      res.status(500).json({ error: "Failed to unlock venue" });
    }
  });

  // Update venue usage stats
  app.put('/api/user-venues/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const preference = await storage.updateUserVenuePreference(parseInt(id), updateData);
      if (!preference) {
        return res.status(404).json({ error: 'Venue preference not found' });
      }
      res.json(preference);
    } catch (error) {
      console.error("Error updating venue preference:", error);
      res.status(500).json({ error: "Failed to update venue preference" });
    }
  });

  // ============ VENUE SESSIONS ROUTES ============

  // Get venue sessions for user
  app.get('/api/venue-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getVenueSessionsByUser(req.user.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching venue sessions:", error);
      res.status(500).json({ error: "Failed to fetch venue sessions" });
    }
  });

  // Get venue sessions by venue
  app.get('/api/venue-sessions/venue/:venueId', isAuthenticated, async (req: any, res) => {
    try {
      const { venueId } = req.params;
      const sessions = await storage.getVenueSessionsByVenue(parseInt(venueId));
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching venue sessions:", error);
      res.status(500).json({ error: "Failed to fetch venue sessions" });
    }
  });

  // Create venue session
  app.post('/api/venue-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = {
        ...req.body,
        userId: req.user.id,
        id: undefined,
        startedAt: undefined,
        completedAt: undefined
      };

      const session = await storage.createVenueSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating venue session:", error);
      res.status(500).json({ error: "Failed to create venue session" });
    }
  });

  // Update venue session
  app.put('/api/venue-sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      delete updateData.id;
      delete updateData.startedAt;

      const session = await storage.updateVenueSession(parseInt(id), updateData);
      if (!session) {
        return res.status(404).json({ error: 'Venue session not found' });
      }
      res.json(session);
    } catch (error) {
      console.error("Error updating venue session:", error);
      res.status(500).json({ error: "Failed to update venue session" });
    }
  });

  // ============ VENUE LEADERBOARDS ROUTES ============

  // Get venue leaderboards
  app.get('/api/venue-leaderboards', isAuthenticated, async (req: any, res) => {
    try {
      const { venueId, sport } = req.query;
      const leaderboards = await storage.getVenueLeaderboards(
        venueId ? parseInt(venueId as string) : undefined,
        sport as string
      );
      res.json(leaderboards);
    } catch (error) {
      console.error("Error fetching venue leaderboards:", error);
      res.status(500).json({ error: "Failed to fetch venue leaderboards" });
    }
  });

  // Get leaderboard entries
  app.get('/api/venue-leaderboards/:id/entries', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const entries = await storage.getVenueLeaderboardEntries(parseInt(id));
      res.json(entries);
    } catch (error) {
      console.error("Error fetching leaderboard entries:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard entries" });
    }
  });

  // Create leaderboard entry
  app.post('/api/venue-leaderboards/:id/entries', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const entryData = {
        ...req.body,
        leaderboardId: parseInt(id),
        userId: req.user.id,
        id: undefined,
        achievedAt: undefined
      };

      const entry = await storage.createVenueLeaderboardEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating leaderboard entry:", error);
      res.status(500).json({ error: "Failed to create leaderboard entry" });
    }
  });

  // Unity AR Routes
  app.use('/api/unity-ar', unityArRouter);
  app.use('/api/admin/unity-ar', adminUnityArRouter);
  
  // Room Mode cross-platform sync routes
  app.use('/api/room-mode-sync', isAuthenticated, roomModeSyncRouter);

  // Start WebSocket manager and HTTP server
  const httpServer = createServer(app);
  const wsManager = new WebSocketManager(httpServer);

  return httpServer;
}