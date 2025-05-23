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
      {/* Header - Secondary color #046A38 */}
      <div className="bg-secondary text-white p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">E</span>
            </div>
            <h1 className="text-2xl font-bold">Ekalavya</h1>
          </div>
          <div className="flex items-center gap-6">
            <MessageSquare className="w-7 h-7" />
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl mb-2">Welcome back, {displayName}</h2>
          <p className="text-white/80 text-lg">Track your performance and achievements</p>
        </div>
      </div>

      <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Recent Tournament Results */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-700">Recent Tournament Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 pb-2 border-b">
                <span>Tournament</span>
                <span className="text-center">Position</span>
                <span className="text-right">Score</span>
              </div>
              {tournaments.map((tournament, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 py-3 text-sm">
                  <span className="text-gray-700">{tournament.name}</span>
                  <span className={`text-center font-semibold ${tournament.color}`}>
                    {tournament.position}
                  </span>
                  <span className="text-right font-semibold text-gray-900">{tournament.score}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          
          {/* Coach */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coach</p>
                  <p className="text-lg font-semibold text-gray-900">Guru Drona</p>
                  <p className="text-xs text-gray-500">Since 2020</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Practice Hours */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Practice Hours</p>
                  <p className="text-lg font-semibold text-gray-900">875 hours</p>
                  <p className="text-xs text-gray-500">20 hrs/week</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Level */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Level</p>
                  <p className="text-lg font-semibold text-gray-900">Advanced</p>
                  <p className="text-xs text-gray-500">Senior Division</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* XP Points */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">XP Points</p>
                  <p className="text-lg font-semibold text-gray-900">4,280 XP</p>
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