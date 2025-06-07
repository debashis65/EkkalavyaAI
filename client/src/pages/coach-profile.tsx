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
      {/* Indian Flag Inspired Design with Brush Strokes */}
      <div className="relative overflow-hidden bg-white px-4 md:px-0">
        {/* Orange brush strokes from top-left */}
        <div className="absolute inset-0">
          <svg 
            viewBox="0 0 800 400" 
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Orange brush strokes */}
            <path
              d="M-50,0 Q200,20 400,10 T800,30 L800,0 Z"
              fill="#FF671F"
              opacity="0.9"
            />
            <path
              d="M-30,15 Q180,35 380,25 T780,45 L800,15 L800,0 Z"
              fill="#FF8C42"
              opacity="0.7"
            />
            <path
              d="M-10,30 Q160,50 360,40 T760,60 L800,30 L800,0 Z"
              fill="#FFA366"
              opacity="0.5"
            />
            
            {/* Green brush strokes from bottom-right */}
            <path
              d="M800,400 Q600,380 400,390 T0,370 L0,400 Z"
              fill="#046A38"
              opacity="0.9"
            />
            <path
              d="M820,385 Q620,365 420,375 T20,355 L0,385 L0,400 Z"
              fill="#0E8A4A"
              opacity="0.7"
            />
            <path
              d="M840,370 Q640,350 440,360 T40,340 L0,370 L0,400 Z"
              fill="#2EAA5C"
              opacity="0.5"
            />
          </svg>
        </div>
        
        {/* Subtle Ashoka Chakra watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <div className="w-64 h-64 rounded-full border-8 border-gray-400 flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
            {/* Chakra spokes */}
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-24 bg-gray-400"
                style={{ transform: `rotate(${i * 15}deg)` }}
              />
            ))}
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8">
          {/* Top Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-8 gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={logoPath} 
                alt="Ekalavya Logo" 
                className="w-6 h-6 md:w-8 md:h-8 object-contain rounded bg-white p-1"
              />
              <span className="text-white text-lg md:text-xl font-bold">Ekalavya</span>
            </div>
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-full sm:w-auto"
            >
              Edit Profile
            </Button>
          </div>

          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start gap-4 md:gap-8">
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{displayName}</h1>
              <p className="text-white/90 text-lg md:text-xl mb-4">Basketball & Tennis Coach</p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="text-white font-semibold">4.9</span>
                  <span className="text-white/80">(127 reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-white/80" />
                  <span className="text-white/80">Mumbai, India</span>
                </div>
              </div>
            </div>
            
            {/* Profile Photo */}
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-lg overflow-hidden border-4 border-white/20 mx-auto md:mx-0">
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face" 
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8">
            <Button className="bg-white text-primary hover:bg-white/90 px-6 md:px-8 py-3 text-base md:text-lg font-semibold w-full sm:w-auto">
              <Calendar className="mr-2 h-5 w-5" />
              Book Session
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white/10 px-6 py-3 w-full sm:w-auto">
              <MessageSquare className="mr-2 h-5 w-5" />
              Message
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Section - Clean Horizontal Layout */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-8 text-center">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">150+</div>
              <div className="text-gray-600 text-xs md:text-sm">Students</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">2000+</div>
              <div className="text-gray-600 text-xs md:text-sm">Hours</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">8</div>
              <div className="text-gray-600 text-xs md:text-sm">Years Exp</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900">95%</div>
              <div className="text-gray-600 text-xs md:text-sm">Response Rate</div>
            </div>
            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl md:text-3xl font-bold text-gray-900">$1,200/hr</div>
              <div className="text-gray-600 text-xs md:text-sm">Starting Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6 border-b">
              {[
                { id: "overview", label: "Overview" },
                { id: "experience", label: "Experience" },
                { id: "reviews", label: "Reviews" },
                { id: "schedule", label: "Schedule" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors ${
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

          {/* Sidebar - Action Buttons & Packages */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full h-12 text-white font-semibold" 
                style={{ backgroundColor: '#FF671F' }}
              >
                Book Session
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Send Message
              </Button>
            </div>

            {/* Session Packages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold">Session Packages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b pb-4">
                  <div className="font-semibold text-gray-900 mb-1">Single Session</div>
                  <div className="text-2xl font-bold" style={{ color: '#FF671F' }}>₹1,200</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Monthly Package</div>
                  <div className="text-2xl font-bold" style={{ color: '#FF671F' }}>₹4,000</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">Single Session</div>
                    <div className="text-2xl font-bold text-orange-600">₹1,200</div>
                    <div className="text-sm text-gray-600">1 hour training</div>
                  </div>
                  <div className="p-3 border rounded-lg bg-orange-50">
                    <div className="font-medium">Monthly Package</div>
                    <div className="text-2xl font-bold text-orange-600">₹4,000</div>
                    <div className="text-sm text-gray-600">4 sessions (Save ₹800)</div>
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