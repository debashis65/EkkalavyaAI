import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface BadmintonTrackerProps {
  recentSessions: ARMetrics[];
  metrics: Record<string, number | string>;
}

export function BadmintonTracker({ recentSessions, metrics }: BadmintonTrackerProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-purple-600 flex flex-row items-center justify-between p-3">
          <div className="flex items-center text-white">
            <i className="fas fa-shuttlecock mr-2"></i>
            <h1 className="font-medium">Badminton AR Analysis</h1>
          </div>
          <Button variant="secondary" className="bg-white text-purple-600 hover:bg-white/90">
            Live Demo
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-purple-900 rounded-lg p-4 relative">
            <div className="flex justify-between items-center text-white mb-2 text-xs">
              <span className="bg-red-600 px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                REC 00:58
              </span>
            </div>
            <div className="h-[160px] relative flex items-center justify-center">
              {/* Badminton Court Visualization */}
              <div className="relative w-[90%] h-32">
                {/* Court outline */}
                <div className="absolute inset-0 border-2 border-white"></div>
                {/* Net */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white transform -translate-x-1/2"></div>
                {/* Service courts */}
                <div className="absolute top-1/4 left-0 right-1/2 h-0.5 bg-white"></div>
                <div className="absolute bottom-1/4 left-0 right-1/2 h-0.5 bg-white"></div>
                <div className="absolute top-1/4 left-1/2 right-0 h-0.5 bg-white"></div>
                <div className="absolute bottom-1/4 left-1/2 right-0 h-0.5 bg-white"></div>
                {/* Center service line */}
                <div className="absolute top-1/4 bottom-1/4 left-1/4 w-0.5 bg-white"></div>
                <div className="absolute top-1/4 bottom-1/4 right-1/4 w-0.5 bg-white"></div>
                {/* Player position */}
                <div className="absolute bottom-4 left-1/4 w-3 h-3 bg-purple-400 rounded-full"></div>
                {/* Shuttlecock trajectory */}
                <div className="absolute top-6 right-1/3 w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="text-white text-xs text-center absolute bottom-2">
                Court Camera View - Smash Analysis
              </div>
              <div className="absolute right-4 top-4 bg-black bg-opacity-70 p-2 rounded text-white text-xs">
                <div>Smash Speed: 85 mph</div>
                <div>Jump Height: 18 cm</div>
                <div>Wrist Snap: 94%</div>
                <div>Follow Through: 88%</div>
                <div>Court Position: 91%</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4 mb-6">
            {[
              { icon: "fa-bolt", label: "Smash", active: true },
              { icon: "fa-feather", label: "Drop Shot", active: false },
              { icon: "fa-arrow-up", label: "Clear", active: false },
              { icon: "fa-running", label: "Footwork", active: false }
            ].map((item, index) => (
              <button 
                key={index}
                className="flex flex-col items-center text-xs"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  item.active 
                    ? "bg-purple-600/20 text-purple-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className={item.active ? "text-purple-400" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Smash Power</span>
              <span className="font-medium text-purple-400">94%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Court Coverage</span>
              <span className="font-medium text-green-400">91%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reaction Time</span>
              <span className="font-medium text-yellow-400">0.18s</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}