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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Background with Better Contrast */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-600 to-green-600 px-3 sm:px-4 md:px-0">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Optional decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-16 h-16 rounded-full border-2 border-white/30"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full border-2 border-white/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-8">
          {/* Top Navigation - Mobile First */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 md:mb-8 gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <img 
                src={logoPath} 
                alt="Ekalavya Logo" 
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 object-contain rounded bg-white p-1 shadow-sm"
              />
              <span className="text-white text-base sm:text-lg md:text-xl font-bold drop-shadow-lg">Ekalavya</span>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/20 border-white/40 text-white hover:bg-white/30 w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 font-medium shadow-lg"
            >
              Edit Profile
            </Button>
          </div>

          {/* Profile Header - Mobile First */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-8 text-center md:text-left">
            {/* Profile Photo - Show first on mobile */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border-4 border-white/20 order-1 md:order-2">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 order-2 md:order-1">
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">{displayName}</h1>
              <p className="text-white text-base sm:text-lg md:text-xl mb-4 drop-shadow-md font-medium">Basketball & Tennis Coach</p>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center md:justify-start gap-3 sm:gap-4 md:gap-6">
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 fill-current drop-shadow-sm" />
                  <span className="text-white font-semibold text-sm sm:text-base drop-shadow-sm">4.9</span>
                  <span className="text-white/90 text-sm sm:text-base drop-shadow-sm">(127 reviews)</span>
                </div>
                <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-sm" />
                  <span className="text-white text-sm sm:text-base drop-shadow-sm">Mumbai, India</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons - Mobile First */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
            <Button className="bg-white text-orange-600 hover:bg-white/90 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 text-sm sm:text-base md:text-lg font-semibold w-full sm:w-auto shadow-lg">
              <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Book Session
            </Button>
            <Button variant="outline" className="border-white/60 bg-white/10 text-white hover:bg-white/20 px-4 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto text-sm sm:text-base shadow-lg">
              <MessageSquare className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Message
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section - Mobile First */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 md:gap-8 text-center">
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">150+</div>
              <div className="text-gray-600 text-xs sm:text-sm">Students</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">2000+</div>
              <div className="text-gray-600 text-xs sm:text-sm">Hours</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">8</div>
              <div className="text-gray-600 text-xs sm:text-sm">Years Exp</div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">95%</div>
              <div className="text-gray-600 text-xs sm:text-sm">Response Rate</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">₹1,200/hr</div>
              <div className="text-gray-600 text-xs sm:text-sm">Starting Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">

            {/* Navigation Tabs - Mobile First */}
            <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 border-b overflow-x-auto">
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
                  <div className="grid grid-cols-7 gap-2 text-center text-sm">
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

          {/* Sidebar - Mobile First */}
          <div className="space-y-4 sm:space-y-6">
            {/* Action Buttons */}
            <div className="space-y-2 sm:space-y-3">
              <Button 
                className="w-full h-10 sm:h-12 text-white font-semibold text-sm sm:text-base" 
                style={{ backgroundColor: '#FF671F' }}
              >
                Book Session
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-10 sm:h-12 border-gray-300 text-gray-700 hover:bg-gray-50 text-sm sm:text-base"
              >
                Send Message
              </Button>
            </div>

            {/* Session Packages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-bold">Session Packages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="border-b pb-3 sm:pb-4">
                  <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Single Session</div>
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: '#FF671F' }}>₹1,200</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Monthly Package</div>
                  <div className="text-xl sm:text-2xl font-bold" style={{ color: '#FF671F' }}>₹4,000</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Response Time</span>
                    <span className="font-medium">&lt; 2 hours</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Languages</span>
                    <span className="font-medium">Hindi, English</span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Sessions Completed</span>
                    <span className="font-medium">2,000+</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Available for 1-on-1 Coaching Section - Mobile First */}
        <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-secondary/10 rounded-lg border border-secondary/20 text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Available for 1-on-1 Coaching</h2>
          <p className="text-muted-foreground mb-4 text-sm sm:text-base">Personalized training sessions to elevate your skills</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button className="text-sm sm:text-base">Book Now</Button>
            <Button variant="outline" className="text-sm sm:text-base">Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  );
}