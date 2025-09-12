import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface FootballTrackerProps {
  recentSessions: ARMetrics[];
  metrics: Record<string, number | string>;
}

export function FootballTracker({ recentSessions, metrics }: FootballTrackerProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-green-600 flex flex-row items-center justify-between p-3">
          <div className="flex items-center text-white">
            <i className="fas fa-futbol mr-2"></i>
            <h1 className="font-medium">Football AR Analysis</h1>
          </div>
          <Button variant="secondary" className="bg-white text-green-600 hover:bg-white/90">
            Live Demo
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-green-800 rounded-lg p-4 relative">
            <div className="flex justify-between items-center text-white mb-2 text-xs">
              <span className="bg-red-600 px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                REC 02:30
              </span>
            </div>
            <div className="h-[160px] relative flex items-center justify-center">
              {/* Football Field Visualization */}
              <div className="relative w-[90%] h-32">
                {/* Field outline */}
                <div className="absolute inset-0 border-2 border-white rounded"></div>
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 w-12 h-12 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                {/* Penalty areas */}
                <div className="absolute top-2 left-2 right-2 h-6 border-2 border-white border-b-0"></div>
                <div className="absolute bottom-2 left-2 right-2 h-6 border-2 border-white border-t-0"></div>
                {/* Player position */}
                <div className="absolute bottom-8 left-1/2 w-3 h-3 bg-yellow-400 rounded-full transform -translate-x-1/2"></div>
                {/* Ball position */}
                <div className="absolute bottom-6 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 translate-x-2"></div>
              </div>
              <div className="text-white text-xs text-center absolute bottom-2">
                Field Camera View - Dribbling Analysis
              </div>
              <div className="absolute right-4 top-4 bg-black bg-opacity-70 p-2 rounded text-white text-xs">
                <div>Ball Control: 88%</div>
                <div>Touch Quality: 91%</div>
                <div>Speed: 24 km/h</div>
                <div>Passing Accuracy: 85%</div>
                <div>First Touch: 87%</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4 mb-6">
            {[
              { icon: "fa-futbol", label: "Ball Control", active: true },
              { icon: "fa-crosshairs", label: "Passing", active: false },
              { icon: "fa-bullseye", label: "Shooting", active: false },
              { icon: "fa-running", label: "Dribbling", active: false }
            ].map((item, index) => (
              <button 
                key={index}
                className="flex flex-col items-center text-xs"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  item.active 
                    ? "bg-green-600/20 text-green-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className={item.active ? "text-green-400" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ball Control</span>
              <span className="font-medium text-green-400">88%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Passing Accuracy</span>
              <span className="font-medium text-blue-400">85%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">First Touch</span>
              <span className="font-medium text-yellow-400">87%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}