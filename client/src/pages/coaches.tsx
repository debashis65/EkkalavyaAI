import { useState } from "react";
import { Helmet } from "react-helmet";
import { CoachCard } from "@/components/coaches/coach-card";
import { CoachLeaderboard } from "@/components/coaches/coach-leaderboard";
import { CoachReviews } from "@/components/coaches/coach-reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Review } from "@/types";

// Mock coaches data
const coaches: User[] = [
  {
    id: 1,
    name: "Guru Drona",
    email: "guru.drona@example.com",
    role: "coach",
    sports: ["archery"],
    rating: 4.9,
    students: 42,
    experience: "15+ Years Experience",
  },
  {
    id: 2,
    name: "Rajiv Sharma",
    email: "rajiv.sharma@example.com",
    role: "coach",
    sports: ["swimming"],
    rating: 4.8,
    students: 38,
    experience: "12 Years Experience",
  },
  {
    id: 3,
    name: "Pradeep Kumar",
    email: "pradeep.kumar@example.com",
    role: "coach",
    sports: ["swimming"],
    rating: 4.8,
    students: 35,
    experience: "10 Years Experience",
  },
  {
    id: 4,
    name: "Sunita Devi",
    email: "sunita.devi@example.com",
    role: "coach",
    sports: ["yoga"],
    rating: 4.7,
    students: 40,
    experience: "8 Years Experience",
  },
  {
    id: 5,
    name: "Mohan Singh",
    email: "mohan.singh@example.com",
    role: "coach",
    sports: ["cricket"],
    rating: 4.6,
    students: 45,
    experience: "11 Years Experience",
  },
  {
    id: 6,
    name: "Anita Patel",
    email: "anita.patel@example.com",
    role: "coach",
    sports: ["tennis"],
    rating: 4.7,
    students: 32,
    experience: "9 Years Experience",
  },
];

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

export default function Coaches() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("all");

  // Filter coaches based on search term and sport filter
  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch = 
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.sports.some(sport => sport.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coach.experience && coach.experience.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSport = sportFilter === "all" || coach.sports.includes(sportFilter as any);
    return matchesSearch && matchesSport;
  });



  return (
    <>
      <Helmet>
        <title>Coaches | Ekalavya</title>
        <meta name="description" content="Discover and connect with top sports coaches and mentors specialized in various disciplines. View ratings, experience, and book training sessions." />
      </Helmet>

      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Find a Coach</h1>
          <Button>
            <i className="fas fa-sliders-h mr-2"></i> Advanced Filters
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              className="pl-10"
              placeholder="Search coaches by name, sport, or expertise"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sports</SelectItem>
                <SelectItem value="archery">Archery</SelectItem>
                <SelectItem value="swimming">Swimming</SelectItem>
                <SelectItem value="cricket">Cricket</SelectItem>
                <SelectItem value="tennis">Tennis</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="rating">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="students">Most Students</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          <Badge variant="outline" className="bg-background">
            4.5+ Rating <button className="ml-2 text-xs">✕</button>
          </Badge>
          <Badge variant="outline" className="bg-background">
            Available Now <button className="ml-2 text-xs">✕</button>
          </Badge>
          <Badge variant="outline" className="bg-background">
            Online Sessions <button className="ml-2 text-xs">✕</button>
          </Badge>
          <Badge variant="outline" className="bg-background">
            In-Person <button className="ml-2 text-xs">✕</button>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <CoachLeaderboard coaches={coaches} />
          <CoachReviews
            reviews={reviews}
            averageRating={4.9}
            totalReviews={128}
            distributionPercentages={[75, 18, 5, 1, 1]}
          />
        </div>




      </div>
    </>
  );
}
