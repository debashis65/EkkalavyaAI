import { useState, useEffect } from "react";
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

// API endpoints
const API_BASE = '/api';
const COACHES_ENDPOINT = `${API_BASE}/coaches`;

// API utility function
const fetchCoaches = async (filters?: { sport?: string; location?: string }): Promise<User[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.sport) queryParams.append('sport', filters.sport);
    if (filters?.location) queryParams.append('location', filters.location);
    
    const url = queryParams.toString() ? `${COACHES_ENDPOINT}?${queryParams}` : COACHES_ENDPOINT;
    
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching coaches:', error);
    return []; // Return empty array on error
  }
};

// API function for reviews
const fetchReviews = async (): Promise<Review[]> => {
  try {
    const response = await fetch(`${API_BASE}/reviews`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return []; // Return empty array on error
  }
};

export default function Coaches() {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sportFilter, setSportFilter] = useState<string>("all");

  // Load coaches and reviews from API
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [coachData, reviewData] = await Promise.all([
        fetchCoaches(),
        fetchReviews()
      ]);
      setCoaches(coachData);
      setReviews(reviewData);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Filter coaches based on search term and sport filter
  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch = 
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.sports.some(sport => sport.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (coach.experience && coach.experience.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSport = sportFilter === "all" || coach.sports.includes(sportFilter as any);
    return matchesSearch && matchesSport;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coaches...</p>
        </div>
      </div>
    );
  }



  return (
    <>
      <Helmet>
        <title>Coaches | Ekalavya</title>
        <meta name="description" content="Discover and connect with top sports coaches and mentors specialized in various disciplines. View ratings, experience, and book training sessions." />
      </Helmet>

      {/* Mobile-First Container */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Mobile-First Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold">Find a Coach</h1>
          <Button className="w-full sm:w-auto">
            <i className="fas fa-sliders-h mr-2"></i> Advanced Filters
          </Button>
        </div>

        {/* Mobile-First Search and Filters */}
        <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row gap-0 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"></i>
            <Input
              className="pl-10"
              placeholder="Search coaches by name, sport, or expertise"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
              <SelectTrigger className="w-full sm:w-[180px]">
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

        {/* Mobile-First Filter Badges */}
        <div className="flex gap-2 mb-4 sm:mb-6 flex-wrap">
          <Badge variant="outline" className="bg-background text-xs sm:text-sm">
            4.5+ Rating <button className="ml-1 sm:ml-2 text-xs">✕</button>
          </Badge>
          <Badge variant="outline" className="bg-background text-xs sm:text-sm">
            Available Now <button className="ml-1 sm:ml-2 text-xs">✕</button>
          </Badge>
          <Badge variant="outline" className="bg-background text-xs sm:text-sm">
            Online Sessions <button className="ml-1 sm:ml-2 text-xs">✕</button>
          </Badge>
          <Badge variant="outline" className="bg-background text-xs sm:text-sm">
            In-Person <button className="ml-1 sm:ml-2 text-xs">✕</button>
          </Badge>
        </div>

        {/* Mobile-First Coach Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          {filteredCoaches.map((coach) => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>

        {/* Mobile-First Bottom Section */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
