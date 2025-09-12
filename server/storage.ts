import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import {
  users,
  userSports,
  sessions,
  reviews,
  performanceMetrics,
  trainingSessions,
  arMetrics,
  achievements,
  virtualVenues,
  userVenuePreferences,
  venueSessions,
  venueLeaderboards,
  venueLeaderboardEntries,
  roomSessions,
  spaceConstraints,
  safetyLogs,
  roomPerformanceMetrics,
  type User,
  type UpsertUser,
  type InsertUser,
  type UserSport,
  type InsertUserSport,
  type Session,
  type InsertSession,
  type Review,
  type InsertReview,
  type PerformanceMetric,
  type InsertPerformanceMetric,
  type TrainingSession,
  type InsertTrainingSession,
  type ARMetric,
  type InsertARMetric,
  type Achievement,
  type InsertAchievement,
  type VirtualVenue,
  type InsertVirtualVenue,
  type UserVenuePreference,
  type InsertUserVenuePreference,
  type VenueSession,
  type InsertVenueSession,
  type VenueLeaderboard,
  type InsertVenueLeaderboard,
  type VenueLeaderboardEntry,
  type InsertVenueLeaderboardEntry,
  type RoomSession,
  type NewRoomSession,
  type SpaceConstraint,
  type NewSpaceConstraint,
  type SafetyLog,
  type NewSafetyLog,
  type RoomPerformanceMetric,
  type NewRoomPerformanceMetric,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined>;
  
  // User-Sport methods
  addUserSport(userSport: InsertUserSport): Promise<UserSport>;
  getUserSports(userId: string): Promise<UserSport[]>;
  
  // Session methods
  getAllSessions(): Promise<Session[]>;
  getSession(id: string): Promise<Session | undefined>;
  getSessionsByAthlete(athleteId: string): Promise<Session[]>;
  getSessionsByCoach(coachId: string): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSessionStatus(id: string, status: 'upcoming' | 'completed' | 'cancelled'): Promise<Session | undefined>;
  
  // Review methods
  getReview(id: string): Promise<Review | undefined>;
  getReviewsByCoach(coachId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Performance Metric methods
  getPerformanceMetric(id: string): Promise<PerformanceMetric | undefined>;
  getPerformanceMetricsByAthlete(athleteId: string): Promise<PerformanceMetric[]>;
  createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  
  // Training Session methods
  getTrainingSession(id: string): Promise<TrainingSession | undefined>;
  getTrainingSessionsByAthlete(athleteId: string): Promise<TrainingSession[]>;
  createTrainingSession(trainingSession: InsertTrainingSession): Promise<TrainingSession>;
  
  // AR Metric methods
  getARMetric(id: string): Promise<ARMetric | undefined>;
  getARMetricsByUser(userId: string): Promise<ARMetric[]>;
  createARMetric(arMetric: InsertARMetric): Promise<ARMetric>;
  
  // Achievement methods
  getAchievement(id: string): Promise<Achievement | undefined>;
  getAchievementsByUser(userId: string): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  
  // Virtual Venue methods
  getAllVenues(): Promise<VirtualVenue[]>;
  getVenuesBySport(sport: string): Promise<VirtualVenue[]>;
  getVenue(id: number): Promise<VirtualVenue | undefined>;
  createVenue(venue: InsertVirtualVenue): Promise<VirtualVenue>;
  updateVenue(id: number, venueData: Partial<InsertVirtualVenue>): Promise<VirtualVenue | undefined>;
  deleteVenue(id: number): Promise<boolean>;
  
  // User Venue Preference methods
  getUserVenuePreferences(userId: string, sport?: string): Promise<UserVenuePreference[]>;
  getUserVenuePreference(userId: string, venueId: number): Promise<UserVenuePreference | undefined>;
  createUserVenuePreference(preference: InsertUserVenuePreference): Promise<UserVenuePreference>;
  updateUserVenuePreference(id: number, preferenceData: Partial<InsertUserVenuePreference>): Promise<UserVenuePreference | undefined>;
  unlockVenueForUser(userId: string, venueId: number): Promise<UserVenuePreference>;
  
  // Venue Session methods
  getVenueSession(id: number): Promise<VenueSession | undefined>;
  getVenueSessionsByUser(userId: string): Promise<VenueSession[]>;
  getVenueSessionsByVenue(venueId: number): Promise<VenueSession[]>;
  createVenueSession(session: InsertVenueSession): Promise<VenueSession>;
  updateVenueSession(id: number, sessionData: Partial<InsertVenueSession>): Promise<VenueSession | undefined>;
  
  // Venue Leaderboard methods
  getVenueLeaderboards(venueId?: number, sport?: string): Promise<VenueLeaderboard[]>;
  getVenueLeaderboard(id: number): Promise<VenueLeaderboard | undefined>;
  createVenueLeaderboard(leaderboard: InsertVenueLeaderboard): Promise<VenueLeaderboard>;
  getVenueLeaderboardEntries(leaderboardId: number): Promise<VenueLeaderboardEntry[]>;
  createVenueLeaderboardEntry(entry: InsertVenueLeaderboardEntry): Promise<VenueLeaderboardEntry>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
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
  
  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  // User-Sport methods
  async addUserSport(userSport: InsertUserSport): Promise<UserSport> {
    const [newUserSport] = await db.insert(userSports).values(userSport).returning();
    return newUserSport;
  }
  
  async getUserSports(userId: string): Promise<UserSport[]> {
    return await db.select().from(userSports).where(eq(userSports.userId, userId));
  }
  
  // Session methods
  async getAllSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(desc(sessions.startTime));
  }
  
  async getSession(id: string): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }
  
  async getSessionsByAthlete(athleteId: string): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.athleteId, athleteId))
      .orderBy(desc(sessions.startTime));
  }
  
  async getSessionsByCoach(coachId: string): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.coachId, coachId))
      .orderBy(desc(sessions.startTime));
  }
  
  async createSession(sessionData: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(sessionData).returning();
    return session;
  }
  
  async updateSessionStatus(id: string, status: 'upcoming' | 'completed' | 'cancelled'): Promise<Session | undefined> {
    const [session] = await db
      .update(sessions)
      .set({ status, updatedAt: new Date() })
      .where(eq(sessions.id, id))
      .returning();
    return session;
  }
  
  // Review methods
  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review;
  }
  
  async getReviewsByCoach(coachId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.coachId, coachId))
      .orderBy(desc(reviews.date));
  }
  
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  }
  
  // Performance Metric methods
  async getPerformanceMetric(id: string): Promise<PerformanceMetric | undefined> {
    const [metric] = await db.select().from(performanceMetrics).where(eq(performanceMetrics.id, id));
    return metric;
  }
  
  async getPerformanceMetricsByAthlete(athleteId: string): Promise<PerformanceMetric[]> {
    return await db
      .select()
      .from(performanceMetrics)
      .where(eq(performanceMetrics.athleteId, athleteId))
      .orderBy(desc(performanceMetrics.date));
  }
  
  async createPerformanceMetric(metricData: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const [metric] = await db.insert(performanceMetrics).values(metricData).returning();
    return metric;
  }
  
  // Training Session methods
  async getTrainingSession(id: string): Promise<TrainingSession | undefined> {
    const [session] = await db.select().from(trainingSessions).where(eq(trainingSessions.id, id));
    return session;
  }
  
  async getTrainingSessionsByAthlete(athleteId: string): Promise<TrainingSession[]> {
    return await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.athleteId, athleteId))
      .orderBy(desc(trainingSessions.date));
  }
  
  async createTrainingSession(sessionData: InsertTrainingSession): Promise<TrainingSession> {
    const [session] = await db.insert(trainingSessions).values(sessionData).returning();
    return session;
  }
  
  // AR Metric methods
  async getARMetric(id: string): Promise<ARMetric | undefined> {
    const [metric] = await db.select().from(arMetrics).where(eq(arMetrics.id, id));
    return metric;
  }
  
  async getARMetricsByUser(userId: string): Promise<ARMetric[]> {
    return await db
      .select()
      .from(arMetrics)
      .where(eq(arMetrics.userId, userId))
      .orderBy(desc(arMetrics.timestamp));
  }
  
  async createARMetric(metricData: InsertARMetric): Promise<ARMetric> {
    const [metric] = await db.insert(arMetrics).values(metricData).returning();
    return metric;
  }
  
  // Achievement methods
  async getAchievement(id: string): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement;
  }
  
  async getAchievementsByUser(userId: string): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.date));
  }
  
  async createAchievement(achievementData: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(achievementData).returning();
    return achievement;
  }
  
  // Virtual Venue methods
  async getAllVenues(): Promise<VirtualVenue[]> {
    return await db.select().from(virtualVenues).where(eq(virtualVenues.isActive, true)).orderBy(virtualVenues.sport, virtualVenues.venueName);
  }
  
  async getVenuesBySport(sport: string): Promise<VirtualVenue[]> {
    return await db
      .select()
      .from(virtualVenues)
      .where(and(eq(virtualVenues.sport, sport), eq(virtualVenues.isActive, true)))
      .orderBy(virtualVenues.difficulty, virtualVenues.venueName);
  }
  
  async getVenue(id: number): Promise<VirtualVenue | undefined> {
    const [venue] = await db.select().from(virtualVenues).where(eq(virtualVenues.id, id));
    return venue;
  }
  
  async createVenue(venueData: InsertVirtualVenue): Promise<VirtualVenue> {
    const [venue] = await db.insert(virtualVenues).values(venueData).returning();
    return venue;
  }
  
  async updateVenue(id: number, venueData: Partial<InsertVirtualVenue>): Promise<VirtualVenue | undefined> {
    const [venue] = await db
      .update(virtualVenues)
      .set({ ...venueData, updatedAt: new Date() })
      .where(eq(virtualVenues.id, id))
      .returning();
    return venue;
  }
  
  async deleteVenue(id: number): Promise<boolean> {
    const result = await db
      .update(virtualVenues)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(virtualVenues.id, id));
    return result.count > 0;
  }
  
  // User Venue Preference methods
  async getUserVenuePreferences(userId: string, sport?: string): Promise<UserVenuePreference[]> {
    const query = db.select().from(userVenuePreferences).where(eq(userVenuePreferences.userId, userId));
    if (sport) {
      return await query.where(eq(userVenuePreferences.sport, sport));
    }
    return await query;
  }
  
  async getUserVenuePreference(userId: string, venueId: number): Promise<UserVenuePreference | undefined> {
    const [preference] = await db
      .select()
      .from(userVenuePreferences)
      .where(and(eq(userVenuePreferences.userId, userId), eq(userVenuePreferences.venueId, venueId)));
    return preference;
  }
  
  async createUserVenuePreference(preferenceData: InsertUserVenuePreference): Promise<UserVenuePreference> {
    const [preference] = await db.insert(userVenuePreferences).values(preferenceData).returning();
    return preference;
  }
  
  async updateUserVenuePreference(id: number, preferenceData: Partial<InsertUserVenuePreference>): Promise<UserVenuePreference | undefined> {
    const [preference] = await db
      .update(userVenuePreferences)
      .set(preferenceData)
      .where(eq(userVenuePreferences.id, id))
      .returning();
    return preference;
  }
  
  async unlockVenueForUser(userId: string, venueId: number): Promise<UserVenuePreference> {
    // Get the venue to determine the sport
    const venue = await this.getVenue(venueId);
    if (!venue) {
      throw new Error('Venue not found');
    }
    
    // Check if preference already exists
    const existingPreference = await this.getUserVenuePreference(userId, venueId);
    
    if (existingPreference) {
      // Update existing preference to unlock
      const updated = await this.updateUserVenuePreference(existingPreference.id, { isUnlocked: true });
      return updated!;
    } else {
      // Create new preference with unlocked status
      return await this.createUserVenuePreference({
        userId,
        sport: venue.sport,
        venueId,
        isUnlocked: true,
      });
    }
  }
  
  // Venue Session methods
  async getVenueSession(id: number): Promise<VenueSession | undefined> {
    const [session] = await db.select().from(venueSessions).where(eq(venueSessions.id, id));
    return session;
  }
  
  async getVenueSessionsByUser(userId: string): Promise<VenueSession[]> {
    return await db
      .select()
      .from(venueSessions)
      .where(eq(venueSessions.userId, userId))
      .orderBy(desc(venueSessions.completedAt));
  }
  
  async getVenueSessionsByVenue(venueId: number): Promise<VenueSession[]> {
    return await db
      .select()
      .from(venueSessions)
      .where(eq(venueSessions.venueId, venueId))
      .orderBy(desc(venueSessions.completedAt));
  }
  
  async createVenueSession(sessionData: InsertVenueSession): Promise<VenueSession> {
    const [session] = await db.insert(venueSessions).values(sessionData).returning();
    return session;
  }
  
  async updateVenueSession(id: number, sessionData: Partial<InsertVenueSession>): Promise<VenueSession | undefined> {
    const [session] = await db
      .update(venueSessions)
      .set(sessionData)
      .where(eq(venueSessions.id, id))
      .returning();
    return session;
  }
  
  // Venue Leaderboard methods
  async getVenueLeaderboards(venueId?: number, sport?: string): Promise<VenueLeaderboard[]> {
    let query = db.select().from(venueLeaderboards).where(eq(venueLeaderboards.isActive, true));
    
    if (venueId) {
      query = query.where(eq(venueLeaderboards.venueId, venueId));
    }
    if (sport) {
      query = query.where(eq(venueLeaderboards.sport, sport));
    }
    
    return await query.orderBy(desc(venueLeaderboards.periodStart));
  }
  
  async getVenueLeaderboard(id: number): Promise<VenueLeaderboard | undefined> {
    const [leaderboard] = await db.select().from(venueLeaderboards).where(eq(venueLeaderboards.id, id));
    return leaderboard;
  }
  
  async createVenueLeaderboard(leaderboardData: InsertVenueLeaderboard): Promise<VenueLeaderboard> {
    const [leaderboard] = await db.insert(venueLeaderboards).values(leaderboardData).returning();
    return leaderboard;
  }
  
  async getVenueLeaderboardEntries(leaderboardId: number): Promise<VenueLeaderboardEntry[]> {
    return await db
      .select()
      .from(venueLeaderboardEntries)
      .where(eq(venueLeaderboardEntries.leaderboardId, leaderboardId))
      .orderBy(venueLeaderboardEntries.rank);
  }
  
  async createVenueLeaderboardEntry(entryData: InsertVenueLeaderboardEntry): Promise<VenueLeaderboardEntry> {
    const [entry] = await db.insert(venueLeaderboardEntries).values(entryData).returning();
    return entry;
  }
}

export const storage = new DatabaseStorage();