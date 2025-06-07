import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Video, Calendar, Clock, Phone, MessageSquare, Users } from "lucide-react";

export default function VideoConsulting() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingCalls = [
    {
      id: 1,
      student: "Arjuna K.",
      sport: "Basketball",
      time: "Today 4:00 PM",
      duration: "60 min",
      type: "Form Analysis",
      status: "confirmed"
    },
    {
      id: 2,
      student: "Sarah Martinez", 
      sport: "Tennis",
      time: "Tomorrow 6:00 PM",
      duration: "45 min",
      type: "Technique Review",
      status: "pending"
    },
    {
      id: 3,
      student: "Mike Robinson",
      sport: "Swimming",
      time: "Friday 3:00 PM", 
      duration: "30 min",
      type: "Progress Check",
      status: "confirmed"
    }
  ];

  const recentCalls = [
    {
      id: 1,
      student: "Emma Chen",
      sport: "Archery",
      date: "Yesterday",
      duration: "45 min",
      rating: 5,
      notes: "Great progress on stance and release"
    },
    {
      id: 2,
      student: "Alex Johnson",
      sport: "Basketball",
      date: "2 days ago",
      duration: "60 min", 
      rating: 4,
      notes: "Worked on defensive positioning"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Video Consulting</h1>
            <p className="text-gray-600 text-sm mb-4">Manage your virtual coaching sessions</p>
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              <Video className="h-4 w-4 mr-2" />
              Schedule New Call
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <Video className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">12</div>
                <div className="text-xs text-gray-600">This Week</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">24h</div>
                <div className="text-xs text-gray-600">Total Hours</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">18</div>
                <div className="text-xs text-gray-600">Active Students</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-xl font-bold text-gray-900">4.9</div>
                <div className="text-xs text-gray-600">Avg Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button 
              variant={activeTab === "upcoming" ? "default" : "outline"}
              onClick={() => setActiveTab("upcoming")}
              className="flex-1 sm:flex-none"
            >
              Upcoming Calls
            </Button>
            <Button 
              variant={activeTab === "recent" ? "default" : "outline"}
              onClick={() => setActiveTab("recent")}
              className="flex-1 sm:flex-none"
            >
              Recent Calls
            </Button>
          </div>

        {/* Upcoming Calls */}
        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {upcomingCalls.map((call) => (
              <Card key={call.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {call.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{call.student}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{call.sport} • {call.type}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{call.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{call.duration}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        className={`${call.status === 'confirmed' ? 'bg-green-600' : 'bg-yellow-600'} text-xs shrink-0`}
                      >
                        {call.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs flex-1">
                        <Video className="h-3 w-3 mr-1" />
                        Join Call
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs flex-1">
                        <Phone className="h-3 w-3 mr-1" />
                        Audio Only
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Calls */}
        {activeTab === "recent" && (
          <div className="space-y-4">
            {recentCalls.map((call) => (
              <Card key={call.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                        <AvatarFallback className="bg-gray-600 text-white">
                          {call.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{call.student}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 truncate">{call.sport}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          <span className="text-xs text-gray-600">{call.date}</span>
                          <span className="text-xs text-gray-600">{call.duration}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-yellow-600">{"★".repeat(call.rating)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm text-gray-600">{call.notes}</p>
                      <Button size="sm" variant="outline" className="text-xs w-full">
                        View Recording
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Live Call Interface (when active) */}
        <Card className="mt-8 border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
              Live Video Call - Ready to Connect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium">Camera will activate when call starts</p>
                <p className="text-sm text-gray-400">Test your camera and microphone</p>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <Button className="bg-green-600 hover:bg-green-700 w-full">
                <Video className="h-4 w-4 mr-2" />
                Start Video
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Audio Only
                </Button>
                <Button variant="outline" className="flex-1">
                  Test Equipment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}