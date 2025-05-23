import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
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
  'athletics'
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

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('athlete'),
  primarySport: sportEnum("primary_sport").notNull(), // User's chosen sport
  classification: text("classification"), // Para sport classification (W1, B1, CP2, etc.)
  membershipTier: text("membership_tier").default("free"), // free, basic, premium, pro
  subscriptionStatus: text("subscription_status").default("inactive"), // active, inactive, expired
  subscriptionStartDate: timestamp("subscription_start_date"),
  subscriptionEndDate: timestamp("subscription_end_date"),
  monthlySpent: integer("monthly_spent").default(0), // Track spending for analytics
  avatar: text("avatar"),
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertUserSport = z.infer<typeof insertUserSportSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type InsertARMetric = z.infer<typeof insertARMetricSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type User = typeof users.$inferSelect;
export type UserSport = typeof userSports.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;
export type TrainingSession = typeof trainingSessions.$inferSelect;
export type ARMetric = typeof arMetrics.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
