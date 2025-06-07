import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Clock, Trophy, Activity, Zap } from "lucide-react";

export default function AnalyticsImproved() {
  const [activeTab, setActiveTab] = useState("overview");

  // Training Focus Hours Data
  const trainingHoursData = [
    { activity: "Shooting", hours: 12, color: "#3B82F6" },
    { activity: "Defense", hours: 8, color: "#10B981" },
    { activity: "Dribbling", hours: 6, color: "#F59E0B" },
    { activity: "Conditioning", hours: 4, color: "#8B5CF6" },
    { activity: "Strategy", hours: 3, color: "#EF4444" }
  ];

  // Progress Data (different for each tab)
  const overviewProgressData = [
    { month: "Jan", shooting: 65, defense: 70, overall: 68 },
    { month: "Feb", shooting: 68, defense: 72, overall: 70 },
    { month: "Mar", shooting: 72, defense: 75, overall: 74 },
    { month: "Apr", shooting: 76, defense: 78, overall: 77 },
    { month: "May", shooting: 80, defense: 82, overall: 81 },
    { month: "Jun", shooting: 85, defense: 85, overall: 85 }
  ];

  const progressTabData = [
    { skill: "Shooting Accuracy", current: 85, previous: 78, improvement: 7 },
    { skill: "Defensive Position", current: 82, previous: 75, improvement: 7 },
    { skill: "Ball Handling", current: 79, previous: 71, improvement: 8 },
    { skill: "Court Vision", current: 76, previous: 68, improvement: 8 },
    { skill: "Stamina", current: 88, previous: 82, improvement: 6 }
  ];

  const sessionsData = [
    { date: "2024-01-15", type: "Individual Training", duration: 90, focus: "Shooting", rating: 4.5 },
    { date: "2024-01-12", type: "Team Practice", duration: 120, focus: "Defense", rating: 4.2 },
    { date: "2024-01-10", type: "Video Analysis", duration: 60, focus: "Strategy", rating: 4.8 },
    { date: "2024-01-08", type: "Conditioning", duration: 75, focus: "Fitness", rating: 4.0 },
    { date: "2024-01-05", type: "Individual Training", duration: 90, focus: "Dribbling", rating: 4.6 }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600 mt-2">Track your progress and training insights</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Target className="h-8 w-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Shooting Accuracy</p>
                        <p className="text-2xl font-bold text-gray-900">85%</p>
                        <p className="text-xs text-green-600">+7% from last month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Activity className="h-8 w-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Training Hours</p>
                        <p className="text-2xl font-bold text-gray-900">33h</p>
                        <p className="text-xs text-green-600">This month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Trophy className="h-8 w-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Goals Achieved</p>
                        <p className="text-2xl font-bold text-gray-900">8/10</p>
                        <p className="text-xs text-green-600">This month</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Zap className="h-8 w-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Overall Rating</p>
                        <p className="text-2xl font-bold text-gray-900">4.6</p>
                        <p className="text-xs text-green-600">Coach feedback</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={overviewProgressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="shooting" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="defense" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="overall" stroke="#F59E0B" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Training Focus Hours - Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Training Focus (Hours)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trainingHoursData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="activity" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="hours" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skill Improvement Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {progressTabData.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{skill.skill}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${skill.current}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{skill.current}%</span>
                          </div>
                        </div>
                        <div className="ml-6 text-right">
                          <div className="text-green-600 font-semibold">+{skill.improvement}%</div>
                          <div className="text-xs text-gray-500">vs last month</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Progress Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={progressTabData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="skill" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="previous" fill="#E5E7EB" name="Previous Month" />
                      <Bar dataKey="current" fill="#3B82F6" name="Current Month" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sessions Tab */}
          <TabsContent value="sessions">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Training Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessionsData.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{session.type}</h3>
                            <p className="text-sm text-gray-600">Focus: {session.focus}</p>
                            <p className="text-xs text-gray-500">{session.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{session.duration} min</div>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="text-sm">{session.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Types Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Individual Training", value: 40, fill: "#3B82F6" },
                            { name: "Team Practice", value: 30, fill: "#10B981" },
                            { name: "Video Analysis", value: 20, fill: "#F59E0B" },
                            { name: "Conditioning", value: 10, fill: "#8B5CF6" }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label
                        />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Session Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={sessionsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="focus" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="rating" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}