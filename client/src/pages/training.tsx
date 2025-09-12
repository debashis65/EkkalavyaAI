import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrainingSession } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";

// Mock training data
const recentSessions: TrainingSession[] = [
  {
    id: 1,
    date: new Date(2025, 2, 28),
    focus: "Accuracy Training",
    duration: "2h 15m",
    intensity: 80,
    performance: 9.2,
  },
  {
    id: 2,
    date: new Date(2025, 2, 27),
    focus: "Stance & Balance",
    duration: "1h 45m",
    intensity: 60,
    performance: 8.7,
  },
  {
    id: 3,
    date: new Date(2025, 2, 25),
    focus: "Strength & Stamina",
    duration: "2h 30m",
    intensity: 90,
    performance: 7.9,
  },
  {
    id: 4,
    date: new Date(2025, 2, 23),
    focus: "Competition Prep",
    duration: "3h 00m",
    intensity: 75,
    performance: 9.5,
  },
];

const trainingPlans = [
  {
    id: 1,
    title: "Archery Mastery",
    description: "Comprehensive program for competitive archers",
    duration: "12 Weeks",
    sessions: 36,
    difficulty: "Advanced",
    coach: "Guru Drona",
    progress: 65,
  },
  {
    id: 2,
    title: "Technique Refinement",
    description: "Focus on perfecting your form and release",
    duration: "4 Weeks",
    sessions: 12,
    difficulty: "Intermediate",
    coach: "Rajiv Sharma",
    progress: 50,
  },
  {
    id: 3,
    title: "Competition Preparation",
    description: "Mental and physical preparation for tournaments",
    duration: "6 Weeks",
    sessions: 18,
    difficulty: "Advanced",
    coach: "Guru Drona",
    progress: 25,
  },
];

const exercises = [
  {
    id: 1,
    name: "Stance Practice",
    description: "Perfect your stance and balance",
    targetReps: 20,
    completedReps: 15,
    sets: 3,
    duration: "15 min",
  },
  {
    id: 2,
    name: "Draw and Hold",
    description: "Strengthen your draw muscles",
    targetReps: 10,
    completedReps: 10,
    sets: 4,
    duration: "20 min",
  },
  {
    id: 3,
    name: "Release Technique",
    description: "Practice smooth, consistent release",
    targetReps: 30,
    completedReps: 22,
    sets: 3,
    duration: "25 min",
  },
  {
    id: 4,
    name: "Target Visualization",
    description: "Mental training for accuracy",
    targetReps: 15,
    completedReps: 10,
    sets: 2,
    duration: "10 min",
  },
];

export default function Training() {
  const [activeTab, setActiveTab] = useState("plans");

  return (
    <>
      <Helmet>
        <title>Training | Ekalavya</title>
        <meta
          name="description"
          content="Access your personalized training plans, track your exercises, and view your training history with Ekalavya."
        />
      </Helmet>

      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Training Center</h1>
          <Button>
            <i className="fas fa-plus mr-2"></i> Add Exercise
          </Button>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full mb-6"
        >
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="plans">Training Plans</TabsTrigger>
            <TabsTrigger value="exercises">Current Exercises</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trainingPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{plan.title}</CardTitle>
                      <Badge>{plan.difficulty}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{plan.progress}%</span>
                    </div>
                    <Progress value={plan.progress} className="mb-4" />

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <i className="fas fa-calendar-alt text-primary mr-2"></i>
                        <span>{plan.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-dumbbell text-primary mr-2"></i>
                        <span>{plan.sessions} Sessions</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-user-tie text-primary mr-2"></i>
                        <span>Coach: {plan.coach}</span>
                      </div>
                      <div className="flex items-center">
                        <i className="fas fa-clock text-primary mr-2"></i>
                        <span>3x Weekly</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button className="flex-1">Continue</Button>
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exercises" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exercises.map((exercise) => (
                <Card key={exercise.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium">{exercise.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {exercise.description}
                        </p>
                      </div>
                      <Badge variant="outline">{exercise.duration}</Badge>
                    </div>

                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        Completion:{" "}
                        {Math.round(
                          (exercise.completedReps / exercise.targetReps) * 100
                        )}
                        %
                      </span>
                      <span>
                        {exercise.completedReps}/{exercise.targetReps} reps
                      </span>
                    </div>
                    <Progress
                      value={
                        (exercise.completedReps / exercise.targetReps) * 100
                      }
                      className="mb-3"
                    />

                    <div className="flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Sets: </span>
                        {exercise.sets}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <i className="fas fa-play mr-1"></i> Start
                        </Button>
                        <Button size="sm">
                          <i className="fas fa-check mr-1"></i> Mark Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Card className="border-dashed border-2 border-muted">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <i className="fas fa-plus-circle text-3xl text-muted-foreground mb-2"></i>
                  <p className="text-muted-foreground mb-3">
                    Add a new exercise to your routine
                  </p>
                  <Button variant="outline">Add Exercise</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Training Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-muted">
                    <thead>
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Focus
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Intensity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Performance
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-muted">
                      {recentSessions.map((session) => (
                        <tr key={session.id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">
                            {formatDate(session.date)}
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
                          <td
                            className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                              session.performance >= 9
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {session.performance.toFixed(1)}/10
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                            <Button size="sm" variant="ghost">
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button size="sm" variant="ghost">
                              <i className="fas fa-download"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex justify-between">
                  <Button variant="outline">
                    <i className="fas fa-filter mr-2"></i> Filter
                  </Button>
                  <Button>View All History</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Training Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-primary/10 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                      <i className="fas fa-fire text-primary text-2xl"></i>
                    </div>
                    <h3 className="font-medium">10-Day Streak</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Completed training 10 days in a row
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-secondary/10 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-2">
                      <i className="fas fa-bullseye text-secondary text-2xl"></i>
                    </div>
                    <h3 className="font-medium">Accuracy Master</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Achieved 90% accuracy in target practice
                    </p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-accent/10 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-2">
                      <i className="fas fa-medal text-accent text-2xl"></i>
                    </div>
                    <h3 className="font-medium">First Competition</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Successfully completed your first competition
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Today's Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3">
                      <i className="fas fa-play"></i>
                    </div>
                    <div>
                      <h3 className="font-medium">Technique Training</h3>
                      <p className="text-xs text-muted-foreground">
                        20 minutes • Stance Focus
                      </p>
                    </div>
                  </div>
                  <Button className="w-full">Start Session</Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center mr-3">
                      <i className="fas fa-video"></i>
                    </div>
                    <div>
                      <h3 className="font-medium">Watch Demo</h3>
                      <p className="text-xs text-muted-foreground">
                        Form Correction • 15 minutes
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Watch Video
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center mr-3">
                      <i className="fas fa-brain"></i>
                    </div>
                    <div>
                      <h3 className="font-medium">Mental Exercise</h3>
                      <p className="text-xs text-muted-foreground">
                        Visualization • 10 minutes
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    Begin Exercise
                  </Button>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
