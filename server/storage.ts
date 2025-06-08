import { 
  users, 
  trainingSchedule,
  type User, 
  type UpsertUser,
  userSports, type UserSport, type InsertUserSport,
  sessions, type Session, type InsertSession,
  reviews, type Review, type InsertReview,
  performanceMetrics, type PerformanceMetric, type InsertPerformanceMetric,
  trainingSessions, type TrainingSession, type InsertTrainingSession,
  arMetrics, type ARMetric, type InsertARMetric,
  achievements, type Achievement, type InsertAchievement,
  sessionStatusEnum
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Define the storage interface
export interface IStorage {
  // User methods for Replit Auth - NO FALLBACK DATA
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // User-Sport methods
  addUserSport(userSport: InsertUserSport): Promise<UserSport>;
  getUserSports(userId: number): Promise<UserSport[]>;
  
  // Session methods
  getAllSessions(): Promise<Session[]>;
  getSession(id: number): Promise<Session | undefined>;
  getSessionsByUser(userId: number): Promise<Session[]>;
  getSessionsByCoach(coachId: number): Promise<Session[]>;
  getSessionsByAthlete(athleteId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSessionStatus(id: number, status: 'upcoming' | 'completed' | 'cancelled'): Promise<Session | undefined>;
  
  // Review methods
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByCoach(coachId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Performance Metric methods
  getPerformanceMetric(id: number): Promise<PerformanceMetric | undefined>;
  getPerformanceMetricsByAthlete(athleteId: number): Promise<PerformanceMetric[]>;
  createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  
  // Training Session methods
  getTrainingSession(id: number): Promise<TrainingSession | undefined>;
  getTrainingSessionsByAthlete(athleteId: number): Promise<TrainingSession[]>;
  createTrainingSession(trainingSession: InsertTrainingSession): Promise<TrainingSession>;
  
  // AR Metric methods
  getARMetric(id: number): Promise<ARMetric | undefined>;
  getARMetricsByUser(userId: number): Promise<ARMetric[]>;
  createARMetric(arMetric: InsertARMetric): Promise<ARMetric>;
  
  // Achievement methods
  getAchievement(id: number): Promise<Achievement | undefined>;
  getAchievementsByUser(userId: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
}

// Database storage implementation - NO MOCK DATA
export class DatabaseStorage implements IStorage {
  
  // User methods for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  // User-Sport methods
  async addUserSport(userSport: InsertUserSport): Promise<UserSport> {
    const [newUserSport] = await db.insert(userSports).values(userSport).returning();
    return newUserSport;
  }
  
  async getUserSports(userId: number): Promise<UserSport[]> {
    return await db.select().from(userSports).where(eq(userSports.userId, userId));
  }
  
  // Session methods
  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions);
  }
  
  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }
  
  async getSessionsByUser(userId: number): Promise<Session[]> {
    return await db.select().from(sessions)
      .where(eq(sessions.athleteId, userId));
  }
  
  async getSessionsByCoach(coachId: number): Promise<Session[]> {
    return await db.select().from(sessions)
      .where(eq(sessions.coachId, coachId));
  }
  
  async getSessionsByAthlete(athleteId: number): Promise<Session[]> {
    return await db.select().from(sessions)
      .where(eq(sessions.athleteId, athleteId));
  }
  
  async createSession(session: InsertSession): Promise<Session> {
    const [newSession] = await db.insert(sessions).values(session).returning();
    return newSession;
  }
  
  async updateSessionStatus(id: number, status: 'upcoming' | 'completed' | 'cancelled'): Promise<Session | undefined> {
    const [updatedSession] = await db.update(sessions)
      .set({ status, updatedAt: new Date() })
      .where(eq(sessions.id, id))
      .returning();
    return updatedSession;
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async getReviewsByCoach(coachId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.coachId, coachId));
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }
  
  // Performance Metric methods
  async getPerformanceMetric(id: number): Promise<PerformanceMetric | undefined> {
    const [metric] = await db.select().from(performanceMetrics).where(eq(performanceMetrics.id, id));
    return metric;
  }
  
  async getPerformanceMetricsByAthlete(athleteId: number): Promise<PerformanceMetric[]> {
    return await db.select().from(performanceMetrics).where(eq(performanceMetrics.athleteId, athleteId));
  }
  
  async createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const [newMetric] = await db.insert(performanceMetrics).values(metric).returning();
    return newMetric;
  }
  
  // Training Session methods
  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    const [session] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, id));
    return session;
  }
  
  async getTrainingSessionsByAthlete(athleteId: number): Promise<TrainingSession[]> {
    return await db.select().from(trainingSessions).where(eq(trainingSessions.athleteId, athleteId));
  }
  
  async createTrainingSession(trainingSession: InsertTrainingSession): Promise<TrainingSession> {
    const [newTrainingSession] = await db.insert(trainingSessions).values(trainingSession).returning();
    return newTrainingSession;
  }
  
  // AR Metric methods
  async getARMetric(id: number): Promise<ARMetric | undefined> {
    const [metric] = await db.select().from(arMetrics).where(eq(arMetrics.id, id));
    return metric;
  }
  
  async getARMetricsByUser(userId: number): Promise<ARMetric[]> {
    return await db.select().from(arMetrics).where(eq(arMetrics.userId, userId));
  }
  
  async createARMetric(arMetric: InsertARMetric): Promise<ARMetric> {
    const [newARMetric] = await db.insert(arMetrics).values(arMetric).returning();
    return newARMetric;
  }
  
  // Achievement methods
  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }
  
  async getAchievementsByUser(userId: number): Promise<Achievement[]> {
    return await db.select().from(achievements).where(eq(achievements.userId, userId));
  }
  
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const [newAchievement] = await db.insert(achievements).values(achievement).returning();
    return newAchievement;
  }
}

export const storage = new DatabaseStorage();
