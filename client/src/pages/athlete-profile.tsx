import { useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { PerformanceChart } from "@/components/analytics/performance-chart";

export default function AthleteProfile() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("performance");

  // This would be fetched from an API in a real app
  const athlete = {
    id: parseInt(id || "1"),
    name: "Rahul Kumar",
    age: 17,
    position: "Forward",
    sport: "Swimming",
    tier: "Tier 3",
    club: "Aquatic Club",
    location: "Mumbai",
    metrics: {
      speed: { value: 78, change: 3 },
      agility: { value: 65, change: 5 },
    },
    recentPerformance: {
      event: "State Championship",
      date: "March 24, 2025",
      position: "2nd Place",
      metrics: {
        time: "25.6s",
        turnSpeed: "1.9m/s",
        dps: "1.82m",
      },
    },
    recovery: {
      muscle: 85,
      hydration: 92,
    },
  };

  // Performance chart data
  const performanceData = [
    { month: "Jan", accuracy: 60, stamina: 55, technique: 58 },
    { month: "Feb", accuracy: 65, stamina: 60, technique: 62 },
    { month: "Mar", accuracy: 68, stamina: 64, technique: 67 },
    { month: "Apr", accuracy: 72, stamina: 67, technique: 70 },
    { month: "May", accuracy: 75, stamina: 72, technique: 74 },
    { month: "Jun", accuracy: 78, stamina: 76, technique: 77 },
    { month: "Jul", accuracy: 82, stamina: 79, technique: 81 },
  ];

  return (
    <>
      <Helmet>
        <title>{athlete.name} | Athlete Profile | Ekalavya</title>
        <meta
          name="description"
          content={`View ${athlete.name}'s performance metrics, training history, and statistics for ${athlete.sport}.`}
        />
      </Helmet>

      <div className="bg-gradient-to-r from-secondary to-secondary-700 h-24 relative">
        <Button
          className="absolute top-4 right-4"
          variant="secondary"
          className="bg-white text-secondary hover:bg-white/90 absolute top-4 right-4"
        >
          Shortlist Player
        </Button>
      </div>

      <div className="px-4 -mt-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Avatar className="w-16 h-16 mr-4 border-4 border-white">
                <AvatarFallback className="bg-secondary/20 text-secondary">
                  {getInitials(athlete.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-medium">{athlete.name}</h2>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>{athlete.age} yrs</span>
                  <span className="mx-2">•</span>
                  <span>{athlete.position}</span>
                  <span className="mx-2">•</span>
                  <span>{athlete.sport}</span>
                </div>
                <div className="flex items-center mt-1">
                  <Badge
                    variant="outline"
                    className="bg-secondary/10 text-secondary mr-2"
                  >
                    <i className="fas fa-trophy mr-1 text-xs"></i>
                    Top 10 in {athlete.tier}
                  </Badge>
                  <div className="text-xs text-muted-foreground">
                    <i className="fas fa-map-marker-alt mr-1"></i>
                    {athlete.location} • {athlete.club}
                  </div>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mt-4 border-b w-full justify-start rounded-none">
                <TabsTrigger
                  value="performance"
                  className="tab-active data-[state=active]:tab-active data-[state=inactive]:tab-inactive"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger
                  value="training"
                  className="tab-inactive data-[state=active]:tab-active data-[state=inactive]:tab-inactive"
                >
                  Training
                </TabsTrigger>
                <TabsTrigger
                  value="videos"
                  className="tab-inactive data-[state=active]:tab-active data-[state=inactive]:tab-inactive"
                >
                  Videos
                </TabsTrigger>
                <TabsTrigger
                  value="reports"
                  className="tab-inactive data-[state=active]:tab-active data-[state=inactive]:tab-inactive"
                >
                  Reports
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Real-Time Tracking */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Real-Time Tracking
            </CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary">
              • Live
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">
              Sprint Interval Training
            </div>
            <div className="text-xs text-muted-foreground">
              Coach: Anand Mehta
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <div className="text-lg font-semibold">
                  1.7<span className="text-xs align-text-top">m/s</span>
                </div>
                <div className="text-xs text-muted-foreground">Speed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  750<span className="text-xs align-text-top">m</span>
                </div>
                <div className="text-xs text-muted-foreground">Distance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold">
                  142<span className="text-xs align-text-top">bpm</span>
                </div>
                <div className="text-xs text-muted-foreground">Heart Rate</div>
              </div>
            </div>

            <div className="mt-3">
              <div className="text-xs text-muted-foreground mb-1">
                Movement Heatmap
              </div>
              <div className="h-24 bg-gradient-to-r from-blue-100 via-red-300 to-red-500 rounded-lg"></div>
            </div>
          </CardContent>
        </Card>

        {/* AI Performance Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              AI Performance Breakdown
            </CardTitle>
            <div className="flex gap-1">
              <Button
                size="sm"
                className="w-5 h-5 bg-secondary text-white rounded-full text-xs flex items-center justify-center p-0"
              >
                W
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-5 h-5 rounded-full text-xs flex items-center justify-center p-0"
              >
                M
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-5 h-5 rounded-full text-xs flex items-center justify-center p-0"
              >
                Y
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm">Speed</div>
                <div className="text-xs text-primary font-medium">
                  {athlete.metrics.speed.value}{" "}
                  <i className="fas fa-arrow-up ml-1"></i>{" "}
                  {athlete.metrics.speed.change}
                </div>
              </div>
              <Progress
                value={athlete.metrics.speed.value}
                className="h-2"
              />
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm">Agility</div>
                <div className="text-xs text-primary font-medium">
                  {athlete.metrics.agility.value}{" "}
                  <i className="fas fa-arrow-up ml-1"></i>{" "}
                  {athlete.metrics.agility.change}
                </div>
              </div>
              <Progress
                value={athlete.metrics.agility.value}
                className="h-2"
              />
            </div>

            <div className="mt-4 p-2 bg-danger/10 rounded-lg">
              <div className="text-xs text-danger font-medium mb-1">
                Form Error: Arm Angle
              </div>
              <div className="h-32 bg-neutral-900 rounded-lg flex items-center justify-center">
                {/* Simple stick figure visualization */}
                <div className="relative w-16 h-24">
                  <div className="absolute w-2 h-2 rounded-full bg-muted left-7 top-0"></div>
                  <div className="absolute w-1 h-12 bg-muted left-8 top-2"></div>
                  <div className="absolute w-8 h-1 bg-danger transform rotate-45 left-3 top-6"></div>
                  <div className="absolute w-8 h-1 bg-muted transform -rotate-45 left-8 top-6"></div>
                  <div className="absolute w-1 h-10 bg-muted left-8 top-14 transform rotate-12"></div>
                  <div className="absolute w-1 h-10 bg-muted left-8 top-14 transform -rotate-12"></div>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                className="text-xs text-muted-foreground w-full mt-1"
              >
                <i className="fas fa-cube mr-1"></i> View in 3D
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Match & Training Stats */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Match & Training Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">
                Recent Performance
              </div>
              <div className="flex justify-between items-center mt-1">
                <div>
                  <div className="font-medium">
                    {athlete.recentPerformance.event}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {athlete.recentPerformance.date}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-secondary/10 text-secondary"
                >
                  {athlete.recentPerformance.position}
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <div className="text-sm font-semibold">
                    {athlete.recentPerformance.metrics.time}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Time (50m)
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">
                    {athlete.recentPerformance.metrics.turnSpeed}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Turn Speed
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-semibold">
                    {athlete.recentPerformance.metrics.dps}
                  </div>
                  <div className="text-xs text-muted-foreground">DPS</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Recovery Status
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Muscle Recovery</span>
                  <span>{athlete.recovery.muscle}%</span>
                </div>
                <Progress value={athlete.recovery.muscle} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Hydration</span>
                  <span>{athlete.recovery.hydration}%</span>
                </div>
                <Progress value={athlete.recovery.hydration} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 pb-4">
        <PerformanceChart data={performanceData} title="Performance Trends" />
      </div>

      <div className="px-4 pb-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Coach Tools:</div>
        <div className="flex space-x-2">
          <Button className="bg-secondary text-white">Shortlist Player</Button>
          <Button variant="outline">Compare</Button>
          <Button variant="outline">Schedule Trial</Button>
          <Button variant="outline">
            <i className="fas fa-file-download"></i> Report
          </Button>
        </div>
      </div>
    </>
  );
}
