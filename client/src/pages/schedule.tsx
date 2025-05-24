import { useState } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Session } from "@/types";
import { formatTime } from "@/lib/utils";

// Mock sessions data
const sessionData: Session[] = [
  {
    id: 1,
    title: "Technical Session",
    startTime: new Date(new Date().setHours(9, 0, 0)),
    endTime: new Date(new Date().setHours(10, 0, 0)),
    athlete: { id: 1, name: "Arjun Sharma", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "technical"
  },
  {
    id: 2,
    title: "Performance Review",
    startTime: new Date(new Date().setHours(14, 30, 0)),
    endTime: new Date(new Date().setHours(15, 30, 0)),
    athlete: { id: 3, name: "Priya Patel", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "performance_review"
  },
  {
    id: 3,
    title: "Form Correction",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(10, 15, 0),
    endTime: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(11, 15, 0),
    athlete: { id: 4, name: "Raj Kumar", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "form_correction"
  },
  {
    id: 4,
    title: "Strategy Session",
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(15, 45, 0),
    endTime: new Date(new Date().setDate(new Date().getDate() + 1)).setHours(16, 45, 0),
    athlete: { id: 5, name: "Ananya Singh", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "strategy"
  },
  {
    id: 5,
    title: "Mental Training",
    startTime: new Date(new Date().setDate(new Date().getDate() + 6)).setHours(8, 30, 0),
    endTime: new Date(new Date().setDate(new Date().getDate() + 6)).setHours(9, 30, 0),
    athlete: { id: 6, name: "Vikram Mehta", role: "athlete", email: "", sports: [] },
    coach: { id: 2, name: "Guru Drona", role: "coach", email: "", sports: [] },
    status: "upcoming",
    type: "mental"
  }
];

export default function Schedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showBookDialog, setShowBookDialog] = useState(false);
  const { toast } = useToast();

  // Filter sessions for the selected date
  const selectedDateSessions = sessionData.filter(session => {
    if (!date) return false;
    
    const sessionDate = new Date(session.startTime);
    return (
      sessionDate.getDate() === date.getDate() &&
      sessionDate.getMonth() === date.getMonth() &&
      sessionDate.getFullYear() === date.getFullYear()
    );
  });

  const handleBookSession = () => {
    toast({
      title: "Session Booked",
      description: "Your training session has been booked successfully.",
    });
    setShowBookDialog(false);
  };

  return (
    <>
      <Helmet>
        <title>Schedule | Ekalavya</title>
        <meta name="description" content="View and manage your training sessions, book new sessions, and keep track of your schedule with Ekalavya." />
      </Helmet>

      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Training Schedule</h1>
          <Button onClick={() => setShowBookDialog(true)}>
            <i className="fas fa-plus mr-2"></i> Book Session
          </Button>
        </div>

        <div className="grid md:grid-cols-[300px_1fr] gap-4">
          <Card>
            <CardContent className="p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {date?.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDateSessions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <i className="fas fa-calendar-day text-3xl mb-2"></i>
                    <p>No sessions scheduled for this day</p>
                    <Button 
                      variant="link" 
                      onClick={() => setShowBookDialog(true)} 
                      className="mt-2"
                    >
                      Book a session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateSessions.map((session) => (
                      <div 
                        key={session.id}
                        className="flex border-l-2 border-secondary pl-3 py-2"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {formatTime(session.startTime)} - {formatTime(session.endTime)} • {session.title}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {session.type === "technical" ? "Coach" : "With"}: {session.coach.name}
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Button size="sm" variant="outline">
                            <i className="fas fa-video mr-1"></i> Join
                          </Button>
                          <Button size="sm" variant="destructive">
                            <i className="fas fa-times mr-1"></i> Cancel
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessionData.slice(0, 3).map((session) => (
                    <div 
                      key={session.id}
                      className="flex border-l-2 border-primary pl-3 py-2"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {session.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(session.startTime).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })} • {formatTime(session.startTime)}
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <i className="far fa-calendar-alt mr-1"></i> Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showBookDialog} onOpenChange={setShowBookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book a Training Session</DialogTitle>
            <DialogDescription>
              Schedule a new training session with your coach.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="session-type" className="text-right">
                Session Type
              </Label>
              <select
                id="session-type"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="technical">Technical Training</option>
                <option value="performance_review">Performance Review</option>
                <option value="form_correction">Form Correction</option>
                <option value="strategy">Strategy Session</option>
                <option value="mental">Mental Training</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coach" className="text-right">
                Coach
              </Label>
              <select
                id="coach"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="1">Guru Drona</option>
                <option value="2">Rajiv Sharma</option>
                <option value="3">Pradeep Kumar</option>
                <option value="4">Sunita Devi</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                className="col-span-3"
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="time" className="text-right">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                className="col-span-3"
                defaultValue="16:00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <select
                id="duration"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                <option value="30">30 minutes</option>
                <option value="60" selected>1 hour</option>
                <option value="90">1 hour 30 minutes</option>
                <option value="120">2 hours</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                Notes
              </Label>
              <textarea
                id="notes"
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                placeholder="Any specific areas you want to focus on?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookSession}>Book Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
