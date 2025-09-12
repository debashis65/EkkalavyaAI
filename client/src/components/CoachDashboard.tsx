import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Star, Trophy, Calendar, PlayCircle, Award, TrendingUp } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

interface CoachDashboardProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function CoachDashboard({ user }: CoachDashboardProps) {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Orange Header - Mobile First */}
      <div className="bg-orange-500 text-white p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          <h1 className="text-lg sm:text-xl font-semibold">Coach Dashboard</h1>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <Search className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {/* Coach Profile Section - Mobile First */}
      <div className="bg-white py-6 sm:py-8 text-center px-4">
        <div className="relative inline-block mb-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-600 mx-auto">
            GD
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
        
        <div className="flex justify-center items-center gap-1 mb-2">
          {[1,2,3,4,5].map((star) => (
            <Star key={star} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs sm:text-sm text-gray-600 ml-2">4.9 (120)</span>
        </div>

        <p className="text-orange-600 font-medium mb-4 text-sm sm:text-base">Archery Coach • Elite Level</p>

        {/* Mobile: Stack vertically, Desktop: Horizontal */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-600 mb-6">
          <div className="flex items-center justify-center gap-1">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>15+ Years Experience</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>42 Athletes Coached</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
              International Certified
            </Badge>
          </div>
        </div>

        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base">
          Book Session
        </Button>
      </div>

      {/* Dashboard Tabs - Mobile First */}
      <div className="border-b bg-white">
        <div className="flex gap-4 sm:gap-8 px-3 sm:px-6 overflow-x-auto">
          <button className="py-2 sm:py-3 border-b-2 border-blue-500 text-blue-600 font-medium text-sm sm:text-base whitespace-nowrap">
            Overview
          </button>
          <button className="py-2 sm:py-3 text-gray-600 hover:text-gray-800 text-sm sm:text-base whitespace-nowrap">
            Schedule
          </button>
          <button className="py-2 sm:py-3 text-gray-600 hover:text-gray-800 text-sm sm:text-base whitespace-nowrap">
            Athletes
          </button>
          <button className="py-2 sm:py-3 text-gray-600 hover:text-gray-800 text-sm sm:text-base whitespace-nowrap">
            Reviews
          </button>
        </div>
      </div>

      {/* Stats Cards - Mobile First */}
      <div className="p-3 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {/* This Week Earnings */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-sm sm:text-base">₹</span>
                </div>
                <div className="flex items-center text-green-600 text-xs sm:text-sm">
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  +12%
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">This Week</div>
              <div className="text-lg sm:text-2xl font-bold">₹24,500</div>
              <div className="text-xs text-gray-500">Top 5% this month</div>
            </CardContent>
          </Card>

          {/* Video Reviews */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                </div>
                <div className="flex items-center text-green-600 text-xs sm:text-sm">
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  +8%
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Video Reviews</div>
              <div className="text-lg sm:text-2xl font-bold">18</div>
              <div className="text-xs text-gray-500">76 this month</div>
            </CardContent>
          </Card>

          {/* Sessions */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                </div>
                <div className="text-xs sm:text-sm text-gray-600">75% Booked</div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Sessions</div>
              <div className="text-lg sm:text-2xl font-bold">12</div>
              <div className="text-xs text-gray-500">Remaining this week</div>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Award className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <div className="flex items-center text-green-600 text-xs sm:text-sm">
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  +3
                </div>
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Certifications</div>
              <div className="text-lg sm:text-2xl font-bold">8</div>
              <div className="text-xs text-gray-500">All verified</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}