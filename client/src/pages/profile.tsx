import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { getInitials } from "@/lib/utils";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Profile | Ekalavya</title>
      </Helmet>

      {/* Header - Matching site design */}
      <div className="bg-white p-3 sm:p-4 text-black">
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <img 
            src="/logo.jpeg" 
            alt="Ekalavya AI Logo" 
            className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded bg-white p-1 flex-shrink-0"
          />
          <h1 className="text-sm sm:text-lg md:text-xl font-semibold">Your Profile</h1>
        </div>
        <p className="text-gray-600 text-xs sm:text-sm">Manage your information and settings</p>
      </div>

      {/* Profile Content */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Profile Header Card */}
        <Card className="mb-4 sm:mb-6 bg-white">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start">
              <div className="flex flex-col items-center">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mb-2">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-lg font-bold">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" className="text-xs">
                  Change Photo
                </Button>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-lg sm:text-xl font-bold mb-1">{user.name}</h1>
                <p className="text-muted-foreground capitalize mb-2 text-xs sm:text-sm">
                  {user.role} • {user.sports?.join(", ") || "Archery"}
                </p>

                <div className="flex flex-wrap gap-1 justify-center sm:justify-start mb-3">
                  <Badge variant="outline" className="text-xs">Junior Level</Badge>
                  <Badge variant="outline" className="text-xs">3 Years Experience</Badge>
                  <Badge className="bg-primary text-xs">Top Performer</Badge>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground">
                  {user.bio || "Passionate about improving my skills and reaching new heights in my sporting journey."}
                </p>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                  Share
                </Button>
                <Button size="sm" className="flex-1 sm:flex-none text-xs bg-orange-600 hover:bg-orange-700">
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-4 sm:mb-6 overflow-x-auto">
            <TabsTrigger value="general" className="text-xs px-2 sm:px-3 whitespace-nowrap">
              General
            </TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs px-2 sm:px-3 whitespace-nowrap">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-2 sm:px-3 whitespace-nowrap">
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="text-xs px-2 sm:px-3 whitespace-nowrap">
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <div className="space-y-4 sm:space-y-6">
              <Card className="bg-white">
                <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="name" className="text-xs sm:text-sm">Full Name</Label>
                      <Input id="name" defaultValue={user.name} className="mt-1 text-xs sm:text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                      <Input id="email" type="email" defaultValue={user.email} className="mt-1 text-xs sm:text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="mt-1 text-xs sm:text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-xs sm:text-sm">Location</Label>
                      <Input id="location" placeholder="City, State" className="mt-1 text-xs sm:text-sm" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio" className="text-xs sm:text-sm">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      defaultValue={user.bio}
                      className="mt-1 resize-none text-xs sm:text-sm"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                  <CardTitle className="text-sm sm:text-base">Sports Information</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="primary-sport" className="text-xs sm:text-sm">Primary Sport</Label>
                      <select className="w-full mt-1 flex h-8 sm:h-10 rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ring-offset-background">
                        <option value="archery">Archery</option>
                        <option value="swimming">Swimming</option>
                        <option value="athletics">Athletics</option>
                        <option value="badminton">Badminton</option>
                        <option value="basketball">Basketball</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="experience" className="text-xs sm:text-sm">Experience Level</Label>
                      <select className="w-full mt-1 flex h-8 sm:h-10 rounded-md border border-input bg-background px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ring-offset-background">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="professional">Professional</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Additional Sports</Label>
                    <div className="flex gap-1 sm:gap-2 flex-wrap mt-2">
                      <Badge variant="outline" className="px-2 py-1 text-xs">
                        Swimming <button className="ml-1">✕</button>
                      </Badge>
                      <Badge variant="outline" className="px-2 py-1 text-xs">
                        Athletics <button className="ml-1">✕</button>
                      </Badge>
                      <Button variant="outline" size="sm" className="rounded-full text-xs">
                        + Add Sport
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">Cancel</Button>
                <Button className="w-full sm:w-auto text-xs sm:text-sm bg-orange-600 hover:bg-orange-700">Save Changes</Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="achievements">
            <Card className="bg-white">
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base">Achievements & Certifications</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start justify-between border-b pb-3">
                    <div className="flex">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        🏆
                      </div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">State Championship</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Junior Archery • March 2025</p>
                        <Badge variant="outline" className="mt-1 text-xs">2nd Place</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between border-b pb-3">
                    <div className="flex">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        🎯
                      </div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">National Qualifying Round</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Archery • January 2025</p>
                        <Badge variant="outline" className="mt-1 text-xs">Qualified</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start justify-between">
                    <div className="flex">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                        🥇
                      </div>
                      <div>
                        <h3 className="font-medium text-sm sm:text-base">Regional Tournament</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">Junior Archery • November 2024</p>
                        <Badge variant="outline" className="mt-1 text-xs">1st Place</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3 mt-4">
                    <Button className="w-full sm:w-auto text-xs sm:text-sm bg-orange-600 hover:bg-orange-700">+ Add Achievement</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="bg-white">
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base">Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-medium mb-3 text-sm sm:text-base">Change Password</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="current-password" className="text-xs sm:text-sm">Current Password</Label>
                      <Input id="current-password" type="password" className="mt-1 text-xs sm:text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="new-password" className="text-xs sm:text-sm">New Password</Label>
                      <Input id="new-password" type="password" className="mt-1 text-xs sm:text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password" className="text-xs sm:text-sm">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" className="mt-1 text-xs sm:text-sm" />
                    </div>
                    <Button className="w-full sm:w-auto text-xs sm:text-sm bg-orange-600 hover:bg-orange-700">Update Password</Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3 text-sm sm:text-base">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-xs sm:text-sm">Enable 2FA</p>
                      <p className="text-xs text-muted-foreground">
                        Add extra security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="bg-white">
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3">
                <CardTitle className="text-sm sm:text-base">Preferences</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-4 sm:space-y-6">
                <div>
                  <h3 className="font-medium mb-3 text-sm sm:text-base">Notifications</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">Email Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive email updates</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">Push Notifications</p>
                        <p className="text-xs text-muted-foreground">Receive push notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-medium mb-3 text-sm sm:text-base">Privacy</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-xs sm:text-sm">Profile Visibility</p>
                        <p className="text-xs text-muted-foreground">Make profile public</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}