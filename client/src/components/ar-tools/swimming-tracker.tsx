import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface SwimmingTrackerProps {
  recentSessions: ARMetrics[];
  metrics: Record<string, number | string>;
}

export function SwimmingTracker({ recentSessions, metrics }: SwimmingTrackerProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-secondary flex flex-row items-center justify-between p-3">
          <div className="flex items-center text-white">
            <i className="fas fa-swimming-pool mr-2"></i>
            <h1 className="font-medium">Swimming AR Analysis</h1>
          </div>
          <Button variant="secondary" className="bg-white text-secondary hover:bg-white/90">
            Live Demo
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-secondary-600 rounded-lg p-4 relative">
            <div className="flex justify-between items-center text-white mb-2 text-xs">
              <span className="bg-destructive px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                REC 00:32
              </span>
            </div>
            <div className="h-[150px] relative flex items-center justify-center">
              <div className="relative w-[80%] h-20">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-secondary transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-[20%] w-[30px] h-0.5 bg-accent transform -translate-y-1/2 -rotate-20 origin-left"></div>
                <div className="absolute top-1/2 left-[60%] w-[30px] h-0.5 bg-accent transform -translate-y-1/2 rotate-20 origin-left"></div>
              </div>
              <div className="text-white text-xs text-center absolute bottom-2">
                Underwater Camera View
              </div>
              <div className="absolute right-4 top-4 bg-black bg-opacity-70 p-2 rounded text-white text-xs">
                <div>Pull Angle: 75°</div>
                <div>Target: 78°</div>
                <div>Stroke Rate: 32 spm</div>
                <div>Efficiency: 85%</div>
                <div>DPS: 1.85m</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4 mb-6">
            {[
              { icon: "fa-hand-paper", label: "Stroke", active: true },
              { icon: "fa-sync", label: "Turns", active: false },
              { icon: "fa-stopwatch", label: "Timing", active: false },
              { icon: "fa-child", label: "Body Position", active: false }
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
            <Button className="flex-1 mr-2 bg-accent hover:bg-accent/90">
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
            <h3 className="text-sm font-medium">Recent Swimming Analysis</h3>
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
                <i className={`fas ${index === 0 ? 'fa-tint' : 'fa-undo'}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">
                      {index === 0 ? 'Freestyle Technique' : 'Turn Analysis'}
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
                    {session.improvement > 0 ? '+' : ''}{session.improvement}% {index === 0 ? 'Efficiency' : 'Improvement'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(metrics).map(([key, value], index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center mb-2">
                <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary flex items-center justify-center mr-2">
                  <i className={`fas ${getIconForMetric(key)}`}></i>
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatMetricName(key)}
                </span>
              </div>
              <div className="text-2xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function getIconForMetric(metric: string): string {
  switch (metric) {
    case 'SWOLF':
      return 'fa-water';
    case '50mSplit':
      return 'fa-stopwatch';
    case 'DPS':
      return 'fa-ruler';
    case 'dragFactor':
      return 'fa-tachometer-alt';
    default:
      return 'fa-chart-bar';
  }
}

function formatMetricName(metric: string): string {
  switch (metric) {
    case 'SWOLF':
      return 'SWOLF';
    case '50mSplit':
      return '50m Split';
    case 'DPS':
      return 'DPS';
    case 'dragFactor':
      return 'Drag Factor';
    default:
      return metric;
  }
}
