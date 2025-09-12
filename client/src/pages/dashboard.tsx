import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, Video, Trophy, Users, Clock, Target, TrendingUp, Star } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userData = localStorage.getItem("ekalavya_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  const isCoach = user.role === 'coach';

  return (
    <>
      <Helmet>
        <title>Dashboard - Ekalavya Sports Training</title>
        <meta name="description" content="Track your sports training progress and coaching sessions" />
      </Helmet>

      {isCoach ? <CoachDashboard /> : <PlayerDashboard />}
    </>
  );
}

function PlayerDashboard() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userData = localStorage.getItem("ekalavya_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <>
      {/* Player Header - Mobile First Design */}
      <div className="bg-primary px-3 sm:px-4 md:px-6 py-4 sm:py-5 md:py-6 text-primary-foreground">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-1">Welcome back, {user?.name}</h1>
        <p className="text-primary-foreground/80 text-sm sm:text-base">Continue your learning journey today</p>
      </div>

      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
        {/* Quick Action Cards - Mobile First Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
              <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="font-medium text-xs sm:text-sm md:text-base">Find Mentor</span>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
              <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Upload className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="font-medium text-xs sm:text-sm md:text-base">Upload Practice</span>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
              <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Video className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="font-medium text-xs sm:text-sm md:text-base">Live Sessions</span>
            </div>
          </Card>

          <Card className="p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex flex-col items-center text-center space-y-1.5 sm:space-y-2">
              <div className="p-2 sm:p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="font-medium text-xs sm:text-sm md:text-base">Achievements</span>
            </div>
          </Card>
        </div>

        {/* Upcoming Sessions - Mobile First */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Upcoming Sessions</CardTitle>
            <Button variant="link" className="text-primary text-sm sm:text-base p-0 sm:p-2">View All</Button>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="border-l-4 border-green-500 pl-3 sm:pl-4 py-2 sm:py-3 bg-green-50 dark:bg-green-950 rounded-r">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">Archery Fundamentals</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Guru Drona • 4:00 PM</p>
                </div>
                <Badge className="self-start text-xs">Today</Badge>
              </div>
            </div>
            
            <div className="border-l-4 border-blue-500 pl-3 sm:pl-4 py-2 sm:py-3 bg-blue-50 dark:bg-blue-950 rounded-r">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm sm:text-base">Meditation Techniques</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground">Guru Vashistha • 6:00 PM</p>
                </div>
                <Badge variant="outline" className="self-start text-xs">Tomorrow</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats Grid - Mobile First */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-red-100 dark:bg-red-900 rounded">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Coach</p>
                <p className="font-semibold text-sm sm:text-base truncate">Guru Drona</p>
                <p className="text-xs text-muted-foreground">Since 2020</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-orange-100 dark:bg-orange-900 rounded">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Practice Hours</p>
                <p className="font-semibold text-sm sm:text-base">875 hours</p>
                <p className="text-xs text-muted-foreground">20 hrs/week</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-blue-100 dark:bg-blue-900 rounded">
                <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Current Level</p>
                <p className="font-semibold text-sm sm:text-base">Advanced</p>
                <p className="text-xs text-muted-foreground">Senior Division</p>
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900 rounded">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">XP Points</p>
                <p className="font-semibold text-sm sm:text-base">4,280 XP</p>
                <p className="text-xs text-muted-foreground">Level 8</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Tournament Results - Mobile First */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="text-lg sm:text-xl">Recent Tournament Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">National Championship</p>
                <p className="text-xs sm:text-sm text-muted-foreground">March 25, 2024</p>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
                <Badge className="bg-yellow-500 text-white text-xs">1st</Badge>
                <p className="text-xs sm:text-sm font-medium">8.9</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">Regional Finals</p>
                <p className="text-xs sm:text-sm text-muted-foreground">February 18, 2024</p>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
                <Badge className="bg-orange-500 text-white text-xs">3rd</Badge>
                <p className="text-xs sm:text-sm font-medium">8.5</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">State Tournament</p>
                <p className="text-xs sm:text-sm text-muted-foreground">January 12, 2024</p>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
                <Badge className="bg-green-500 text-white text-xs">2nd</Badge>
                <p className="text-xs sm:text-sm font-medium">8.7</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm sm:text-base">District Cup</p>
                <p className="text-xs sm:text-sm text-muted-foreground">December 5, 2023</p>
              </div>
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-1">
                <Badge className="bg-green-500 text-white text-xs">1st</Badge>
                <p className="text-xs sm:text-sm font-medium">9.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function CoachDashboard() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userData = localStorage.getItem("ekalavya_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <>
      {/* Coach Header */}
      <div className="bg-primary px-6 py-6 text-primary-foreground">
        <h1 className="text-2xl font-semibold mb-1">Coach Dashboard</h1>
        <p className="text-primary-foreground/80">Manage your students and track their progress</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Monthly Earnings & Active Students - Top row from design */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">₹48,500</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% from last month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold">48</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <Users className="h-4 w-4 mr-1" />
                    +4 new this week
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teaching Plans - Matching design */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Teaching Plans</CardTitle>
            <Button variant="link" className="text-primary">Edit Plans</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Basic Archery</h4>
                <p className="text-sm text-muted-foreground">4 lessons per month • Video reviews • Chat support</p>
                <p className="text-sm text-green-600 mt-1">35 students enrolled</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹4,500/mo</p>
                <Badge className="mt-1">Most Popular</Badge>
              </div>
            </div>

            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Advanced Mastery</h4>
                <p className="text-sm text-muted-foreground">8 lessons per month • One-on-one coaching • 24/7 support</p>
                <p className="text-sm text-green-600 mt-1">13 students enrolled</p>
              </div>
              <div className="text-right">
                <p className="font-bold">₹8,900/mo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights - Bottom row from design */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <p className="text-sm text-muted-foreground">Last 30 days</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Rating</p>
                    <p className="text-2xl font-bold flex items-center">
                      <Star className="h-5 w-5 text-yellow-500 mr-1" />
                      4.9
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Response</p>
                    <p className="text-2xl font-bold">98%</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completion</p>
                    <p className="text-2xl font-bold">95%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-950 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Student Satisfaction</p>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <p className="text-sm font-medium mt-1">92%</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}