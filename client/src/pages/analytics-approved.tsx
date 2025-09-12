import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, Trophy, Zap, MessageSquare } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

interface AnalyticsProps {
  user?: User;
}

export default function AnalyticsApproved({ user }: AnalyticsProps) {
  const tournaments = [
    { name: "National Championship", position: "1st", score: 8.9, color: "text-green-600" },
    { name: "Regional Finals", position: "3rd", score: 8.5, color: "text-orange-600" },
    { name: "State Tournament", position: "2nd", score: 8.7, color: "text-blue-600" },
    { name: "District Cup", position: "1st", score: 9.0, color: "text-green-600" },
    { name: "Club Championship", position: "1st", score: 9.2, color: "text-green-600" }
  ];

  const displayName = user?.name || "Arjuna";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-secondary text-white p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm sm:text-lg">E</span>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Ekalavya</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">Welcome back, {displayName}</h2>
          <p className="text-white/80 text-sm sm:text-base md:text-lg">Track your performance and achievements</p>
        </div>
      </div>

      {/* Mobile-First Content Container */}
      <div className="p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Recent Tournament Results - Mobile First */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-700">Recent Tournament Results</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-1">
              <div className="hidden sm:grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                <span>Tournament</span>
                <span className="text-center">Position</span>
                <span className="text-right">Score</span>
              </div>
              {tournaments.map((tournament, index) => (
                <div key={index} className="sm:grid sm:grid-cols-3 sm:gap-4 py-3 text-sm border-b last:border-b-0 sm:border-b-0">
                  {/* Mobile Stack Layout */}
                  <div className="sm:hidden space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">{tournament.name}</span>
                      <Badge className={`${tournament.color} bg-transparent border px-2 py-1`}>
                        {tournament.position}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{tournament.score}</span>
                    </div>
                  </div>
                  {/* Desktop Grid Layout */}
                  <span className="hidden sm:block text-gray-700">{tournament.name}</span>
                  <span className={`hidden sm:block text-center font-semibold ${tournament.color}`}>
                    {tournament.position}
                  </span>
                  <span className="hidden sm:block text-right font-semibold text-gray-900">{tournament.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile-First Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          
          {/* Coach Card - Mobile First */}
          <Card>
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Coach</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate">Guru Drona</p>
                  <p className="text-xs text-gray-500">Since 2020</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Hours Card - Mobile First */}
          <Card>
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Practice Hours</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">875 hours</p>
                  <p className="text-xs text-gray-500">20 hrs/week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Level Card - Mobile First */}
          <Card>
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">Current Level</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Advanced</p>
                  <p className="text-xs text-gray-500">Senior Division</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XP Points Card - Mobile First */}
          <Card>
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">XP Points</p>
                  <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">4,280 XP</p>
                  <p className="text-xs text-gray-500">Level 8</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
      </div>
    </div>
  );
}