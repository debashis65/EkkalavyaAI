import { 
  users, type User, type InsertUser,
  userSports, type UserSport, type InsertUserSport,
  sessions, type Session, type InsertSession,
  reviews, type Review, type InsertReview,
  performanceMetrics, type PerformanceMetric, type InsertPerformanceMetric,
  trainingSessions, type TrainingSession, type InsertTrainingSession,
  arMetrics, type ARMetric, type InsertARMetric,
  achievements, type Achievement, type InsertAchievement,
  sessionStatusEnum
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  
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

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private userSportsStore: Map<number, UserSport>;
  private sessionsStore: Map<number, Session>;
  private reviewsStore: Map<number, Review>;
  private performanceMetricsStore: Map<number, PerformanceMetric>;
  private trainingSessionsStore: Map<number, TrainingSession>;
  private arMetricsStore: Map<number, ARMetric>;
  private achievementsStore: Map<number, Achievement>;
  
  private userId: number = 1;
  private userSportId: number = 1;
  private sessionId: number = 1;
  private reviewId: number = 1;
  private performanceMetricId: number = 1;
  private trainingSessionId: number = 1;
  private arMetricId: number = 1;
  private achievementId: number = 1;
  
  constructor() {
    this.usersStore = new Map();
    this.userSportsStore = new Map();
    this.sessionsStore = new Map();
    this.reviewsStore = new Map();
    this.performanceMetricsStore = new Map();
    this.trainingSessionsStore = new Map();
    this.arMetricsStore = new Map();
    this.achievementsStore = new Map();
    
    // Initialize with sample users for development
    this.createUser({
      name: "Guru Drona",
      email: "coach@example.com",
      password: "password123",
      role: "coach",
      bio: "Elite archery coach with over 15 years of experience training national and international champions. Specializes in technical precision and mental preparation.",
      rating: 49, // 4.9 out of 5
      experience: "15+ Years Experience",
      students: 48
    });
    
    this.createUser({
      name: "Arjun Sharma",
      email: "athlete@example.com",
      password: "password123",
      role: "athlete",
      bio: "Passionate about improving my skills and reaching new heights in my sporting journey."
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(user => user.email === email);
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersStore.values());
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const newUser: User = {
      ...user,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.usersStore.set(id, newUser);
    return newUser;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };
    
    this.usersStore.set(id, updatedUser);
    return updatedUser;
  }
  
  // User-Sport methods
  async addUserSport(userSport: InsertUserSport): Promise<UserSport> {
    const id = this.userSportId++;
    const newUserSport: UserSport = {
      ...userSport,
      id
    };
    this.userSportsStore.set(id, newUserSport);
    return newUserSport;
  }
  
  async getUserSports(userId: number): Promise<UserSport[]> {
    return Array.from(this.userSportsStore.values()).filter(userSport => userSport.userId === userId);
  }
  
  // Session methods
  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessionsStore.values());
  }
  
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessionsStore.get(id);
  }
  
  async getSessionsByUser(userId: number): Promise<Session[]> {
    return Array.from(this.sessionsStore.values())
      .filter(session => session.athleteId === userId || session.coachId === userId);
  }
  
  async getSessionsByCoach(coachId: number): Promise<Session[]> {
    return Array.from(this.sessionsStore.values())
      .filter(session => session.coachId === coachId);
  }
  
  async getSessionsByAthlete(athleteId: number): Promise<Session[]> {
    return Array.from(this.sessionsStore.values())
      .filter(session => session.athleteId === athleteId);
  }
  
  async createSession(session: InsertSession): Promise<Session> {
    const id = this.sessionId++;
    const now = new Date();
    const newSession: Session = {
      ...session,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.sessionsStore.set(id, newSession);
    return newSession;
  }
  
  async updateSessionStatus(id: number, status: 'upcoming' | 'completed' | 'cancelled'): Promise<Session | undefined> {
    const session = await this.getSession(id);
    if (!session) return undefined;
    
    const updatedSession: Session = {
      ...session,
      status,
      updatedAt: new Date()
    };
    
    this.sessionsStore.set(id, updatedSession);
    return updatedSession;
  }
  
  // Review methods
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviewsStore.get(id);
  }
  
  async getReviewsByCoach(coachId: number): Promise<Review[]> {
    return Array.from(this.reviewsStore.values())
      .filter(review => review.coachId === coachId);
  }
  
  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const now = new Date();
    const newReview: Review = {
      ...review,
      id,
      date: now
    };
    this.reviewsStore.set(id, newReview);
    return newReview;
  }
  
  // Performance Metric methods
  async getPerformanceMetric(id: number): Promise<PerformanceMetric | undefined> {
    return this.performanceMetricsStore.get(id);
  }
  
  async getPerformanceMetricsByAthlete(athleteId: number): Promise<PerformanceMetric[]> {
    return Array.from(this.performanceMetricsStore.values())
      .filter(metric => metric.athleteId === athleteId);
  }
  
  async createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const id = this.performanceMetricId++;
    const now = new Date();
    const newMetric: PerformanceMetric = {
      ...metric,
      id,
      date: now
    };
    this.performanceMetricsStore.set(id, newMetric);
    return newMetric;
  }
  
  // Training Session methods
  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    return this.trainingSessionsStore.get(id);
  }
  
  async getTrainingSessionsByAthlete(athleteId: number): Promise<TrainingSession[]> {
    return Array.from(this.trainingSessionsStore.values())
      .filter(session => session.athleteId === athleteId);
  }
  
  async createTrainingSession(trainingSession: InsertTrainingSession): Promise<TrainingSession> {
    const id = this.trainingSessionId++;
    const now = new Date();
    const newTrainingSession: TrainingSession = {
      ...trainingSession,
      id,
      date: now
    };
    this.trainingSessionsStore.set(id, newTrainingSession);
    return newTrainingSession;
  }
  
  // AR Metric methods
  async getARMetric(id: number): Promise<ARMetric | undefined> {
    return this.arMetricsStore.get(id);
  }
  
  async getARMetricsByUser(userId: number): Promise<ARMetric[]> {
    return Array.from(this.arMetricsStore.values())
      .filter(metric => metric.userId === userId);
  }
  
  async createARMetric(arMetric: InsertARMetric): Promise<ARMetric> {
    const id = this.arMetricId++;
    const now = new Date();
    const newARMetric: ARMetric = {
      ...arMetric,
      id,
      timestamp: now
    };
    this.arMetricsStore.set(id, newARMetric);
    return newARMetric;
  }
  
  // Achievement methods
  async getAchievement(id: number): Promise<Achievement | undefined> {
    return this.achievementsStore.get(id);
  }
  
  async getAchievementsByUser(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievementsStore.values())
      .filter(achievement => achievement.userId === userId);
  }
  
  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    const id = this.achievementId++;
    const newAchievement: Achievement = {
      ...achievement,
      id
    };
    this.achievementsStore.set(id, newAchievement);
    return newAchievement;
  }
}

export const storage = new MemStorage();
