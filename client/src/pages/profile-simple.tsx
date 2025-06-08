import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Camera, Star, Trophy, Target } from "lucide-react";

export default function Profile() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
                <Button size="sm" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full">
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">Arjun Sharma</h1>
                    <p className="text-gray-600">Basketball Player</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">Intermediate</Badge>
                      <Badge variant="outline">2 years experience</Badge>
                    </div>
                  </div>
                  <Button>Edit Profile</Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">127</div>
                    <div className="text-sm text-gray-500">Training Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">8.4</div>
                    <div className="text-sm text-gray-500">Avg Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">23</div>
                    <div className="text-sm text-gray-500">Achievements</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sports & Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Sports & Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Basketball</span>
                  <Badge>Primary</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full w-3/4"></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">75% proficiency</p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Swimming</span>
                  <Badge variant="secondary">Secondary</Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full w-1/2"></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">50% proficiency</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-2 border rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  🏆
                </div>
                <div>
                  <p className="font-medium">Perfect Week</p>
                  <p className="text-sm text-gray-500">Completed all training sessions</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 border rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  🎯
                </div>
                <div>
                  <p className="font-medium">Accuracy Master</p>
                  <p className="text-sm text-gray-500">85% shooting accuracy in AR training</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 border rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  ⚡
                </div>
                <div>
                  <p className="font-medium">Speed Demon</p>
                  <p className="text-sm text-gray-500">Improved sprint time by 0.3 seconds</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Current Training Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Free Throw Accuracy</span>
                  <span className="text-sm text-gray-500">82/90%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '91%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Vertical Jump</span>
                  <span className="text-sm text-gray-500">24/28 inches</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '86%' }}></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Conditioning</span>
                  <span className="text-sm text-gray-500">7/10 level</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">94%</div>
                  <div className="text-sm text-gray-600">Session Attendance</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">4.8</div>
                  <div className="text-sm text-gray-600">Coach Rating</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">156</div>
                  <div className="text-sm text-gray-600">Hours Trained</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">12</div>
                  <div className="text-sm text-gray-600">Skills Improved</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}