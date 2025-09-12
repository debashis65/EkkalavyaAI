import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface AthleticsTrackerProps {
  recentSessions: ARMetrics[];
  metrics: Record<string, number | string>;
}

export function AthleticsTracker({ recentSessions, metrics }: AthleticsTrackerProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-indigo-600 flex flex-row items-center justify-between p-3">
          <div className="flex items-center text-white">
            <i className="fas fa-running mr-2"></i>
            <h1 className="font-medium">Athletics AR Analysis</h1>
          </div>
          <Button variant="secondary" className="bg-white text-indigo-600 hover:bg-white/90">
            Live Demo
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-indigo-900 rounded-lg p-4 relative">
            <div className="flex justify-between items-center text-white mb-2 text-xs">
              <span className="bg-red-600 px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                REC 03:15
              </span>
            </div>
            <div className="h-[160px] relative flex items-center justify-center">
              <div className="relative w-[90%] h-32">
                {/* Track lanes */}
                <div className="absolute inset-0 bg-red-800 rounded"></div>
                <div className="absolute top-0 bottom-0 left-1/8 w-0.5 bg-white"></div>
                <div className="absolute top-0 bottom-0 left-2/8 w-0.5 bg-white"></div>
                <div className="absolute top-0 bottom-0 left-3/8 w-0.5 bg-white"></div>
                <div className="absolute top-0 bottom-0 left-4/8 w-0.5 bg-white"></div>
                <div className="absolute top-0 bottom-0 left-5/8 w-0.5 bg-white"></div>
                <div className="absolute top-0 bottom-0 left-6/8 w-0.5 bg-white"></div>
                <div className="absolute top-0 bottom-0 left-7/8 w-0.5 bg-white"></div>
                {/* Runner position */}
                <div className="absolute bottom-8 left-3/8 w-3 h-3 bg-indigo-400 rounded-full"></div>
                {/* Stride pattern */}
                <div className="absolute bottom-6 left-2/8 w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="absolute bottom-6 left-4/8 w-1 h-1 bg-yellow-400 rounded-full"></div>
                <div className="absolute bottom-6 left-5/8 w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="text-white text-xs text-center absolute bottom-2">
                Track Camera View - Sprint Analysis
              </div>
              <div className="absolute right-4 top-4 bg-black bg-opacity-70 p-2 rounded text-white text-xs">
                <div>Speed: 28.5 km/h</div>
                <div>Cadence: 4.2 steps/s</div>
                <div>Stride Length: 1.9m</div>
                <div>Form Score: 87%</div>
                <div>Ground Contact: 0.08s</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4 mb-6">
            {[
              { icon: "fa-running", label: "Sprint", active: true },
              { icon: "fa-stopwatch", label: "Endurance", active: false },
              { icon: "fa-chart-line", label: "Form", active: false },
              { icon: "fa-heartbeat", label: "Pace", active: false }
            ].map((item, index) => (
              <button 
                key={index}
                className="flex flex-col items-center text-xs"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  item.active 
                    ? "bg-indigo-600/20 text-indigo-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className={item.active ? "text-indigo-400" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Running Form</span>
              <span className="font-medium text-indigo-400">87%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cadence</span>
              <span className="font-medium text-green-400">4.2 steps/s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Efficiency</span>
              <span className="font-medium text-yellow-400">92%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}