export type UserRole = "coach" | "athlete" | "admin";

export type Sport = "archery" | "swimming" | "basketball" | "football" | "cricket" | "gymnastics" | "tennis" | "badminton" | "yoga" | "athletics";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  sports: Sport[];
  rating?: number;
  achievements?: string[];
  bio?: string;
  experience?: string;
  students?: number;
  twoFactorEnabled?: boolean;
}

export interface Session {
  id: number;
  title: string;
  startTime: Date;
  endTime: Date;
  athlete: User;
  coach: User;
  status: "upcoming" | "completed" | "cancelled";
  type: "technical" | "performance_review" | "form_correction" | "strategy" | "mental" | "physical";
}

export interface Stat {
  label: string;
  value: number | string;
  change: number;
  changeType: "increase" | "decrease" | "neutral";
  icon: string;
}

export interface Review {
  id: number;
  reviewer: User;
  rating: number;
  text: string;
  date: Date;
}

export interface AthletePerformance {
  id: number;
  athlete: User;
  sport: Sport;
  improvement: number;
  metrics: Record<string, number>;
}

export interface CoachStats {
  students: number;
  rating: number;
  reviewCount: number;
  sports: Sport[];
  experience: string;
  availability: string[];
}

export interface TrainingSession {
  id: number;
  date: Date;
  focus: string;
  duration: string;
  intensity: number;
  performance: number;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface BarChartData {
  name: string;
  value: number;
}

export interface ARMetrics {
  id: number;
  type: "archery" | "swimming" | "other";
  metrics: Record<string, number | string>;
  improvement: number;
  timestamp: Date;
}
