import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, MapPin, Clock, Users, Trophy, Calendar, MessageSquare } from "lucide-react";
import logoPath from "@assets/llogo.jpeg";

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
}

interface CoachProfileProps {
  user?: User;
}

export default function CoachProfile({ user }: CoachProfileProps) {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Use logged-in user's details or fallback
  const displayName = user?.name || "Guru Drona";
  const userInitials = displayName.split(' ').map(n => n[0]).join('');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Orange Background - Mobile-first */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-white">
              <AvatarFallback className="bg-white text-orange-600 text-xl sm:text-2xl font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold">{displayName}</h1>
              <p className="text-orange-100 text-base sm:text-lg">Basketball & Tennis Coach</p>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-300 fill-current" />
                  <span className="font-semibold">4.9</span>
                  <span className="text-orange-100">(127 reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-orange-100">Mumbai, India</span>
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right mt-4 sm:mt-0">
              <div className="text-xl sm:text-2xl font-bold">₹1,200/hr</div>
              <div className="text-orange-100 text-sm">Starting price</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Quick Stats - Mobile-first */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-lg sm:text-2xl font-bold">150+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Students</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-lg sm:text-2xl font-bold">2000+</div>
                  <div className="text-xs sm:text-sm text-gray-600">Hours</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600 mx-auto mb-2" />
                  <div className="text-lg sm:text-2xl font-bold">8</div>
                  <div className="text-xs sm:text-sm text-gray-600">Years Exp</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 sm:p-4 text-center">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-lg sm:text-2xl font-bold">95%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Response Rate</div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Tabs - Mobile-first */}
            <div className="flex gap-2 sm:gap-4 mb-6 border-b overflow-x-auto">
              {[
                { id: "overview", label: "Overview" },
                { id: "experience", label: "Experience" },
                { id: "reviews", label: "Reviews" },
                { id: "schedule", label: "Schedule" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 font-medium border-b-2 transition-colors text-sm sm:text-base whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Me</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      I'm a certified basketball and tennis coach with 8 years of experience training athletes 
                      at all levels. I specialize in fundamental skill development, game strategy, and mental 
                      conditioning. My coaching philosophy focuses on building confidence while developing 
                      technical excellence.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Specializations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-100 text-blue-800">Basketball Fundamentals</Badge>
                      <Badge className="bg-green-100 text-green-800">Shooting Technique</Badge>
                      <Badge className="bg-purple-100 text-purple-800">Defensive Strategy</Badge>
                      <Badge className="bg-orange-100 text-orange-800">Tennis Serve</Badge>
                      <Badge className="bg-red-100 text-red-800">Mental Conditioning</Badge>
                      <Badge className="bg-yellow-100 text-yellow-800">Youth Development</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "experience" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Coaching Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-semibold">Head Basketball Coach</h3>
                        <p className="text-gray-600">Mumbai Sports Academy • 2019 - Present</p>
                        <p className="text-sm text-gray-700 mt-2">
                          Leading training programs for 50+ junior athletes, developing game strategies and individual skill enhancement plans.
                        </p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h3 className="font-semibold">Tennis Instructor</h3>
                        <p className="text-gray-600">Elite Tennis Club • 2017 - 2019</p>
                        <p className="text-sm text-gray-700 mt-2">
                          Specialized in serving technique and match strategy for competitive players.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-4">
                {[
                  {
                    name: "Arjun Sharma",
                    rating: 5,
                    comment: "Excellent coach! My shooting accuracy improved by 40% in just 3 months.",
                    date: "2 weeks ago"
                  },
                  {
                    name: "Priya Patel",
                    rating: 5,
                    comment: "Great tennis instructor. Really helped with my serve technique.",
                    date: "1 month ago"
                  }
                ].map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.name}</span>
                            <div className="flex">
                              {[...Array(review.rating)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">{review.date}</span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === "schedule" && (
              <Card>
                <CardHeader>
                  <CardTitle>Available Time Slots</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 text-center text-xs sm:text-sm">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <div key={day} className="font-medium p-2">{day}</div>
                    ))}
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <div key={day} className="p-2 border rounded">
                        <div className="text-green-600 text-xs">Available</div>
                        <div className="text-xs">9AM-6PM</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Mobile-first */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-4 sm:p-6">
                <Button className="w-full bg-orange-600 hover:bg-orange-700 mb-3 text-sm sm:text-base">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Session
                </Button>
                <Button variant="outline" className="w-full text-sm sm:text-base">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Session Packages</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm sm:text-base">Single Session</div>
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">₹1,200</div>
                    <div className="text-xs sm:text-sm text-gray-600">1 hour training</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-orange-50">
                    <div className="font-medium text-sm sm:text-base">Monthly Package</div>
                    <div className="text-xl sm:text-2xl font-bold text-orange-600">₹4,000</div>
                    <div className="text-xs sm:text-sm text-gray-600">4 sessions (Save ₹800)</div>
                    <Badge className="bg-orange-600 text-white text-xs mt-1">Best Value</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">&lt; 2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Languages</span>
                    <span className="font-medium">Hindi, English</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sessions Completed</span>
                    <span className="font-medium">2,000+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available for 1-on-1 Coaching Section - Moved from Coaches page */}
        <div className="mt-8 p-6 bg-secondary/10 rounded-lg border border-secondary/20 text-center">
          <h2 className="text-xl font-semibold mb-2">Available for 1-on-1 Coaching</h2>
          <p className="text-muted-foreground mb-4">Personalized training sessions to elevate your skills</p>
          <div className="flex gap-4 justify-center">
            <Button>Book Now</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  );
}