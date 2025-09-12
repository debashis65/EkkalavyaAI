import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Trophy, Users, Clock, Lock, CheckCircle } from "lucide-react";

interface VirtualVenue {
  id: number;
  sport: string;
  venueName: string;
  venueLocation?: string;
  venueType: string;
  surfaceType: string;
  isRealVenue: boolean;
  capacity?: number;
  dimensions: {
    length: number;
    width: number;
    height?: number;
  };
  environmentEffects: {
    lighting: string;
    weather?: string;
    crowdNoise: number;
    temperature?: number;
  };
  gridConfiguration: {
    zones: Array<{
      name: string;
      coordinates: { x: number; y: number; width: number; height: number };
      scoreMultiplier: number;
      difficulty: string;
    }>;
  };
  difficulty: string;
  unlockRequirement?: {
    minScore?: number;
    achievement?: string;
  };
  thumbnailUrl?: string;
  isActive: boolean;
}

interface UserVenuePreference {
  id: number;
  venueId: number;
  isUnlocked: boolean;
  timesUsed: number;
  bestScore?: number;
  totalTimeSpent: number;
  lastUsedAt?: string;
}

interface VirtualVenueSelectorProps {
  sport: string;
  onVenueSelect: (venue: VirtualVenue) => void;
  selectedVenueId?: number;
  user?: any;
  className?: string;
}

export default function VirtualVenueSelector({ sport, onVenueSelect, selectedVenueId, user, className }: VirtualVenueSelectorProps) {
  const [venues, setVenues] = useState<VirtualVenue[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserVenuePreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  // Get real venue configurations for each sport
  const getVenuesForSport = (sportName: string): VirtualVenue[] => {
    const venueConfigs: Record<string, VirtualVenue[]> = {
      basketball: [
        // Indian Primary Venues (Always Available)
        {
          id: 1,
          sport: "basketball",
          venueName: "Indira Gandhi Arena",
          venueLocation: "New Delhi, India",
          venueType: "arena",
          surfaceType: "hardwood",
          isRealVenue: true,
          capacity: 15000,
          dimensions: { length: 28.7, width: 15.2, height: 7.0 },
          environmentEffects: {
            lighting: "professional",
            crowdNoise: 78,
            temperature: 24
          },
          gridConfiguration: {
            zones: [
              { name: "Free Throw Line", coordinates: { x: 14.35, y: 5.8, width: 3.6, height: 1.2 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Three Point Arc", coordinates: { x: 14.35, y: 7.24, width: 7.32, height: 1.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Paint Zone", coordinates: { x: 14.35, y: 0, width: 4.9, height: 5.8 }, scoreMultiplier: 1.2, difficulty: "easy" },
              { name: "Corner Three", coordinates: { x: 0.9, y: 3, width: 2, height: 4 }, scoreMultiplier: 1.4, difficulty: "hard" }
            ]
          },
          difficulty: "advanced",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/indira-gandhi-arena.jpg",
          isActive: true
        },
        {
          id: 2,
          sport: "basketball",
          venueName: "Sree Kanteerava Stadium Court",
          venueLocation: "Bangalore, India",
          venueType: "arena",
          surfaceType: "hardwood",
          isRealVenue: true,
          capacity: 8000,
          dimensions: { length: 28.7, width: 15.2, height: 7.0 },
          environmentEffects: {
            lighting: "professional",
            crowdNoise: 70,
            temperature: 22
          },
          gridConfiguration: {
            zones: [
              { name: "Free Throw Line", coordinates: { x: 14.35, y: 5.8, width: 3.6, height: 1.2 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Three Point Arc", coordinates: { x: 14.35, y: 7.24, width: 7.32, height: 1.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Paint Zone", coordinates: { x: 14.35, y: 0, width: 4.9, height: 5.8 }, scoreMultiplier: 1.2, difficulty: "easy" },
              { name: "Corner Three", coordinates: { x: 0.9, y: 3, width: 2, height: 4 }, scoreMultiplier: 1.4, difficulty: "hard" }
            ]
          },
          difficulty: "intermediate",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/kanteerava-court.jpg",
          isActive: true
        },
        {
          id: 3,
          sport: "basketball",
          venueName: "Training Academy Court",
          venueLocation: "Mumbai, India",
          venueType: "indoor",
          surfaceType: "hardwood",
          isRealVenue: false,
          capacity: 500,
          dimensions: { length: 28.7, width: 15.2, height: 7.0 },
          environmentEffects: {
            lighting: "standard",
            crowdNoise: 25,
            temperature: 26
          },
          gridConfiguration: {
            zones: [
              { name: "Free Throw Line", coordinates: { x: 14.35, y: 5.8, width: 3.6, height: 1.2 }, scoreMultiplier: 1.0, difficulty: "easy" },
              { name: "Close Range", coordinates: { x: 14.35, y: 2, width: 4, height: 3 }, scoreMultiplier: 1.1, difficulty: "easy" },
              { name: "Mid Range", coordinates: { x: 14.35, y: 6, width: 6, height: 2 }, scoreMultiplier: 1.3, difficulty: "medium" }
            ]
          },
          difficulty: "beginner",
          isActive: true
        },
        {
          id: 25,
          sport: "basketball",
          venueName: "Kalinga Stadium Indoor Court",
          venueLocation: "Bhubaneswar, Odisha",
          venueType: "arena",
          surfaceType: "hardwood",
          isRealVenue: true,
          capacity: 3000,
          dimensions: { length: 28.7, width: 15.2, height: 7.0 },
          environmentEffects: {
            lighting: "professional",
            crowdNoise: 60,
            temperature: 29
          },
          gridConfiguration: {
            zones: [
              { name: "Free Throw Line", coordinates: { x: 14.35, y: 5.8, width: 3.6, height: 1.2 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Three Point Arc", coordinates: { x: 14.35, y: 7.24, width: 7.32, height: 1.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Paint Zone", coordinates: { x: 14.35, y: 0, width: 4.9, height: 5.8 }, scoreMultiplier: 1.2, difficulty: "easy" },
              { name: "Corner Three", coordinates: { x: 0.9, y: 3, width: 2, height: 4 }, scoreMultiplier: 1.4, difficulty: "hard" }
            ]
          },
          difficulty: "intermediate",
          thumbnailUrl: "/venues/kalinga-basketball.jpg",
          isActive: true
        },
        {
          id: 32,
          sport: "basketball",
          venueName: "Jawaharlal Nehru Indoor Stadium",
          venueLocation: "Cuttack, Odisha",
          venueType: "arena",
          surfaceType: "hardwood",
          isRealVenue: true,
          capacity: 4000,
          dimensions: { length: 28.7, width: 15.2, height: 7.0 },
          environmentEffects: {
            lighting: "professional",
            crowdNoise: 65,
            temperature: 30
          },
          gridConfiguration: {
            zones: [
              { name: "Free Throw Line", coordinates: { x: 14.35, y: 5.8, width: 3.6, height: 1.2 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Three Point Arc", coordinates: { x: 14.35, y: 7.24, width: 7.32, height: 1.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Paint Zone", coordinates: { x: 14.35, y: 0, width: 4.9, height: 5.8 }, scoreMultiplier: 1.2, difficulty: "easy" },
              { name: "Corner Three", coordinates: { x: 0.9, y: 3, width: 2, height: 4 }, scoreMultiplier: 1.4, difficulty: "hard" }
            ]
          },
          difficulty: "intermediate",
          thumbnailUrl: "/venues/jln-indoor-cuttack.jpg",
          isActive: true
        },
        {
          id: 37,
          sport: "basketball",
          venueName: "Ispat Stadium Basketball Court",
          venueLocation: "Rourkela, Odisha",
          venueType: "arena",
          surfaceType: "hardwood",
          isRealVenue: true,
          capacity: 2500,
          dimensions: { length: 28.7, width: 15.2, height: 7.0 },
          environmentEffects: {
            lighting: "professional",
            crowdNoise: 55,
            temperature: 31
          },
          gridConfiguration: {
            zones: [
              { name: "Free Throw Line", coordinates: { x: 14.35, y: 5.8, width: 3.6, height: 1.2 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Three Point Arc", coordinates: { x: 14.35, y: 7.24, width: 7.32, height: 1.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Paint Zone", coordinates: { x: 14.35, y: 0, width: 4.9, height: 5.8 }, scoreMultiplier: 1.2, difficulty: "easy" },
              { name: "Corner Three", coordinates: { x: 0.9, y: 3, width: 2, height: 4 }, scoreMultiplier: 1.4, difficulty: "hard" }
            ]
          },
          difficulty: "intermediate",
          thumbnailUrl: "/venues/ispat-stadium.jpg",
          isActive: true
        },
        // Other Indian Stadiums (Unlock at 75% score)
        {
          id: 4,
          sport: "basketball",
          venueName: "Madison Square Garden",
          venueLocation: "New York, USA",
          venueType: "arena",
          surfaceType: "hardwood",
          isRealVenue: true,
          capacity: 20789,
          dimensions: { length: 28.7, width: 15.2, height: 7.0 },
          environmentEffects: {
            lighting: "professional",
            crowdNoise: 85,
            temperature: 21
          },
          gridConfiguration: {
            zones: [
              { name: "Free Throw Line", coordinates: { x: 14.35, y: 5.8, width: 3.6, height: 1.2 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Three Point Arc", coordinates: { x: 14.35, y: 7.24, width: 7.32, height: 1.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Paint Zone", coordinates: { x: 14.35, y: 0, width: 4.9, height: 5.8 }, scoreMultiplier: 1.2, difficulty: "easy" },
              { name: "Corner Three", coordinates: { x: 0.9, y: 3, width: 2, height: 4 }, scoreMultiplier: 1.4, difficulty: "hard" }
            ]
          },
          difficulty: "professional",
          unlockRequirement: { minScore: 90 },
          thumbnailUrl: "/venues/msg-court.jpg",
          isActive: true
        },
        {
          id: 5,
          sport: "basketball",
          venueName: "Staples Center Court",
          venueLocation: "Los Angeles, USA",
          venueType: "arena",
          surfaceType: "hardwood",
          isRealVenue: true,
          capacity: 19060,
          dimensions: { length: 28.7, width: 15.2, height: 7.0 },
          environmentEffects: {
            lighting: "professional",
            crowdNoise: 82,
            temperature: 20
          },
          gridConfiguration: {
            zones: [
              { name: "Free Throw Line", coordinates: { x: 14.35, y: 5.8, width: 3.6, height: 1.2 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Three Point Arc", coordinates: { x: 14.35, y: 7.24, width: 7.32, height: 1.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Paint Zone", coordinates: { x: 14.35, y: 0, width: 4.9, height: 5.8 }, scoreMultiplier: 1.2, difficulty: "easy" },
              { name: "Corner Three", coordinates: { x: 0.9, y: 3, width: 2, height: 4 }, scoreMultiplier: 1.4, difficulty: "hard" }
            ]
          },
          difficulty: "professional",
          unlockRequirement: { minScore: 90 },
          thumbnailUrl: "/venues/staples-court.jpg",
          isActive: true
        }
      ],
      football: [
        // Indian Primary Venues (Always Available)
        {
          id: 6,
          sport: "football",
          venueName: "Salt Lake Stadium",
          venueLocation: "Kolkata, India",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 85000,
          dimensions: { length: 105, width: 68 },
          environmentEffects: {
            lighting: "professional",
            weather: "humid",
            crowdNoise: 88,
            temperature: 28
          },
          gridConfiguration: {
            zones: [
              { name: "Penalty Box", coordinates: { x: 52.5, y: 0, width: 40.3, height: 16.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Six Yard Box", coordinates: { x: 52.5, y: 0, width: 18.3, height: 5.5 }, scoreMultiplier: 2.0, difficulty: "easy" },
              { name: "Center Circle", coordinates: { x: 52.5, y: 34, width: 18.3, height: 18.3 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Wing Areas", coordinates: { x: 10, y: 20, width: 20, height: 30 }, scoreMultiplier: 1.2, difficulty: "medium" }
            ]
          },
          difficulty: "professional",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/salt-lake-stadium.jpg",
          isActive: true
        },
        {
          id: 7,
          sport: "football",
          venueName: "Jawaharlal Nehru Stadium",
          venueLocation: "New Delhi, India",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 60000,
          dimensions: { length: 105, width: 68 },
          environmentEffects: {
            lighting: "professional",
            weather: "clear",
            crowdNoise: 80,
            temperature: 25
          },
          gridConfiguration: {
            zones: [
              { name: "Penalty Box", coordinates: { x: 52.5, y: 0, width: 40.3, height: 16.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Six Yard Box", coordinates: { x: 52.5, y: 0, width: 18.3, height: 5.5 }, scoreMultiplier: 2.0, difficulty: "easy" },
              { name: "Center Circle", coordinates: { x: 52.5, y: 34, width: 18.3, height: 18.3 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Wing Areas", coordinates: { x: 10, y: 20, width: 20, height: 30 }, scoreMultiplier: 1.2, difficulty: "medium" }
            ]
          },
          difficulty: "advanced",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/jln-stadium.jpg",
          isActive: true
        },
        {
          id: 8,
          sport: "football",
          venueName: "Fatorda Stadium",
          venueLocation: "Goa, India",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 19000,
          dimensions: { length: 105, width: 68 },
          environmentEffects: {
            lighting: "natural",
            weather: "coastal",
            crowdNoise: 75,
            temperature: 30
          },
          gridConfiguration: {
            zones: [
              { name: "Penalty Box", coordinates: { x: 52.5, y: 0, width: 40.3, height: 16.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Six Yard Box", coordinates: { x: 52.5, y: 0, width: 18.3, height: 5.5 }, scoreMultiplier: 2.0, difficulty: "easy" },
              { name: "Center Circle", coordinates: { x: 52.5, y: 34, width: 18.3, height: 18.3 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Wing Areas", coordinates: { x: 10, y: 20, width: 20, height: 30 }, scoreMultiplier: 1.2, difficulty: "medium" }
            ]
          },
          difficulty: "intermediate",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/fatorda-stadium.jpg",
          isActive: true
        },
        {
          id: 9,
          sport: "football",
          venueName: "Training Academy Field",
          venueLocation: "Pune, India",
          venueType: "field",
          surfaceType: "grass",
          isRealVenue: false,
          capacity: 1000,
          dimensions: { length: 105, width: 68 },
          environmentEffects: {
            lighting: "natural",
            weather: "clear",
            crowdNoise: 20,
            temperature: 24
          },
          gridConfiguration: {
            zones: [
              { name: "Shooting Zone", coordinates: { x: 52.5, y: 0, width: 25, height: 20 }, scoreMultiplier: 1.2, difficulty: "easy" },
              { name: "Passing Zone", coordinates: { x: 52.5, y: 25, width: 50, height: 20 }, scoreMultiplier: 1.0, difficulty: "easy" },
              { name: "Dribbling Course", coordinates: { x: 20, y: 50, width: 65, height: 18 }, scoreMultiplier: 1.1, difficulty: "medium" }
            ]
          },
          difficulty: "beginner",
          isActive: true
        },
        {
          id: 26,
          sport: "football",
          venueName: "Kalinga Stadium",
          venueLocation: "Bhubaneswar, Odisha",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 15000,
          dimensions: { length: 105, width: 68 },
          environmentEffects: {
            lighting: "professional",
            weather: "humid",
            crowdNoise: 75,
            temperature: 32
          },
          gridConfiguration: {
            zones: [
              { name: "Penalty Box", coordinates: { x: 52.5, y: 0, width: 40.3, height: 16.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Six Yard Box", coordinates: { x: 52.5, y: 0, width: 18.3, height: 5.5 }, scoreMultiplier: 2.0, difficulty: "easy" },
              { name: "Center Circle", coordinates: { x: 52.5, y: 34, width: 18.3, height: 18.3 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Wing Areas", coordinates: { x: 10, y: 20, width: 20, height: 30 }, scoreMultiplier: 1.2, difficulty: "medium" }
            ]
          },
          difficulty: "advanced",
          thumbnailUrl: "/venues/kalinga-stadium.jpg",
          isActive: true
        },
        {
          id: 38,
          sport: "football",
          venueName: "Angul Stadium",
          venueLocation: "Angul, Odisha",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 12000,
          dimensions: { length: 105, width: 68 },
          environmentEffects: {
            lighting: "standard",
            weather: "hot",
            crowdNoise: 60,
            temperature: 35
          },
          gridConfiguration: {
            zones: [
              { name: "Penalty Box", coordinates: { x: 52.5, y: 0, width: 40.3, height: 16.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Six Yard Box", coordinates: { x: 52.5, y: 0, width: 18.3, height: 5.5 }, scoreMultiplier: 2.0, difficulty: "easy" },
              { name: "Center Circle", coordinates: { x: 52.5, y: 34, width: 18.3, height: 18.3 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Wing Areas", coordinates: { x: 10, y: 20, width: 20, height: 30 }, scoreMultiplier: 1.2, difficulty: "medium" }
            ]
          },
          difficulty: "intermediate",
          thumbnailUrl: "/venues/angul-stadium.jpg",
          isActive: true
        },
        {
          id: 39,
          sport: "football",
          venueName: "Sports Stadium Berhampur",
          venueLocation: "Berhampur, Odisha",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 10000,
          dimensions: { length: 105, width: 68 },
          environmentEffects: {
            lighting: "standard",
            weather: "coastal",
            crowdNoise: 55,
            temperature: 32
          },
          gridConfiguration: {
            zones: [
              { name: "Penalty Box", coordinates: { x: 52.5, y: 0, width: 40.3, height: 16.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Six Yard Box", coordinates: { x: 52.5, y: 0, width: 18.3, height: 5.5 }, scoreMultiplier: 2.0, difficulty: "easy" },
              { name: "Center Circle", coordinates: { x: 52.5, y: 34, width: 18.3, height: 18.3 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Wing Areas", coordinates: { x: 10, y: 20, width: 20, height: 30 }, scoreMultiplier: 1.2, difficulty: "medium" }
            ]
          },
          difficulty: "intermediate",
          thumbnailUrl: "/venues/berhampur-stadium.jpg",
          isActive: true
        },
        // Other Indian Stadiums (Unlock at 75% score)
        {
          id: 10,
          sport: "football",
          venueName: "Wembley Stadium",
          venueLocation: "London, England",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 90000,
          dimensions: { length: 105, width: 68 },
          environmentEffects: {
            lighting: "natural",
            weather: "cloudy",
            crowdNoise: 90,
            temperature: 15
          },
          gridConfiguration: {
            zones: [
              { name: "Penalty Box", coordinates: { x: 52.5, y: 0, width: 40.3, height: 16.5 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Six Yard Box", coordinates: { x: 52.5, y: 0, width: 18.3, height: 5.5 }, scoreMultiplier: 2.0, difficulty: "easy" },
              { name: "Center Circle", coordinates: { x: 52.5, y: 34, width: 18.3, height: 18.3 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Wing Areas", coordinates: { x: 10, y: 20, width: 20, height: 30 }, scoreMultiplier: 1.2, difficulty: "medium" }
            ]
          },
          difficulty: "professional",
          unlockRequirement: { minScore: 90 },
          thumbnailUrl: "/venues/wembley-pitch.jpg",
          isActive: true
        }
      ],
      tennis: [
        // Indian Primary Venues (Always Available)
        {
          id: 11,
          sport: "tennis",
          venueName: "DLTA Complex Court",
          venueLocation: "New Delhi, India",
          venueType: "court",
          surfaceType: "hard",
          isRealVenue: true,
          capacity: 5000,
          dimensions: { length: 23.77, width: 10.97 },
          environmentEffects: {
            lighting: "professional",
            weather: "sunny",
            crowdNoise: 65,
            temperature: 32
          },
          gridConfiguration: {
            zones: [
              { name: "Service Box", coordinates: { x: 11.88, y: 0, width: 6.4, height: 5.49 }, scoreMultiplier: 1.3, difficulty: "medium" },
              { name: "Baseline", coordinates: { x: 11.88, y: 0, width: 11.88, height: 1 }, scoreMultiplier: 1.2, difficulty: "hard" },
              { name: "Net Area", coordinates: { x: 11.88, y: 5.5, width: 11.88, height: 2 }, scoreMultiplier: 1.4, difficulty: "hard" },
              { name: "Corner Shots", coordinates: { x: 1, y: 1, width: 3, height: 3 }, scoreMultiplier: 1.6, difficulty: "expert" }
            ]
          },
          difficulty: "advanced",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/dlta-court.jpg",
          isActive: true
        },
        {
          id: 12,
          sport: "tennis",
          venueName: "Balewadi Sports Complex",
          venueLocation: "Pune, India",
          venueType: "court",
          surfaceType: "hard",
          isRealVenue: true,
          capacity: 3000,
          dimensions: { length: 23.77, width: 10.97 },
          environmentEffects: {
            lighting: "professional",
            weather: "moderate",
            crowdNoise: 55,
            temperature: 28
          },
          gridConfiguration: {
            zones: [
              { name: "Service Box", coordinates: { x: 11.88, y: 0, width: 6.4, height: 5.49 }, scoreMultiplier: 1.3, difficulty: "medium" },
              { name: "Baseline", coordinates: { x: 11.88, y: 0, width: 11.88, height: 1 }, scoreMultiplier: 1.2, difficulty: "hard" },
              { name: "Net Area", coordinates: { x: 11.88, y: 5.5, width: 11.88, height: 2 }, scoreMultiplier: 1.4, difficulty: "hard" },
              { name: "Corner Shots", coordinates: { x: 1, y: 1, width: 3, height: 3 }, scoreMultiplier: 1.6, difficulty: "expert" }
            ]
          },
          difficulty: "intermediate",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/balewadi-court.jpg",
          isActive: true
        },
        {
          id: 13,
          sport: "tennis",
          venueName: "Academy Practice Court",
          venueLocation: "Chennai, India",
          venueType: "court",
          surfaceType: "hard",
          isRealVenue: false,
          capacity: 200,
          dimensions: { length: 23.77, width: 10.97 },
          environmentEffects: {
            lighting: "standard",
            weather: "hot",
            crowdNoise: 20,
            temperature: 35
          },
          gridConfiguration: {
            zones: [
              { name: "Service Box", coordinates: { x: 11.88, y: 0, width: 6.4, height: 5.49 }, scoreMultiplier: 1.1, difficulty: "easy" },
              { name: "Baseline", coordinates: { x: 11.88, y: 0, width: 11.88, height: 1 }, scoreMultiplier: 1.0, difficulty: "medium" },
              { name: "Net Area", coordinates: { x: 11.88, y: 5.5, width: 11.88, height: 2 }, scoreMultiplier: 1.2, difficulty: "medium" }
            ]
          },
          difficulty: "beginner",
          isActive: true
        },
        // International Secondary Venues (Unlock at 90% score)
        {
          id: 14,
          sport: "tennis",
          venueName: "Wimbledon Centre Court",
          venueLocation: "London, England",
          venueType: "court",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 14979,
          dimensions: { length: 23.77, width: 10.97 },
          environmentEffects: {
            lighting: "natural",
            weather: "sunny",
            crowdNoise: 75,
            temperature: 22
          },
          gridConfiguration: {
            zones: [
              { name: "Service Box", coordinates: { x: 11.88, y: 0, width: 6.4, height: 5.49 }, scoreMultiplier: 1.3, difficulty: "medium" },
              { name: "Baseline", coordinates: { x: 11.88, y: 0, width: 11.88, height: 1 }, scoreMultiplier: 1.2, difficulty: "hard" },
              { name: "Net Area", coordinates: { x: 11.88, y: 5.5, width: 11.88, height: 2 }, scoreMultiplier: 1.4, difficulty: "hard" },
              { name: "Corner Shots", coordinates: { x: 1, y: 1, width: 3, height: 3 }, scoreMultiplier: 1.6, difficulty: "expert" }
            ]
          },
          difficulty: "professional",
          unlockRequirement: { minScore: 90 },
          thumbnailUrl: "/venues/wimbledon-court.jpg",
          isActive: true
        }
      ],
      archery: [
        // Indian Primary Venues (Always Available)
        {
          id: 15,
          sport: "archery",
          venueName: "Tata Archery Academy",
          venueLocation: "Jamshedpur, India",
          venueType: "range",
          surfaceType: "synthetic",
          isRealVenue: true,
          capacity: 2000,
          dimensions: { length: 70, width: 15 },
          environmentEffects: {
            lighting: "professional",
            weather: "clear",
            crowdNoise: 25,
            temperature: 28
          },
          gridConfiguration: {
            zones: [
              { name: "Gold Ring (9-10)", coordinates: { x: 35, y: 70, width: 0.122, height: 0.122 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Red Ring (7-8)", coordinates: { x: 35, y: 70, width: 0.244, height: 0.244 }, scoreMultiplier: 2.5, difficulty: "hard" },
              { name: "Blue Ring (5-6)", coordinates: { x: 35, y: 70, width: 0.366, height: 0.366 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Black Ring (3-4)", coordinates: { x: 35, y: 70, width: 0.488, height: 0.488 }, scoreMultiplier: 1.5, difficulty: "easy" },
              { name: "White Ring (1-2)", coordinates: { x: 35, y: 70, width: 0.61, height: 0.61 }, scoreMultiplier: 1.0, difficulty: "beginner" }
            ]
          },
          difficulty: "advanced",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/tata-archery.jpg",
          isActive: true
        },
        {
          id: 16,
          sport: "archery",
          venueName: "SAI Archery Range",
          venueLocation: "Bangalore, India",
          venueType: "range",
          surfaceType: "synthetic",
          isRealVenue: true,
          capacity: 1000,
          dimensions: { length: 70, width: 15 },
          environmentEffects: {
            lighting: "professional",
            weather: "moderate",
            crowdNoise: 15,
            temperature: 26
          },
          gridConfiguration: {
            zones: [
              { name: "Gold Ring (9-10)", coordinates: { x: 35, y: 70, width: 0.122, height: 0.122 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Red Ring (7-8)", coordinates: { x: 35, y: 70, width: 0.244, height: 0.244 }, scoreMultiplier: 2.5, difficulty: "hard" },
              { name: "Blue Ring (5-6)", coordinates: { x: 35, y: 70, width: 0.366, height: 0.366 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Black Ring (3-4)", coordinates: { x: 35, y: 70, width: 0.488, height: 0.488 }, scoreMultiplier: 1.5, difficulty: "easy" },
              { name: "White Ring (1-2)", coordinates: { x: 35, y: 70, width: 0.61, height: 0.61 }, scoreMultiplier: 1.0, difficulty: "beginner" }
            ]
          },
          difficulty: "intermediate",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/sai-archery.jpg",
          isActive: true
        },
        {
          id: 17,
          sport: "archery",
          venueName: "Training Range",
          venueLocation: "Imphal, India",
          venueType: "range",
          surfaceType: "grass",
          isRealVenue: false,
          capacity: 300,
          dimensions: { length: 50, width: 10 },
          environmentEffects: {
            lighting: "natural",
            weather: "clear",
            crowdNoise: 5,
            temperature: 24
          },
          gridConfiguration: {
            zones: [
              { name: "Outer Ring", coordinates: { x: 25, y: 50, width: 0.61, height: 0.61 }, scoreMultiplier: 1.0, difficulty: "beginner" },
              { name: "Middle Ring", coordinates: { x: 25, y: 50, width: 0.366, height: 0.366 }, scoreMultiplier: 1.5, difficulty: "easy" },
              { name: "Inner Ring", coordinates: { x: 25, y: 50, width: 0.244, height: 0.244 }, scoreMultiplier: 2.0, difficulty: "medium" }
            ]
          },
          difficulty: "beginner",
          isActive: true
        },
        // International Secondary Venues (Unlock at 90% score)
        {
          id: 18,
          sport: "archery",
          venueName: "Olympic Archery Venue",
          venueLocation: "Tokyo, Japan",
          venueType: "range",
          surfaceType: "synthetic",
          isRealVenue: true,
          capacity: 5000,
          dimensions: { length: 70, width: 15 },
          environmentEffects: {
            lighting: "professional",
            weather: "clear",
            crowdNoise: 20,
            temperature: 25
          },
          gridConfiguration: {
            zones: [
              { name: "Gold Ring (9-10)", coordinates: { x: 35, y: 70, width: 0.122, height: 0.122 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Red Ring (7-8)", coordinates: { x: 35, y: 70, width: 0.244, height: 0.244 }, scoreMultiplier: 2.5, difficulty: "hard" },
              { name: "Blue Ring (5-6)", coordinates: { x: 35, y: 70, width: 0.366, height: 0.366 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Black Ring (3-4)", coordinates: { x: 35, y: 70, width: 0.488, height: 0.488 }, scoreMultiplier: 1.5, difficulty: "easy" },
              { name: "White Ring (1-2)", coordinates: { x: 35, y: 70, width: 0.61, height: 0.61 }, scoreMultiplier: 1.0, difficulty: "beginner" }
            ]
          },
          difficulty: "professional",
          unlockRequirement: { minScore: 90 },
          thumbnailUrl: "/venues/olympic-archery.jpg",
          isActive: true
        }
      ],
      cricket: [
        // Indian Primary Venues (Always Available)
        {
          id: 19,
          sport: "cricket",
          venueName: "Eden Gardens",
          venueLocation: "Kolkata, India",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 66000,
          dimensions: { length: 137, width: 150 },
          environmentEffects: {
            lighting: "professional",
            weather: "humid",
            crowdNoise: 85,
            temperature: 30
          },
          gridConfiguration: {
            zones: [
              { name: "Stumps Target", coordinates: { x: 68.5, y: 0, width: 0.23, height: 0.71 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Good Length", coordinates: { x: 68.5, y: 4, width: 6, height: 2 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Boundary Zone", coordinates: { x: 0, y: 0, width: 137, height: 150 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Six Zone", coordinates: { x: 20, y: 20, width: 97, height: 110 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "professional",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/eden-gardens.jpg",
          isActive: true
        },
        {
          id: 20,
          sport: "cricket",
          venueName: "Wankhede Stadium",
          venueLocation: "Mumbai, India",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 33000,
          dimensions: { length: 137, width: 150 },
          environmentEffects: {
            lighting: "professional",
            weather: "clear",
            crowdNoise: 80,
            temperature: 28
          },
          gridConfiguration: {
            zones: [
              { name: "Stumps Target", coordinates: { x: 68.5, y: 0, width: 0.23, height: 0.71 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Good Length", coordinates: { x: 68.5, y: 4, width: 6, height: 2 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Boundary Zone", coordinates: { x: 0, y: 0, width: 137, height: 150 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Six Zone", coordinates: { x: 20, y: 20, width: 97, height: 110 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "advanced",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/wankhede-stadium.jpg",
          isActive: true
        },
        {
          id: 21,
          sport: "cricket",
          venueName: "M. Chinnaswamy Stadium",
          venueLocation: "Bangalore, India",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 40000,
          dimensions: { length: 137, width: 150 },
          environmentEffects: {
            lighting: "professional",
            weather: "pleasant",
            crowdNoise: 78,
            temperature: 25
          },
          gridConfiguration: {
            zones: [
              { name: "Stumps Target", coordinates: { x: 68.5, y: 0, width: 0.23, height: 0.71 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Good Length", coordinates: { x: 68.5, y: 4, width: 6, height: 2 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Boundary Zone", coordinates: { x: 0, y: 0, width: 137, height: 150 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Six Zone", coordinates: { x: 20, y: 20, width: 97, height: 110 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "intermediate",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/chinnaswamy-stadium.jpg",
          isActive: true
        },
        {
          id: 22,
          sport: "cricket",
          venueName: "Training Ground",
          venueLocation: "Chennai, India",
          venueType: "ground",
          surfaceType: "grass",
          isRealVenue: false,
          capacity: 1000,
          dimensions: { length: 120, width: 120 },
          environmentEffects: {
            lighting: "natural",
            weather: "hot",
            crowdNoise: 20,
            temperature: 35
          },
          gridConfiguration: {
            zones: [
              { name: "Stumps Practice", coordinates: { x: 60, y: 0, width: 0.23, height: 0.71 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Bowling Spot", coordinates: { x: 60, y: 4, width: 4, height: 2 }, scoreMultiplier: 1.2, difficulty: "easy" },
              { name: "Batting Area", coordinates: { x: 30, y: 30, width: 60, height: 60 }, scoreMultiplier: 1.5, difficulty: "medium" }
            ]
          },
          difficulty: "beginner",
          isActive: true
        },
        {
          id: 31,
          sport: "cricket",
          venueName: "Barabati Stadium",
          venueLocation: "Cuttack, Odisha",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 45000,
          dimensions: { length: 137, width: 150 },
          environmentEffects: {
            lighting: "professional",
            weather: "humid",
            crowdNoise: 83,
            temperature: 33
          },
          gridConfiguration: {
            zones: [
              { name: "Stumps Target", coordinates: { x: 68.5, y: 0, width: 0.23, height: 0.71 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Good Length", coordinates: { x: 68.5, y: 4, width: 6, height: 2 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Boundary Zone", coordinates: { x: 0, y: 0, width: 137, height: 150 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Six Zone", coordinates: { x: 20, y: 20, width: 97, height: 110 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "advanced",
          thumbnailUrl: "/venues/barabati-stadium.jpg",
          isActive: true
        },
        {
          id: 33,
          sport: "cricket",
          venueName: "East Coast Railway Stadium",
          venueLocation: "Bhubaneswar, Odisha",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 25000,
          dimensions: { length: 137, width: 150 },
          environmentEffects: {
            lighting: "professional",
            weather: "humid",
            crowdNoise: 70,
            temperature: 31
          },
          gridConfiguration: {
            zones: [
              { name: "Stumps Target", coordinates: { x: 68.5, y: 0, width: 0.23, height: 0.71 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Good Length", coordinates: { x: 68.5, y: 4, width: 6, height: 2 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Boundary Zone", coordinates: { x: 0, y: 0, width: 137, height: 150 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Six Zone", coordinates: { x: 20, y: 20, width: 97, height: 110 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "advanced",
          thumbnailUrl: "/venues/ecr-stadium.jpg",
          isActive: true
        },
        {
          id: 34,
          sport: "cricket",
          venueName: "Malkangiri Stadium",
          venueLocation: "Malkangiri, Odisha",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 8000,
          dimensions: { length: 137, width: 150 },
          environmentEffects: {
            lighting: "standard",
            weather: "tropical",
            crowdNoise: 50,
            temperature: 34
          },
          gridConfiguration: {
            zones: [
              { name: "Stumps Target", coordinates: { x: 68.5, y: 0, width: 0.23, height: 0.71 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Good Length", coordinates: { x: 68.5, y: 4, width: 6, height: 2 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Boundary Zone", coordinates: { x: 0, y: 0, width: 137, height: 150 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Six Zone", coordinates: { x: 20, y: 20, width: 97, height: 110 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "intermediate",
          thumbnailUrl: "/venues/malkangiri-stadium.jpg",
          isActive: true
        },
        // Other Indian Stadiums (Unlock at 75% score)
        {
          id: 23,
          sport: "cricket",
          venueName: "Lord's Cricket Ground",
          venueLocation: "London, England",
          venueType: "stadium",
          surfaceType: "grass",
          isRealVenue: true,
          capacity: 30000,
          dimensions: { length: 137, width: 150 },
          environmentEffects: {
            lighting: "natural",
            weather: "overcast",
            crowdNoise: 70,
            temperature: 18
          },
          gridConfiguration: {
            zones: [
              { name: "Stumps Target", coordinates: { x: 68.5, y: 0, width: 0.23, height: 0.71 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Good Length", coordinates: { x: 68.5, y: 4, width: 6, height: 2 }, scoreMultiplier: 1.5, difficulty: "hard" },
              { name: "Boundary Zone", coordinates: { x: 0, y: 0, width: 137, height: 150 }, scoreMultiplier: 2.0, difficulty: "medium" },
              { name: "Six Zone", coordinates: { x: 20, y: 20, width: 97, height: 110 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "professional",
          unlockRequirement: { minScore: 90 },
          thumbnailUrl: "/venues/lords-cricket.jpg",
          isActive: true
        }
      ],
      hockey: [
        // Indian Primary Venues (Always Available)
        {
          id: 27,
          sport: "hockey",
          venueName: "Kalinga Hockey Stadium",
          venueLocation: "Bhubaneswar, Odisha",
          venueType: "stadium",
          surfaceType: "synthetic",
          isRealVenue: true,
          capacity: 15000,
          dimensions: { length: 91.4, width: 55 },
          environmentEffects: {
            lighting: "professional",
            weather: "humid",
            crowdNoise: 80,
            temperature: 31
          },
          gridConfiguration: {
            zones: [
              { name: "Shooting Circle", coordinates: { x: 45.7, y: 0, width: 14.63, height: 14.63 }, scoreMultiplier: 2.0, difficulty: "hard" },
              { name: "25 Yard Line", coordinates: { x: 45.7, y: 22.9, width: 55, height: 2 }, scoreMultiplier: 1.3, difficulty: "medium" },
              { name: "Goal Area", coordinates: { x: 45.7, y: 0, width: 3.66, height: 2.14 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Penalty Spot", coordinates: { x: 45.7, y: 6.4, width: 0.5, height: 0.5 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "professional",
          thumbnailUrl: "/venues/kalinga-hockey.jpg",
          isActive: true
        },
        {
          id: 28,
          sport: "hockey",
          venueName: "Shivaji Stadium Hockey Field",
          venueLocation: "New Delhi, India",
          venueType: "stadium",
          surfaceType: "synthetic",
          isRealVenue: true,
          capacity: 17000,
          dimensions: { length: 91.4, width: 55 },
          environmentEffects: {
            lighting: "professional",
            weather: "clear",
            crowdNoise: 75,
            temperature: 28
          },
          gridConfiguration: {
            zones: [
              { name: "Shooting Circle", coordinates: { x: 45.7, y: 0, width: 14.63, height: 14.63 }, scoreMultiplier: 2.0, difficulty: "hard" },
              { name: "25 Yard Line", coordinates: { x: 45.7, y: 22.9, width: 55, height: 2 }, scoreMultiplier: 1.3, difficulty: "medium" },
              { name: "Goal Area", coordinates: { x: 45.7, y: 0, width: 3.66, height: 2.14 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Penalty Spot", coordinates: { x: 45.7, y: 6.4, width: 0.5, height: 0.5 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "advanced",
          unlockRequirement: { minScore: 75 },
          thumbnailUrl: "/venues/shivaji-hockey.jpg",
          isActive: true
        },
        {
          id: 29,
          sport: "hockey",
          venueName: "Training Ground",
          venueLocation: "Chandigarh, India",
          venueType: "field",
          surfaceType: "grass",
          isRealVenue: false,
          capacity: 500,
          dimensions: { length: 91.4, width: 55 },
          environmentEffects: {
            lighting: "natural",
            weather: "pleasant",
            crowdNoise: 15,
            temperature: 24
          },
          gridConfiguration: {
            zones: [
              { name: "Basic Shooting", coordinates: { x: 45.7, y: 0, width: 10, height: 10 }, scoreMultiplier: 1.5, difficulty: "easy" },
              { name: "Passing Zone", coordinates: { x: 45.7, y: 15, width: 55, height: 10 }, scoreMultiplier: 1.0, difficulty: "easy" },
              { name: "Dribbling Course", coordinates: { x: 20, y: 30, width: 51.4, height: 25 }, scoreMultiplier: 1.2, difficulty: "medium" }
            ]
          },
          difficulty: "beginner",
          isActive: true
        },
        {
          id: 35,
          sport: "hockey",
          venueName: "Biju Patnaik Hockey Stadium",
          venueLocation: "Rourkela, Odisha",
          venueType: "stadium",
          surfaceType: "synthetic",
          isRealVenue: true,
          capacity: 20000,
          dimensions: { length: 91.4, width: 55 },
          environmentEffects: {
            lighting: "professional",
            weather: "humid",
            crowdNoise: 85,
            temperature: 32
          },
          gridConfiguration: {
            zones: [
              { name: "Shooting Circle", coordinates: { x: 45.7, y: 0, width: 14.63, height: 14.63 }, scoreMultiplier: 2.0, difficulty: "hard" },
              { name: "25 Yard Line", coordinates: { x: 45.7, y: 22.9, width: 55, height: 2 }, scoreMultiplier: 1.3, difficulty: "medium" },
              { name: "Goal Area", coordinates: { x: 45.7, y: 0, width: 3.66, height: 2.14 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Penalty Spot", coordinates: { x: 45.7, y: 6.4, width: 0.5, height: 0.5 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "professional",
          thumbnailUrl: "/venues/biju-patnaik-hockey.jpg",
          isActive: true
        },
        {
          id: 36,
          sport: "hockey",
          venueName: "Birsa Munda International Hockey Stadium",
          venueLocation: "Rourkela, Odisha",
          venueType: "stadium",
          surfaceType: "synthetic",
          isRealVenue: true,
          capacity: 21000,
          dimensions: { length: 91.4, width: 55 },
          environmentEffects: {
            lighting: "professional",
            weather: "humid",
            crowdNoise: 88,
            temperature: 33
          },
          gridConfiguration: {
            zones: [
              { name: "Shooting Circle", coordinates: { x: 45.7, y: 0, width: 14.63, height: 14.63 }, scoreMultiplier: 2.0, difficulty: "hard" },
              { name: "25 Yard Line", coordinates: { x: 45.7, y: 22.9, width: 55, height: 2 }, scoreMultiplier: 1.3, difficulty: "medium" },
              { name: "Goal Area", coordinates: { x: 45.7, y: 0, width: 3.66, height: 2.14 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Penalty Spot", coordinates: { x: 45.7, y: 6.4, width: 0.5, height: 0.5 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "professional",
          thumbnailUrl: "/venues/birsa-munda-hockey.jpg",
          isActive: true
        },
        // Other Indian Stadiums (Unlock at 75% score)
        {
          id: 40,
          sport: "hockey",
          venueName: "Shivaji Stadium Hockey Field",
          venueLocation: "London, England",
          venueType: "stadium",
          surfaceType: "synthetic",
          isRealVenue: true,
          capacity: 15000,
          dimensions: { length: 91.4, width: 55 },
          environmentEffects: {
            lighting: "professional",
            weather: "cool",
            crowdNoise: 70,
            temperature: 16
          },
          gridConfiguration: {
            zones: [
              { name: "Shooting Circle", coordinates: { x: 45.7, y: 0, width: 14.63, height: 14.63 }, scoreMultiplier: 2.0, difficulty: "hard" },
              { name: "25 Yard Line", coordinates: { x: 45.7, y: 22.9, width: 55, height: 2 }, scoreMultiplier: 1.3, difficulty: "medium" },
              { name: "Goal Area", coordinates: { x: 45.7, y: 0, width: 3.66, height: 2.14 }, scoreMultiplier: 3.0, difficulty: "expert" },
              { name: "Penalty Spot", coordinates: { x: 45.7, y: 6.4, width: 0.5, height: 0.5 }, scoreMultiplier: 2.5, difficulty: "hard" }
            ]
          },
          difficulty: "professional",
          unlockRequirement: { minScore: 90 },
          thumbnailUrl: "/venues/lee-valley-hockey.jpg",
          isActive: true
        }
      ]
    };

    return venueConfigs[sportName] || [];
  };

  useEffect(() => {
    const loadVenuesAndPreferences = async () => {
      setLoading(true);
      try {
        // For now, use the real venue configurations
        // In production, this would fetch from /api/venues/sport/:sport
        const sportVenues = getVenuesForSport(sport);
        setVenues(sportVenues);

        // Load user preferences if authenticated
        if (user) {
          try {
            const response = await fetch(`/api/user-venues?sport=${sport}`, {
              credentials: 'include'
            });
            if (response.ok) {
              const preferences = await response.json();
              setUserPreferences(preferences);
            }
          } catch (error) {
            console.error('Failed to load user venue preferences:', error);
            // Continue without preferences for unauthenticated users
          }
        }
      } catch (error) {
        console.error('Error loading venues:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVenuesAndPreferences();
  }, [sport, user]);

  const getUserPreference = (venueId: number): UserVenuePreference | undefined => {
    return userPreferences.find(pref => pref.venueId === venueId);
  };

  const isVenueUnlocked = (venue: VirtualVenue): boolean => {
    // Basic training venues are always unlocked
    if (venue.difficulty === "beginner") return true;
    
    // Odisha venues are primary and always available
    if (venue.venueLocation?.includes("Odisha")) return true;
    
    // Other venues need to be unlocked based on user preferences
    const preference = getUserPreference(venue.id);
    return preference?.isUnlocked || false;
  };

  const unlockVenue = async (venueId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/user-venues/unlock/${venueId}`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const newPreference = await response.json();
        setUserPreferences(prev => {
          const updated = prev.filter(p => p.venueId !== venueId);
          return [...updated, newPreference];
        });
      }
    } catch (error) {
      console.error('Failed to unlock venue:', error);
    }
  };

  const filteredVenues = venues.filter(venue => 
    difficultyFilter === "all" || venue.difficulty === difficultyFilter
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-blue-100 text-blue-800";
      case "advanced": return "bg-orange-100 text-orange-800";
      case "professional": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getVenueTypeIcon = (venueType: string) => {
    switch (venueType) {
      case "arena": case "stadium": return "🏟️";
      case "court": return "🎾";
      case "field": return "⚽";
      case "range": return "🏹";
      case "indoor": return "🏢";
      default: return "🏛️";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Virtual Training Venues</h3>
          <p className="text-sm text-gray-600">
            Train in realistic environments from around the world
          </p>
        </div>
        
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVenues.map((venue) => {
          const userPref = getUserPreference(venue.id);
          const isUnlocked = isVenueUnlocked(venue);
          const isSelected = selectedVenueId === venue.id;

          return (
            <Card 
              key={venue.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500' : ''
              } ${!isUnlocked ? 'opacity-60' : ''}`}
              onClick={() => isUnlocked && onVenueSelect(venue)}
            >
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className="text-xl md:text-2xl flex-shrink-0">{getVenueTypeIcon(venue.venueType)}</span>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-sm md:text-base leading-tight break-words">{venue.venueName}</CardTitle>
                      {venue.venueLocation && (
                        <div className="flex items-center text-xs md:text-sm text-gray-500 mt-1">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="break-words">{venue.venueLocation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {!isUnlocked && <Lock className="w-4 h-4 text-gray-400" />}
                  {isSelected && <CheckCircle className="w-4 h-4 text-blue-500" />}
                </div>
              </CardHeader>

              <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6 pt-0">
                <div className="flex flex-wrap gap-1 md:gap-2">
                  <Badge className={`text-xs ${getDifficultyColor(venue.difficulty)}`}>
                    {venue.difficulty}
                  </Badge>
                  {venue.isRealVenue && (
                    <Badge variant="outline" className="text-xs">
                      <Trophy className="w-3 h-3 mr-1" />
                      Real Venue
                    </Badge>
                  )}
                </div>

                <div className="text-xs md:text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex-shrink-0">Surface:</span>
                    <span className="capitalize truncate text-right">{venue.surfaceType}</span>
                  </div>
                  {venue.capacity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 flex-shrink-0">Capacity:</span>
                      <span className="flex items-center truncate">
                        <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{venue.capacity.toLocaleString()}</span>
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex-shrink-0">Zones:</span>
                    <span className="truncate text-right">{venue.gridConfiguration.zones.length} areas</span>
                  </div>
                </div>

                {userPref && (
                  <div className="text-xs bg-gray-50 p-2 rounded space-y-1">
                    <div className="flex justify-between">
                      <span>Times Used:</span>
                      <span>{userPref.timesUsed}</span>
                    </div>
                    {userPref.bestScore && (
                      <div className="flex justify-between">
                        <span>Best Score:</span>
                        <span className="font-medium">{userPref.bestScore}%</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Total Time:</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {Math.round(userPref.totalTimeSpent / 60)}m
                      </span>
                    </div>
                  </div>
                )}

                {!isUnlocked && venue.unlockRequirement && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                    {venue.unlockRequirement.minScore ? 
                      `Requires ${venue.unlockRequirement.minScore}% score to unlock` :
                      `Requires ${venue.unlockRequirement.achievement} achievement`
                    }
                  </div>
                )}

                {!isUnlocked && user && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      unlockVenue(venue.id);
                    }}
                  >
                    <Lock className="w-3 h-3 mr-2" />
                    Unlock Venue
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVenues.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No venues available for the selected difficulty level.
        </div>
      )}
    </div>
  );
}