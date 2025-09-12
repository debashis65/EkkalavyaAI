import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface ArcheryTrackerProps {
  recentSessions: ARMetrics[];
}

export function ArcheryTracker({ recentSessions }: ArcheryTrackerProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-secondary flex flex-row items-center justify-between p-3">
          <div className="flex items-center text-white">
            <i className="fas fa-camera-retro mr-2"></i>
            <h1 className="font-medium">AR Performance Tracker</h1>
          </div>
          <Button variant="secondary" className="bg-white text-secondary hover:bg-white/90">
            Live Demo
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-neutral-900 rounded-lg p-4 relative">
            <div className="flex justify-between items-center text-white mb-2 text-xs">
              <span className="bg-destructive px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                REC 00:45
              </span>
              <div className="text-right">
                <div>Angle: 42°</div>
                <div>Target: 40°</div>
                <div>Speed: 32 km/h</div>
                <div>Release: 98%</div>
                <div>Form: 95%</div>
              </div>
            </div>
            <div className="h-[200px] relative flex items-center justify-center">
              <div className="relative w-40 h-80">
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[80px] w-[40px] border-2 border-r-0 border-secondary rounded-l-full"></div>
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ml-[18px] w-2 h-[60px] bg-secondary"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 text-white text-xs text-center">
                AR Camera View
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4 mb-6">
            {[
              { icon: "fa-sliders-h", label: "Technique", active: true },
              { icon: "fa-person-booth", label: "Posture", active: false },
              { icon: "fa-bolt", label: "Power", active: false },
              { icon: "fa-redo", label: "Replay", active: false }
            ].map((item, index) => (
              <button 
                key={index}
                className="flex flex-col items-center text-xs"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  item.active 
                    ? "bg-secondary/20 text-secondary" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className={item.active ? "text-secondary" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          
          <div className="flex mb-4">
            <Button variant="outline" className="flex-1 mr-2">
              <i className="fas fa-video mr-1"></i> Record
            </Button>
            <Button variant="secondary" className="flex-1 mr-2">
              <i className="fas fa-chart-line mr-1"></i> Analyze
            </Button>
            <Button variant="outline" className="flex-1">
              <i className="fas fa-check mr-1"></i> Submit
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Recent Tracking Sessions</h3>
            <a href="#" className="text-xs text-primary">View All</a>
          </div>
          
          {recentSessions.map((session, index) => (
            <div 
              key={session.id} 
              className={cn(
                "flex items-center py-2",
                index < recentSessions.length - 1 ? "border-b" : ""
              )}
            >
              <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mr-3">
                <i className={`fas ${session.type === 'archery' ? 'fa-bullseye' : 'fa-bolt'}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">
                      {session.type === 'archery' ? 'Archery Form Analysis' : 'Reaction Time Drill'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(session.timestamp).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        hour: 'numeric', 
                        minute: 'numeric', 
                        hour12: true 
                      })}
                    </div>
                  </div>
                  <div className={cn(
                    "text-xs font-medium",
                    session.improvement > 0 ? "text-primary" : "text-destructive"
                  )}>
                    {session.improvement > 0 ? '+' : ''}{session.improvement}% Improvement
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
