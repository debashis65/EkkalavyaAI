import { Helmet } from "react-helmet";
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions";
import { TopAthletes } from "@/components/dashboard/top-athletes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { Session, AthletePerformance } from "@/types";
import { Search, Upload, Video, Trophy, Users, Clock, Target, TrendingUp } from "lucide-react";

// Mock data for dashboard
const upcomingSessions: Session[] = [
  {
    id: 1,
    title: "Technical Session",
    startTime: new Date(new Date().setHours(9, 0, 0)),
    endTime: new Date(new Date().setHours(10, 0, 0)),
    athlete: { id: 1, name: "Arjun Sharma", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "technical"
  },
  {
    id: 2,
    title: "Performance Review",
    startTime: new Date(new Date().setHours(14, 30, 0)),
    endTime: new Date(new Date().setHours(15, 30, 0)),
    athlete: { id: 3, name: "Priya Patel", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "performance_review"
  },
  {
    id: 3,
    title: "Form Correction",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10, 15, 0),
    endTime: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(11, 15, 0),
    athlete: { id: 4, name: "Raj Kumar", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "form_correction"
  },
  {
    id: 4,
    title: "Strategy Session",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(15, 45, 0),
    endTime: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(16, 45, 0),
    athlete: { id: 5, name: "Ananya Singh", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "strategy"
  },
  {
    id: 5,
    title: "Mental Training",
    startTime: new Date(new Date().setDate(new Date().getDate() + 6)).setHours(8, 30, 0),
    endTime: new Date(new Date().setDate(new Date().getDate() + 6)).setHours(9, 30, 0),
    athlete: { id: 6, name: "Vikram Mehta", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "mental"
  }
];

const topAthletes: AthletePerformance[] = [
  {
    id: 1,
    athlete: { id: 1, name: "Arjun Sharma", role: "athlete", email: "", sports: ["archery"] },
    sport: "archery",
    improvement: 18,
    metrics: { accuracy: 85, stamina: 80, technique: 83 }
  },
  {
    id: 2,
    athlete: { id: 3, name: "Priya Patel", role: "athlete", email: "", sports: ["archery"] },
    sport: "archery",
    improvement: 15,
    metrics: { accuracy: 82, stamina: 75, technique: 80 }
  },
  {
    id: 3,
    athlete: { id: 4, name: "Raj Kumar", role: "athlete", email: "", sports: ["archery"] },
    sport: "archery",
    improvement: 13,
    metrics: { accuracy: 80, stamina: 78, technique: 79 }
  },
  {
    id: 4,
    athlete: { id: 5, name: "Ananya Singh", role: "athlete", email: "", sports: ["archery"] },
    sport: "archery",
    improvement: 12,
    metrics: { accuracy: 77, stamina: 82, technique: 75 }
  },
  {
    id: 5,
    athlete: { id: 6, name: "Vikram Mehta", role: "athlete", email: "", sports: ["archery"] },
    sport: "archery",
    improvement: 10,
    metrics: { accuracy: 75, stamina: 79, technique: 74 }
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const isCoach = user?.role === "coach";

  return (
    <>
      <Helmet>
        <title>Dashboard | Ekalavya</title>
        <meta name="description" content="View your upcoming sessions, top athletes, and performance metrics on the Ekalavya dashboard." />
      </Helmet>

      {isCoach ? <CoachDashboard /> : <AthleteDashboard />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 pb-4">
        <UpcomingSessions sessions={upcomingSessions} />
        <TopAthletes athletes={topAthletes} />
      </div>
    </>
  );
}

function CoachDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <div className="bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">Namaste, {user.name}</h2>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                <i className="fas fa-star text-yellow-300 text-xs"></i>
                <span className="text-xs ml-1">{user.rating?.toFixed(1)}</span>
              </div>
              <span className="mx-2 text-primary-foreground/70">|</span>
              <span className="text-xs">Archery Master</span>
              <span className="mx-2 text-primary-foreground/70">|</span>
              <span className="text-xs">{user.students} students</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <i className="far fa-calendar-alt mr-1"></i>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="border-l-2 border-primary pl-3 py-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">Archery Fundamentals</div>
                  <div className="text-sm text-muted-foreground">Arjun • 4:00 PM - 5:00 PM</div>
                </div>
                <Badge>Upcoming</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="px-4 pb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Student Activity</CardTitle>
            <Button variant="link" size="sm" className="text-primary p-0 h-auto">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-3">
                <AvatarFallback className="bg-muted">A</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">Arjun</div>
                <div className="text-xs text-muted-foreground">Uploaded a practice video • 2 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function AthleteDashboard() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <>
      <div className="bg-primary px-4 py-4 text-primary-foreground">
        <h1 className="text-xl font-semibold">Welcome back, {user.name}!</h1>
        <p className="text-sm mt-1 text-primary-foreground/80">Track your progress and upcoming sessions</p>
      </div>
      
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Avatar className="h-14 w-14 mr-4">
                <AvatarFallback className="bg-secondary/20 text-secondary-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-medium">{user.name}</h2>
                <p className="text-sm text-muted-foreground">Archery Student</p>
                <div className="flex items-center mt-1">
                  <Badge variant="secondary" className="mr-2">
                    <i className="fas fa-arrow-up mr-1 text-xs"></i>
                    +8% This Week
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 text-primary">
                    875 Training Hours
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="px-4 grid grid-cols-2 gap-4 mb-4">
        {[
          { label: "Next Session", value: "Today, 4:00 PM", icon: "fa-calendar-alt", color: "primary" },
          { label: "Current Focus", value: "Accuracy", icon: "fa-bullseye", color: "secondary" },
          { label: "Weekly Goal", value: "75% complete", icon: "fa-chart-line", color: "accent" },
          { label: "Coach", value: "Guru Drona", icon: "fa-user-tie", color: "success" }
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-3">
              <div className="flex items-center mb-1">
                <div className={`w-8 h-8 rounded-full bg-${stat.color}/10 text-${stat.color} flex items-center justify-center mr-2`}>
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <div className="text-sm font-semibold mt-1">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
