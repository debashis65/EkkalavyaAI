import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/auth-context";
import { getInitials } from "@/lib/utils";
import { User } from "@/types";

const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  bio: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z
    .string()
    .min(10, {
      message: "Phone number must be at least 10 digits.",
    })
    .optional(),
  location: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileWorking() {
  // Direct access to user data from localStorage as a fallback
  const { user } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Ensure we have user data by checking localStorage directly if needed
  useEffect(() => {
    if (user) {
      setUserData(user);
    } else {
      const storedUser = localStorage.getItem("ekalavya_user");
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    }
  }, [user]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      bio: userData?.bio || "",
      phone: "",
      location: "",
    },
  });

  // Update form when userData changes
  useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        phone: "",
        location: "",
      });
    }
  }, [userData, form]);

  function onSubmit(data: ProfileFormValues) {
    // In a real application, this would update the user's profile
    console.log(data);
    
    // For demo purposes, update local storage with the new values
    if (userData) {
      const updatedUser = {
        ...userData,
        name: data.name,
        email: data.email,
        bio: data.bio,
      };
      localStorage.setItem("ekalavya_user", JSON.stringify(updatedUser));
      setUserData(updatedUser);
    }
  }

  const achievements = [
    {
      id: 1,
      title: "State Championship",
      date: "March 2025",
      position: "2nd Place",
      category: "Junior Archery",
    },
    {
      id: 2,
      title: "National Qualifying Round",
      date: "January 2025",
      position: "Qualified",
      category: "Archery",
    },
    {
      id: 3,
      title: "Regional Tournament",
      date: "November 2024",
      position: "1st Place",
      category: "Junior Archery",
    },
  ];

  // Show loading state while we fetch user data
  if (!userData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Profile | Ekalavya</title>
        <meta
          name="description"
          content="Manage your profile settings, view your achievements, and customize your preferences on Ekalavya."
        />
      </Helmet>

      <div className="p-4">
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{userData.name}</h1>
                <p className="text-muted-foreground capitalize mb-2">
                  {userData.role} • {userData.sports?.join(", ")}
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {userData.role === "athlete" && (
                    <>
                      <Badge variant="outline">Junior Level</Badge>
                      <Badge variant="outline">3 Years Experience</Badge>
                      <Badge className="bg-primary">Top 10 Performer</Badge>
                    </>
                  )}
                  {userData.role === "coach" && (
                    <>
                      <Badge variant="outline">
                        {userData.students} Athletes Coached
                      </Badge>
                      <Badge variant="outline">15+ Years Experience</Badge>
                      <Badge className="bg-primary">
                        Rating: {userData.rating?.toFixed(1)}
                      </Badge>
                    </>
                  )}
                </div>

                <p className="max-w-2xl">
                  {userData.bio ||
                    "Passionate about improving my skills and reaching new heights in my sporting journey. Looking forward to learning from the best coaches on Ekalavya."}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <i className="fas fa-share-alt mr-2"></i> Share
                </Button>
                <Button variant="secondary">
                  <i className="fas fa-pen mr-2"></i> Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell us about yourself..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Brief description for your profile.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sports Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel>Primary Sport</FormLabel>
                        <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                          <option value="archery">Archery</option>
                          <option value="swimming">Swimming</option>
                          <option value="athletics">Athletics</option>
                          <option value="badminton">Badminton</option>
                          <option value="basketball">Basketball</option>
                        </select>
                      </div>
                      <div>
                        <FormLabel>Experience Level</FormLabel>
                        <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                          <option value="professional">Professional</option>
                          <option value="expert">Expert</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <FormLabel>Additional Sports</FormLabel>
                      <div className="flex gap-2 flex-wrap mt-2">
                        <Badge variant="outline" className="px-3 py-1">
                          Swimming <button className="ml-2">✕</button>
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                          Athletics <button className="ml-2">✕</button>
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                        >
                          <i className="fas fa-plus mr-1"></i> Add Sport
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userData.achievements?.map((achievement, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                          <i className="fas fa-trophy text-primary"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">{achievement}</h3>
                          <p className="text-sm text-muted-foreground">
                            {userData.role === "coach" ? "Coaching Achievement" : "Performance Achievement"}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {userData.role === "coach" ? "Coach" : "Athlete"}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-ellipsis-h"></i>
                      </Button>
                    </div>
                  ))}

                  {/* Additional achievements from the mock data */}
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-start justify-between border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="flex">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                          <i className="fas fa-trophy text-primary"></i>
                        </div>
                        <div>
                          <h3 className="font-medium">{achievement.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.category} • {achievement.date}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {achievement.position}
                          </Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-ellipsis-h"></i>
                      </Button>
                    </div>
                  ))}

                  <div className="border-t pt-4 mt-6">
                    <Button>
                      <i className="fas fa-plus mr-2"></i> Add Achievement
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Change Password</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Current Password
                      </label>
                      <Input type="password" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        New Password
                      </label>
                      <Input type="password" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Confirm New Password
                      </label>
                      <Input type="password" className="mt-1" />
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Two-Factor Authentication
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enable 2FA</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch id="2fa" />
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Connected Accounts
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                          <i className="fab fa-google text-white"></i>
                        </div>
                        <div>
                          <p className="font-medium">Google</p>
                          <p className="text-sm text-muted-foreground">
                            Not Connected
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                          <i className="fab fa-apple text-white"></i>
                        </div>
                        <div>
                          <p className="font-medium">Apple</p>
                          <p className="text-sm text-muted-foreground">
                            Connected
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Disconnect
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border rounded-lg p-4 flex flex-col items-center cursor-pointer bg-background">
                    <div className="w-full h-32 bg-white border mb-3 rounded-md shadow flex items-center justify-center">
                      <div className="w-8 h-8 bg-primary rounded-full"></div>
                    </div>
                    <span className="font-medium">Light Mode</span>
                  </div>

                  <div className="border rounded-lg p-4 flex flex-col items-center cursor-pointer bg-background">
                    <div className="w-full h-32 bg-gray-900 border mb-3 rounded-md shadow flex items-center justify-center">
                      <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                    </div>
                    <span>Dark Mode</span>
                  </div>

                  <div className="border rounded-lg p-4 flex flex-col items-center cursor-pointer bg-background">
                    <div className="w-full h-32 bg-white border mb-3 rounded-md shadow flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                    </div>
                    <span>Blue Theme</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Email Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified 1 hour before your scheduled sessions
                    </p>
                  </div>
                  <Switch id="email-1" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Coach Recommendations</p>
                    <p className="text-sm text-muted-foreground">
                      Receive weekly coach recommendations based on your sports
                    </p>
                  </div>
                  <Switch id="email-2" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Performance Reports</p>
                    <p className="text-sm text-muted-foreground">
                      Weekly summary of your training and performance metrics
                    </p>
                  </div>
                  <Switch id="email-3" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Promotional Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Special offers, discounts, and new features
                    </p>
                  </div>
                  <Switch id="email-4" />
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-end">
              <Button>Save Preferences</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}