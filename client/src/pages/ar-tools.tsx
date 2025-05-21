import { useState } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArcheryTracker } from "@/components/ar-tools/archery-tracker";
import { SwimmingTracker } from "@/components/ar-tools/swimming-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";

// Mock AR data
const archeryMetrics: ARMetrics[] = [
  {
    id: 1,
    type: "archery",
    metrics: {
      angle: 42,
      target: 40,
      speed: "32 km/h",
      release: "98%",
      form: "95%",
    },
    improvement: 10,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 2,
    type: "archery",
    metrics: {
      angle: 39,
      target: 40,
      speed: "30 km/h",
      release: "92%",
      form: "90%",
    },
    improvement: 5,
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), // Yesterday
  },
];

const swimmingMetrics: ARMetrics[] = [
  {
    id: 3,
    type: "swimming",
    metrics: {
      pullAngle: 75,
      target: 78,
      strokeRate: "32 spm",
      efficiency: "85%",
      dps: "1.85m",
    },
    improvement: 9,
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
  },
  {
    id: 4,
    type: "swimming",
    metrics: {
      pullAngle: 72,
      target: 78,
      strokeRate: "30 spm",
      efficiency: "82%",
      dps: "1.80m",
    },
    improvement: -0.4,
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000), // Yesterday
  },
];

const swimmingStatsMetrics = {
  SWOLF: 32,
  "50mSplit": "31.2s",
  DPS: "1.85m",
  dragFactor: "0.82",
};

export default function ARTools() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <Helmet>
        <title>AR Performance Tools | Ekalavya</title>
        <meta
          name="description"
          content="Use advanced AR technology to analyze and improve your technique in archery, swimming, and other sports with Ekalavya's performance tracking tools."
        />
      </Helmet>

      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">AR Performance Tools</h1>
          <Button>
            <i className="fas fa-camera mr-2"></i> Start New Session
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="archery">Archery</TabsTrigger>
            <TabsTrigger value="swimming">Swimming</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>AR Performance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Use augmented reality technology to track, analyze, and
                  improve your performance across different sports. Our AR tools
                  provide real-time feedback on your technique, form, and
                  measurements.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                        <i className="fas fa-bullseye text-primary text-2xl"></i>
                      </div>
                      <h3 className="font-medium mb-1">Archery Tracker</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Analyze your stance, release, and accuracy
                      </p>
                      <Button
                        onClick={() => setActiveTab("archery")}
                        variant="outline"
                        className="w-full"
                      >
                        Start Tracking
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-2">
                        <i className="fas fa-swimming-pool text-accent text-2xl"></i>
                      </div>
                      <h3 className="font-medium mb-1">Swimming Analyzer</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Track your stroke, efficiency, and technique
                      </p>
                      <Button
                        onClick={() => setActiveTab("swimming")}
                        variant="outline"
                        className="w-full"
                      >
                        Start Tracking
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-2">
                        <i className="fas fa-running text-secondary text-2xl"></i>
                      </div>
                      <h3 className="font-medium mb-1">Running Form</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Analyze your gait, cadence, and posture
                      </p>
                      <Button disabled variant="outline" className="w-full">
                        Coming Soon
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <i className="fas fa-bullseye text-primary"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Archery Form Analysis</h3>
                        <span className="text-sm text-muted-foreground">
                          Today, 14:30
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Analyzed release angle and form consistency
                      </p>
                      <div className="flex items-center mt-1 text-sm text-primary">
                        <i className="fas fa-arrow-up mr-1"></i>
                        <span>10% improvement from last session</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mr-4">
                      <i className="fas fa-swimming-pool text-accent"></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium">Swimming Stroke Analysis</h3>
                        <span className="text-sm text-muted-foreground">
                          Yesterday, 11:15
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Focused on stroke efficiency and pull pattern
                      </p>
                      <div className="flex items-center mt-1 text-sm text-primary">
                        <i className="fas fa-arrow-up mr-1"></i>
                        <span>8% efficiency improvement</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    View All Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="archery" className="mt-4">
            <ArcheryTracker recentSessions={archeryMetrics} />
          </TabsContent>

          <TabsContent value="swimming" className="mt-4">
            <SwimmingTracker
              recentSessions={swimmingMetrics}
              metrics={swimmingStatsMetrics}
            />
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How AR Tracking Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <i className="fas fa-camera text-primary text-xl"></i>
                </div>
                <h3 className="font-medium mb-1">1. Record</h3>
                <p className="text-sm text-muted-foreground">
                  Use your device's camera to record your form and technique
                  during practice or performance.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-3">
                  <i className="fas fa-chart-line text-accent text-xl"></i>
                </div>
                <h3 className="font-medium mb-1">2. Analyze</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI algorithm analyzes your movements, form, and technique
                  in real-time with precision.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-3">
                  <i className="fas fa-graduation-cap text-secondary text-xl"></i>
                </div>
                <h3 className="font-medium mb-1">3. Improve</h3>
                <p className="text-sm text-muted-foreground">
                  Receive personalized feedback and suggestions to improve your
                  technique and performance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
