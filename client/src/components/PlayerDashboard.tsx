import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Upload, Video, Trophy, MessageSquare, User, Camera, Zap, ArrowRight } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

interface PlayerDashboardProps {
  user: User;
  setUser: (user: User | null) => void;
  setActiveTab: (tab: string) => void;
}

export default function PlayerDashboard({ user, setActiveTab }: PlayerDashboardProps) {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with new color palette */}
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
          <h2 className="text-2xl mb-2">Welcome back, {user.name}</h2>
          <p className="text-white/80 text-lg">Continue your learning journey today</p>
        </div>
      </div>

      {/* AR Tool Banner - Prominent CTA with new colors */}
      <div className="bg-gradient-to-r from-primary via-accent to-secondary text-white p-8 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="bg-white/20 p-4 rounded-full">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">AI Performance Analysis</h2>
                <p className="text-white/90 text-lg">Upload your training videos and get instant AI-powered technique feedback</p>
              </div>
            </div>
            <Button 
              onClick={() => setActiveTab('ar-tools')}
              className="bg-white text-primary hover:bg-gray-50 font-semibold px-8 py-4 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Zap className="w-6 h-6 mr-3" />
              Start AI Analysis
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('coaches')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-800">Find Mentor</h3>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('ar-tools')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-800">Upload Practice</h3>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('training')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-800">Live Sessions</h3>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('analytics')}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-800">Achievements</h3>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Upcoming Sessions</h3>
            <Button variant="ghost" size="sm" className="text-green-600">
              View All
            </Button>
          </div>

          <div className="space-y-3">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Archery Fundamentals</h4>
                    <p className="text-sm text-gray-600 mb-2">Guru Drona • 4:00 PM</p>
                  </div>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                    Today
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Meditation Techniques</h4>
                    <p className="text-sm text-gray-600 mb-2">Guru Vashistha • 6:00 PM</p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                    Tomorrow
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Video className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-800">Guru Drona reviewed your practice video</h4>
                  <span className="text-xs text-gray-500">2 hours ago</span>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                  "Good progress on your stance. Let's focus on your bow grip in our next session."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}