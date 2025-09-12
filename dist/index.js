var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  achievements: () => achievements,
  arAnalysisResults: () => arAnalysisResults,
  arMetrics: () => arMetrics,
  authSessions: () => authSessions,
  challengeParticipants: () => challengeParticipants,
  coachPlayerRelations: () => coachPlayerRelations,
  drillRecommendations: () => drillRecommendations,
  environmentConditionEnum: () => environmentConditionEnum,
  insertARMetricSchema: () => insertARMetricSchema,
  insertAchievementSchema: () => insertAchievementSchema,
  insertPerformanceMetricSchema: () => insertPerformanceMetricSchema,
  insertReviewSchema: () => insertReviewSchema,
  insertRoomPerformanceMetricSchema: () => insertRoomPerformanceMetricSchema,
  insertRoomSessionSchema: () => insertRoomSessionSchema,
  insertSafetyLogSchema: () => insertSafetyLogSchema,
  insertSessionSchema: () => insertSessionSchema,
  insertSpaceConstraintSchema: () => insertSpaceConstraintSchema,
  insertTrainingSessionSchema: () => insertTrainingSessionSchema,
  insertUnityArBounceEventSchema: () => insertUnityArBounceEventSchema,
  insertUnityArPerformanceMetricSchema: () => insertUnityArPerformanceMetricSchema,
  insertUnityArSessionSchema: () => insertUnityArSessionSchema,
  insertUnityArSportConfigSchema: () => insertUnityArSportConfigSchema,
  insertUnityArSportSettingSchema: () => insertUnityArSportSettingSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserSportSchema: () => insertUserSportSchema,
  insertUserVenuePreferenceSchema: () => insertUserVenuePreferenceSchema,
  insertVenueLeaderboardEntrySchema: () => insertVenueLeaderboardEntrySchema,
  insertVenueLeaderboardSchema: () => insertVenueLeaderboardSchema,
  insertVenueSessionSchema: () => insertVenueSessionSchema,
  insertVirtualVenueSchema: () => insertVirtualVenueSchema,
  leaderboardChallenges: () => leaderboardChallenges,
  paymentTransactions: () => paymentTransactions,
  performanceMetrics: () => performanceMetrics,
  progressTracking: () => progressTracking,
  reviews: () => reviews,
  roomPerformanceMetrics: () => roomPerformanceMetrics,
  roomSessions: () => roomSessions,
  safetyLogs: () => safetyLogs,
  sessionStatusEnum: () => sessionStatusEnum,
  sessionTypeEnum: () => sessionTypeEnum,
  sessions: () => sessions,
  spaceConstraints: () => spaceConstraints,
  sportEnum: () => sportEnum,
  subscriptionPlans: () => subscriptionPlans,
  surfaceTypeEnum: () => surfaceTypeEnum,
  trainingSchedule: () => trainingSchedule,
  trainingSessions: () => trainingSessions,
  unityArBounceEvents: () => unityArBounceEvents,
  unityArModeEnum: () => unityArModeEnum,
  unityArPerformanceMetrics: () => unityArPerformanceMetrics,
  unityArSessions: () => unityArSessions,
  unityArSportConfigs: () => unityArSportConfigs,
  unityArSportSettings: () => unityArSportSettings,
  unityDevicePlatformEnum: () => unityDevicePlatformEnum,
  unityDifficultyEnum: () => unityDifficultyEnum,
  unitySessionStatusEnum: () => unitySessionStatusEnum,
  userRoleEnum: () => userRoleEnum,
  userSports: () => userSports,
  userSubscriptions: () => userSubscriptions,
  userVenuePreferences: () => userVenuePreferences,
  users: () => users,
  venueLeaderboardEntries: () => venueLeaderboardEntries,
  venueLeaderboards: () => venueLeaderboards,
  venueSessions: () => venueSessions,
  venueTypeEnum: () => venueTypeEnum,
  virtualVenues: () => virtualVenues,
  websocketSessions: () => websocketSessions
});
import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum = pgEnum("role", ["admin", "coach", "athlete"]);
var sportEnum = pgEnum("sport", [
  "archery",
  "swimming",
  "basketball",
  "football",
  "cricket",
  "gymnastics",
  "tennis",
  "badminton",
  "yoga",
  "athletics",
  "volleyball",
  "squash",
  "table_tennis",
  "cycling",
  "long_jump",
  "high_jump",
  "pole_vault",
  "hurdle",
  "boxing",
  "shotput_throw",
  "discus_throw",
  "javelin_throw",
  "hockey",
  "wrestling",
  "judo",
  "weightlifting",
  "karate",
  "skating",
  "ice_skating",
  "golf",
  "kabaddi",
  "kho_kho",
  "para_archery",
  "para_swimming",
  "para_basketball",
  "para_football",
  "para_cricket",
  "para_athletics",
  "para_tennis",
  "para_badminton",
  "para_volleyball",
  "para_table_tennis",
  "para_boxing",
  "para_wrestling",
  "para_judo",
  "para_weightlifting",
  "para_cycling",
  "para_skating",
  "wheelchair_basketball",
  "wheelchair_tennis",
  "wheelchair_racing",
  "blind_football",
  "goalball",
  "sitting_volleyball"
]);
var sessionStatusEnum = pgEnum("session_status", ["upcoming", "completed", "cancelled"]);
var sessionTypeEnum = pgEnum("session_type", [
  "technical",
  "performance_review",
  "form_correction",
  "strategy",
  "mental",
  "physical"
]);
var venueTypeEnum = pgEnum("venue_type", ["indoor", "outdoor", "stadium", "arena", "field", "court", "pool", "range"]);
var surfaceTypeEnum = pgEnum("surface_type", ["hardwood", "grass", "clay", "synthetic", "concrete", "water", "sand", "ice", "rubber"]);
var environmentConditionEnum = pgEnum("environment_condition", ["clear", "sunny", "cloudy", "rainy", "windy", "night", "indoor_lit"]);
var unityArModeEnum = pgEnum("unity_ar_mode", ["disabled", "enabled", "admin_only"]);
var unityDifficultyEnum = pgEnum("unity_difficulty", ["easy", "medium", "hard", "expert"]);
var unitySessionStatusEnum = pgEnum("unity_session_status", ["active", "paused", "completed", "failed"]);
var unityDevicePlatformEnum = pgEnum("unity_device_platform", ["android", "ios"]);
var authSessions = pgTable(
  "auth_sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  name: varchar("name").notNull(),
  password: varchar("password").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default("athlete"),
  primarySport: sportEnum("primary_sport"),
  // User's chosen sport
  classification: text("classification"),
  // Para sport classification (W1, B1, CP2, etc.)
  membershipTier: text("membership_tier").default("free"),
  // free, basic, premium, pro
  subscriptionStatus: text("subscription_status").default("inactive"),
  // active, inactive, expired
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  monthlySpent: integer("monthly_spent").default(0),
  // Track spending for analytics
  bio: text("bio"),
  rating: integer("rating"),
  experience: text("experience"),
  students: integer("students"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userSports = pgTable("user_sports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sport: sportEnum("sport").notNull()
});
var sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  status: sessionStatusEnum("status").notNull().default("upcoming"),
  type: sessionTypeEnum("session_type").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  date: timestamp("date").defaultNow()
});
var performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  metricName: text("metric_name").notNull(),
  metricValue: integer("metric_value").notNull(),
  improvement: integer("improvement"),
  date: timestamp("date").defaultNow()
});
var trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  focus: text("focus").notNull(),
  duration: text("duration").notNull(),
  intensity: integer("intensity").notNull(),
  performance: integer("performance"),
  date: timestamp("date").defaultNow()
});
var arMetrics = pgTable("ar_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  metricsData: text("metrics_data").notNull(),
  // JSON stored as text
  improvement: integer("improvement"),
  timestamp: timestamp("timestamp").defaultNow()
});
var achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  date: timestamp("date"),
  position: text("position"),
  category: text("category")
});
var arAnalysisResults = pgTable("ar_analysis_results", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  playerId: integer("player_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  analysisType: text("analysis_type").notNull(),
  realTimeData: text("real_time_data").notNull(),
  // JSON string of pose data
  finalScore: integer("final_score"),
  improvements: text("improvements").notNull(),
  // JSON array of suggestions
  recordingUrl: text("recording_url"),
  thumbnailUrl: text("thumbnail_url"),
  timestamp: timestamp("timestamp").defaultNow()
});
var drillRecommendations = pgTable("drill_recommendations", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  drillName: text("drill_name").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  // beginner, intermediate, advanced
  focusAreas: text("focus_areas").notNull(),
  // JSON array
  instructions: text("instructions").notNull(),
  // JSON array
  videoUrl: text("video_url"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  aiGenerated: boolean("ai_generated").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var progressTracking = pgTable("progress_tracking", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  metricName: text("metric_name").notNull(),
  currentValue: integer("current_value").notNull(),
  previousValue: integer("previous_value"),
  targetValue: integer("target_value"),
  unit: text("unit"),
  // seconds, meters, percentage, etc.
  category: text("category").notNull(),
  // speed, accuracy, strength, endurance, technique
  recordedAt: timestamp("recorded_at").defaultNow()
});
var coachPlayerRelations = pgTable("coach_player_relations", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => users.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  isActive: boolean("is_active").default(true)
});
var websocketSessions = pgTable("websocket_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  analysisType: text("analysis_type").notNull(),
  isActive: boolean("is_active").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at")
});
var trainingSchedule = pgTable("training_schedule", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  drillName: text("drill_name").notNull(),
  sport: sportEnum("sport").notNull(),
  targetArea: text("target_area").notNull(),
  // form, accuracy, speed, etc.
  priority: text("priority").notNull(),
  // high, critical, essential, etc.
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").default("scheduled"),
  // scheduled, completed, skipped
  estimatedDuration: text("estimated_duration"),
  difficulty: text("difficulty"),
  // Easy, Medium, Hard
  drillData: text("drill_data"),
  // JSON string with full drill details
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // "Freemium", "AI Training", "Pro Coach", etc.
  userType: userRoleEnum("user_type").notNull(),
  // athlete or coach
  price: integer("price").notNull(),
  // Price in rupees
  currency: text("currency").default("INR"),
  billingCycle: text("billing_cycle").notNull(),
  // monthly, yearly
  features: text("features").array(),
  // List of features included
  maxAnalysisPerMonth: integer("max_analysis_per_month"),
  // Analysis limit
  hasLiveCoaching: boolean("has_live_coaching").default(false),
  hasAdvancedMetrics: boolean("has_advanced_metrics").default(false),
  hasLeaderboardAccess: boolean("has_leaderboard_access").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull(),
  // active, cancelled, expired, paused
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").default(true),
  paymentMethod: text("payment_method"),
  // UPI, card, etc.
  transactionId: text("transaction_id"),
  amountPaid: integer("amount_paid").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subscriptionId: integer("subscription_id").references(() => userSubscriptions.id),
  amount: integer("amount").notNull(),
  currency: text("currency").default("INR"),
  transactionType: text("transaction_type").notNull(),
  // subscription, analysis, coaching_session, leaderboard_entry
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id").notNull(),
  status: text("status").notNull(),
  // success, failed, pending, refunded
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
});
var leaderboardChallenges = pgTable("leaderboard_challenges", {
  id: serial("id").primaryKey(),
  sport: sportEnum("sport").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  entryFee: integer("entry_fee").notNull(),
  // In rupees (5-20)
  prizePool: integer("prize_pool").notNull(),
  // Total prize money
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  status: text("status").default("upcoming"),
  // upcoming, active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow()
});
var challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => leaderboardChallenges.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  entryFeePaid: integer("entry_fee_paid").notNull(),
  currentScore: integer("current_score").default(0),
  currentRank: integer("current_rank"),
  joinedAt: timestamp("joined_at").defaultNow()
});
var virtualVenues = pgTable("virtual_venues", {
  id: serial("id").primaryKey(),
  sport: sportEnum("sport").notNull(),
  venueName: text("venue_name").notNull(),
  // "Madison Square Garden", "Wembley Stadium", "Wimbledon Centre Court"
  venueLocation: text("venue_location"),
  // "New York, USA", "London, England"
  venueType: venueTypeEnum("venue_type").notNull(),
  surfaceType: surfaceTypeEnum("surface_type").notNull(),
  isRealVenue: boolean("is_real_venue").default(true),
  // True for real venues, false for generic practice environments
  capacity: integer("capacity"),
  // Stadium/arena capacity
  dimensions: jsonb("dimensions").notNull(),
  // Court/field measurements in meters
  environmentEffects: jsonb("environment_effects"),
  // Weather, lighting, crowd noise levels
  gridConfiguration: jsonb("grid_configuration").notNull(),
  // Scoring zones and measurement grids
  difficulty: text("difficulty").notNull().default("intermediate"),
  // beginner, intermediate, advanced, professional
  unlockRequirement: jsonb("unlock_requirement"),
  // Performance score or achievement needed to unlock
  thumbnailUrl: text("thumbnail_url"),
  // Preview image URL
  modelUrl: text("model_url"),
  // 3D model or texture URL
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var userVenuePreferences = pgTable("user_venue_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sport: sportEnum("sport").notNull(),
  venueId: integer("venue_id").notNull().references(() => virtualVenues.id, { onDelete: "cascade" }),
  isUnlocked: boolean("is_unlocked").default(false),
  timesUsed: integer("times_used").default(0),
  bestScore: integer("best_score"),
  totalTimeSpent: integer("total_time_spent").default(0),
  // In seconds
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var venueSessions = pgTable("venue_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  venueId: integer("venue_id").notNull().references(() => virtualVenues.id, { onDelete: "cascade" }),
  sport: sportEnum("sport").notNull(),
  sessionType: text("session_type").notNull(),
  // "practice", "analysis", "challenge", "competition"
  duration: integer("duration").notNull(),
  // Session duration in seconds
  performanceScore: integer("performance_score"),
  metricsData: jsonb("metrics_data").notNull(),
  // Detailed performance metrics for the venue
  environmentCondition: environmentConditionEnum("environment_condition").default("clear"),
  gridAccuracy: jsonb("grid_accuracy"),
  // Accuracy per grid zone
  improvementAreas: text("improvement_areas").array(),
  // Areas that need work
  achievements: text("achievements").array(),
  // Session achievements unlocked
  recordingUrl: text("recording_url"),
  // Video recording of the session
  thumbnailUrl: text("thumbnail_url"),
  // Session thumbnail
  isCompleted: boolean("is_completed").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at").defaultNow()
});
var venueLeaderboards = pgTable("venue_leaderboards", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull().references(() => virtualVenues.id, { onDelete: "cascade" }),
  sport: sportEnum("sport").notNull(),
  leaderboardType: text("leaderboard_type").notNull(),
  // "weekly", "monthly", "all_time", "challenge"
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  isActive: boolean("is_active").default(true),
  prizePools: jsonb("prize_pools"),
  // Prize distribution for top performers
  createdAt: timestamp("created_at").defaultNow()
});
var venueLeaderboardEntries = pgTable("venue_leaderboard_entries", {
  id: serial("id").primaryKey(),
  leaderboardId: integer("leaderboard_id").notNull().references(() => venueLeaderboards.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  rank: integer("rank"),
  sessionsCount: integer("sessions_count").default(1),
  bestSessionId: integer("best_session_id").references(() => venueSessions.id),
  totalTime: integer("total_time").default(0),
  // Total time spent in venue
  achievedAt: timestamp("achieved_at").defaultNow()
});
var unityArSportSettings = pgTable("unity_ar_sport_settings", {
  id: serial("id").primaryKey(),
  sport: sportEnum("sport").notNull().unique(),
  arMode: unityArModeEnum("ar_mode").notNull().default("disabled"),
  defaultDifficulty: unityDifficultyEnum("default_difficulty").notNull().default("medium"),
  isActive: boolean("is_active").default(false),
  requiresCalibration: boolean("requires_calibration").default(true),
  minPlaneArea: integer("min_plane_area").default(12),
  // square meters
  maxPlayers: integer("max_players").default(1),
  sessionTimeout: integer("session_timeout").default(1800),
  // seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var unityArSessions = pgTable("unity_ar_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sport: sportEnum("sport").notNull(),
  drillConfigId: text("drill_config_id").notNull(),
  difficulty: unityDifficultyEnum("difficulty").notNull(),
  status: unitySessionStatusEnum("status").notNull().default("active"),
  devicePlatform: unityDevicePlatformEnum("device_platform").notNull(),
  deviceModel: text("device_model"),
  unityVersion: text("unity_version"),
  // Calibration data
  calibrationData: jsonb("calibration_data"),
  // Court/field positioning
  planeArea: integer("plane_area"),
  // Detected plane area in cm²
  // Session metrics
  duration: integer("duration").default(0),
  // seconds
  totalBounces: integer("total_bounces").default(0),
  successfulHits: integer("successful_hits").default(0),
  accuracy: integer("accuracy").default(0),
  // percentage
  averageReactionTime: integer("average_reaction_time").default(0),
  // milliseconds
  // Scoring
  precisionScore: integer("precision_score").default(0),
  paceScore: integer("pace_score").default(0),
  streakScore: integer("streak_score").default(0),
  totalScore: integer("total_score").default(0),
  // Session state
  sessionData: jsonb("session_data"),
  // Complete session log JSON
  heatmapData: jsonb("heatmap_data"),
  // Bounce positions for heatmap
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var unityArBounceEvents = pgTable("unity_ar_bounce_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => unityArSessions.id, { onDelete: "cascade" }),
  // Timing
  timestampMs: integer("timestamp_ms").notNull(),
  // Positions
  bounceWorldPos: jsonb("bounce_world_pos").notNull(),
  // [x, y, z] in Unity world space
  bounceCourtPos: jsonb("bounce_court_pos").notNull(),
  // [x, y] in court coordinate system
  targetIndex: integer("target_index").notNull(),
  targetPos: jsonb("target_pos").notNull(),
  // [x, y] target position
  // Accuracy
  errorDistance: integer("error_distance").notNull(),
  // millimeters
  isHit: boolean("is_hit").notNull(),
  toleranceRadius: integer("tolerance_radius").notNull(),
  // millimeters
  // Detection confidence
  visionConfidence: integer("vision_confidence").default(0),
  // 0-100
  audioConfidence: integer("audio_confidence").default(0),
  // 0-100
  fusionConfidence: integer("fusion_confidence").default(0),
  // 0-100
  createdAt: timestamp("created_at").defaultNow()
});
var unityArPerformanceMetrics = pgTable("unity_ar_performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sport: sportEnum("sport").notNull(),
  metricType: text("metric_type").notNull(),
  // 'precision', 'pace', 'consistency', 'improvement'
  // Time period aggregation
  periodType: text("period_type").notNull(),
  // 'session', 'daily', 'weekly', 'monthly'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  // Metric values
  value: integer("value").notNull(),
  previousValue: integer("previous_value").default(0),
  improvement: integer("improvement").default(0),
  percentile: integer("percentile").default(50),
  // vs other users
  // Context
  sessionsCount: integer("sessions_count").default(1),
  totalDuration: integer("total_duration").default(0),
  difficulty: unityDifficultyEnum("difficulty").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow()
});
var unityArSportConfigs = pgTable("unity_ar_sport_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sport: sportEnum("sport").notNull(),
  configVersion: text("config_version").notNull().default("1.0"),
  // Court/Field layout
  fieldDimensions: jsonb("field_dimensions").notNull(),
  // Length, width in meters
  markerLayout: jsonb("marker_layout").notNull(),
  // Drill marker positions
  scoringZones: jsonb("scoring_zones"),
  // Special scoring areas
  // Difficulty settings
  easyTolerance: integer("easy_tolerance").default(300),
  // millimeters
  mediumTolerance: integer("medium_tolerance").default(200),
  hardTolerance: integer("hard_tolerance").default(100),
  expertTolerance: integer("expert_tolerance").default(50),
  // Pacing requirements
  targetPaceHz: integer("target_pace_hz").default(220),
  // 2.2 Hz * 100
  // Scoring weights
  precisionWeight: integer("precision_weight").default(60),
  paceWeight: integer("pace_weight").default(30),
  streakWeight: integer("streak_weight").default(10),
  // Requirements
  minPlaneSize: jsonb("min_plane_size").notNull(),
  // [width, height] in meters
  requiresAudio: boolean("requires_audio").default(true),
  requiresVision: boolean("requires_vision").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserSportSchema = createInsertSchema(userSports).omit({
  id: true
});
var insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  date: true
});
var insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  date: true
});
var insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({
  id: true,
  date: true
});
var insertARMetricSchema = createInsertSchema(arMetrics).omit({
  id: true,
  timestamp: true
});
var insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true
});
var insertVirtualVenueSchema = createInsertSchema(virtualVenues).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUserVenuePreferenceSchema = createInsertSchema(userVenuePreferences).omit({
  id: true,
  createdAt: true
});
var insertVenueSessionSchema = createInsertSchema(venueSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true
});
var insertVenueLeaderboardSchema = createInsertSchema(venueLeaderboards).omit({
  id: true,
  createdAt: true
});
var insertVenueLeaderboardEntrySchema = createInsertSchema(venueLeaderboardEntries).omit({
  id: true,
  achievedAt: true
});
var insertUnityArSportSettingSchema = createInsertSchema(unityArSportSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertUnityArSessionSchema = createInsertSchema(unityArSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
  createdAt: true
});
var insertUnityArBounceEventSchema = createInsertSchema(unityArBounceEvents).omit({
  id: true,
  createdAt: true
});
var insertUnityArPerformanceMetricSchema = createInsertSchema(unityArPerformanceMetrics).omit({
  id: true,
  calculatedAt: true
});
var insertUnityArSportConfigSchema = createInsertSchema(unityArSportConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var roomSessions = pgTable("room_sessions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => trainingSessions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Room dimensions and characteristics  
  roomWidth: integer("room_width").notNull(),
  // centimeters for precision
  roomHeight: integer("room_height").notNull(),
  // centimeters for precision
  roomArea: integer("room_area").notNull(),
  // square centimeters
  ceilingHeight: integer("ceiling_height"),
  // centimeters (optional)
  isFlat: boolean("is_flat").notNull().default(true),
  aspectRatio: integer("aspect_ratio").notNull(),
  // multiplied by 100 for precision
  // Calibration data
  calibrationType: text("calibration_type").notNull().default("two_point"),
  // two_point, basketball_diameter
  baselineDistance: integer("baseline_distance").notNull(),
  // centimeters
  roomCenter: jsonb("room_center").notNull(),
  // {x, y, z} coordinates
  scaleFactor: integer("scale_factor").notNull().default(100),
  // multiplied by 100 for precision
  // Safety and environment
  safetyScore: integer("safety_score").notNull(),
  // 0-100
  obstacleCount: integer("obstacle_count").notNull().default(0),
  lightingConditions: text("lighting_conditions"),
  // good, moderate, poor
  reflectiveSurfaces: boolean("reflective_surfaces").notNull().default(false),
  // Platform and performance
  platform: text("platform").notNull(),
  // web_mediapipe, flutter_unity
  averageFps: integer("average_fps"),
  // FPS
  trackingQuality: integer("tracking_quality"),
  // 0-100
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var spaceConstraints = pgTable("space_constraints", {
  id: serial("id").primaryKey(),
  roomSessionId: integer("room_session_id").notNull().references(() => roomSessions.id, { onDelete: "cascade" }),
  // Constraint types
  constraintType: text("constraint_type").notNull(),
  // movement, target_placement, drill_modification
  severity: text("severity").notNull(),
  // low, medium, high, critical
  description: text("description").notNull(),
  // Affected areas (normalized coordinates 0-100)
  affectedArea: jsonb("affected_area").notNull(),
  // {x1, y1, x2, y2} or polygon
  recommendation: text("recommendation"),
  // Resolution
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow()
});
var safetyLogs = pgTable("safety_logs", {
  id: serial("id").primaryKey(),
  roomSessionId: integer("room_session_id").references(() => roomSessions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Incident details
  incidentType: text("incident_type").notNull(),
  // boundary_violation, collision_risk, pose_unsafe, tracking_lost
  severity: text("severity").notNull(),
  // info, warning, critical
  message: text("message").notNull(),
  // Context
  userPosition: jsonb("user_position"),
  // {x, y, z} at time of incident
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  drillPattern: text("drill_pattern"),
  // Response
  automaticResponse: text("automatic_response"),
  // pause, warning, drill_modification
  userResponse: text("user_response"),
  // acknowledged, ignored, session_stopped
  createdAt: timestamp("created_at").defaultNow()
});
var roomPerformanceMetrics = pgTable("room_performance_metrics", {
  id: serial("id").primaryKey(),
  roomSessionId: integer("room_session_id").notNull().references(() => roomSessions.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sport: sportEnum("sport").notNull(),
  // Room-specific metrics
  adaptationScore: integer("adaptation_score").notNull(),
  // 0-100 how well adapted to space
  spaceUtilization: integer("space_utilization").notNull(),
  // 0-100 percentage of space used
  movementEfficiency: integer("movement_efficiency").notNull(),
  // 0-100 efficient movement in confined space
  safetyCompliance: integer("safety_compliance").notNull(),
  // 0-100 adherence to safety boundaries
  // Drill modifications applied
  drillsModified: integer("drills_modified").default(0),
  targetAdjustments: integer("target_adjustments").default(0),
  speedReductions: integer("speed_reductions").default(0),
  // Performance comparison
  roomModeScore: integer("room_mode_score").notNull(),
  // Overall room mode performance
  venueEquivalentScore: integer("venue_equivalent_score"),
  // Estimated performance in full venue
  improvementPotential: integer("improvement_potential"),
  // 0-100 room for improvement
  recordedAt: timestamp("recorded_at").defaultNow()
});
var insertRoomSessionSchema = createInsertSchema(roomSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSpaceConstraintSchema = createInsertSchema(spaceConstraints).omit({
  id: true,
  createdAt: true
});
var insertSafetyLogSchema = createInsertSchema(safetyLogs).omit({
  id: true,
  timestamp: true,
  createdAt: true
});
var insertRoomPerformanceMetricSchema = createInsertSchema(roomPerformanceMetrics).omit({
  id: true,
  recordedAt: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, and } from "drizzle-orm";
var DatabaseStorage = class {
  // User methods
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getAllUsers() {
    return await db.select().from(users);
  }
  async updateUser(id, userData) {
    const [user] = await db.update(users).set({ ...userData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user;
  }
  // User-Sport methods
  async addUserSport(userSport) {
    const [newUserSport] = await db.insert(userSports).values(userSport).returning();
    return newUserSport;
  }
  async getUserSports(userId) {
    return await db.select().from(userSports).where(eq(userSports.userId, userId));
  }
  // Session methods
  async getAllSessions() {
    return await db.select().from(sessions).orderBy(desc(sessions.startTime));
  }
  async getSession(id) {
    const [session2] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session2;
  }
  async getSessionsByAthlete(athleteId) {
    return await db.select().from(sessions).where(eq(sessions.athleteId, athleteId)).orderBy(desc(sessions.startTime));
  }
  async getSessionsByCoach(coachId) {
    return await db.select().from(sessions).where(eq(sessions.coachId, coachId)).orderBy(desc(sessions.startTime));
  }
  async createSession(sessionData) {
    const [session2] = await db.insert(sessions).values(sessionData).returning();
    return session2;
  }
  async updateSessionStatus(id, status) {
    const [session2] = await db.update(sessions).set({ status, updatedAt: /* @__PURE__ */ new Date() }).where(eq(sessions.id, id)).returning();
    return session2;
  }
  // Review methods
  async getReview(id) {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  async getReviewsByCoach(coachId) {
    return await db.select().from(reviews).where(eq(reviews.coachId, coachId)).orderBy(desc(reviews.date));
  }
  async createReview(reviewData) {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }
  // Performance Metric methods
  async getPerformanceMetric(id) {
    const [metric] = await db.select().from(performanceMetrics).where(eq(performanceMetrics.id, id));
    return metric;
  }
  async getPerformanceMetricsByAthlete(athleteId) {
    return await db.select().from(performanceMetrics).where(eq(performanceMetrics.athleteId, athleteId)).orderBy(desc(performanceMetrics.date));
  }
  async createPerformanceMetric(metricData) {
    const [metric] = await db.insert(performanceMetrics).values(metricData).returning();
    return metric;
  }
  // Training Session methods
  async getTrainingSession(id) {
    const [session2] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, id));
    return session2;
  }
  async getTrainingSessionsByAthlete(athleteId) {
    return await db.select().from(trainingSessions).where(eq(trainingSessions.athleteId, athleteId)).orderBy(desc(trainingSessions.date));
  }
  async createTrainingSession(sessionData) {
    const [session2] = await db.insert(trainingSessions).values(sessionData).returning();
    return session2;
  }
  // AR Metric methods
  async getARMetric(id) {
    const [metric] = await db.select().from(arMetrics).where(eq(arMetrics.id, id));
    return metric;
  }
  async getARMetricsByUser(userId) {
    return await db.select().from(arMetrics).where(eq(arMetrics.userId, userId)).orderBy(desc(arMetrics.timestamp));
  }
  async createARMetric(metricData) {
    const [metric] = await db.insert(arMetrics).values(metricData).returning();
    return metric;
  }
  // Achievement methods
  async getAchievement(id) {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }
  async getAchievementsByUser(userId) {
    return await db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.date));
  }
  async createAchievement(achievementData) {
    const [achievement] = await db.insert(achievements).values(achievementData).returning();
    return achievement;
  }
  // Virtual Venue methods
  async getAllVenues() {
    return await db.select().from(virtualVenues).where(eq(virtualVenues.isActive, true)).orderBy(virtualVenues.sport, virtualVenues.venueName);
  }
  async getVenuesBySport(sport) {
    return await db.select().from(virtualVenues).where(and(eq(virtualVenues.sport, sport), eq(virtualVenues.isActive, true))).orderBy(virtualVenues.difficulty, virtualVenues.venueName);
  }
  async getVenue(id) {
    const [venue] = await db.select().from(virtualVenues).where(eq(virtualVenues.id, id));
    return venue;
  }
  async createVenue(venueData) {
    const [venue] = await db.insert(virtualVenues).values(venueData).returning();
    return venue;
  }
  async updateVenue(id, venueData) {
    const [venue] = await db.update(virtualVenues).set({ ...venueData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(virtualVenues.id, id)).returning();
    return venue;
  }
  async deleteVenue(id) {
    const result = await db.update(virtualVenues).set({ isActive: false, updatedAt: /* @__PURE__ */ new Date() }).where(eq(virtualVenues.id, id));
    return result.count > 0;
  }
  // User Venue Preference methods
  async getUserVenuePreferences(userId, sport) {
    const query = db.select().from(userVenuePreferences).where(eq(userVenuePreferences.userId, userId));
    if (sport) {
      return await query.where(eq(userVenuePreferences.sport, sport));
    }
    return await query;
  }
  async getUserVenuePreference(userId, venueId) {
    const [preference] = await db.select().from(userVenuePreferences).where(and(eq(userVenuePreferences.userId, userId), eq(userVenuePreferences.venueId, venueId)));
    return preference;
  }
  async createUserVenuePreference(preferenceData) {
    const [preference] = await db.insert(userVenuePreferences).values(preferenceData).returning();
    return preference;
  }
  async updateUserVenuePreference(id, preferenceData) {
    const [preference] = await db.update(userVenuePreferences).set(preferenceData).where(eq(userVenuePreferences.id, id)).returning();
    return preference;
  }
  async unlockVenueForUser(userId, venueId) {
    const venue = await this.getVenue(venueId);
    if (!venue) {
      throw new Error("Venue not found");
    }
    const existingPreference = await this.getUserVenuePreference(userId, venueId);
    if (existingPreference) {
      const updated = await this.updateUserVenuePreference(existingPreference.id, { isUnlocked: true });
      return updated;
    } else {
      return await this.createUserVenuePreference({
        userId,
        sport: venue.sport,
        venueId,
        isUnlocked: true
      });
    }
  }
  // Venue Session methods
  async getVenueSession(id) {
    const [session2] = await db.select().from(venueSessions).where(eq(venueSessions.id, id));
    return session2;
  }
  async getVenueSessionsByUser(userId) {
    return await db.select().from(venueSessions).where(eq(venueSessions.userId, userId)).orderBy(desc(venueSessions.completedAt));
  }
  async getVenueSessionsByVenue(venueId) {
    return await db.select().from(venueSessions).where(eq(venueSessions.venueId, venueId)).orderBy(desc(venueSessions.completedAt));
  }
  async createVenueSession(sessionData) {
    const [session2] = await db.insert(venueSessions).values(sessionData).returning();
    return session2;
  }
  async updateVenueSession(id, sessionData) {
    const [session2] = await db.update(venueSessions).set(sessionData).where(eq(venueSessions.id, id)).returning();
    return session2;
  }
  // Venue Leaderboard methods
  async getVenueLeaderboards(venueId, sport) {
    let query = db.select().from(venueLeaderboards).where(eq(venueLeaderboards.isActive, true));
    if (venueId) {
      query = query.where(eq(venueLeaderboards.venueId, venueId));
    }
    if (sport) {
      query = query.where(eq(venueLeaderboards.sport, sport));
    }
    return await query.orderBy(desc(venueLeaderboards.periodStart));
  }
  async getVenueLeaderboard(id) {
    const [leaderboard] = await db.select().from(venueLeaderboards).where(eq(venueLeaderboards.id, id));
    return leaderboard;
  }
  async createVenueLeaderboard(leaderboardData) {
    const [leaderboard] = await db.insert(venueLeaderboards).values(leaderboardData).returning();
    return leaderboard;
  }
  async getVenueLeaderboardEntries(leaderboardId) {
    return await db.select().from(venueLeaderboardEntries).where(eq(venueLeaderboardEntries.leaderboardId, leaderboardId)).orderBy(venueLeaderboardEntries.rank);
  }
  async createVenueLeaderboardEntry(entryData) {
    const [entry] = await db.insert(venueLeaderboardEntries).values(entryData).returning();
    return entry;
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  const fullName = [claims["first_name"], claims["last_name"]].filter(Boolean).join(" ") || claims["email"] || "Anonymous User";
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    name: fullName,
    password: "oauth_user",
    // Placeholder for OAuth users
    profileImageUrl: claims["profile_image_url"],
    role: "athlete"
    // Default role
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/websocket.ts
import { WebSocketServer } from "ws";
import { v4 as uuidv4 } from "uuid";
var WebSocketManager = class {
  wss;
  activeSessions = /* @__PURE__ */ new Map();
  clientConnections = /* @__PURE__ */ new Map();
  constructor(server) {
    this.wss = new WebSocketServer({
      server,
      path: "/ws",
      verifyClient: (info) => {
        return true;
      }
    });
    this.wss.on("connection", this.handleConnection.bind(this));
  }
  handleConnection(ws2, request) {
    const sessionId = uuidv4();
    console.log(`New WebSocket connection: ${sessionId}`);
    ws2.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws2, sessionId, message);
      } catch (error) {
        console.error("Invalid message format:", error);
        ws2.send(JSON.stringify({ error: "Invalid message format" }));
      }
    });
    ws2.on("close", () => {
      console.log(`WebSocket connection closed: ${sessionId}`);
      this.cleanupSession(sessionId);
    });
    ws2.on("error", (error) => {
      console.error(`WebSocket error for session ${sessionId}:`, error);
      this.cleanupSession(sessionId);
    });
    ws2.send(JSON.stringify({
      type: "connection_established",
      sessionId,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }));
  }
  async handleMessage(ws2, sessionId, message) {
    switch (message.type) {
      case "start_analysis":
        await this.startAnalysisSession(ws2, sessionId, message);
        break;
      case "camera_frame":
        await this.processFrame(ws2, sessionId, message);
        break;
      case "end_analysis":
        await this.endAnalysisSession(ws2, sessionId, message);
        break;
      default:
        ws2.send(JSON.stringify({ error: "Unknown message type" }));
    }
  }
  async startAnalysisSession(ws2, sessionId, message) {
    const { userId, sport, analysisType } = message;
    const session2 = {
      sessionId,
      userId,
      sport,
      analysisType,
      isActive: true,
      startedAt: /* @__PURE__ */ new Date()
    };
    this.activeSessions.set(sessionId, session2);
    this.clientConnections.set(sessionId, ws2);
    ws2.send(JSON.stringify({
      type: "analysis_started",
      sessionId,
      sport,
      analysisType,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    }));
    console.log(`Analysis session started: ${sessionId} for user ${userId} - ${sport}`);
  }
  async processFrame(ws2, sessionId, message) {
    const session2 = this.activeSessions.get(sessionId);
    if (!session2 || !session2.isActive) {
      ws2.send(JSON.stringify({ error: "No active analysis session" }));
      return;
    }
    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sport: session2.sport,
          analysis_type: session2.analysisType,
          image_data: message.frameData,
          session_id: sessionId
        })
      });
      if (response.ok) {
        const analysisResult = await response.json();
        ws2.send(JSON.stringify({
          type: "analysis_result",
          sessionId,
          result: analysisResult,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      } else {
        ws2.send(JSON.stringify({
          type: "analysis_error",
          error: "AI analysis failed",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
    } catch (error) {
      console.error("Frame processing error:", error);
      ws2.send(JSON.stringify({
        type: "analysis_error",
        error: "Processing failed",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }));
    }
  }
  async endAnalysisSession(ws2, sessionId, message) {
    const session2 = this.activeSessions.get(sessionId);
    if (!session2) {
      ws2.send(JSON.stringify({ error: "No analysis session found" }));
      return;
    }
    session2.isActive = false;
    try {
      const response = await fetch("http://localhost:8000/generate_report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: session2.userId,
          sport: session2.sport,
          analysis_type: session2.analysisType
        })
      });
      if (response.ok) {
        const report = await response.json();
        ws2.send(JSON.stringify({
          type: "session_complete",
          sessionId,
          report,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }));
      }
    } catch (error) {
      console.error("Report generation error:", error);
    }
    this.cleanupSession(sessionId);
    console.log(`Analysis session ended: ${sessionId}`);
  }
  cleanupSession(sessionId) {
    this.activeSessions.delete(sessionId);
    this.clientConnections.delete(sessionId);
  }
  getActiveSessionsCount() {
    return this.activeSessions.size;
  }
  getSessionInfo(sessionId) {
    return this.activeSessions.get(sessionId);
  }
};
var websocket_default = WebSocketManager;

// server/routes/unity-ar.ts
import { Router } from "express";
import { eq as eq2, and as and2, desc as desc2, sql as sql2 } from "drizzle-orm";
import { z } from "zod";
var router = Router();
var checkAvailabilitySchema = z.object({
  sport: z.string(),
  userId: z.string().optional()
});
var createSessionSchema = z.object({
  userId: z.string(),
  sport: z.string(),
  drillConfigId: z.string(),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]),
  devicePlatform: z.enum(["android", "ios"]),
  deviceModel: z.string().optional(),
  unityVersion: z.string().optional()
});
var updateSessionSchema = z.object({
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
  status: z.enum(["active", "paused", "completed", "failed"]).optional()
});
var createBounceEventSchema = z.object({
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
  fusionConfidence: z.number().min(0).max(100).optional()
});
var createRoomSessionSchema = z.object({
  userId: z.string(),
  sport: z.string(),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]),
  drillPattern: z.enum(["dribble_box", "micro_ladder", "figure_8", "wall_rebound", "seated_control"]),
  roomConstraints: z.object({
    width: z.number(),
    height: z.number(),
    isFlat: z.boolean(),
    ceilingHeight: z.number().optional(),
    wallProximity: z.number().optional(),
    safetyMargin: z.number().default(0.3)
  }),
  devicePlatform: z.enum(["android", "ios", "web"]),
  platformType: z.enum(["unity", "mediapipe"]).default("unity")
});
var logSafetyIncidentSchema = z.object({
  sessionId: z.string(),
  incidentType: z.enum(["ceiling_collision", "wall_proximity", "floor_hazard", "movement_restriction"]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  description: z.string(),
  userPosition: z.array(z.number()).length(3).optional(),
  recommendedAction: z.string().optional(),
  wasSessionPaused: z.boolean().default(false),
  timestampMs: z.number()
});
var updateRoomSessionSchema = z.object({
  sessionId: z.string(),
  patternsCompleted: z.number().optional(),
  safetyViolations: z.number().optional(),
  adaptiveToleranceUsed: z.boolean().optional(),
  roomModeMetrics: z.object({
    confinedSpaceScore: z.number(),
    adaptabilityScore: z.number(),
    safetyComplianceScore: z.number(),
    patternEfficiency: z.number()
  }).optional(),
  status: z.enum(["active", "paused", "completed", "failed"]).optional()
});
router.get("/check-availability", async (req, res) => {
  try {
    const { sport, userId } = checkAvailabilitySchema.parse(req.query);
    const [sportSetting] = await db.select().from(unityArSportSettings).where(eq2(unityArSportSettings.sport, sport));
    if (!sportSetting) {
      return res.json({
        available: false,
        reason: "Unity AR not configured for this sport"
      });
    }
    if (sportSetting.arMode === "disabled") {
      return res.json({
        available: false,
        reason: "Unity AR is disabled for this sport"
      });
    }
    if (sportSetting.arMode === "admin_only" && userId) {
      const [user] = await db.select().from(users).where(eq2(users.id, userId));
      if (!user || user.role !== "admin") {
        return res.json({
          available: false,
          reason: "Unity AR is restricted to administrators for this sport"
        });
      }
    }
    const [sportConfig] = await db.select().from(unityArSportConfigs).where(and2(
      eq2(unityArSportConfigs.sport, sport),
      eq2(unityArSportConfigs.isActive, true)
    )).orderBy(desc2(unityArSportConfigs.createdAt)).limit(1);
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
    console.error("Error checking Unity AR availability:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/sport-config/:sport", async (req, res) => {
  try {
    const { sport } = req.params;
    const [config] = await db.select().from(unityArSportConfigs).where(and2(
      eq2(unityArSportConfigs.sport, sport),
      eq2(unityArSportConfigs.isActive, true)
    )).orderBy(desc2(unityArSportConfigs.createdAt)).limit(1);
    if (!config) {
      return res.status(404).json({ error: "Sport configuration not found" });
    }
    res.json(config);
  } catch (error) {
    console.error("Error fetching sport config:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/sessions", async (req, res) => {
  try {
    const sessionData = createSessionSchema.parse(req.body);
    const [session2] = await db.insert(unityArSessions).values({
      ...sessionData,
      status: "active"
    }).returning();
    res.json(session2);
  } catch (error) {
    console.error("Error creating Unity AR session:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router.put("/sessions", async (req, res) => {
  try {
    const updateData = updateSessionSchema.parse(req.body);
    const { sessionId, ...updates } = updateData;
    if (updates.status === "completed") {
      updates.completedAt = /* @__PURE__ */ new Date();
    }
    const [session2] = await db.update(unityArSessions).set(updates).where(eq2(unityArSessions.id, sessionId)).returning();
    if (!session2) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session2);
  } catch (error) {
    console.error("Error updating Unity AR session:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const [session2] = await db.select().from(unityArSessions).where(eq2(unityArSessions.id, sessionId));
    if (!session2) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.json(session2);
  } catch (error) {
    console.error("Error fetching Unity AR session:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/bounce-events", async (req, res) => {
  try {
    const bounceData = createBounceEventSchema.parse(req.body);
    const [bounceEvent] = await db.insert(unityArBounceEvents).values({
      ...bounceData,
      bounceWorldPos: bounceData.bounceWorldPos,
      bounceCourtPos: bounceData.bounceCourtPos,
      targetPos: bounceData.targetPos
    }).returning();
    res.json(bounceEvent);
  } catch (error) {
    console.error("Error creating bounce event:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/sessions/:sessionId/bounce-events", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = "100", offset = "0" } = req.query;
    const bounceEvents = await db.select().from(unityArBounceEvents).where(eq2(unityArBounceEvents.sessionId, sessionId)).orderBy(unityArBounceEvents.timestampMs).limit(parseInt(limit)).offset(parseInt(offset));
    res.json(bounceEvents);
  } catch (error) {
    console.error("Error fetching bounce events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/users/:userId/sessions", async (req, res) => {
  try {
    const { userId } = req.params;
    const { sport, limit = "20", offset = "0" } = req.query;
    let query = db.select().from(unityArSessions).where(eq2(unityArSessions.userId, userId));
    if (sport) {
      query = query.where(and2(
        eq2(unityArSessions.userId, userId),
        eq2(unityArSessions.sport, sport)
      ));
    }
    const sessions2 = await query.orderBy(desc2(unityArSessions.createdAt)).limit(parseInt(limit)).offset(parseInt(offset));
    res.json(sessions2);
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/users/:userId/performance-metrics", async (req, res) => {
  try {
    const { userId } = req.params;
    const { sport, periodType = "weekly", limit = "10" } = req.query;
    let query = db.select().from(unityArPerformanceMetrics).where(eq2(unityArPerformanceMetrics.userId, userId));
    if (sport) {
      query = query.where(and2(
        eq2(unityArPerformanceMetrics.userId, userId),
        eq2(unityArPerformanceMetrics.sport, sport)
      ));
    }
    if (periodType) {
      query = query.where(and2(
        eq2(unityArPerformanceMetrics.userId, userId),
        eq2(unityArPerformanceMetrics.periodType, periodType)
      ));
    }
    const metrics = await query.orderBy(desc2(unityArPerformanceMetrics.calculatedAt)).limit(parseInt(limit));
    res.json(metrics);
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/leaderboard/:sport", async (req, res) => {
  try {
    const { sport } = req.params;
    const { period = "weekly", limit = "10" } = req.query;
    const leaderboard = await db.select({
      userId: unityArSessions.userId,
      userName: users.name,
      profileImageUrl: users.profileImageUrl,
      totalScore: sql2`AVG(${unityArSessions.totalScore})`,
      sessionCount: sql2`COUNT(*)`,
      averageAccuracy: sql2`AVG(${unityArSessions.accuracy})`,
      bestScore: sql2`MAX(${unityArSessions.totalScore})`
    }).from(unityArSessions).innerJoin(users, eq2(unityArSessions.userId, users.id)).where(and2(
      eq2(unityArSessions.sport, sport),
      eq2(unityArSessions.status, "completed")
    )).groupBy(unityArSessions.userId, users.name, users.profileImageUrl).orderBy(desc2(sql2`AVG(${unityArSessions.totalScore})`)).limit(parseInt(limit));
    res.json(leaderboard);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/admin/stats", async (req, res) => {
  try {
    const [sessionStats] = await db.select({
      totalSessions: sql2`COUNT(*)`,
      completedSessions: sql2`COUNT(*) FILTER (WHERE status = 'completed')`,
      averageDuration: sql2`AVG(duration)`
    }).from(unityArSessions);
    const [activeSportsCount] = await db.select({
      count: sql2`COUNT(DISTINCT sport)`
    }).from(unityArSportSettings).where(eq2(unityArSportSettings.isActive, true));
    const [topSport] = await db.select({
      sport: unityArSessions.sport,
      sessionCount: sql2`COUNT(*)`
    }).from(unityArSessions).groupBy(unityArSessions.sport).orderBy(desc2(sql2`COUNT(*)`)).limit(1);
    const [userStats] = await db.select({
      totalUsers: sql2`COUNT(DISTINCT ${unityArSessions.userId})`,
      dailyActiveUsers: sql2`COUNT(DISTINCT ${unityArSessions.userId}) FILTER (WHERE ${unityArSessions.createdAt} > NOW() - INTERVAL '1 day')`
    }).from(unityArSessions);
    res.json({
      totalSessions: sessionStats.totalSessions,
      activeSports: activeSportsCount.count,
      averageSessionDuration: sessionStats.averageDuration || 0,
      topPerformingSport: topSport?.sport || "basketball",
      totalUsers: userStats.totalUsers,
      dailyActiveUsers: userStats.dailyActiveUsers
    });
  } catch (error) {
    console.error("Error fetching Unity AR stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/room-sessions", async (req, res) => {
  try {
    const roomSessionData = createRoomSessionSchema.parse(req.body);
    const [session2] = await db.insert(unityArSessions).values({
      userId: roomSessionData.userId,
      sport: roomSessionData.sport,
      drillConfigId: `room_${roomSessionData.drillPattern}`,
      difficulty: roomSessionData.difficulty,
      devicePlatform: roomSessionData.devicePlatform,
      deviceModel: `${roomSessionData.platformType}_room_mode`,
      status: "active",
      sessionData: {
        isRoomMode: true,
        drillPattern: roomSessionData.drillPattern,
        roomConstraints: roomSessionData.roomConstraints,
        platformType: roomSessionData.platformType
      }
    }).returning();
    res.json({
      ...session2,
      roomMode: true,
      drillPattern: roomSessionData.drillPattern,
      constraints: roomSessionData.roomConstraints
    });
  } catch (error) {
    console.error("Error creating room mode session:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/safety-incidents", async (req, res) => {
  try {
    const incidentData = logSafetyIncidentSchema.parse(req.body);
    const [session2] = await db.select().from(unityArSessions).where(eq2(unityArSessions.id, incidentData.sessionId)).limit(1);
    if (!session2) {
      return res.status(404).json({ error: "Session not found" });
    }
    const currentSessionData = session2.sessionData || {};
    const safetyLogs3 = currentSessionData.safetyLogs || [];
    const newIncident = {
      id: `incident_${Date.now()}`,
      ...incidentData,
      loggedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await db.update(unityArSessions).set({
      sessionData: {
        ...currentSessionData,
        safetyLogs: [...safetyLogs3, newIncident],
        totalSafetyIncidents: (currentSessionData.totalSafetyIncidents || 0) + 1,
        lastIncidentSeverity: incidentData.severity
      }
    }).where(eq2(unityArSessions.id, incidentData.sessionId));
    if (incidentData.severity === "critical" && !incidentData.wasSessionPaused) {
      await db.update(unityArSessions).set({ status: "paused" }).where(eq2(unityArSessions.id, incidentData.sessionId));
    }
    res.json({ success: true, incidentId: newIncident.id });
  } catch (error) {
    console.error("Error logging safety incident:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/users/:userId/room-analytics", async (req, res) => {
  try {
    const { userId } = req.params;
    const { timeframe = "week" } = req.query;
    const roomSessions3 = await db.select().from(unityArSessions).where(and2(
      eq2(unityArSessions.userId, userId),
      sql2`${unityArSessions.sessionData}->>'isRoomMode' = 'true'`,
      eq2(unityArSessions.status, "completed")
    )).orderBy(desc2(unityArSessions.createdAt));
    if (roomSessions3.length === 0) {
      return res.json({
        totalRoomSessions: 0,
        patternDistribution: {},
        safetyMetrics: {},
        averageScores: {},
        improvement: {}
      });
    }
    const patternDistribution = roomSessions3.reduce((acc, session2) => {
      const pattern = session2.sessionData?.drillPattern || "unknown";
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {});
    const safetyMetrics = {
      totalIncidents: roomSessions3.reduce((sum2, session2) => sum2 + (session2.sessionData?.totalSafetyIncidents || 0), 0),
      averageIncidentsPerSession: 0,
      criticalIncidents: 0,
      safetyComplianceRate: 0
    };
    safetyMetrics.averageIncidentsPerSession = safetyMetrics.totalIncidents / roomSessions3.length;
    safetyMetrics.criticalIncidents = roomSessions3.reduce((count2, session2) => {
      const logs = session2.sessionData?.safetyLogs || [];
      return count2 + logs.filter((log2) => log2.severity === "critical").length;
    }, 0);
    safetyMetrics.safetyComplianceRate = (roomSessions3.length - safetyMetrics.criticalIncidents) / roomSessions3.length * 100;
    const averageScores = {
      overallScore: roomSessions3.reduce((sum2, session2) => sum2 + (session2.totalScore || 0), 0) / roomSessions3.length,
      accuracy: roomSessions3.reduce((sum2, session2) => sum2 + (session2.accuracy || 0), 0) / roomSessions3.length,
      confinedSpaceAdaptation: 0
    };
    const roomModeScores = roomSessions3.map((session2) => session2.sessionData?.roomModeMetrics?.confinedSpaceScore).filter((score) => score !== void 0);
    if (roomModeScores.length > 0) {
      averageScores.confinedSpaceAdaptation = roomModeScores.reduce((sum2, score) => sum2 + score, 0) / roomModeScores.length;
    }
    res.json({
      totalRoomSessions: roomSessions3.length,
      patternDistribution,
      safetyMetrics,
      averageScores,
      improvement: {
        scoresTrend: _calculateScoresTrend(roomSessions3),
        safetyTrend: _calculateSafetyTrend(roomSessions3)
      }
    });
  } catch (error) {
    console.error("Error fetching room analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/room-recommendations", async (req, res) => {
  try {
    const { width, height, isFlat, ceilingHeight, sport } = req.body;
    const recommendations = {
      recommendedPatterns: [],
      safetyWarnings: [],
      adaptations: {}
    };
    if (width >= 2.5 && height >= 2.5 && isFlat) {
      recommendations.recommendedPatterns.push("dribble_box");
    }
    if (width >= 2 || height >= 2) {
      recommendations.recommendedPatterns.push("micro_ladder");
    }
    if (width >= 1.8 && height >= 1.8) {
      recommendations.recommendedPatterns.push("figure_8");
    }
    if (ceilingHeight && ceilingHeight < 2.3) {
      recommendations.safetyWarnings.push("Low ceiling - overhead movements restricted");
      recommendations.recommendedPatterns.push("seated_control");
    }
    if (width * height < 4) {
      recommendations.safetyWarnings.push("Very confined space - reduced movement patterns only");
      recommendations.adaptations.toleranceMultiplier = 1.5;
      recommendations.adaptations.reducedTargetCount = true;
    }
    if (sport === "basketball" && (ceilingHeight || 3) < 2.8) {
      recommendations.safetyWarnings.push("Insufficient ceiling height for basketball shooting motions");
      recommendations.adaptations.noOverheadMovements = true;
    }
    res.json(recommendations);
  } catch (error) {
    console.error("Error generating room recommendations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
function _calculateScoresTrend(sessions2) {
  if (sessions2.length < 2) return "insufficient_data";
  const recentSessions = sessions2.slice(0, Math.min(5, sessions2.length));
  const olderSessions = sessions2.slice(Math.min(5, sessions2.length));
  const recentAvg = recentSessions.reduce((sum2, s) => sum2 + (s.totalScore || 0), 0) / recentSessions.length;
  const olderAvg = olderSessions.reduce((sum2, s) => sum2 + (s.totalScore || 0), 0) / olderSessions.length;
  if (recentAvg > olderAvg * 1.1) return "improving";
  if (recentAvg < olderAvg * 0.9) return "declining";
  return "stable";
}
function _calculateSafetyTrend(sessions2) {
  if (sessions2.length < 2) return "insufficient_data";
  const recentSessions = sessions2.slice(0, Math.min(5, sessions2.length));
  const olderSessions = sessions2.slice(Math.min(5, sessions2.length));
  const recentIncidents = recentSessions.reduce((sum2, s) => sum2 + (s.sessionData?.totalSafetyIncidents || 0), 0);
  const olderIncidents = olderSessions.reduce((sum2, s) => sum2 + (s.sessionData?.totalSafetyIncidents || 0), 0);
  const recentRate = recentIncidents / recentSessions.length;
  const olderRate = olderIncidents / olderSessions.length;
  if (recentRate < olderRate * 0.8) return "improving";
  if (recentRate > olderRate * 1.2) return "declining";
  return "stable";
}

// server/routes/admin-unity-ar.ts
import { Router as Router2 } from "express";
import { eq as eq3, and as and3, desc as desc3, sql as sql3 } from "drizzle-orm";
import { z as z2 } from "zod";
var router2 = Router2();
var updateSportSettingsSchema = z2.object({
  settings: z2.array(z2.object({
    id: z2.number().optional(),
    sport: z2.string(),
    arMode: z2.enum(["disabled", "enabled", "admin_only"]),
    defaultDifficulty: z2.enum(["easy", "medium", "hard", "expert"]),
    isActive: z2.boolean(),
    requiresCalibration: z2.boolean(),
    minPlaneArea: z2.number(),
    maxPlayers: z2.number(),
    sessionTimeout: z2.number()
  }))
});
var createSportConfigSchema = z2.object({
  sport: z2.string(),
  configVersion: z2.string(),
  fieldDimensions: z2.object({
    length: z2.number(),
    width: z2.number()
  }),
  markerLayout: z2.object({
    pattern: z2.string(),
    positions: z2.array(z2.object({
      x: z2.number(),
      y: z2.number(),
      targetRadius: z2.number().optional()
    }))
  }),
  scoringZones: z2.array(z2.object({
    name: z2.string(),
    type: z2.string(),
    position: z2.object({ x: z2.number(), y: z2.number() }),
    dimensions: z2.object({ width: z2.number(), height: z2.number() }).optional(),
    radius: z2.number().optional()
  })).optional(),
  easyTolerance: z2.number(),
  mediumTolerance: z2.number(),
  hardTolerance: z2.number(),
  expertTolerance: z2.number(),
  targetPaceHz: z2.number(),
  precisionWeight: z2.number(),
  paceWeight: z2.number(),
  streakWeight: z2.number(),
  minPlaneSize: z2.object({
    width: z2.number(),
    height: z2.number()
  }),
  requiresAudio: z2.boolean(),
  requiresVision: z2.boolean()
});
var requireAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const [user] = await db.select().from(users).where(eq3(users.id, userId));
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Admin privileges required" });
    }
    next();
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
router2.get("/settings", requireAdmin, async (req, res) => {
  try {
    const settings = await db.select().from(unityArSportSettings).orderBy(unityArSportSettings.sport);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching Unity AR settings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/settings", requireAdmin, async (req, res) => {
  try {
    const { settings } = updateSportSettingsSchema.parse(req.body);
    await db.transaction(async (tx) => {
      for (const setting of settings) {
        if (setting.id) {
          await tx.update(unityArSportSettings).set({
            arMode: setting.arMode,
            defaultDifficulty: setting.defaultDifficulty,
            isActive: setting.isActive,
            requiresCalibration: setting.requiresCalibration,
            minPlaneArea: setting.minPlaneArea,
            maxPlayers: setting.maxPlayers,
            sessionTimeout: setting.sessionTimeout,
            updatedAt: /* @__PURE__ */ new Date()
          }).where(eq3(unityArSportSettings.id, setting.id));
        } else {
          await tx.insert(unityArSportSettings).values({
            sport: setting.sport,
            arMode: setting.arMode,
            defaultDifficulty: setting.defaultDifficulty,
            isActive: setting.isActive,
            requiresCalibration: setting.requiresCalibration,
            minPlaneArea: setting.minPlaneArea,
            maxPlayers: setting.maxPlayers,
            sessionTimeout: setting.sessionTimeout
          }).onConflictDoUpdate({
            target: unityArSportSettings.sport,
            set: {
              arMode: setting.arMode,
              defaultDifficulty: setting.defaultDifficulty,
              isActive: setting.isActive,
              requiresCalibration: setting.requiresCalibration,
              minPlaneArea: setting.minPlaneArea,
              maxPlayers: setting.maxPlayers,
              sessionTimeout: setting.sessionTimeout,
              updatedAt: /* @__PURE__ */ new Date()
            }
          });
        }
      }
    });
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating Unity AR settings:", error);
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/sport-configs", requireAdmin, async (req, res) => {
  try {
    const configs = await db.select().from(unityArSportConfigs).orderBy(unityArSportConfigs.sport, desc3(unityArSportConfigs.createdAt));
    res.json(configs);
  } catch (error) {
    console.error("Error fetching Unity AR sport configs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.post("/sport-configs", requireAdmin, async (req, res) => {
  try {
    const configData = createSportConfigSchema.parse(req.body);
    await db.update(unityArSportConfigs).set({ isActive: false }).where(eq3(unityArSportConfigs.sport, configData.sport));
    const [newConfig] = await db.insert(unityArSportConfigs).values({
      sport: configData.sport,
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
      isActive: true
    }).returning();
    res.json(newConfig);
  } catch (error) {
    console.error("Error creating Unity AR sport config:", error);
    if (error instanceof z2.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/analytics/sessions", requireAdmin, async (req, res) => {
  try {
    const { sport, days = "30" } = req.query;
    const daysAgo = parseInt(days);
    let baseQuery = db.select({
      date: sql3`DATE(${unityArSessions.createdAt})`,
      sport: unityArSessions.sport,
      sessionCount: sql3`COUNT(*)`,
      completedSessions: sql3`COUNT(*) FILTER (WHERE status = 'completed')`,
      averageScore: sql3`AVG(${unityArSessions.totalScore}) FILTER (WHERE status = 'completed')`,
      averageDuration: sql3`AVG(${unityArSessions.duration}) FILTER (WHERE status = 'completed')`,
      averageAccuracy: sql3`AVG(${unityArSessions.accuracy}) FILTER (WHERE status = 'completed')`,
      uniqueUsers: sql3`COUNT(DISTINCT ${unityArSessions.userId})`
    }).from(unityArSessions).where(sql3`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`);
    if (sport) {
      baseQuery = baseQuery.where(eq3(unityArSessions.sport, sport));
    }
    const analytics = await baseQuery.groupBy(sql3`DATE(${unityArSessions.createdAt})`, unityArSessions.sport).orderBy(sql3`DATE(${unityArSessions.createdAt}) DESC`);
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching Unity AR analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/analytics/engagement", requireAdmin, async (req, res) => {
  try {
    const { days = "30" } = req.query;
    const daysAgo = parseInt(days);
    const dailyActiveUsers = await db.select({
      date: sql3`DATE(${unityArSessions.createdAt})`,
      activeUsers: sql3`COUNT(DISTINCT ${unityArSessions.userId})`
    }).from(unityArSessions).where(sql3`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`).groupBy(sql3`DATE(${unityArSessions.createdAt})`).orderBy(sql3`DATE(${unityArSessions.createdAt}) DESC`);
    const retention = await db.select({
      sport: unityArSessions.sport,
      totalUsers: sql3`COUNT(DISTINCT ${unityArSessions.userId})`,
      returningUsers: sql3`COUNT(DISTINCT ${unityArSessions.userId}) FILTER (WHERE (SELECT COUNT(*) FROM ${unityArSessions} s2 WHERE s2.user_id = ${unityArSessions.userId} AND s2.created_at > ${unityArSessions.createdAt} + INTERVAL '1 day' AND s2.created_at < ${unityArSessions.createdAt} + INTERVAL '7 days') > 0)`
    }).from(unityArSessions).where(sql3`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`).groupBy(unityArSessions.sport);
    const completion = await db.select({
      sport: unityArSessions.sport,
      totalSessions: sql3`COUNT(*)`,
      completedSessions: sql3`COUNT(*) FILTER (WHERE status = 'completed')`,
      failedSessions: sql3`COUNT(*) FILTER (WHERE status = 'failed')`
    }).from(unityArSessions).where(sql3`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`).groupBy(unityArSessions.sport);
    res.json({
      dailyActiveUsers,
      retention,
      completion
    });
  } catch (error) {
    console.error("Error fetching Unity AR engagement metrics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router2.get("/analytics/devices", requireAdmin, async (req, res) => {
  try {
    const { days = "30" } = req.query;
    const daysAgo = parseInt(days);
    const platforms = await db.select({
      platform: unityArSessions.devicePlatform,
      sessionCount: sql3`COUNT(*)`,
      uniqueUsers: sql3`COUNT(DISTINCT ${unityArSessions.userId})`,
      averageScore: sql3`AVG(${unityArSessions.totalScore}) FILTER (WHERE status = 'completed')`,
      completionRate: sql3`COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / COUNT(*)`
    }).from(unityArSessions).where(sql3`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`).groupBy(unityArSessions.devicePlatform);
    const devices = await db.select({
      deviceModel: unityArSessions.deviceModel,
      sessionCount: sql3`COUNT(*)`,
      averageScore: sql3`AVG(${unityArSessions.totalScore}) FILTER (WHERE status = 'completed')`
    }).from(unityArSessions).where(and3(
      sql3`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`,
      sql3`${unityArSessions.deviceModel} IS NOT NULL`
    )).groupBy(unityArSessions.deviceModel).orderBy(desc3(sql3`COUNT(*)`)).limit(10);
    const unityVersions = await db.select({
      unityVersion: unityArSessions.unityVersion,
      sessionCount: sql3`COUNT(*)`,
      averageScore: sql3`AVG(${unityArSessions.totalScore}) FILTER (WHERE status = 'completed')`
    }).from(unityArSessions).where(and3(
      sql3`${unityArSessions.createdAt} > NOW() - INTERVAL '${daysAgo} days'`,
      sql3`${unityArSessions.unityVersion} IS NOT NULL`
    )).groupBy(unityArSessions.unityVersion).orderBy(desc3(sql3`COUNT(*)`));
    res.json({
      platforms,
      devices,
      unityVersions
    });
  } catch (error) {
    console.error("Error fetching Unity AR device analytics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// server/routes/room-mode-sync.ts
import { Router as Router3 } from "express";
import { z as z3 } from "zod";
import { eq as eq4, desc as desc4 } from "drizzle-orm";
var router3 = Router3();
var syncRoomSessionSchema = z3.object({
  sessionId: z3.number(),
  platform: z3.enum(["web_mediapipe", "flutter_unity"]),
  syncData: z3.object({
    averageFps: z3.number().optional(),
    trackingQuality: z3.number().min(0).max(100).optional(),
    safetyScore: z3.number().min(0).max(100).optional(),
    roomCenter: z3.object({ x: z3.number(), y: z3.number(), z: z3.number() }).optional(),
    scaleFactor: z3.number().optional(),
    obstacleCount: z3.number().optional(),
    lightingConditions: z3.string().optional(),
    reflectiveSurfaces: z3.boolean().optional()
  })
});
var createRoomSessionSchema2 = z3.object({
  sessionId: z3.number().optional(),
  userId: z3.number(),
  roomWidth: z3.number(),
  roomHeight: z3.number(),
  roomArea: z3.number(),
  ceilingHeight: z3.number().optional(),
  isFlat: z3.boolean().default(true),
  aspectRatio: z3.number(),
  calibrationType: z3.string().default("two_point"),
  baselineDistance: z3.number(),
  roomCenter: z3.object({ x: z3.number(), y: z3.number(), z: z3.number() }),
  scaleFactor: z3.number().default(100),
  safetyScore: z3.number(),
  obstacleCount: z3.number().default(0),
  lightingConditions: z3.string().optional(),
  reflectiveSurfaces: z3.boolean().default(false),
  platform: z3.enum(["web_mediapipe", "flutter_unity"]),
  averageFps: z3.number().optional(),
  trackingQuality: z3.number().optional()
});
var syncSafetyLogSchema = z3.object({
  roomSessionId: z3.number(),
  userId: z3.number(),
  incidentType: z3.enum(["boundary_violation", "collision_risk", "pose_unsafe", "tracking_lost"]),
  severity: z3.enum(["info", "warning", "critical"]),
  message: z3.string(),
  userPosition: z3.object({ x: z3.number(), y: z3.number(), z: z3.number() }).optional(),
  drillPattern: z3.string().optional(),
  automaticResponse: z3.string().optional(),
  userResponse: z3.string().optional()
});
var syncPerformanceMetricSchema = z3.object({
  roomSessionId: z3.number(),
  userId: z3.number(),
  sport: z3.string(),
  adaptationScore: z3.number().min(0).max(100),
  spaceUtilization: z3.number().min(0).max(100),
  movementEfficiency: z3.number().min(0).max(100),
  safetyCompliance: z3.number().min(0).max(100),
  drillsModified: z3.number().default(0),
  targetAdjustments: z3.number().default(0),
  speedReductions: z3.number().default(0),
  roomModeScore: z3.number().min(0).max(100),
  venueEquivalentScore: z3.number().min(0).max(100).optional(),
  improvementPotential: z3.number().min(0).max(100).optional()
});
router3.post("/session", async (req, res) => {
  try {
    const sessionData = createRoomSessionSchema2.parse(req.body);
    const [session2] = await db.insert(roomSessions).values(sessionData).returning();
    res.json({
      success: true,
      session: session2,
      message: "Room session created successfully"
    });
  } catch (error) {
    console.error("Error creating room session:", error);
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});
router3.put("/session/sync", async (req, res) => {
  try {
    const { sessionId, platform, syncData } = syncRoomSessionSchema.parse(req.body);
    const [currentSession] = await db.select().from(roomSessions).where(eq4(roomSessions.id, sessionId));
    if (!currentSession) {
      return res.status(404).json({
        success: false,
        error: "Room session not found"
      });
    }
    const updates = {
      platform,
      updatedAt: /* @__PURE__ */ new Date()
    };
    if (syncData.averageFps !== void 0) {
      updates.averageFps = Math.max(syncData.averageFps, currentSession.averageFps || 0);
    }
    if (syncData.trackingQuality !== void 0) {
      updates.trackingQuality = Math.max(syncData.trackingQuality, currentSession.trackingQuality || 0);
    }
    if (syncData.safetyScore !== void 0) {
      updates.safetyScore = syncData.safetyScore;
    }
    if (syncData.roomCenter) updates.roomCenter = syncData.roomCenter;
    if (syncData.scaleFactor) updates.scaleFactor = syncData.scaleFactor;
    if (syncData.obstacleCount !== void 0) updates.obstacleCount = syncData.obstacleCount;
    if (syncData.lightingConditions) updates.lightingConditions = syncData.lightingConditions;
    if (syncData.reflectiveSurfaces !== void 0) updates.reflectiveSurfaces = syncData.reflectiveSurfaces;
    const [updatedSession] = await db.update(roomSessions).set(updates).where(eq4(roomSessions.id, sessionId)).returning();
    res.json({
      success: true,
      session: updatedSession,
      platform,
      message: "Room session synced successfully"
    });
  } catch (error) {
    console.error("Error syncing room session:", error);
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to sync room session"
    });
  }
});
router3.get("/sessions/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid user ID"
      });
    }
    const sessions2 = await db.select().from(roomSessions).where(eq4(roomSessions.userId, userId)).orderBy(desc4(roomSessions.createdAt));
    const sessionsByPlatform = sessions2.reduce((acc, session2) => {
      const platform = session2.platform;
      if (!acc[platform]) acc[platform] = [];
      acc[platform].push(session2);
      return acc;
    }, {});
    res.json({
      success: true,
      sessions: sessions2,
      sessionsByPlatform,
      totalSessions: sessions2.length
    });
  } catch (error) {
    console.error("Error getting user room sessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get user sessions"
    });
  }
});
router3.post("/safety-log", async (req, res) => {
  try {
    const logData = syncSafetyLogSchema.parse(req.body);
    const [safetyLog] = await db.insert(safetyLogs).values({
      ...logData,
      timestamp: /* @__PURE__ */ new Date()
    }).returning();
    res.json({
      success: true,
      safetyLog,
      message: "Safety log recorded successfully"
    });
  } catch (error) {
    console.error("Error creating safety log:", error);
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to record safety log"
    });
  }
});
router3.post("/performance-metric", async (req, res) => {
  try {
    const metricData = syncPerformanceMetricSchema.parse(req.body);
    const [metric] = await db.insert(roomPerformanceMetrics).values(metricData).returning();
    res.json({
      success: true,
      metric,
      message: "Performance metric recorded successfully"
    });
  } catch (error) {
    console.error("Error creating performance metric:", error);
    if (error instanceof z3.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to record performance metric"
    });
  }
});
router3.get("/sync-status/:sessionId", async (req, res) => {
  try {
    const sessionId = parseInt(req.params.sessionId);
    if (isNaN(sessionId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid session ID"
      });
    }
    const [session2] = await db.select().from(roomSessions).where(eq4(roomSessions.id, sessionId));
    if (!session2) {
      return res.status(404).json({
        success: false,
        error: "Room session not found"
      });
    }
    const [constraints, logs, metrics] = await Promise.all([
      db.select().from(spaceConstraints).where(eq4(spaceConstraints.roomSessionId, sessionId)),
      db.select().from(safetyLogs).where(eq4(safetyLogs.roomSessionId, sessionId)),
      db.select().from(roomPerformanceMetrics).where(eq4(roomPerformanceMetrics.roomSessionId, sessionId))
    ]);
    const syncStatus = {
      session: session2,
      constraints,
      safetyLogs: logs,
      performanceMetrics: metrics,
      lastSyncedAt: session2.updatedAt,
      platform: session2.platform,
      isConsistent: true,
      // All platforms have same core data
      syncHealth: {
        dataIntegrity: "good",
        platformConsistency: "synced",
        lastUpdate: session2.updatedAt
      }
    };
    res.json({
      success: true,
      syncStatus,
      message: "Sync status retrieved successfully"
    });
  } catch (error) {
    console.error("Error getting sync status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get sync status"
    });
  }
});
var room_mode_sync_default = router3;

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/users", isAuthenticated, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const sanitizedUsers = users2.map((user) => ({
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
  app2.get("/api/coaches", isAuthenticated, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const coaches = users2.filter((user) => user.role === "coach").map((coach) => ({
        id: coach.id,
        name: coach.name,
        email: coach.email,
        role: coach.role,
        rating: coach.rating || 0,
        students: coach.students || 0,
        experience: coach.experience || "New Coach",
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
  app2.put("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      if (req.user.id !== id && req.user.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized to update this profile" });
      }
      delete updateData.password;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      const updatedUser = await storage.updateUser(id, updateData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
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
  app2.get("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      let sessions2;
      if (req.user.role === "coach") {
        sessions2 = await storage.getSessionsByCoach(req.user.id);
      } else {
        sessions2 = await storage.getSessionsByAthlete(req.user.id);
      }
      res.json(sessions2);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });
  app2.post("/api/sessions", isAuthenticated, async (req, res) => {
    try {
      const sessionData = {
        ...req.body,
        id: void 0,
        // Let database generate ID
        createdAt: void 0,
        updatedAt: void 0
      };
      const session2 = await storage.createSession(sessionData);
      res.status(201).json(session2);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });
  app2.patch("/api/sessions/:id/status", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["upcoming", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const session2 = await storage.updateSessionStatus(id, status);
      if (!session2) {
        return res.status(404).json({ error: "Session not found" });
      }
      res.json(session2);
    } catch (error) {
      console.error("Error updating session status:", error);
      res.status(500).json({ error: "Failed to update session status" });
    }
  });
  app2.get("/api/training-sessions", isAuthenticated, async (req, res) => {
    try {
      const sessions2 = await storage.getTrainingSessionsByAthlete(req.user.id);
      res.json(sessions2);
    } catch (error) {
      console.error("Error fetching training sessions:", error);
      res.status(500).json({ error: "Failed to fetch training sessions" });
    }
  });
  app2.post("/api/training-sessions", isAuthenticated, async (req, res) => {
    try {
      const sessionData = {
        ...req.body,
        athleteId: req.user.id,
        id: void 0,
        date: void 0
      };
      const session2 = await storage.createTrainingSession(sessionData);
      res.status(201).json(session2);
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(500).json({ error: "Failed to create training session" });
    }
  });
  app2.get("/api/performance-metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getPerformanceMetricsByAthlete(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching performance metrics:", error);
      res.status(500).json({ error: "Failed to fetch performance metrics" });
    }
  });
  app2.post("/api/performance-metrics", isAuthenticated, async (req, res) => {
    try {
      const metricData = {
        ...req.body,
        athleteId: req.user.id,
        id: void 0,
        date: void 0
      };
      const metric = await storage.createPerformanceMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error creating performance metric:", error);
      res.status(500).json({ error: "Failed to create performance metric" });
    }
  });
  app2.get("/api/ar-metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getARMetricsByUser(req.user.id);
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching AR metrics:", error);
      res.status(500).json({ error: "Failed to fetch AR metrics" });
    }
  });
  app2.post("/api/ar-metrics", isAuthenticated, async (req, res) => {
    try {
      const metricData = {
        ...req.body,
        userId: req.user.id,
        id: void 0,
        timestamp: void 0
      };
      const metric = await storage.createARMetric(metricData);
      res.status(201).json(metric);
    } catch (error) {
      console.error("Error creating AR metric:", error);
      res.status(500).json({ error: "Failed to create AR metric" });
    }
  });
  app2.get("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const achievements2 = await storage.getAchievementsByUser(req.user.id);
      res.json(achievements2);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });
  app2.post("/api/achievements", isAuthenticated, async (req, res) => {
    try {
      const achievementData = {
        ...req.body,
        userId: req.user.id,
        id: void 0
      };
      const achievement = await storage.createAchievement(achievementData);
      res.status(201).json(achievement);
    } catch (error) {
      console.error("Error creating achievement:", error);
      res.status(500).json({ error: "Failed to create achievement" });
    }
  });
  app2.get("/api/reviews/coach/:coachId", isAuthenticated, async (req, res) => {
    try {
      const { coachId } = req.params;
      const reviews2 = await storage.getReviewsByCoach(coachId);
      res.json(reviews2);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });
  app2.post("/api/reviews", isAuthenticated, async (req, res) => {
    try {
      const reviewData = {
        ...req.body,
        reviewerId: req.user.id,
        id: void 0,
        date: void 0
      };
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });
  app2.get("/api/venues", isAuthenticated, async (req, res) => {
    try {
      const venues = await storage.getAllVenues();
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ error: "Failed to fetch venues" });
    }
  });
  app2.get("/api/venues/sport/:sport", isAuthenticated, async (req, res) => {
    try {
      const { sport } = req.params;
      const venues = await storage.getVenuesBySport(sport);
      res.json(venues);
    } catch (error) {
      console.error("Error fetching venues by sport:", error);
      res.status(500).json({ error: "Failed to fetch venues by sport" });
    }
  });
  app2.get("/api/venues/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const venue = await storage.getVenue(parseInt(id));
      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ error: "Failed to fetch venue" });
    }
  });
  app2.post("/api/venues", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const venueData = {
        ...req.body,
        id: void 0,
        createdAt: void 0,
        updatedAt: void 0
      };
      const venue = await storage.createVenue(venueData);
      res.status(201).json(venue);
    } catch (error) {
      console.error("Error creating venue:", error);
      res.status(500).json({ error: "Failed to create venue" });
    }
  });
  app2.put("/api/venues/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { id } = req.params;
      const updateData = req.body;
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      const venue = await storage.updateVenue(parseInt(id), updateData);
      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }
      res.json(venue);
    } catch (error) {
      console.error("Error updating venue:", error);
      res.status(500).json({ error: "Failed to update venue" });
    }
  });
  app2.delete("/api/venues/:id", isAuthenticated, async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { id } = req.params;
      const success = await storage.deleteVenue(parseInt(id));
      if (!success) {
        return res.status(404).json({ error: "Venue not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting venue:", error);
      res.status(500).json({ error: "Failed to delete venue" });
    }
  });
  app2.get("/api/user-venues", isAuthenticated, async (req, res) => {
    try {
      const { sport } = req.query;
      const preferences = await storage.getUserVenuePreferences(req.user.id, sport);
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user venue preferences:", error);
      res.status(500).json({ error: "Failed to fetch user venue preferences" });
    }
  });
  app2.post("/api/user-venues/unlock/:venueId", isAuthenticated, async (req, res) => {
    try {
      const { venueId } = req.params;
      const preference = await storage.unlockVenueForUser(req.user.id, parseInt(venueId));
      res.status(201).json(preference);
    } catch (error) {
      console.error("Error unlocking venue:", error);
      res.status(500).json({ error: "Failed to unlock venue" });
    }
  });
  app2.put("/api/user-venues/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const preference = await storage.updateUserVenuePreference(parseInt(id), updateData);
      if (!preference) {
        return res.status(404).json({ error: "Venue preference not found" });
      }
      res.json(preference);
    } catch (error) {
      console.error("Error updating venue preference:", error);
      res.status(500).json({ error: "Failed to update venue preference" });
    }
  });
  app2.get("/api/venue-sessions", isAuthenticated, async (req, res) => {
    try {
      const sessions2 = await storage.getVenueSessionsByUser(req.user.id);
      res.json(sessions2);
    } catch (error) {
      console.error("Error fetching venue sessions:", error);
      res.status(500).json({ error: "Failed to fetch venue sessions" });
    }
  });
  app2.get("/api/venue-sessions/venue/:venueId", isAuthenticated, async (req, res) => {
    try {
      const { venueId } = req.params;
      const sessions2 = await storage.getVenueSessionsByVenue(parseInt(venueId));
      res.json(sessions2);
    } catch (error) {
      console.error("Error fetching venue sessions:", error);
      res.status(500).json({ error: "Failed to fetch venue sessions" });
    }
  });
  app2.post("/api/venue-sessions", isAuthenticated, async (req, res) => {
    try {
      const sessionData = {
        ...req.body,
        userId: req.user.id,
        id: void 0,
        startedAt: void 0,
        completedAt: void 0
      };
      const session2 = await storage.createVenueSession(sessionData);
      res.status(201).json(session2);
    } catch (error) {
      console.error("Error creating venue session:", error);
      res.status(500).json({ error: "Failed to create venue session" });
    }
  });
  app2.put("/api/venue-sessions/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      delete updateData.id;
      delete updateData.startedAt;
      const session2 = await storage.updateVenueSession(parseInt(id), updateData);
      if (!session2) {
        return res.status(404).json({ error: "Venue session not found" });
      }
      res.json(session2);
    } catch (error) {
      console.error("Error updating venue session:", error);
      res.status(500).json({ error: "Failed to update venue session" });
    }
  });
  app2.get("/api/venue-leaderboards", isAuthenticated, async (req, res) => {
    try {
      const { venueId, sport } = req.query;
      const leaderboards = await storage.getVenueLeaderboards(
        venueId ? parseInt(venueId) : void 0,
        sport
      );
      res.json(leaderboards);
    } catch (error) {
      console.error("Error fetching venue leaderboards:", error);
      res.status(500).json({ error: "Failed to fetch venue leaderboards" });
    }
  });
  app2.get("/api/venue-leaderboards/:id/entries", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const entries = await storage.getVenueLeaderboardEntries(parseInt(id));
      res.json(entries);
    } catch (error) {
      console.error("Error fetching leaderboard entries:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard entries" });
    }
  });
  app2.post("/api/venue-leaderboards/:id/entries", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const entryData = {
        ...req.body,
        leaderboardId: parseInt(id),
        userId: req.user.id,
        id: void 0,
        achievedAt: void 0
      };
      const entry = await storage.createVenueLeaderboardEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      console.error("Error creating leaderboard entry:", error);
      res.status(500).json({ error: "Failed to create leaderboard entry" });
    }
  });
  app2.use("/api/unity-ar", router);
  app2.use("/api/admin/unity-ar", router2);
  app2.use("/api/room-mode-sync", isAuthenticated, room_mode_sync_default);
  const httpServer = createServer(app2);
  const wsManager = new websocket_default(httpServer);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
