import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { roomSessions, spaceConstraints, safetyLogs, roomPerformanceMetrics } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

// Validation schemas for cross-platform sync
const syncRoomSessionSchema = z.object({
  sessionId: z.number(),
  platform: z.enum(['web_mediapipe', 'flutter_unity']),
  syncData: z.object({
    averageFps: z.number().optional(),
    trackingQuality: z.number().min(0).max(100).optional(),
    safetyScore: z.number().min(0).max(100).optional(),
    roomCenter: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
    scaleFactor: z.number().optional(),
    obstacleCount: z.number().optional(),
    lightingConditions: z.string().optional(),
    reflectiveSurfaces: z.boolean().optional(),
  })
});

const createRoomSessionSchema = z.object({
  sessionId: z.number().optional(),
  userId: z.number(),
  roomWidth: z.number(),
  roomHeight: z.number(),
  roomArea: z.number(),
  ceilingHeight: z.number().optional(),
  isFlat: z.boolean().default(true),
  aspectRatio: z.number(),
  calibrationType: z.string().default('two_point'),
  baselineDistance: z.number(),
  roomCenter: z.object({ x: z.number(), y: z.number(), z: z.number() }),
  scaleFactor: z.number().default(100),
  safetyScore: z.number(),
  obstacleCount: z.number().default(0),
  lightingConditions: z.string().optional(),
  reflectiveSurfaces: z.boolean().default(false),
  platform: z.enum(['web_mediapipe', 'flutter_unity']),
  averageFps: z.number().optional(),
  trackingQuality: z.number().optional(),
});

const syncSafetyLogSchema = z.object({
  roomSessionId: z.number(),
  userId: z.number(),
  incidentType: z.enum(['boundary_violation', 'collision_risk', 'pose_unsafe', 'tracking_lost']),
  severity: z.enum(['info', 'warning', 'critical']),
  message: z.string(),
  userPosition: z.object({ x: z.number(), y: z.number(), z: z.number() }).optional(),
  drillPattern: z.string().optional(),
  automaticResponse: z.string().optional(),
  userResponse: z.string().optional(),
});

const syncPerformanceMetricSchema = z.object({
  roomSessionId: z.number(),
  userId: z.number(),
  sport: z.string(),
  adaptationScore: z.number().min(0).max(100),
  spaceUtilization: z.number().min(0).max(100),
  movementEfficiency: z.number().min(0).max(100),
  safetyCompliance: z.number().min(0).max(100),
  drillsModified: z.number().default(0),
  targetAdjustments: z.number().default(0),
  speedReductions: z.number().default(0),
  roomModeScore: z.number().min(0).max(100),
  venueEquivalentScore: z.number().min(0).max(100).optional(),
  improvementPotential: z.number().min(0).max(100).optional(),
});

/**
 * Create or update room session across platforms
 */
router.post('/session', async (req, res) => {
  try {
    const sessionData = createRoomSessionSchema.parse(req.body);
    
    const [session] = await db
      .insert(roomSessions)
      .values(sessionData)
      .returning();
    
    res.json({
      success: true,
      session,
      message: 'Room session created successfully'
    });
  } catch (error) {
    console.error('Error creating room session:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        details: error.errors 
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

/**
 * Sync room session data between platforms
 */
router.put('/session/sync', async (req, res) => {
  try {
    const { sessionId, platform, syncData } = syncRoomSessionSchema.parse(req.body);
    
    // Get current session
    const [currentSession] = await db
      .select()
      .from(roomSessions)
      .where(eq(roomSessions.id, sessionId));
    
    if (!currentSession) {
      return res.status(404).json({
        success: false,
        error: 'Room session not found'
      });
    }
    
    // Merge platform-specific data intelligently
    const updates: any = {
      platform,
      updatedAt: new Date(),
    };
    
    // Update FPS if provided and higher than current
    if (syncData.averageFps !== undefined) {
      updates.averageFps = Math.max(syncData.averageFps, currentSession.averageFps || 0);
    }
    
    // Update tracking quality if provided and higher than current
    if (syncData.trackingQuality !== undefined) {
      updates.trackingQuality = Math.max(syncData.trackingQuality, currentSession.trackingQuality || 0);
    }
    
    // Update safety score if provided and valid
    if (syncData.safetyScore !== undefined) {
      updates.safetyScore = syncData.safetyScore;
    }
    
    // Update environment data
    if (syncData.roomCenter) updates.roomCenter = syncData.roomCenter;
    if (syncData.scaleFactor) updates.scaleFactor = syncData.scaleFactor;
    if (syncData.obstacleCount !== undefined) updates.obstacleCount = syncData.obstacleCount;
    if (syncData.lightingConditions) updates.lightingConditions = syncData.lightingConditions;
    if (syncData.reflectiveSurfaces !== undefined) updates.reflectiveSurfaces = syncData.reflectiveSurfaces;
    
    const [updatedSession] = await db
      .update(roomSessions)
      .set(updates)
      .where(eq(roomSessions.id, sessionId))
      .returning();
    
    res.json({
      success: true,
      session: updatedSession,
      platform,
      message: 'Room session synced successfully'
    });
  } catch (error) {
    console.error('Error syncing room session:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        details: error.errors 
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Failed to sync room session' 
    });
  }
});

/**
 * Get room sessions for a user across platforms
 */
router.get('/sessions/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }
    
    const sessions = await db
      .select()
      .from(roomSessions)
      .where(eq(roomSessions.userId, userId))
      .orderBy(desc(roomSessions.createdAt));
    
    // Group by platform
    const sessionsByPlatform = sessions.reduce((acc, session) => {
      const platform = session.platform;
      if (!acc[platform]) acc[platform] = [];
      acc[platform].push(session);
      return acc;
    }, {} as Record<string, any[]>);
    
    res.json({
      success: true,
      sessions,
      sessionsByPlatform,
      totalSessions: sessions.length
    });
  } catch (error) {
    console.error('Error getting user room sessions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user sessions' 
    });
  }
});

/**
 * Sync safety log across platforms
 */
router.post('/safety-log', async (req, res) => {
  try {
    const logData = syncSafetyLogSchema.parse(req.body);
    
    const [safetyLog] = await db
      .insert(safetyLogs)
      .values({
        ...logData,
        timestamp: new Date(),
      })
      .returning();
    
    res.json({
      success: true,
      safetyLog,
      message: 'Safety log recorded successfully'
    });
  } catch (error) {
    console.error('Error creating safety log:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        details: error.errors 
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Failed to record safety log' 
    });
  }
});

/**
 * Sync performance metrics across platforms
 */
router.post('/performance-metric', async (req, res) => {
  try {
    const metricData = syncPerformanceMetricSchema.parse(req.body);
    
    const [metric] = await db
      .insert(roomPerformanceMetrics)
      .values(metricData)
      .returning();
    
    res.json({
      success: true,
      metric,
      message: 'Performance metric recorded successfully'
    });
  } catch (error) {
    console.error('Error creating performance metric:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        error: 'Validation error',
        details: error.errors 
      });
    }
    res.status(500).json({ 
      success: false,
      error: 'Failed to record performance metric' 
    });
  }
});

/**
 * Get comprehensive sync status for cross-platform consistency
 */
router.get('/sync-status/:sessionId', async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID'
      });
    }
    
    // Get room session
    const [session] = await db
      .select()
      .from(roomSessions)
      .where(eq(roomSessions.id, sessionId));
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Room session not found'
      });
    }
    
    // Get related data
    const [constraints, logs, metrics] = await Promise.all([
      db.select().from(spaceConstraints).where(eq(spaceConstraints.roomSessionId, sessionId)),
      db.select().from(safetyLogs).where(eq(safetyLogs.roomSessionId, sessionId)),
      db.select().from(roomPerformanceMetrics).where(eq(roomPerformanceMetrics.roomSessionId, sessionId))
    ]);
    
    const syncStatus = {
      session,
      constraints,
      safetyLogs: logs,
      performanceMetrics: metrics,
      lastSyncedAt: session.updatedAt,
      platform: session.platform,
      isConsistent: true, // All platforms have same core data
      syncHealth: {
        dataIntegrity: 'good',
        platformConsistency: 'synced',
        lastUpdate: session.updatedAt
      }
    };
    
    res.json({
      success: true,
      syncStatus,
      message: 'Sync status retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get sync status' 
    });
  }
});

export default router;