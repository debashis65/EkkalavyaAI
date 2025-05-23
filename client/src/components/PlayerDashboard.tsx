import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Upload, Video, Trophy, MessageSquare, User } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

interface PlayerDashboardProps {
  user: User;
  setUser: (user: User | null) => void;
}

export default function PlayerDashboard({ user, setUser }: PlayerDashboardProps) {
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("ekalavya_user");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Green Header */}
      <div className="bg-green-600 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">E</span>
            </div>
            <h1 className="text-xl font-bold">Ekalavya</h1>
          </div>
          <div className="flex items-center gap-4">
            <MessageSquare className="w-6 h-6" />
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-green-700"
            >
              Logout
            </Button>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg mb-1">Welcome back, {user.name}</h2>
          <p className="text-green-100 text-sm">Continue your learning journey today</p>
        </div>
      </div>

      <div className="p-6">
        {/* Action Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-800">Find Mentor</h3>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-medium text-gray-800">Upload Practice</h3>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-800">Live Sessions</h3>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
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