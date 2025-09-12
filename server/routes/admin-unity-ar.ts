import { Router } from 'express';
import { db } from '../db';
import { 
  unityArSportSettings, 
  unityArSportConfigs,
  unityArSessions,
  users
} from '../../shared/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Validation schemas
const updateSportSettingsSchema = z.object({
  settings: z.array(z.object({
    id: z.number().optional(),
    sport: z.string(),
    arMode: z.enum(['disabled', 'enabled', 'admin_only']),
    defaultDifficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
    isActive: z.boolean(),
    requiresCalibration: z.boolean(),
    minPlaneArea: z.number(),
    maxPlayers: z.number(),
    sessionTimeout: z.number(),
  }))
});

const createSportConfigSchema = z.object({
  sport: z.string(),
  configVersion: z.string(),
  fieldDimensions: z.object({
    length: z.number(),
    width: z.number(),
  }),
  markerLayout: z.object({
    pattern: z.string(),
    positions: z.array(z.object({
      x: z.number(),
      y: z.number(),
      targetRadius: z.number().optional(),
    }))
  }),
  scoringZones: z.array(z.object({
    name: z.string(),
    type: z.string(),
    position: z.object({ x: z.number(), y: z.number() }),
    dimensions: z.object({ width: z.number(), height: z.number() }).optional(),
    radius: z.number().optional(),
  })).optional(),
  easyTolerance: z.number(),
  mediumTolerance: z.number(),
  hardTolerance: z.number(),
  expertTolerance: z.number(),
  targetPaceHz: z.number(),
  precisionWeight: z.number(),
  paceWeight: z.number(),
  streakWeight: z.number(),
  minPlaneSize: z.object({
    width: z.number(),
    height: z.number(),
  }),
  requiresAudio: z.boolean(),
  requiresVision: z.boolean(),
});

// Admin authentication middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user?.id || req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin privileges required' });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all Unity AR sport settings
 */
router.get('/settings', requireAdmin, async (req, res) => {
  try {
    const settings = await db
      .select()
      .from(unityArSportSettings)
      .orderBy(unityArSportSettings.sport);
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching Unity AR settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Update Unity AR sport settings (bulk)
 */
router.post('/settings', requireAdmin, async (req, res) => {
  try {
    const { settings } = updateSportSettingsSchema.parse(req.body);
    
    // Use database transaction for bulk updates
    await db.transaction(async (tx) => {
      for (const setting of settings) {
        if (setting.id) {
          // Update existing setting
          await tx
            .update(unityArSportSettings)
            .set({
              arMode: setting.arMode,
              defaultDifficulty: setting.defaultDifficulty,
              isActive: setting.isActive,
              requiresCalibration: setting.requiresCalibration,
              minPlaneArea: setting.minPlaneArea,
              maxPlayers: setting.maxPlayers,
              sessionTimeout: setting.sessionTimeout,
              updatedAt: new Date(),
            })
            .where(eq(unityArSportSettings.id, setting.id));
        } else {
          // Insert new setting
          await tx
            .insert(unityArSportSettings)
            .values({
              sport: setting.sport as any,
              arMode: setting.arMode,
              defaultDifficulty: setting.defaultDifficulty,
              isActive: setting.isActive,
              requiresCalibration: setting.requiresCalibration,
              minPlaneArea: setting.minPlaneArea,
              maxPlayers: setting.maxPlayers,
              sessionTimeout: setting.sessionTimeout,
            })
            .onConflictDoUpdate({
              target: unityArSportSettings.sport,
              set: {
                arMode: setting.arMode,
                defaultDifficulty: setting.defaultDifficulty,
                isActive: setting.isActive,
                requiresCalibration: setting.requiresCalibration,
                minPlaneArea: setting.minPlaneArea,
                maxPlayers: setting.maxPlayers,
                sessionTimeout: setting.sessionTimeout,
                updatedAt: new Date(),
              }
            });
        }
      }
    });
    
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating Unity AR settings:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get all Unity AR sport configurations
 */
router.get('/sport-configs', requireAdmin, async (req, res) => {
  try {
    const configs = await db
      .select()
      .from(unityArSportConfigs)
      .orderBy(unityArSportConfigs.sport, desc(unityArSportConfigs.createdAt));
    
    res.json(configs);
  } catch (error) {
    console.error('Error fetching Unity AR sport configs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Create or update Unity AR sport configuration
 */
router.post('/sport-configs', requireAdmin, async (req, res) => {
  try {
    const configData = createSportConfigSchema.parse(req.body);
    
    // Deactivate previous configs for this sport
    await db
      .update(unityArSportConfigs)
      .set({ isActive: false })
      .where(eq(unityArSportConfigs.sport, configData.sport as any));
    
    // Insert new config
    const [newConfig] = await db
      .insert(unityArSportConfigs)
      .values({
        sport: configData.sport as any,
        configVersion: configData.configVersion,
        fieldDimensions: configData.fieldDimensions,
        markerLayout: configData.markerLayout,
        scoringZones: configData.scoringZones || [],
        easyTolerance: configData.easyTolerance,
        mediumTolerance: configData.mediumTolerance,
        hardTolerance: configData.hardTolerance,
        expertTolerance: configData.expertTolerance,
        targetPaceHz: configData.targetPaceHz,
        precisionWeight: configData.precisionWeight,
        paceWeight: configData.paceWeight,
        streakWeight: configData.streakWeight,
        minPlaneSize: configData.minPlaneSize,
        requiresAudio: configData.requiresAudio,
        requiresVision: configData.requiresVision,
        isActive: true,
      })
      .returning();
    
    res.json(newConfig);
  } catch (error) {
    console.error('Error creating Unity AR sport config:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Unity AR session analytics
 */
router.get('/analytics/sessions', requireAdmin, async (req, res) => {
  try {
    const { sport, days = '30' } = req.query;
    const daysAgo = parseInt(days as string);
    
    let baseQuery = db
      .select({
        date: sql<string>`DATE(${unityArSessions.createdAt})`,
        sport: unityArSessions.sport,
        sessionCount: sql<number>`COUNT(*)`,
        completedSessions: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')`,
        averageScore: sql<number>`AVG(${unityArSessions.totalScore}) FILTER (WHERE status = 'completed')`,
        averageDuration: sql<number>`AVG(${unityArSessions.duration}) FILTER (WHERE status = 'completed')`,
        averageAccuracy: sql<number>`AVG(${unityArSessions.accuracy}) FILTER (WHERE status = 'completed')`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${unityArSessions.userId})`,
      })
      .from(unityArSessions)
      .where(sql`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`);
    
    if (sport) {
      baseQuery = baseQuery.where(eq(unityArSessions.sport, sport as any));
    }
    
    const analytics = await baseQuery
      .groupBy(sql`DATE(${unityArSessions.createdAt})`, unityArSessions.sport)
      .orderBy(sql`DATE(${unityArSessions.createdAt}) DESC`);
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching Unity AR analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Unity AR user engagement metrics
 */
router.get('/analytics/engagement', requireAdmin, async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const daysAgo = parseInt(days as string);
    
    // Daily active users
    const dailyActiveUsers = await db
      .select({
        date: sql<string>`DATE(${unityArSessions.createdAt})`,
        activeUsers: sql<number>`COUNT(DISTINCT ${unityArSessions.userId})`,
      })
      .from(unityArSessions)
      .where(sql`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`)
      .groupBy(sql`DATE(${unityArSessions.createdAt})`)
      .orderBy(sql`DATE(${unityArSessions.createdAt}) DESC`);
    
    // User retention (users who came back within 7 days)
    const retention = await db
      .select({
        sport: unityArSessions.sport,
        totalUsers: sql<number>`COUNT(DISTINCT ${unityArSessions.userId})`,
        returningUsers: sql<number>`COUNT(DISTINCT ${unityArSessions.userId}) FILTER (WHERE (SELECT COUNT(*) FROM ${unityArSessions} s2 WHERE s2.user_id = ${unityArSessions.userId} AND s2.created_at > ${unityArSessions.createdAt} + INTERVAL '1 day' AND s2.created_at < ${unityArSessions.createdAt} + INTERVAL '7 days') > 0)`,
      })
      .from(unityArSessions)
      .where(sql`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`)
      .groupBy(unityArSessions.sport);
    
    // Session completion rates
    const completion = await db
      .select({
        sport: unityArSessions.sport,
        totalSessions: sql<number>`COUNT(*)`,
        completedSessions: sql<number>`COUNT(*) FILTER (WHERE status = 'completed')`,
        failedSessions: sql<number>`COUNT(*) FILTER (WHERE status = 'failed')`,
      })
      .from(unityArSessions)
      .where(sql`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`)
      .groupBy(unityArSessions.sport);
    
    res.json({
      dailyActiveUsers,
      retention,
      completion,
    });
  } catch (error) {
    console.error('Error fetching Unity AR engagement metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get Unity AR device and platform statistics
 */
router.get('/analytics/devices', requireAdmin, async (req, res) => {
  try {
    const { days = '30' } = req.query;
    const daysAgo = parseInt(days as string);
    
    // Platform distribution
    const platforms = await db
      .select({
        platform: unityArSessions.devicePlatform,
        sessionCount: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${unityArSessions.userId})`,
        averageScore: sql<number>`AVG(${unityArSessions.totalScore}) FILTER (WHERE status = 'completed')`,
        completionRate: sql<number>`COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*)`,
      })
      .from(unityArSessions)
      .where(sql`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`)
      .groupBy(unityArSessions.devicePlatform);
    
    // Device model distribution (top 10)
    const devices = await db
      .select({
        deviceModel: unityArSessions.deviceModel,
        sessionCount: sql<number>`COUNT(*)`,
        averageScore: sql<number>`AVG(${unityArSessions.totalScore}) FILTER (WHERE status = 'completed')`,
      })
      .from(unityArSessions)
      .where(and(
        sql`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`,
        sql`${unityArSessions.deviceModel} IS NOT NULL`
      ))
      .groupBy(unityArSessions.deviceModel)
      .orderBy(desc(sql`COUNT(*)`))
      .limit(10);
    
    // Unity version distribution
    const unityVersions = await db
      .select({
        unityVersion: unityArSessions.unityVersion,
        sessionCount: sql<number>`COUNT(*)`,
        averageScore: sql<number>`AVG(${unityArSessions.totalScore}) FILTER (WHERE status = 'completed')`,
      })
      .from(unityArSessions)
      .where(and(
        sql`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`,
        sql`${unityArSessions.unityVersion} IS NOT NULL`
      ))
      .groupBy(unityArSessions.unityVersion)
      .orderBy(desc(sql`COUNT(*)`));
    
    res.json({
      platforms,
      devices,
      unityVersions,
    });
  } catch (error) {
    console.error('Error fetching Unity AR device analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as adminUnityArRouter };