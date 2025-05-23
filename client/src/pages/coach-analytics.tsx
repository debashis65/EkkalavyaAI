import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, TrendingUp, Clock, Star, Calendar } from "lucide-react";

export default function CoachAnalytics() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Coach Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor your students' progress and coaching performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Hours This Month</p>
                  <p className="text-2xl font-bold text-gray-900">86</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Student Improvement</p>
                  <p className="text-2xl font-bold text-gray-900">+18%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium">Arjuna K.</p>
                    <p className="text-sm text-gray-600">Basketball - Shooting</p>
                  </div>
                  <Badge className="bg-green-600">+15%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium">Sarah M.</p>
                    <p className="text-sm text-gray-600">Tennis - Serve</p>
                  </div>
                  <Badge className="bg-blue-600">+12%</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div>
                    <p className="font-medium">Mike R.</p>
                    <p className="text-sm text-gray-600">Swimming - Stroke</p>
                  </div>
                  <Badge className="bg-orange-600">+8%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completed Sessions</span>
                  <span className="font-bold">142</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Scheduled Sessions</span>
                  <span className="font-bold">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Video Consultations</span>
                  <span className="font-bold">36</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Student Feedback</span>
                  <span className="font-bold">4.8/5</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Coaching Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 border-l-4 border-green-500">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <p className="font-medium">Basketball Session with Arjuna K.</p>
                  <p className="text-sm text-gray-600">Shooting form analysis completed - 85% accuracy improvement</p>
                </div>
                <span className="text-sm text-gray-500">2 hours ago</span>
              </div>
              <div className="flex items-center gap-4 p-4 border-l-4 border-blue-500">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <p className="font-medium">Video Consultation with Sarah M.</p>
                  <p className="text-sm text-gray-600">Tennis serve technique review and training plan update</p>
                </div>
                <span className="text-sm text-gray-500">1 day ago</span>
              </div>
              <div className="flex items-center gap-4 p-4 border-l-4 border-orange-500">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div className="flex-1">
                  <p className="font-medium">Training Plan Created for Mike R.</p>
                  <p className="text-sm text-gray-600">Swimming stroke improvement - 6-week program</p>
                </div>
                <span className="text-sm text-gray-500">2 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}