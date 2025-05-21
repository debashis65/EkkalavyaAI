import { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CoachReviews } from "@/components/coaches/coach-reviews";
import { TopAthletes } from "@/components/dashboard/top-athletes";
import { UpcomingSessions } from "@/components/dashboard/upcoming-sessions";
import { getInitials } from "@/lib/utils";
import { User, Review, Session, AthletePerformance } from "@/types";

export default function CoachProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  // This would be fetched from an API in a real app
  const coach: User = {
    id: parseInt(id || "1"),
    name: "Guru Drona",
    email: "guru.drona@example.com",
    role: "coach",
    sports: ["archery"],
    rating: 4.9,
    students: 42,
    achievements: ["National Coach Award", "Olympic Medal Coach"],
    bio: "Elite archery coach with over 15 years of experience training national and international champions. Specializes in technical precision and mental preparation.",
    experience: "15+ Years Experience",
  };

  // Mock reviews data
  const reviews: Review[] = [
    {
      id: 1,
      reviewer: {
        id: 101,
        name: "Arjun Sharma",
        email: "arjun@example.com",
        role: "athlete",
        sports: ["archery"],
      },
      rating: 5,
      text: "Guru Drona has completely transformed my technique. His attention to detail and personalized approach has helped me win my first national championship. Truly grateful!",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    },
    {
      id: 2,
      reviewer: {
        id: 102,
        name: "Priya Patel",
        email: "priya@example.com",
        role: "athlete",
        sports: ["archery"],
      },
      rating: 5,
      text: "The best coach I've ever had! His guidance extends beyond just technique to mental preparation and competition strategy. Highly recommended!",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
    },
    {
      id: 3,
      reviewer: {
        id: 103,
        name: "Raj Kumar",
        email: "raj@example.com",
        role: "athlete",
        sports: ["archery"],
      },
      rating: 4,
      text: "Excellent coaching and mentoring. Guru Drona has a unique ability to identify your weaknesses and turn them into strengths. Very satisfied with my progress.",
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
    },
  ];

  // Mock upcoming sessions
  const upcomingSessions: Session[] = [
    {
      id: 1,
      title: "Technical Session",
      startTime: new Date(new Date().setHours(9, 0, 0)),
      endTime: new Date(new Date().setHours(10, 0, 0)),
      athlete: { id: 1, name: "Arjun Sharma", role: "athlete", email: "", sports: [] },
      coach,
      status: "upcoming",
      type: "technical"
    },
    {
      id: 2,
      title: "Performance Review",
      startTime: new Date(new Date().setHours(14, 30, 0)),
      endTime: new Date(new Date().setHours(15, 30, 0)),
      athlete: { id: 3, name: "Priya Patel", role: "athlete", email: "", sports: [] },
      coach,
      status: "upcoming",
      type: "performance_review"
    }
  ];

  // Mock top athletes data
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
    }
  ];

  return (
    <>
      <Helmet>
        <title>{coach.name} | Coach Profile | Ekalavya</title>
        <meta
          name="description"
          content={`Learn about ${coach.name}, expert ${coach.sports.join(
            ", "
          )} coach with ${coach.experience} of experience.`}
        />
      </Helmet>

      <div className="bg-secondary p-3 flex items-center justify-between shadow">
        <div className="flex items-center">
          <button className="md:hidden mr-2 text-white">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-white font-medium">Coach Profile</h1>
        </div>
        <div>
          <button className="text-white flex items-center justify-center h-8 w-8">
            <i className="fas fa-comments"></i>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 flex flex-col items-center">
        <Avatar className="w-24 h-24 border-2 border-secondary-400">
          <AvatarFallback className="text-xl bg-secondary/20 text-secondary">
            {getInitials(coach.name)}
          </AvatarFallback>
        </Avatar>
        <div className="w-4 h-4 bg-success rounded-full -mt-3 border-2 border-white"></div>
        <h2 className="text-xl font-semibold mt-2">{coach.name}</h2>
        <div className="flex items-center mt-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <i
                key={i}
                className={`fas fa-star ${
                  i < Math.floor(coach.rating || 0)
                    ? "text-yellow-400"
                    : i < (coach.rating || 0)
                    ? "text-yellow-400 opacity-50"
                    : "text-muted"
                }`}
              ></i>
            ))}
          </div>
          <span className="ml-2 text-sm">
            {coach.rating?.toFixed(1)} ({coach.students})
          </span>
        </div>
        <p className="text-muted-foreground mt-1">
          {coach.sports.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" & ")} Coach • Elite Level
        </p>

        <div className="flex justify-center space-x-6 mt-3 text-sm">
          <div className="flex items-center">
            <i className="far fa-clock text-secondary mr-1"></i>
            <span>{coach.experience}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-users text-secondary mr-1"></i>
            <span>{coach.students} Athletes</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-certificate text-secondary mr-1"></i>
            <span>Certified</span>
          </div>
        </div>

        <Button className="mt-4 bg-secondary text-white hover:bg-secondary/90">
          Book Session
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b mt-2">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto">
            <TabsTrigger
              value="overview"
              className="py-3 px-4 font-medium text-sm rounded-none"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="py-3 px-4 font-medium text-sm rounded-none"
            >
              Schedule
            </TabsTrigger>
            <TabsTrigger
              value="athletes"
              className="py-3 px-4 font-medium text-sm rounded-none"
            >
              Athletes
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="py-3 px-4 font-medium text-sm rounded-none"
            >
              Reviews
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="p-4">
          <TabsContent value="overview" className="mt-0">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About Me</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{coach.bio}</p>

                <h3 className="font-medium mb-2">Specialties</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    Technical Training
                  </span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    Mental Preparation
                  </span>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    Competition Strategy
                  </span>
                </div>

                <h3 className="font-medium mb-2">Achievements</h3>
                <ul className="list-disc list-inside text-muted-foreground">
                  {coach.achievements?.map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <UpcomingSessions sessions={upcomingSessions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="athletes" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Top Athletes</CardTitle>
              </CardHeader>
              <CardContent>
                <TopAthletes athletes={topAthletes} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-0">
            <CoachReviews
              reviews={reviews}
              averageRating={4.9}
              totalReviews={128}
              distributionPercentages={[75, 18, 5, 1, 1]}
            />
          </TabsContent>
        </div>
      </Tabs>

      <div className="p-4">
        <Card className="bg-secondary/10 border-secondary/20">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">
              Available for 1-on-1 Coaching
            </h2>
            <p className="text-muted-foreground mb-4">
              Personalized training sessions to elevate your skills
            </p>
            <div className="flex gap-4 justify-center">
              <Button>Book Now</Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}