import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface CricketTrackerProps {
  recentSessions: ARMetrics[];
  metrics: Record<string, number | string>;
}

export function CricketTracker({ recentSessions, metrics }: CricketTrackerProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-blue-600 flex flex-row items-center justify-between p-3">
          <div className="flex items-center text-white">
            <i className="fas fa-baseball-ball mr-2"></i>
            <h1 className="font-medium">Cricket AR Analysis</h1>
          </div>
          <Button variant="secondary" className="bg-white text-blue-600 hover:bg-white/90">
            Live Demo
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-blue-900 rounded-lg p-4 relative">
            <div className="flex justify-between items-center text-white mb-2 text-xs">
              <span className="bg-red-600 px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                REC 01:45
              </span>
            </div>
            <div className="h-[160px] relative flex items-center justify-center">
              {/* Cricket Pitch Visualization */}
              <div className="relative w-[90%] h-32">
                {/* Pitch outline */}
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-white transform -translate-y-1/2"></div>
                {/* Wickets */}
                <div className="absolute top-1/2 left-4 w-1 h-8 bg-white transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-4 w-1 h-8 bg-white transform -translate-y-1/2"></div>
                {/* Bowling crease */}
                <div className="absolute top-1/2 left-6 w-8 h-0.5 bg-white transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 right-6 w-8 h-0.5 bg-white transform -translate-y-1/2"></div>
                {/* Batsman position */}
                <div className="absolute top-1/2 right-8 w-3 h-3 bg-yellow-400 rounded-full transform -translate-y-1/2"></div>
                {/* Ball trajectory */}
                <div className="absolute top-1/2 left-12 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2"></div>
              </div>
              <div className="text-white text-xs text-center absolute bottom-2">
                Pitch Camera View - Batting Analysis
              </div>
              <div className="absolute right-4 top-4 bg-black bg-opacity-70 p-2 rounded text-white text-xs">
                <div>Bat Speed: 45 mph</div>
                <div>Footwork: 82%</div>
                <div>Head Position: 88%</div>
                <div>Shot Timing: 91%</div>
                <div>Balance: 85%</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4 mb-6">
            {[
              { icon: "fa-baseball-ball", label: "Batting", active: true },
              { icon: "fa-hand-paper", label: "Bowling", active: false },
              { icon: "fa-running", label: "Fielding", active: false },
              { icon: "fa-bullseye", label: "Wicket Keeping", active: false }
            ].map((item, index) => (
              <button 
                key={index}
                className="flex flex-col items-center text-xs"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  item.active 
                    ? "bg-blue-600/20 text-blue-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className={item.active ? "text-blue-400" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shot Timing</span>
              <span className="font-medium text-green-400">91%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Head Position</span>
              <span className="font-medium text-blue-400">88%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Footwork Score</span>
              <span className="font-medium text-yellow-400">82%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}