import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, varchar, jsonb, index } from "drizzle-orm/pg-core";
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

// Session storage table for Replit authentication
export const authSessions = pgTable(
  "auth_sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with Replit authentication support
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
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

// Authentication types for Replit Auth
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

export type UserSport = typeof userSports.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type ARMetric = typeof arMetrics.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
