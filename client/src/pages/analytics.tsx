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

      {/* Mobile-First Header */}
      <div className="bg-secondary p-3 sm:p-4 md:p-6 flex items-center justify-between shadow">
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="md:hidden text-white text-lg">
            ←
          </button>
          <h1 className="text-white font-medium text-base sm:text-lg md:text-xl">Training Analytics</h1>
        </div>
        <div>
          <button className="text-white flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 hover:bg-white/10 rounded">
            📊
          </button>
        </div>
      </div>

      {/* Mobile-First Tabs */}
      <div className="bg-background border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto overflow-x-auto">
            <TabsTrigger 
              value="overview" 
              className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none whitespace-nowrap"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none whitespace-nowrap"
            >
              Progress
            </TabsTrigger>
            <TabsTrigger 
              value="sessions" 
              className="py-2 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none whitespace-nowrap"
            >
              Sessions
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Mobile-First Content */}
      <div className="p-3 sm:p-4 md:p-6">
        {/* Profile Card - Mobile First */}
        <Card className="mb-4 sm:mb-6">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <Avatar className="w-12 h-12 sm:w-14 sm:h-14">
                <AvatarFallback className="bg-neutral-200">
                  {getInitials("Arjun Sharma")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg md:text-xl font-medium">Arjun Sharma</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Advanced Archer</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 sm:mt-2">
                  <div className="text-xs sm:text-sm text-primary font-medium">
                    ↗ +18% Improvement
                  </div>
                  <div className="px-2 py-1 bg-primary/10 text-primary/90 text-xs rounded flex items-center w-fit">
                    🏆 Top Performer
                  </div>
                </div>
              </div>
              <div className="text-right self-start sm:self-center">
                <div className="text-2xl sm:text-3xl font-semibold">875</div>
                <div className="text-xs text-muted-foreground">Total Training Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Grid - Mobile First */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
