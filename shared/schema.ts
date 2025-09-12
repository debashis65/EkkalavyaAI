import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum definitions
export const userRoleEnum = pgEnum('role', ['admin', 'coach', 'athlete']);
export const sportEnum = pgEnum('sport', [
  'archery', 
  'swimming', 
  'basketball', 
  'football', 
  'cricket', 
  'gymnastics', 
  'tennis', 
  'badminton', 
  'yoga', 
  'athletics',
  'volleyball',
  'squash',
  'table_tennis',
  'cycling',
  'long_jump',
  'high_jump',
  'pole_vault',
  'hurdle',
  'boxing',
  'shotput_throw',
  'discus_throw',
  'javelin_throw',
  'hockey',
  'wrestling',
  'judo',
  'weightlifting',
  'karate',
  'skating',
  'ice_skating',
  'golf',
  'kabaddi',
  'kho_kho',
  'para_archery',
  'para_swimming',
  'para_basketball',
  'para_football',
  'para_cricket',
  'para_athletics',
  'para_tennis',
  'para_badminton',
  'para_volleyball',
  'para_table_tennis',
  'para_boxing',
  'para_wrestling',
  'para_judo',
  'para_weightlifting',
  'para_cycling',
  'para_skating',
  'wheelchair_basketball',
  'wheelchair_tennis',
  'wheelchair_racing',
  'blind_football',
  'goalball',
  'sitting_volleyball'
]);
export const sessionStatusEnum = pgEnum('session_status', ['upcoming', 'completed', 'cancelled']);
export const sessionTypeEnum = pgEnum('session_type', [
  'technical', 
  'performance_review', 
  'form_correction', 
  'strategy', 
  'mental', 
  'physical'
]);

// Virtual venue enums
export const venueTypeEnum = pgEnum('venue_type', ['indoor', 'outdoor', 'stadium', 'arena', 'field', 'court', 'pool', 'range']);
export const surfaceTypeEnum = pgEnum('surface_type', ['hardwood', 'grass', 'clay', 'synthetic', 'concrete', 'water', 'sand', 'ice', 'rubber']);
export const environmentConditionEnum = pgEnum('environment_condition', ['clear', 'sunny', 'cloudy', 'rainy', 'windy', 'night', 'indoor_lit']);

// Unity AR specific enums
export const unityArModeEnum = pgEnum('unity_ar_mode', ['disabled', 'enabled', 'admin_only']);
export const unityDifficultyEnum = pgEnum('unity_difficulty', ['easy', 'medium', 'hard', 'expert']);
export const unitySessionStatusEnum = pgEnum('unity_session_status', ['active', 'paused', 'completed', 'failed']);
export const unityDevicePlatformEnum = pgEnum('unity_device_platform', ['android', 'ios']);

// Session storage table for user authentication
export const authSessions = pgTable(
  "auth_sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with proper authentication support
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: varchar("email").unique().notNull(),
  name: varchar("name").notNull(),
  password: varchar("password").notNull(),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default('athlete'),
  primarySport: sportEnum("primary_sport"), // User's chosen sport
  classification: text("classification"), // Para sport classification (W1, B1, CP2, etc.)
  membershipTier: text("membership_tier").default("free"), // free, basic, premium, pro
  subscriptionStatus: text("subscription_status").default("inactive"), // active, inactive, expired
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  monthlySpent: integer("monthly_spent").default(0), // Track spending for analytics
  bio: text("bio"),
  rating: integer("rating"),
  experience: text("experience"),
  students: integer("students"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// UserSports table (many-to-many relationship)
export const userSports = pgTable("user_sports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sport: sportEnum("sport").notNull(),
});

// Sessions table
export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  status: sessionStatusEnum("status").notNull().default('upcoming'),
  type: sessionTypeEnum("session_type").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  coachId: integer("coach_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  date: timestamp("date").defaultNow(),
});

// PerformanceMetrics table
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  metricName: text("metric_name").notNull(),
  metricValue: integer("metric_value").notNull(),
  improvement: integer("improvement"),
  date: timestamp("date").defaultNow(),
});

// TrainingSessions table
export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  athleteId: integer("athlete_id").notNull().references(() => users.id),
  focus: text("focus").notNull(),
  duration: text("duration").notNull(),
  intensity: integer("intensity").notNull(),
  performance: integer("performance"),
  date: timestamp("date").defaultNow(),
});

// ARMetrics table
export const arMetrics = pgTable("ar_metrics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  metricsData: text("metrics_data").notNull(), // JSON stored as text
  improvement: integer("improvement"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  date: timestamp("date"),
  position: text("position"),
  category: text("category"),
});

// Real-time AR Analysis Results
export const arAnalysisResults = pgTable("ar_analysis_results", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  playerId: integer("player_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  analysisType: text("analysis_type").notNull(),
  realTimeData: text("real_time_data").notNull(), // JSON string of pose data
  finalScore: integer("final_score"),
  improvements: text("improvements").notNull(), // JSON array of suggestions
  recordingUrl: text("recording_url"),
  thumbnailUrl: text("thumbnail_url"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// AI Drill Recommendations
export const drillRecommendations = pgTable("drill_recommendations", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  drillName: text("drill_name").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  focusAreas: text("focus_areas").notNull(), // JSON array
  instructions: text("instructions").notNull(), // JSON array
  videoUrl: text("video_url"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  aiGenerated: boolean("ai_generated").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Progress Tracking
export const progressTracking = pgTable("progress_tracking", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  metricName: text("metric_name").notNull(),
  currentValue: integer("current_value").notNull(),
  previousValue: integer("previous_value"),
  targetValue: integer("target_value"),
  unit: text("unit"), // seconds, meters, percentage, etc.
  category: text("category").notNull(), // speed, accuracy, strength, endurance, technique
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Coach Player Relationships
export const coachPlayerRelations = pgTable("coach_player_relations", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").notNull().references(() => users.id),
  playerId: integer("player_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// WebSocket Sessions for real-time analysis
export const websocketSessions = pgTable("websocket_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  sport: sportEnum("sport").notNull(),
  analysisType: text("analysis_type").notNull(),
  isActive: boolean("is_active").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
});

// Training Schedule for AI-generated drill recommendations
export const trainingSchedule = pgTable("training_schedule", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  drillName: text("drill_name").notNull(),
  sport: sportEnum("sport").notNull(),
  targetArea: text("target_area").notNull(), // form, accuracy, speed, etc.
  priority: text("priority").notNull(), // high, critical, essential, etc.
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: text("status").default("scheduled"), // scheduled, completed, skipped
  estimatedDuration: text("estimated_duration"),
  difficulty: text("difficulty"), // Easy, Medium, Hard
  drillData: text("drill_data"), // JSON string with full drill details
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription Plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // "Freemium", "AI Training", "Pro Coach", etc.
  userType: userRoleEnum("user_type").notNull(), // athlete or coach
  price: integer("price").notNull(), // Price in rupees
  currency: text("currency").default("INR"),
  billingCycle: text("billing_cycle").notNull(), // monthly, yearly
  features: text("features").array(), // List of features included
  maxAnalysisPerMonth: integer("max_analysis_per_month"), // Analysis limit
  hasLiveCoaching: boolean("has_live_coaching").default(false),
  hasAdvancedMetrics: boolean("has_advanced_metrics").default(false),
  hasLeaderboardAccess: boolean("has_leaderboard_access").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Subscriptions table
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: integer("plan_id").notNull().references(() => subscriptionPlans.id),
  status: text("status").notNull(), // active, cancelled, expired, paused
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  autoRenew: boolean("auto_renew").default(true),
  paymentMethod: text("payment_method"), // UPI, card, etc.
  transactionId: text("transaction_id"),
  amountPaid: integer("amount_paid").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Transactions table
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subscriptionId: integer("subscription_id").references(() => userSubscriptions.id),
  amount: integer("amount").notNull(),
  currency: text("currency").default("INR"),
  transactionType: text("transaction_type").notNull(), // subscription, analysis, coaching_session, leaderboard_entry
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id").notNull(),
  status: text("status").notNull(), // success, failed, pending, refunded
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Leaderboard Challenges table
export const leaderboardChallenges = pgTable("leaderboard_challenges", {
  id: serial("id").primaryKey(),
  sport: sportEnum("sport").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  entryFee: integer("entry_fee").notNull(), // In rupees (5-20)
  prizePool: integer("prize_pool").notNull(), // Total prize money
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  status: text("status").default("upcoming"), // upcoming, active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Challenge Participants table
export const challengeParticipants = pgTable("challenge_participants", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => leaderboardChallenges.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  entryFeePaid: integer("entry_fee_paid").notNull(),
  currentScore: integer("current_score").default(0),
  currentRank: integer("current_rank"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Virtual Venues table - Real sports venues and environments
export const virtualVenues = pgTable("virtual_venues", {
  id: serial("id").primaryKey(),
  sport: sportEnum("sport").notNull(),
  venueName: text("venue_name").notNull(), // "Madison Square Garden", "Wembley Stadium", "Wimbledon Centre Court"
  venueLocation: text("venue_location"), // "New York, USA", "London, England"
  venueType: venueTypeEnum("venue_type").notNull(),
  surfaceType: surfaceTypeEnum("surface_type").notNull(),
  isRealVenue: boolean("is_real_venue").default(true), // True for real venues, false for generic practice environments
  capacity: integer("capacity"), // Stadium/arena capacity
  dimensions: jsonb("dimensions").notNull(), // Court/field measurements in meters
  environmentEffects: jsonb("environment_effects"), // Weather, lighting, crowd noise levels
  gridConfiguration: jsonb("grid_configuration").notNull(), // Scoring zones and measurement grids
  difficulty: text("difficulty").notNull().default("intermediate"), // beginner, intermediate, advanced, professional
  unlockRequirement: jsonb("unlock_requirement"), // Performance score or achievement needed to unlock
  thumbnailUrl: text("thumbnail_url"), // Preview image URL
  modelUrl: text("model_url"), // 3D model or texture URL
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Venue Preferences table
export const userVenuePreferences = pgTable("user_venue_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sport: sportEnum("sport").notNull(),
  venueId: integer("venue_id").notNull().references(() => virtualVenues.id, { onDelete: 'cascade' }),
  isUnlocked: boolean("is_unlocked").default(false),
  timesUsed: integer("times_used").default(0),
  bestScore: integer("best_score"),
  totalTimeSpent: integer("total_time_spent").default(0), // In seconds
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Venue Sessions table - Track performance in specific venues
export const venueSessions = pgTable("venue_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  venueId: integer("venue_id").notNull().references(() => virtualVenues.id, { onDelete: 'cascade' }),
  sport: sportEnum("sport").notNull(),
  sessionType: text("session_type").notNull(), // "practice", "analysis", "challenge", "competition"
  duration: integer("duration").notNull(), // Session duration in seconds
  performanceScore: integer("performance_score"),
  metricsData: jsonb("metrics_data").notNull(), // Detailed performance metrics for the venue
  environmentCondition: environmentConditionEnum("environment_condition").default('clear'),
  gridAccuracy: jsonb("grid_accuracy"), // Accuracy per grid zone
  improvementAreas: text("improvement_areas").array(), // Areas that need work
  achievements: text("achievements").array(), // Session achievements unlocked
  recordingUrl: text("recording_url"), // Video recording of the session
  thumbnailUrl: text("thumbnail_url"), // Session thumbnail
  isCompleted: boolean("is_completed").default(true),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Venue Leaderboards table - Competition within specific venues
export const venueLeaderboards = pgTable("venue_leaderboards", {
  id: serial("id").primaryKey(),
  venueId: integer("venue_id").notNull().references(() => virtualVenues.id, { onDelete: 'cascade' }),
  sport: sportEnum("sport").notNull(),
  leaderboardType: text("leaderboard_type").notNull(), // "weekly", "monthly", "all_time", "challenge"
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  isActive: boolean("is_active").default(true),
  prizePools: jsonb("prize_pools"), // Prize distribution for top performers
  createdAt: timestamp("created_at").defaultNow(),
});

// Venue Leaderboard Entries table
export const venueLeaderboardEntries = pgTable("venue_leaderboard_entries", {
  id: serial("id").primaryKey(),
  leaderboardId: integer("leaderboard_id").notNull().references(() => venueLeaderboards.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  score: integer("score").notNull(),
  rank: integer("rank"),
  sessionsCount: integer("sessions_count").default(1),
  bestSessionId: integer("best_session_id").references(() => venueSessions.id),
  totalTime: integer("total_time").default(0), // Total time spent in venue
  achievedAt: timestamp("achieved_at").defaultNow(),
});

// Unity AR Admin Settings - Controls which sports have Unity AR enabled
export const unityArSportSettings = pgTable("unity_ar_sport_settings", {
  id: serial("id").primaryKey(),
  sport: sportEnum("sport").notNull().unique(),
  arMode: unityArModeEnum("ar_mode").notNull().default('disabled'),
  defaultDifficulty: unityDifficultyEnum("default_difficulty").notNull().default('medium'),
  isActive: boolean("is_active").default(false),
  requiresCalibration: boolean("requires_calibration").default(true),
  minPlaneArea: integer("min_plane_area").default(12), // square meters
  maxPlayers: integer("max_players").default(1),
  sessionTimeout: integer("session_timeout").default(1800), // seconds
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Unity AR Sessions - Track Unity AR training sessions
export const unityArSessions = pgTable("unity_ar_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sport: sportEnum("sport").notNull(),
  drillConfigId: text("drill_config_id").notNull(),
  difficulty: unityDifficultyEnum("difficulty").notNull(),
  status: unitySessionStatusEnum("status").notNull().default('active'),
  devicePlatform: unityDevicePlatformEnum("device_platform").notNull(),
  deviceModel: text("device_model"),
  unityVersion: text("unity_version"),
  
  // Calibration data
  calibrationData: jsonb("calibration_data"), // Court/field positioning
  planeArea: integer("plane_area"), // Detected plane area in cm²
  
  // Session metrics
  duration: integer("duration").default(0), // seconds
  totalBounces: integer("total_bounces").default(0),
  successfulHits: integer("successful_hits").default(0),
  accuracy: integer("accuracy").default(0), // percentage
  averageReactionTime: integer("average_reaction_time").default(0), // milliseconds
  
  // Scoring
  precisionScore: integer("precision_score").default(0),
  paceScore: integer("pace_score").default(0),
  streakScore: integer("streak_score").default(0),
  totalScore: integer("total_score").default(0),
  
  // Session state
  sessionData: jsonb("session_data"), // Complete session log JSON
  heatmapData: jsonb("heatmap_data"), // Bounce positions for heatmap
  
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Unity AR Bounce Events - Individual bounce tracking
export const unityArBounceEvents = pgTable("unity_ar_bounce_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => unityArSessions.id, { onDelete: 'cascade' }),
  
  // Timing
  timestampMs: integer("timestamp_ms").notNull(),
  
  // Positions
  bounceWorldPos: jsonb("bounce_world_pos").notNull(), // [x, y, z] in Unity world space
  bounceCourtPos: jsonb("bounce_court_pos").notNull(), // [x, y] in court coordinate system
  targetIndex: integer("target_index").notNull(),
  targetPos: jsonb("target_pos").notNull(), // [x, y] target position
  
  // Accuracy
  errorDistance: integer("error_distance").notNull(), // millimeters
  isHit: boolean("is_hit").notNull(),
  toleranceRadius: integer("tolerance_radius").notNull(), // millimeters
  
  // Detection confidence
  visionConfidence: integer("vision_confidence").default(0), // 0-100
  audioConfidence: integer("audio_confidence").default(0), // 0-100
  fusionConfidence: integer("fusion_confidence").default(0), // 0-100
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Unity AR Performance Metrics - Aggregated performance data
export const unityArPerformanceMetrics = pgTable("unity_ar_performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sport: sportEnum("sport").notNull(),
  metricType: text("metric_type").notNull(), // 'precision', 'pace', 'consistency', 'improvement'
  
  // Time period aggregation
  periodType: text("period_type").notNull(), // 'session', 'daily', 'weekly', 'monthly'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Metric values
  value: integer("value").notNull(),
  previousValue: integer("previous_value").default(0),
  improvement: integer("improvement").default(0),
  percentile: integer("percentile").default(50), // vs other users
  
  // Context
  sessionsCount: integer("sessions_count").default(1),
  totalDuration: integer("total_duration").default(0),
  difficulty: unityDifficultyEnum("difficulty").notNull(),
  
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// Unity AR Sport Configs - Dynamic sport configuration
export const unityArSportConfigs = pgTable("unity_ar_sport_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sport: sportEnum("sport").notNull(),
  configVersion: text("config_version").notNull().default('1.0'),
  
  // Court/Field layout
  fieldDimensions: jsonb("field_dimensions").notNull(), // Length, width in meters
  markerLayout: jsonb("marker_layout").notNull(), // Drill marker positions
  scoringZones: jsonb("scoring_zones"), // Special scoring areas
  
  // Difficulty settings
  easyTolerance: integer("easy_tolerance").default(300), // millimeters
  mediumTolerance: integer("medium_tolerance").default(200),
  hardTolerance: integer("hard_tolerance").default(100),
  expertTolerance: integer("expert_tolerance").default(50),
  
  // Pacing requirements
  targetPaceHz: integer("target_pace_hz").default(220), // 2.2 Hz * 100
  
  // Scoring weights
  precisionWeight: integer("precision_weight").default(60),
  paceWeight: integer("pace_weight").default(30),
  streakWeight: integer("streak_weight").default(10),
  
  // Requirements
  minPlaneSize: jsonb("min_plane_size").notNull(), // [width, height] in meters
  requiresAudio: boolean("requires_audio").default(true),
  requiresVision: boolean("requires_vision").default(true),
  
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSportSchema = createInsertSchema(userSports).omit({
  id: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  date: true,
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  date: true,
});

export const insertTrainingSessionSchema = createInsertSchema(trainingSessions).omit({
  id: true,
  date: true,
});

export const insertARMetricSchema = createInsertSchema(arMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

// Virtual venue insert schemas
export const insertVirtualVenueSchema = createInsertSchema(virtualVenues).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserVenuePreferenceSchema = createInsertSchema(userVenuePreferences).omit({
  id: true,
  createdAt: true,
});

export const insertVenueSessionSchema = createInsertSchema(venueSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertVenueLeaderboardSchema = createInsertSchema(venueLeaderboards).omit({
  id: true,
  createdAt: true,
});

export const insertVenueLeaderboardEntrySchema = createInsertSchema(venueLeaderboardEntries).omit({
  id: true,
  achievedAt: true,
});

// Unity AR insert schemas
export const insertUnityArSportSettingSchema = createInsertSchema(unityArSportSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUnityArSessionSchema = createInsertSchema(unityArSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
});

export const insertUnityArBounceEventSchema = createInsertSchema(unityArBounceEvents).omit({
  id: true,
  createdAt: true,
});

export const insertUnityArPerformanceMetricSchema = createInsertSchema(unityArPerformanceMetrics).omit({
  id: true,
  calculatedAt: true,
});

export const insertUnityArSportConfigSchema = createInsertSchema(unityArSportConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Authentication types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserSport = z.infer<typeof insertUserSportSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type InsertARMetric = z.infer<typeof insertARMetricSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

// Virtual venue types
export type InsertVirtualVenue = z.infer<typeof insertVirtualVenueSchema>;
export type InsertUserVenuePreference = z.infer<typeof insertUserVenuePreferenceSchema>;
export type InsertVenueSession = z.infer<typeof insertVenueSessionSchema>;
export type InsertVenueLeaderboard = z.infer<typeof insertVenueLeaderboardSchema>;
export type InsertVenueLeaderboardEntry = z.infer<typeof insertVenueLeaderboardEntrySchema>;

// Unity AR types  
export type InsertUnityArSportSetting = z.infer<typeof insertUnityArSportSettingSchema>;
export type InsertUnityArSession = z.infer<typeof insertUnityArSessionSchema>;
export type InsertUnityArBounceEvent = z.infer<typeof insertUnityArBounceEventSchema>;
export type InsertUnityArPerformanceMetric = z.infer<typeof insertUnityArPerformanceMetricSchema>;
export type InsertUnityArSportConfig = z.infer<typeof insertUnityArSportConfigSchema>;

export type UserSport = typeof userSports.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type ARMetric = typeof arMetrics.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;

// Virtual venue select types
export type VirtualVenue = typeof virtualVenues.$inferSelect;
export type UserVenuePreference = typeof userVenuePreferences.$inferSelect;
export type VenueSession = typeof venueSessions.$inferSelect;
export type VenueLeaderboard = typeof venueLeaderboards.$inferSelect;
export type VenueLeaderboardEntry = typeof venueLeaderboardEntries.$inferSelect;

// Unity AR select types
export type UnityArSportSetting = typeof unityArSportSettings.$inferSelect;
export type UnityArSession = typeof unityArSessions.$inferSelect;
export type UnityArBounceEvent = typeof unityArBounceEvents.$inferSelect;
export type UnityArPerformanceMetric = typeof unityArPerformanceMetrics.$inferSelect;
export type UnityArSportConfig = typeof unityArSportConfigs.$inferSelect;

// Room Mode Training Tables - for confined space training
export const roomSessions = pgTable("room_sessions", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => trainingSessions.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Room dimensions and characteristics  
  roomWidth: integer("room_width").notNull(), // centimeters for precision
  roomHeight: integer("room_height").notNull(), // centimeters for precision
  roomArea: integer("room_area").notNull(), // square centimeters
  ceilingHeight: integer("ceiling_height"), // centimeters (optional)
  isFlat: boolean("is_flat").notNull().default(true),
  aspectRatio: integer("aspect_ratio").notNull(), // multiplied by 100 for precision
  
  // Calibration data
  calibrationType: text("calibration_type").notNull().default('two_point'), // two_point, basketball_diameter
  baselineDistance: integer("baseline_distance").notNull(), // centimeters
  roomCenter: jsonb("room_center").notNull(), // {x, y, z} coordinates
  scaleFactor: integer("scale_factor").notNull().default(100), // multiplied by 100 for precision
  
  // Safety and environment
  safetyScore: integer("safety_score").notNull(), // 0-100
  obstacleCount: integer("obstacle_count").notNull().default(0),
  lightingConditions: text("lighting_conditions"), // good, moderate, poor
  reflectiveSurfaces: boolean("reflective_surfaces").notNull().default(false),
  
  // Platform and performance
  platform: text("platform").notNull(), // web_mediapipe, flutter_unity
  averageFps: integer("average_fps"), // FPS
  trackingQuality: integer("tracking_quality"), // 0-100
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Space constraints tracking for room mode
export const spaceConstraints = pgTable("space_constraints", {
  id: serial("id").primaryKey(),
  roomSessionId: integer("room_session_id").notNull().references(() => roomSessions.id, { onDelete: 'cascade' }),
  
  // Constraint types
  constraintType: text("constraint_type").notNull(), // movement, target_placement, drill_modification
  severity: text("severity").notNull(), // low, medium, high, critical
  description: text("description").notNull(),
  
  // Affected areas (normalized coordinates 0-100)
  affectedArea: jsonb("affected_area").notNull(), // {x1, y1, x2, y2} or polygon
  recommendation: text("recommendation"),
  
  // Resolution
  isResolved: boolean("is_resolved").notNull().default(false),
  resolvedAt: timestamp("resolved_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Safety logs for room mode incidents and warnings
export const safetyLogs = pgTable("safety_logs", {
  id: serial("id").primaryKey(),
  roomSessionId: integer("room_session_id").references(() => roomSessions.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Incident details
  incidentType: text("incident_type").notNull(), // boundary_violation, collision_risk, pose_unsafe, tracking_lost
  severity: text("severity").notNull(), // info, warning, critical
  message: text("message").notNull(),
  
  // Context
  userPosition: jsonb("user_position"), // {x, y, z} at time of incident
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  drillPattern: text("drill_pattern"),
  
  // Response
  automaticResponse: text("automatic_response"), // pause, warning, drill_modification
  userResponse: text("user_response"), // acknowledged, ignored, session_stopped
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Room mode performance metrics - specialized for confined spaces
export const roomPerformanceMetrics = pgTable("room_performance_metrics", {
  id: serial("id").primaryKey(),
  roomSessionId: integer("room_session_id").notNull().references(() => roomSessions.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  sport: sportEnum("sport").notNull(),
  
  // Room-specific metrics
  adaptationScore: integer("adaptation_score").notNull(), // 0-100 how well adapted to space
  spaceUtilization: integer("space_utilization").notNull(), // 0-100 percentage of space used
  movementEfficiency: integer("movement_efficiency").notNull(), // 0-100 efficient movement in confined space
  safetyCompliance: integer("safety_compliance").notNull(), // 0-100 adherence to safety boundaries
  
  // Drill modifications applied
  drillsModified: integer("drills_modified").default(0),
  targetAdjustments: integer("target_adjustments").default(0),
  speedReductions: integer("speed_reductions").default(0),
  
  // Performance comparison
  roomModeScore: integer("room_mode_score").notNull(), // Overall room mode performance
  venueEquivalentScore: integer("venue_equivalent_score"), // Estimated performance in full venue
  improvementPotential: integer("improvement_potential"), // 0-100 room for improvement
  
  recordedAt: timestamp("recorded_at").defaultNow(),
});

// Room Mode insert schemas
export const insertRoomSessionSchema = createInsertSchema(roomSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSpaceConstraintSchema = createInsertSchema(spaceConstraints).omit({
  id: true,
  createdAt: true,
});

export const insertSafetyLogSchema = createInsertSchema(safetyLogs).omit({
  id: true,
  timestamp: true,
  createdAt: true,
});

export const insertRoomPerformanceMetricSchema = createInsertSchema(roomPerformanceMetrics).omit({
  id: true,
  recordedAt: true,
});

// Room Mode types
export type RoomSession = typeof roomSessions.$inferSelect;
export type NewRoomSession = typeof roomSessions.$inferInsert;
export type SpaceConstraint = typeof spaceConstraints.$inferSelect;
export type NewSpaceConstraint = typeof spaceConstraints.$inferInsert;
export type SafetyLog = typeof safetyLogs.$inferSelect;
export type NewSafetyLog = typeof safetyLogs.$inferInsert;
export type RoomPerformanceMetric = typeof roomPerformanceMetrics.$inferSelect;
export type NewRoomPerformanceMetric = typeof roomPerformanceMetrics.$inferInsert;
