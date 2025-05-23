import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Star, TrendingUp, Target, Clock, Award } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

interface ProfileProps {
  user?: User;
}

export default function Profile({ user }: ProfileProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Use logged-in user's details or fallback
  const displayName = user?.name || "Arjuna";
  const userInitials = displayName.split(' ').map(n => n[0]).join('');

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header with Profile Info */}
        <div className="bg-orange-500 rounded-t-lg p-6 text-white relative">
          <div className="absolute top-4 right-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-orange-400"
              onClick={() => setShowEditModal(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 bg-white text-orange-500 text-xl font-bold">
              <AvatarFallback>RK</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Rahul Kumar</h1>
              <p className="text-orange-100">17 yrs • Forward • Swimming</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1">Top 5% in Tier 2</span>
                </div>
                <Badge variant="secondary" className="bg-orange-400 text-white">Elite</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="performance" className="bg-white rounded-b-lg shadow-sm">
          <TabsList className="w-full justify-start border-b bg-transparent">
            <TabsTrigger value="performance" className="text-orange-600 data-[state=active]:border-b-2 data-[state=active]:border-orange-600">
              Performance
            </TabsTrigger>
            <TabsTrigger value="training">Training</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column - Real-Time Tracking & Sprint Training */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-green-600" />
                      Real-Time Tracking
                      <Badge className="ml-auto bg-green-100 text-green-700">+15%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Skill Assessment</span>
                        <span className="font-bold">78.3</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Current sprint time improved by 0.3 seconds
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Sprint Interval Training
                      <Badge className="ml-auto bg-yellow-100 text-yellow-700">46/21</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Distance</span>
                        <span className="font-bold">1.7 mi</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average</span>
                        <span className="font-bold">759m</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Habit Score</span>
                        <span className="font-bold">142 pts</span>
                      </div>
                      <Button size="sm" className="w-full bg-red-500 hover:bg-red-600 text-white">
                        Advanced Metrics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Center Column - AI Performance Breakdown */}
              <div>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="w-5 h-5 text-orange-600" />
                      AI Performance Breakdown
                      <Badge className="ml-auto bg-orange-100 text-orange-700">NEW</Badge>
                      <Badge className="bg-gray-100 text-gray-700">360</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Agility</span>
                          <span className="font-bold">85.7%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Technique</span>
                          <span className="font-bold">65.4%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                        </div>
                      </div>

                      {/* AI Analysis Visualization */}
                      <div className="bg-gray-100 rounded-lg p-4 mt-4">
                        <div className="flex items-center justify-center h-32">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                              <span className="text-white font-bold">AI</span>
                            </div>
                            <p className="text-sm text-gray-600">Motion Analysis</p>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-3 bg-red-500 hover:bg-red-600 text-white">
                          View Analysis
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Match & Training Stats */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600" />
                      Match & Training Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-600">Recent Performance</div>
                        <div className="text-lg font-bold">State Championship</div>
                        <div className="text-sm text-gray-500">March 15, 2024 - 1st Place</div>
                        <div className="flex gap-2 mt-2">
                          <Badge className="bg-yellow-100 text-yellow-700">25.6s</Badge>
                          <Badge className="bg-green-100 text-green-700">1.8m/s</Badge>
                          <Badge className="bg-blue-100 text-blue-700">1.82m</Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-600">Recovery Status</div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="text-lg font-bold text-green-600">85%</div>
                            <div className="text-xs text-gray-500">Endurance</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="text-lg font-bold text-blue-600">90%</div>
                            <div className="text-xs text-gray-500">Stamina</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 rounded">
                            <div className="text-lg font-bold text-yellow-600">83%</div>
                            <div className="text-xs text-gray-500">Balance</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Performance Trends Chart */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Performance chart visualization</p>
                    <p className="text-sm text-gray-400">Accuracy • Stamina • Technique trends over time</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Training Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Training Focus (Hours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-r from-red-400 to-pink-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white font-bold">Chart</span>
                      </div>
                      <p className="text-sm text-gray-500">Distribution: Offense • Defense • Technique • Strategy • Analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Target Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <span className="text-white font-bold">Pie</span>
                      </div>
                      <p className="text-sm text-gray-500">Bullseye 25% • Inner Ring 40% • Outer Ring 25% • Outer Ring 10%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sessions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Accuracy Training</div>
                      <div className="text-sm text-gray-500">29 Mar 2024 • 2h 30m</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">92.3%</div>
                      <div className="text-sm text-gray-500">Performance</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Training Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Shooting Fundamentals</h4>
                        <p className="text-sm text-gray-600">Week 3 of 6</p>
                      </div>
                      <Badge className="bg-orange-600">Active</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Conditioning Program</h4>
                        <p className="text-sm text-gray-600">Week 5 of 8</p>
                      </div>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Defensive Drills</h4>
                        <p className="text-sm text-gray-600">Starting next week</p>
                      </div>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 border-l-4 border-orange-500">
                      <div className="text-sm font-medium">Monday</div>
                      <div className="text-sm text-gray-600">Shooting Practice - 4:00 PM</div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border-l-4 border-blue-500">
                      <div className="text-sm font-medium">Wednesday</div>
                      <div className="text-sm text-gray-600">Conditioning - 5:30 PM</div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border-l-4 border-green-500">
                      <div className="text-sm font-medium">Friday</div>
                      <div className="text-sm text-gray-600">Skills Training - 4:30 PM</div>
                    </div>
                    <div className="flex items-center gap-3 p-2 border-l-4 border-purple-500">
                      <div className="text-sm font-medium">Saturday</div>
                      <div className="text-sm text-gray-600">Team Practice - 10:00 AM</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Recent Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">▶</span>
                        </div>
                        <p className="text-xs text-gray-600">Free Throw Analysis</p>
                        <p className="text-xs text-gray-500">Mar 25, 2024</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">87%</div>
                      <div className="text-xs text-gray-500">Accuracy Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Form Check</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">▶</span>
                        </div>
                        <p className="text-xs text-gray-600">Shooting Form</p>
                        <p className="text-xs text-gray-500">Mar 23, 2024</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">B+</div>
                      <div className="text-xs text-gray-500">Form Grade</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Movement Study</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-100 rounded-lg p-4 h-32 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-white text-sm">▶</span>
                        </div>
                        <p className="text-xs text-gray-600">Footwork Drill</p>
                        <p className="text-xs text-gray-500">Mar 20, 2024</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">92%</div>
                      <div className="text-xs text-gray-500">Technique Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="p-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Performance Report</CardTitle>
                  <p className="text-sm text-gray-600">March 2024 Summary</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">24</div>
                      <div className="text-sm text-gray-600">Training Sessions</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">89%</div>
                      <div className="text-sm text-gray-600">Attendance Rate</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">+15%</div>
                      <div className="text-sm text-gray-600">Skill Improvement</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">4.7</div>
                      <div className="text-sm text-gray-600">Coach Rating</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Shooting Accuracy</span>
                          <span className="font-bold">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Ball Handling</span>
                          <span className="font-bold">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Defense</span>
                          <span className="font-bold">72%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Goals Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Achieve 80% free throw accuracy</p>
                          <p className="text-sm text-gray-500">Completed</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">⚡</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Improve defensive stance</p>
                          <p className="text-sm text-gray-500">75% complete</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs">→</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Master crossover dribble</p>
                          <p className="text-sm text-gray-500">In progress</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Profile Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Change Password</label>
                  <input type="password" className="w-full p-2 border rounded-lg" placeholder="New password" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Notification Settings</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Training reminders
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      Performance updates
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      Social notifications
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Theme</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>Light Mode</option>
                    <option>Dark Mode</option>
                    <option>Auto</option>
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setShowEditModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setShowEditModal(false)} className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}