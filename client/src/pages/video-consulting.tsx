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
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Video Consulting</h1>
            <p className="text-gray-600 mt-2">Manage your virtual coaching sessions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Video className="h-4 w-4 mr-2" />
            Schedule New Call
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Video className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">24h</div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">18</div>
              <div className="text-sm text-gray-600">Active Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">4.9</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <Button 
            variant={activeTab === "upcoming" ? "default" : "outline"}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Calls
          </Button>
          <Button 
            variant={activeTab === "recent" ? "default" : "outline"}
            onClick={() => setActiveTab("recent")}
          >
            Recent Calls
          </Button>
        </div>

        {/* Upcoming Calls */}
        {activeTab === "upcoming" && (
          <div className="space-y-4">
            {upcomingCalls.map((call) => (
              <Card key={call.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-blue-600 text-white">
                          {call.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{call.student}</h3>
                        <p className="text-sm text-gray-600">{call.sport} • {call.type}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{call.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{call.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        className={call.status === 'confirmed' ? 'bg-green-600' : 'bg-yellow-600'}
                      >
                        {call.status}
                      </Badge>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        <Video className="h-4 w-4 mr-1" />
                        Join Call
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4 mr-1" />
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
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gray-600 text-white">
                          {call.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{call.student}</h3>
                        <p className="text-sm text-gray-600">{call.sport}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600">{call.date}</span>
                          <span className="text-sm text-gray-600">{call.duration}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-yellow-600">{"★".repeat(call.rating)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right max-w-xs">
                        <p className="text-sm text-gray-600">{call.notes}</p>
                      </div>
                      <Button size="sm" variant="outline">
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
            <div className="flex justify-center gap-4 mt-4">
              <Button className="bg-green-600 hover:bg-green-700">
                <Video className="h-4 w-4 mr-2" />
                Start Video
              </Button>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Audio Only
              </Button>
              <Button variant="outline">
                Test Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}