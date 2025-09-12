import { Router } from 'express';
import { db } from '../db';
import { 
  unityArSportSettings, 
  unityArSessions, 
  unityArBounceEvents, 
  unityArPerformanceMetrics,
  unityArSportConfigs,
  users 
} from '../../shared/schema';
import { eq, and, desc, sql, count, avg, max, sum } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Validation schemas
const checkAvailabilitySchema = z.object({
  sport: z.string(),
  userId: z.string().optional(),
});

const createSessionSchema = z.object({
  userId: z.string(),
  sport: z.string(),
  drillConfigId: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  devicePlatform: z.enum(['android', 'ios']),
  deviceModel: z.string().optional(),
  unityVersion: z.string().optional(),
});

const updateSessionSchema = z.object({
  sessionId: z.string(),
  calibrationData: z.any().optional(),
  planeArea: z.number().optional(),
  duration: z.number().optional(),
  totalBounces: z.number().optional(),
  successfulHits: z.number().optional(),
  accuracy: z.number().optional(),
  averageReactionTime: z.number().optional(),
  precisionScore: z.number().optional(),
  paceScore: z.number().optional(),
  streakScore: z.number().optional(),
  totalScore: z.number().optional(),
  sessionData: z.any().optional(),
  heatmapData: z.any().optional(),
  status: z.enum(['active', 'paused', 'completed', 'failed']).optional(),
});

const createBounceEventSchema = z.object({
  sessionId: z.string(),
  timestampMs: z.number(),
  bounceWorldPos: z.array(z.number()).length(3),
  bounceCourtPos: z.array(z.number()).length(2),
  targetIndex: z.number(),
  targetPos: z.array(z.number()).length(2),
  errorDistance: z.number(),
  isHit: z.boolean(),
  toleranceRadius: z.number(),
  visionConfidence: z.number().min(0).max(100).optional(),
  audioConfidence: z.number().min(0).max(100).optional(),
  fusionConfidence: z.number().min(0).max(100).optional(),
});

// Room Mode schemas
const createRoomSessionSchema = z.object({
  userId: z.string(),
  sport: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  drillPattern: z.enum(['dribble_box', 'micro_ladder', 'figure_8', 'wall_rebound', 'seated_control']),
  roomConstraints: z.object({
    width: z.number(),
    height: z.number(),
    isFlat: z.boolean(),
    ceilingHeight: z.number().optional(),
    wallProximity: z.number().optional(),
    safetyMargin: z.number().default(0.3),
  }),
  devicePlatform: z.enum(['android', 'ios', 'web']),
  platformType: z.enum(['unity', 'mediapipe']).default('unity'),
});

const logSafetyIncidentSchema = z.object({
  sessionId: z.string(),
  incidentType: z.enum(['ceiling_collision', 'wall_proximity', 'floor_hazard', 'movement_restriction']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  description: z.string(),
  userPosition: z.array(z.number()).length(3).optional(),
  recommendedAction: z.string().optional(),
  wasSessionPaused: z.boolean().default(false),
  timestampMs: z.number(),
});

const updateRoomSessionSchema = z.object({
  sessionId: z.string(),
  patternsCompleted: z.number().optional(),
  safetyViolations: z.number().optional(),
  adaptiveToleranceUsed: z.boolean().optional(),
  roomModeMetrics: z.object({
    confinedSpaceScore: z.number(),
    adaptabilityScore: z.number(),
    safetyComplianceScore: z.number(),
    patternEfficiency: z.number(),
  }).optional(),
  status: z.enum(['active', 'paused', 'completed', 'failed']).optional(),
});

/**
 * Check if Unity AR is available for a specific sport
 */
router.get('/check-availability', async (req, res) => {
  try {
    const { sport, userId } = checkAvailabilitySchema.parse(req.query);
    
    // Check if Unity AR is enabled for this sport
    const [sportSetting] = await db
      .select()
      .from(unityArSportSettings)
      .where(eq(unityArSportSettings.sport, sport as any));
    
    if (!sportSetting) {
      return res.json({
        available: false,
        reason: 'Unity AR not configured for this sport'
      });
    }
    
    if (sportSetting.arMode === 'disabled') {
      return res.json({
        available: false,
        reason: 'Unity AR is disabled for this sport'
      });
    }
    
    // Check user permissions for admin-only mode
    if (sportSetting.arMode === 'admin_only' && userId) {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!user || user.role !== 'admin') {
        return res.json({
          available: false,
          reason: 'Unity AR is restricted to administrators for this sport'
        });
      }
    }
    
    // Get sport configuration
    const [sportConfig] = await db
      .select()
      .from(unityArSportConfigs)
      .where(and(
        eq(unityArSportConfigs.sport, sport as any),
        eq(unityArSportConfigs.isActive, true)
      ))
      .orderBy(desc(unityArSportConfigs.createdAt))
      .limit(1);
    
    res.json({
      available: true,
      sportSetting,
      sportConfig,
      requirements: {
        minPlaneArea: sportSetting.minPlaneArea,
        requiresCalibration: sportSetting.requiresCalibration,
        maxPlayers: sportSetting.maxPlayers,
        sessionTimeout: sportSetting.sessionTimeout
      }
    });
  } catch (error) {
    console.error('Error checking Unity AR availability:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get sport configuration for Unity AR
 */
router.get('/sport-config/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    
    const [config] = await db
      .select()
      .from(unityArSportConfigs)
      .where(and(
        eq(unityArSportConfigs.sport, sport as any),
        eq(unityArSportConfigs.isActive, true)
      ))
      .orderBy(desc(unityArSportConfigs.createdAt))
      .limit(1);
    
    if (!config) {
      return res.status(404).json({ error: 'Sport configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching sport config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create new Unity AR session
 */
router.post('/sessions', async (req, res) => {
  try {
    const sessionData = createSessionSchema.parse(req.body);
    
    const [session] = await db
      .insert(unityArSessions)
      .values({
        ...sessionData,
        status: 'active',
      })
      .returning();
    
    res.json(session);
  } catch (error) {
    console.error('Error creating Unity AR session:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update Unity AR session
 */
router.put('/sessions', async (req, res) => {
  try {
    const updateData = updateSessionSchema.parse(req.body);
    const { sessionId, ...updates } = updateData;
    
    // Add completion timestamp if session is being completed
    if (updates.status === 'completed') {
      (updates as any).completedAt = new Date();
    }
    
    const [session] = await db
      .update(unityArSessions)
      .set(updates)
      .where(eq(unityArSessions.id, sessionId))
      .returning();
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error updating Unity AR session:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Unity AR session
 */
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const [session] = await db
      .select()
      .from(unityArSessions)
      .where(eq(unityArSessions.id, sessionId));
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching Unity AR session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create bounce event
 */
router.post('/bounce-events', async (req, res) => {
  try {
    const bounceData = createBounceEventSchema.parse(req.body);
    
    const [bounceEvent] = await db
      .insert(unityArBounceEvents)
      .values({
        ...bounceData,
        bounceWorldPos: bounceData.bounceWorldPos,
        bounceCourtPos: bounceData.bounceCourtPos,
        targetPos: bounceData.targetPos,
      })
      .returning();
    
    res.json(bounceEvent);
  } catch (error) {
    console.error('Error creating bounce event:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get bounce events for a session
 */
router.get('/sessions/:sessionId/bounce-events', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = '100', offset = '0' } = req.query;
    
    const bounceEvents = await db
      .select()
      .from(unityArBounceEvents)
      .where(eq(unityArBounceEvents.sessionId, sessionId))
      .orderBy(unityArBounceEvents.timestampMs)
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    res.json(bounceEvents);
  } catch (error) {
    console.error('Error fetching bounce events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get user's Unity AR sessions
 */
router.get('/users/:userId/sessions', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sport, limit = '20', offset = '0' } = req.query;
    
    let query = db
      .select()
      .from(unityArSessions)
      .where(eq(unityArSessions.userId, userId));
    
    if (sport) {
      query = query.where(and(
        eq(unityArSessions.userId, userId),
        eq(unityArSessions.sport, sport as any)
      ));
    }
    
    const sessions = await query
      .orderBy(desc(unityArSessions.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));
    
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Unity AR performance metrics for a user
 */
router.get('/users/:userId/performance-metrics', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sport, periodType = 'weekly', limit = '10' } = req.query;
    
    let query = db
      .select()
      .from(unityArPerformanceMetrics)
      .where(eq(unityArPerformanceMetrics.userId, userId));
    
    if (sport) {
      query = query.where(and(
        eq(unityArPerformanceMetrics.userId, userId),
        eq(unityArPerformanceMetrics.sport, sport as any)
      ));
    }
    
    if (periodType) {
      query = query.where(and(
        eq(unityArPerformanceMetrics.userId, userId),
        eq(unityArPerformanceMetrics.periodType, periodType as string)
      ));
    }
    
    const metrics = await query
      .orderBy(desc(unityArPerformanceMetrics.calculatedAt))
      .limit(parseInt(limit as string));
    
    res.json(metrics);
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Unity AR leaderboard for a sport
 */
router.get('/leaderboard/:sport', async (req, res) => {
  try {
    const { sport } = req.params;
    const { period = 'weekly', limit = '10' } = req.query;
    
    // Get top performers based on total score
    const leaderboard = await db
      .select({
        userId: unityArSessions.userId,
        userName: users.name,
        profileImageUrl: users.profileImageUrl,
        totalScore: sql<number>`AVG(${unityArSessions.totalScore})`,
        sessionCount: sql<number>`COUNT(*)`,
        averageAccuracy: sql<number>`AVG(${unityArSessions.accuracy})`,
        bestScore: sql<number>`MAX(${unityArSessions.totalScore})`,
      })
      .from(unityArSessions)
      .innerJoin(users, eq(unityArSessions.userId, users.id))
      .where(and(
        eq(unityArSessions.sport, sport as any),
        eq(unityArSessions.status, 'completed')
      ))
      .groupBy(unityArSessions.userId, users.name, users.profileImageUrl)
      .orderBy(desc(sql`AVG(${unityArSessions.totalScore})`))
      .limit(parseInt(limit as string));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Unity AR statistics (for admin dashboard)
 */
router.get('/admin/stats', async (req, res) => {
  try {
    // Get total sessions
    const [sessionStats] = await db
      .select({
        totalSessions: sql<number>`COUNT(*)`,
        completedSessions: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')`,
        averageDuration: sql<number>`AVG(duration)`,
      })
      .from(unityArSessions);
    
    // Get active sports count
    const [activeSportsCount] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT sport)`,
      })
      .from(unityArSportSettings)
      .where(eq(unityArSportSettings.isActive, true));
    
    // Get top performing sport
    const [topSport] = await db
      .select({
        sport: unityArSessions.sport,
        sessionCount: sql<number>`COUNT(*)`,
      })
      .from(unityArSessions)
      .groupBy(unityArSessions.sport)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(1);
    
    // Get user statistics
    const [userStats] = await db
      .select({
        totalUsers: sql<number>`COUNT(DISTINCT ${unityArSessions.userId})`,
        dailyActiveUsers: sql<number>`COUNT(DISTINCT ${unityArSessions.userId}) FILTER (WHERE ${unityArSessions.createdAt} > NOW() - INTERVAL '1 day')`,
      })
      .from(unityArSessions);
    
    res.json({
      totalSessions: sessionStats.totalSessions,
      activeSports: activeSportsCount.count,
      averageSessionDuration: sessionStats.averageDuration || 0,
      topPerformingSport: topSport?.sport || 'basketball',
      totalUsers: userStats.totalUsers,
      dailyActiveUsers: userStats.dailyActiveUsers,
    });
  } catch (error) {
    console.error('Error fetching Unity AR stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create Room Mode session
 */
router.post('/room-sessions', async (req, res) => {
  try {
    const roomSessionData = createRoomSessionSchema.parse(req.body);
    
    // Create base session with room mode specific data
    const [session] = await db
      .insert(unityArSessions)
      .values({
        userId: roomSessionData.userId,
        sport: roomSessionData.sport as any,
        drillConfigId: `room_${roomSessionData.drillPattern}`,
        difficulty: roomSessionData.difficulty,
        devicePlatform: roomSessionData.devicePlatform,
        deviceModel: `${roomSessionData.platformType}_room_mode`,
        status: 'active',
        sessionData: {
          isRoomMode: true,
          drillPattern: roomSessionData.drillPattern,
          roomConstraints: roomSessionData.roomConstraints,
          platformType: roomSessionData.platformType,
        },
      })
      .returning();
    
    res.json({
      ...session,
      roomMode: true,
      drillPattern: roomSessionData.drillPattern,
      constraints: roomSessionData.roomConstraints,
    });
  } catch (error) {
    console.error('Error creating room mode session:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Log safety incident
 */
router.post('/safety-incidents', async (req, res) => {
  try {
    const incidentData = logSafetyIncidentSchema.parse(req.body);
    
    // Store in session data as safety log
    const [session] = await db
      .select()
      .from(unityArSessions)
      .where(eq(unityArSessions.id, incidentData.sessionId))
      .limit(1);
      
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const currentSessionData = session.sessionData || {};
    const safetyLogs = currentSessionData.safetyLogs || [];
    
    const newIncident = {
      id: `incident_${Date.now()}`,
      ...incidentData,
      loggedAt: new Date().toISOString(),
    };
    
    await db
      .update(unityArSessions)
      .set({
        sessionData: {
          ...currentSessionData,
          safetyLogs: [...safetyLogs, newIncident],
          totalSafetyIncidents: (currentSessionData.totalSafetyIncidents || 0) + 1,
          lastIncidentSeverity: incidentData.severity,
        }
      })
      .where(eq(unityArSessions.id, incidentData.sessionId));
    
    // Auto-pause for critical incidents
    if (incidentData.severity === 'critical' && !incidentData.wasSessionPaused) {
      await db
        .update(unityArSessions)
        .set({ status: 'paused' })
        .where(eq(unityArSessions.id, incidentData.sessionId));
    }
    
    res.json({ success: true, incidentId: newIncident.id });
  } catch (error) {
    console.error('Error logging safety incident:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get room mode analytics for user
 */
router.get('/users/:userId/room-analytics', async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = 'week' } = req.query;
    
    // Get room mode sessions
    const roomSessions = await db
      .select()
      .from(unityArSessions)
      .where(and(
        eq(unityArSessions.userId, userId),
        sql`${unityArSessions.sessionData}->>'isRoomMode' = 'true'`,
        eq(unityArSessions.status, 'completed')
      ))
      .orderBy(desc(unityArSessions.createdAt));
    
    if (roomSessions.length === 0) {
      return res.json({
        totalRoomSessions: 0,
        patternDistribution: {},
        safetyMetrics: {},
        averageScores: {},
        improvement: {},
      });
    }
    
    // Calculate pattern distribution
    const patternDistribution = roomSessions.reduce((acc, session) => {
      const pattern = session.sessionData?.drillPattern || 'unknown';
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate safety metrics
    const safetyMetrics = {
      totalIncidents: roomSessions.reduce((sum, session) => 
        sum + (session.sessionData?.totalSafetyIncidents || 0), 0),
      averageIncidentsPerSession: 0,
      criticalIncidents: 0,
      safetyComplianceRate: 0,
    };
    
    safetyMetrics.averageIncidentsPerSession = safetyMetrics.totalIncidents / roomSessions.length;
    
    // Count critical incidents
    safetyMetrics.criticalIncidents = roomSessions.reduce((count, session) => {
      const logs = session.sessionData?.safetyLogs || [];
      return count + logs.filter((log: any) => log.severity === 'critical').length;
    }, 0);
    
    safetyMetrics.safetyComplianceRate = 
      ((roomSessions.length - safetyMetrics.criticalIncidents) / roomSessions.length) * 100;
    
    // Calculate average scores
    const averageScores = {
      overallScore: roomSessions.reduce((sum, session) => sum + (session.totalScore || 0), 0) / roomSessions.length,
      accuracy: roomSessions.reduce((sum, session) => sum + (session.accuracy || 0), 0) / roomSessions.length,
      confinedSpaceAdaptation: 0,
    };
    
    const roomModeScores = roomSessions
      .map(session => session.sessionData?.roomModeMetrics?.confinedSpaceScore)
      .filter(score => score !== undefined);
      
    if (roomModeScores.length > 0) {
      averageScores.confinedSpaceAdaptation = 
        roomModeScores.reduce((sum, score) => sum + score, 0) / roomModeScores.length;
    }
    
    res.json({
      totalRoomSessions: roomSessions.length,
      patternDistribution,
      safetyMetrics,
      averageScores,
      improvement: {
        scoresTrend: _calculateScoresTrend(roomSessions),
        safetyTrend: _calculateSafetyTrend(roomSessions),
      },
    });
  } catch (error) {
    console.error('Error fetching room analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get room constraints recommendations
 */
router.post('/room-recommendations', async (req, res) => {
  try {
    const { width, height, isFlat, ceilingHeight, sport } = req.body;
    
    const recommendations = {
      recommendedPatterns: [],
      safetyWarnings: [],
      adaptations: {},
    };
    
    // Pattern recommendations based on space
    if (width >= 2.5 && height >= 2.5 && isFlat) {
      recommendations.recommendedPatterns.push('dribble_box');
    }
    
    if (width >= 2.0 || height >= 2.0) {
      recommendations.recommendedPatterns.push('micro_ladder');
    }
    
    if (width >= 1.8 && height >= 1.8) {
      recommendations.recommendedPatterns.push('figure_8');
    }
    
    if (ceilingHeight && ceilingHeight < 2.3) {
      recommendations.safetyWarnings.push('Low ceiling - overhead movements restricted');
      recommendations.recommendedPatterns.push('seated_control');
    }
    
    if (width * height < 4.0) {
      recommendations.safetyWarnings.push('Very confined space - reduced movement patterns only');
      recommendations.adaptations.toleranceMultiplier = 1.5;
      recommendations.adaptations.reducedTargetCount = true;
    }
    
    // Sport-specific adaptations
    if (sport === 'basketball' && (ceilingHeight || 3.0) < 2.8) {
      recommendations.safetyWarnings.push('Insufficient ceiling height for basketball shooting motions');
      recommendations.adaptations.noOverheadMovements = true;
    }
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating room recommendations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper functions
function _calculateScoresTrend(sessions: any[]) {
  if (sessions.length < 2) return 'insufficient_data';
  
  const recentSessions = sessions.slice(0, Math.min(5, sessions.length));
  const olderSessions = sessions.slice(Math.min(5, sessions.length));
  
  const recentAvg = recentSessions.reduce((sum, s) => sum + (s.totalScore || 0), 0) / recentSessions.length;
  const olderAvg = olderSessions.reduce((sum, s) => sum + (s.totalScore || 0), 0) / olderSessions.length;
  
  if (recentAvg > olderAvg * 1.1) return 'improving';
  if (recentAvg < olderAvg * 0.9) return 'declining';
  return 'stable';
}

function _calculateSafetyTrend(sessions: any[]) {
  if (sessions.length < 2) return 'insufficient_data';
  
  const recentSessions = sessions.slice(0, Math.min(5, sessions.length));
  const olderSessions = sessions.slice(Math.min(5, sessions.length));
  
  const recentIncidents = recentSessions.reduce((sum, s) => sum + (s.sessionData?.totalSafetyIncidents || 0), 0);
  const olderIncidents = olderSessions.reduce((sum, s) => sum + (s.sessionData?.totalSafetyIncidents || 0), 0);
  
  const recentRate = recentIncidents / recentSessions.length;
  const olderRate = olderIncidents / olderSessions.length;
  
  if (recentRate < olderRate * 0.8) return 'improving';
  if (recentRate > olderRate * 1.2) return 'declining';
  return 'stable';
}

export { router as unityArRouter };