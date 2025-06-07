import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth-context";
import { Search, Upload, Video, Trophy, Users, Clock, Target, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  const isCoach = user.role === 'coach';

  return (
    <>
      <Helmet>
        <title>Dashboard - Ekalavya Sports Training</title>
        <meta name="description" content="Track your sports training progress and upcoming sessions" />
      </Helmet>

      {/* Header - Matching the green header from design */}
      <div className="bg-primary px-6 py-6 text-primary-foreground">
        <h1 className="text-2xl font-semibold mb-1">Welcome back, {user.name}</h1>
        <p className="text-primary-foreground/80">Continue your learning journey today</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Action Cards - Exactly like in design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium">Find Mentor</span>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium">Upload Practice</span>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium">Live Sessions</span>
            </div>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="font-medium">Achievements</span>
            </div>
          </Card>
        </div>

        {/* Upcoming Sessions - Matching design layout */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming Sessions</CardTitle>
            <Button variant="link" className="text-primary">View All</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50 dark:bg-green-950 rounded-r">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Archery Fundamentals</h4>
                  <p className="text-sm text-muted-foreground">Guru Drona • 4:00 PM</p>
                </div>
                <Badge>Today</Badge>
              </div>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 dark:bg-blue-950 rounded-r">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">Meditation Techniques</h4>
                  <p className="text-sm text-muted-foreground">Guru Vashistha • 6:00 PM</p>
                </div>
                <Badge variant="outline">Tomorrow</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                  <Video className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Guru Drona</span> reviewed your practice video
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                  <p className="text-sm text-green-600 mt-1 italic">
                    "Good progress on your stance. Let's focus on your bow grip in our next session."
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats Grid - Matching the 4-card layout from design */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded">
                <Users className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coach</p>
                <p className="font-semibold">Guru Drona</p>
                <p className="text-xs text-muted-foreground">Since 2020</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded">
                <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Practice Hours</p>
                <p className="font-semibold">875 hours</p>
                <p className="text-xs text-muted-foreground">20 hrs/week</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Level</p>
                <p className="font-semibold">Advanced</p>
                <p className="text-xs text-muted-foreground">Senior Division</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded">
                <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">XP Points</p>
                <p className="font-semibold">4,280 XP</p>
                <p className="text-xs text-muted-foreground">Level 8</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Tournament Results - Exactly matching the design */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tournament Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg">
                <div>
                  <p className="font-medium">National Championship</p>
                  <p className="text-sm text-muted-foreground">Regional Finals</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-yellow-500 text-white">1st</Badge>
                  <p className="text-sm font-medium mt-1">8.9</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
                <div>
                  <p className="font-medium">Regional Finals</p>
                  <p className="text-sm text-muted-foreground">State Tournament</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-orange-500 text-white">3rd</Badge>
                  <p className="text-sm font-medium mt-1">8.5</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                <div>
                  <p className="font-medium">State Tournament</p>
                  <p className="text-sm text-muted-foreground">District Cup</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-500 text-white">2nd</Badge>
                  <p className="text-sm font-medium mt-1">8.7</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                <div>
                  <p className="font-medium">District Cup</p>
                  <p className="text-sm text-muted-foreground">Club Championship</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-500 text-white">1st</Badge>
                  <p className="text-sm font-medium mt-1">9.0</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
                <div>
                  <p className="font-medium">Club Championship</p>
                  <p className="text-sm text-muted-foreground">Annual Meet</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-500 text-white">1st</Badge>
                  <p className="text-sm font-medium mt-1">9.2</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}