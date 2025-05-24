import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceChart } from "@/components/analytics/performance-chart";
import { StatsCard } from "@/components/analytics/stats-card";
import { DistributionChart } from "@/components/analytics/distribution-chart";
import { getInitials } from "@/lib/utils";
import { Stat, PieChartData, BarChartData } from "@/types";

// Mock data
const performanceData = [
  { month: "Jan", accuracy: 65, stamina: 50, technique: 60 },
  { month: "Feb", accuracy: 68, stamina: 53, technique: 65 },
  { month: "Mar", accuracy: 70, stamina: 58, technique: 70 },
  { month: "Apr", accuracy: 72, stamina: 62, technique: 73 },
  { month: "May", accuracy: 77, stamina: 68, technique: 76 },
  { month: "Jun", accuracy: 82, stamina: 74, technique: 80 },
  { month: "Jul", accuracy: 85, stamina: 80, technique: 83 },
];

const statsData: Stat[] = [
  { 
    label: "Accuracy", 
    value: "85%", 
    change: 1, 
    changeType: "increase", 
    icon: "fa-bullseye" 
  },
  { 
    label: "Stamina", 
    value: "80%", 
    change: 2, 
    changeType: "increase", 
    icon: "fa-bolt" 
  },
  { 
    label: "Technique", 
    value: "83%", 
    change: 2, 
    changeType: "increase", 
    icon: "fa-sliders-h" 
  },
  { 
    label: "This Week", 
    value: "18h", 
    change: 20, 
    changeType: "decrease", 
    icon: "fa-clock" 
  },
];

const targetDistributionData: PieChartData[] = [
  { name: "Bullseye", value: 32, color: "hsl(var(--primary))" },
  { name: "Inner Ring", value: 38, color: "hsl(var(--accent))" },
  { name: "Middle Ring", value: 15, color: "hsl(var(--warning))" },
  { name: "Outer Ring", value: 15, color: "hsl(var(--danger))" },
];

const trainingFocusData: BarChartData[] = [
  { name: "Stance", value: 30 },
  { name: "Aim", value: 50 },
  { name: "Release", value: 40 },
  { name: "Strength", value: 20 },
  { name: "Mental", value: 25 },
];

const recentSessions = [
  { 
    date: new Date(2025, 2, 28), 
    focus: "Accuracy Training", 
    duration: "2h 15m", 
    intensity: 80, 
    performance: 9.2 
  },
  { 
    date: new Date(2025, 2, 27), 
    focus: "Stance & Balance", 
    duration: "1h 45m", 
    intensity: 60, 
    performance: 8.7 
  },
  { 
    date: new Date(2025, 2, 25), 
    focus: "Strength & Stamina", 
    duration: "2h 30m", 
    intensity: 90, 
    performance: 7.9 
  },
  { 
    date: new Date(2025, 2, 23), 
    focus: "Competition Prep", 
    duration: "3h 00m", 
    intensity: 75, 
    performance: 9.5 
  },
];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <Helmet>
        <title>Analytics | Ekalavya</title>
        <meta name="description" content="Track your performance metrics, training focus, and session analytics with Ekalavya's comprehensive analytics dashboard." />
      </Helmet>

      <div className="bg-secondary p-3 flex items-center justify-between shadow">
        <div className="flex items-center">
          <button className="md:hidden mr-2 text-white">
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="text-white font-medium">Training Analytics</h1>
        </div>
        <div>
          <button className="text-white flex items-center justify-center h-8 w-8">
            <i className="fas fa-print"></i>
          </button>
        </div>
      </div>

      <div className="bg-background border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto">
            <TabsTrigger 
              value="overview" 
              className={`py-3 px-4 font-medium text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none`}
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className={`py-3 px-4 font-medium text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none`}
            >
              Progress
            </TabsTrigger>
            <TabsTrigger 
              value="sessions" 
              className={`py-3 px-4 font-medium text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none`}
            >
              Sessions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="p-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Avatar className="w-14 h-14 mr-4">
                <AvatarFallback className="bg-neutral-200">
                  {getInitials("Arjun Sharma")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-lg font-medium">Arjun Sharma</h2>
                <p className="text-sm text-muted-foreground">Advanced Archer</p>
                <div className="flex items-center mt-1">
                  <div className="text-xs text-primary font-medium">
                    <i className="fas fa-arrow-up mr-1"></i>+18% Improvement
                  </div>
                  <div className="ml-2 px-2 py-1 bg-primary/10 text-primary/90 text-xs rounded flex items-center">
                    <i className="fas fa-trophy mr-1 text-xs"></i>
                    Top Performer
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-semibold">875</div>
                <div className="text-xs text-muted-foreground">Total Training Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          {statsData.map((stat, index) => (
            <StatsCard key={index} stat={stat} />
          ))}
        </div>
        
        <PerformanceChart data={performanceData} title="Performance Trends" />
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-4">Training Focus (Hours)</h3>
              <div className="h-40 flex items-end space-x-6 pl-6">
                {trainingFocusData.map((item, index) => (
                  <div className="flex flex-col items-center" key={index}>
                    <div 
                      className="w-12 bg-secondary rounded-t" 
                      style={{ height: `${item.value}%` }}
                    ></div>
                    <span className="text-xs mt-1">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <DistributionChart 
            data={targetDistributionData}
            title="Target Distribution"
          />
        </div>
        
        <Card className="mt-4">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-4">Recent Sessions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-muted">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Focus</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Intensity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-muted">
                  {recentSessions.map((session, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                        {session.date.toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {session.focus}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {session.duration}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-24 h-2 bg-muted rounded-full">
                          <div 
                            className="h-2 bg-secondary rounded-full" 
                            style={{ width: `${session.intensity}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${session.performance >= 9 ? 'text-primary-600' : 'text-muted-foreground'}`}>
                        {session.performance.toFixed(1)}/10
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
