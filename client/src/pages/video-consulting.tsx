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
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header - Mobile First */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Video Consulting</h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your virtual coaching sessions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base">
            <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Schedule New Call
          </Button>
        </div>

        {/* Quick Stats - Mobile First */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <Video className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900">12</div>
              <div className="text-xs sm:text-sm text-gray-600">This Week</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900">24h</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Hours</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900">18</div>
              <div className="text-xs sm:text-sm text-gray-600">Active Students</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-6 text-center">
              <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-lg sm:text-2xl font-bold text-gray-900">4.9</div>
              <div className="text-xs sm:text-sm text-gray-600">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - Mobile First */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button 
            variant={activeTab === "upcoming" ? "default" : "outline"}
            onClick={() => setActiveTab("upcoming")}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            Upcoming Calls
          </Button>
          <Button 
            variant={activeTab === "recent" ? "default" : "outline"}
            onClick={() => setActiveTab("recent")}
            className="w-full sm:w-auto text-sm sm:text-base"
          >
            Recent Calls
          </Button>
        </div>

        {/* Upcoming Calls - Mobile First */}
        {activeTab === "upcoming" && (
          <div className="space-y-3 sm:space-y-4">
            {upcomingCalls.map((call) => (
              <Card key={call.id}>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                        <AvatarFallback className="bg-blue-600 text-white text-sm sm:text-base">
                          {call.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{call.student}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{call.sport} • {call.type}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-600">{call.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                            <span className="text-xs sm:text-sm text-gray-600">{call.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                      <Badge 
                        className={`${call.status === 'confirmed' ? 'bg-green-600' : 'bg-yellow-600'} text-xs sm:text-sm`}
                      >
                        {call.status}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none text-xs sm:text-sm">
                          <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Join Call
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 sm:flex-none text-xs sm:text-sm">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Audio Only
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Calls - Mobile First */}
        {activeTab === "recent" && (
          <div className="space-y-3 sm:space-y-4">
            {recentCalls.map((call) => (
              <Card key={call.id}>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                        <AvatarFallback className="bg-gray-600 text-white text-sm sm:text-base">
                          {call.student.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm sm:text-base">{call.student}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{call.sport}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                          <span className="text-xs sm:text-sm text-gray-600">{call.date}</span>
                          <span className="text-xs sm:text-sm text-gray-600">{call.duration}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-xs sm:text-sm text-yellow-600">{"★".repeat(call.rating)}</span>
                          </div>
                        </div>
                        <div className="mt-2 sm:hidden">
                          <p className="text-xs text-gray-600">{call.notes}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                      <div className="hidden sm:block text-right max-w-xs">
                        <p className="text-sm text-gray-600">{call.notes}</p>
                      </div>
                      <Button size="sm" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                        View Recording
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Live Call Interface - Mobile First */}
        <Card className="mt-6 sm:mt-8 border-2 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-600 rounded-full animate-pulse"></div>
              Live Video Call - Ready to Connect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 rounded-lg h-48 sm:h-64 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <Video className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 text-gray-400" />
                <p className="text-base sm:text-lg font-medium">Camera will activate when call starts</p>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Test your camera and microphone</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-3 sm:mt-4">
              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-sm sm:text-base">
                <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Start Video
              </Button>
              <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Audio Only
              </Button>
              <Button variant="outline" className="w-full sm:w-auto text-sm sm:text-base">
                Test Equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}