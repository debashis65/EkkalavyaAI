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
      {/* Header - Mobile-first responsive */}
      <div className="bg-secondary text-white p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-sm sm:text-lg">E</span>
            </div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold">Ekalavya</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl mb-1 sm:mb-2">Welcome back, {user.name}</h2>
          <p className="text-white/80 text-sm sm:text-base lg:text-lg">Continue your learning journey today</p>
        </div>
      </div>

      {/* AR Tool Banner - Mobile-first responsive */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="bg-accent text-white p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl shadow-lg max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 lg:justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <div className="bg-white/20 p-3 sm:p-4 rounded-full">
                <Camera className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2">AI Performance Analysis</h2>
                <p className="text-white/90 text-sm sm:text-base lg:text-lg">Upload your training videos and get instant AI-powered technique feedback</p>
              </div>
            </div>
            <Button 
              onClick={() => setActiveTab('ar-tools')}
              className="w-full sm:w-auto text-white hover:opacity-90 font-semibold px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg rounded-lg sm:rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
              style={{ backgroundColor: '#0CCA4A' }}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3" />
              Start AI Analysis
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2 sm:ml-3" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Action Cards - Mobile-first responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('coaches')}>
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
              <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">Find Mentor</h3>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('ar-tools')}>
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Upload className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600" />
              </div>
              <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">Upload Practice</h3>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('training')}>
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
              <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">Live Sessions</h3>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('analytics')}>
            <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
              <h3 className="text-xs sm:text-sm lg:text-base font-medium text-gray-800">Achievements</h3>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Sessions - Mobile responsive */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Upcoming Sessions</h3>
            <Button variant="ghost" size="sm" className="text-green-600 w-fit">
              View All
            </Button>
          </div>

          <div className="space-y-3">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">Archery Fundamentals</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Guru Drona • 4:00 PM</p>
                  </div>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded w-fit">
                    Today
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1 text-sm sm:text-base">Meditation Techniques</h4>
                    <p className="text-xs sm:text-sm text-gray-600">Guru Vashistha • 6:00 PM</p>
                  </div>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded w-fit">
                    Tomorrow
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity - Mobile responsive */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Recent Activity</h3>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Video className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1 gap-1">
                  <h4 className="font-medium text-gray-800 text-sm sm:text-base">Guru Drona reviewed your practice video</h4>
                  <span className="text-xs text-gray-500 self-start">2 hours ago</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 p-2 sm:p-3 rounded">
                  "Good progress on your stance. Let's focus on your bow grip in our next session."
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ready to Level Up Section - Mobile responsive */}
        <div className="mt-6 sm:mt-8 text-center bg-primary text-primary-foreground p-4 sm:p-6 lg:p-8 rounded-lg">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">Ready to Level Up?</h2>
          <p className="text-primary-foreground/80 mb-3 sm:mb-4 text-sm sm:text-base">Personalized training sessions to elevate your skills</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">Book Now</Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto">Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  );
}