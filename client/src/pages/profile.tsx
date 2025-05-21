import { useState } from "react";
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
import { useTheme } from "@/context/theme-provider";
import { getInitials } from "@/lib/utils";

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

export default function Profile() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      phone: "",
      location: "",
    },
  });

  function onSubmit(data: ProfileFormValues) {
    // In a real application, this would update the user's profile
    console.log(data);
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

  if (!user) return null;

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
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground capitalize mb-2">
                  {user.role} • {user.sports.join(", ")}
                </p>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {user.role === "athlete" && (
                    <>
                      <Badge variant="outline">Junior Level</Badge>
                      <Badge variant="outline">3 Years Experience</Badge>
                      <Badge className="bg-primary">Top 10 Performer</Badge>
                    </>
                  )}
                  {user.role === "coach" && (
                    <>
                      <Badge variant="outline">
                        {user.students} Athletes Coached
                      </Badge>
                      <Badge variant="outline">15+ Years Experience</Badge>
                      <Badge className="bg-primary">
                        Rating: {user.rating?.toFixed(1)}
                      </Badge>
                    </>
                  )}
                </div>

                <p className="max-w-2xl">
                  {user.bio ||
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
                      <FormLabel>Current Password</FormLabel>
                      <Input type="password" />
                    </div>
                    <div>
                      <FormLabel>New Password</FormLabel>
                      <Input type="password" />
                    </div>
                    <div>
                      <FormLabel>Confirm New Password</FormLabel>
                      <Input type="password" />
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
                            Not connected
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                          <i className="fab fa-facebook-f text-white"></i>
                        </div>
                        <div>
                          <p className="font-medium">Facebook</p>
                          <p className="text-sm text-muted-foreground">
                            Not connected
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">Connect</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">
                    Appearance Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer ${
                        theme === "light"
                          ? "bg-primary/10 border-primary"
                          : "bg-background"
                      }`}
                      onClick={() => setTheme("light")}
                    >
                      <div className="w-full h-32 bg-white border mb-3 rounded-md shadow flex items-center justify-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                      </div>
                      <span
                        className={
                          theme === "light" ? "font-medium text-primary" : ""
                        }
                      >
                        Light Mode
                      </span>
                    </div>

                    <div
                      className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer ${
                        theme === "dark"
                          ? "bg-primary/10 border-primary"
                          : "bg-background"
                      }`}
                      onClick={() => setTheme("dark")}
                    >
                      <div className="w-full h-32 bg-gray-900 border mb-3 rounded-md shadow flex items-center justify-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full"></div>
                      </div>
                      <span
                        className={
                          theme === "dark" ? "font-medium text-primary" : ""
                        }
                      >
                        Dark Mode
                      </span>
                    </div>

                    <div
                      className={`border rounded-lg p-4 flex flex-col items-center cursor-pointer ${
                        theme === "blue-theme"
                          ? "bg-primary/10 border-primary"
                          : "bg-background"
                      }`}
                      onClick={() => setTheme("blue-theme")}
                    >
                      <div className="w-full h-32 bg-white border mb-3 rounded-md shadow flex items-center justify-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                      </div>
                      <span
                        className={
                          theme === "blue-theme"
                            ? "font-medium text-primary"
                            : ""
                        }
                      >
                        Blue Theme
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Notification Settings
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about your account activity
                        </p>
                      </div>
                      <Switch id="email-notifications" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications about your sessions
                        </p>
                      </div>
                      <Switch id="push-notifications" defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Receive text messages for important updates
                        </p>
                      </div>
                      <Switch id="sms-notifications" />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">
                    Language Settings
                  </h3>
                  <div>
                    <FormLabel>Preferred Language</FormLabel>
                    <select className="w-full md:w-1/3 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                      <option value="en">English</option>
                      <option value="hi">हिंदी (Hindi)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>Save Preferences</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
