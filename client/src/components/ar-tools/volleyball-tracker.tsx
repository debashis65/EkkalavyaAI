import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface VolleyballTrackerProps {
  recentSessions: ARMetrics[];
  metrics: Record<string, number | string>;
}

export function VolleyballTracker({ recentSessions, metrics }: VolleyballTrackerProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-red-600 flex flex-row items-center justify-between p-3">
          <div className="flex items-center text-white">
            <i className="fas fa-volleyball-ball mr-2"></i>
            <h1 className="font-medium">Volleyball AR Analysis</h1>
          </div>
          <Button variant="secondary" className="bg-white text-red-600 hover:bg-white/90">
            Live Demo
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-red-900 rounded-lg p-4 relative">
            <div className="flex justify-between items-center text-white mb-2 text-xs">
              <span className="bg-red-600 px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                REC 01:08
              </span>
            </div>
            <div className="h-[160px] relative flex items-center justify-center">
              <div className="relative w-[90%] h-32">
                {/* Court outline */}
                <div className="absolute inset-0 border-2 border-white"></div>
                {/* Net */}
                <div className="absolute top-0 bottom-0 left-1/2 w-1 bg-white transform -translate-x-1/2"></div>
                {/* Attack line */}
                <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-white"></div>
                <div className="absolute top-0 bottom-0 right-1/4 w-0.5 bg-white"></div>
                {/* Player positions */}
                <div className="absolute bottom-6 left-1/6 w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="absolute bottom-6 left-2/6 w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="absolute bottom-6 left-3/6 w-2 h-2 bg-red-400 rounded-full"></div>
                {/* Ball position */}
                <div className="absolute top-4 left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2"></div>
              </div>
              <div className="text-white text-xs text-center absolute bottom-2">
                Court Camera View - Spike Analysis
              </div>
              <div className="absolute right-4 top-4 bg-black bg-opacity-70 p-2 rounded text-white text-xs">
                <div>Jump Height: 32 cm</div>
                <div>Attack Speed: 68 mph</div>
                <div>Hit Angle: 15°</div>
                <div>Timing: 94%</div>
                <div>Approach: 89%</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4 mb-6">
            {[
              { icon: "fa-hand-rock", label: "Spike", active: true },
              { icon: "fa-shield-alt", label: "Block", active: false },
              { icon: "fa-paper-plane", label: "Serve", active: false },
              { icon: "fa-hands", label: "Set", active: false }
            ].map((item, index) => (
              <button 
                key={index}
                className="flex flex-col items-center text-xs"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  item.active 
                    ? "bg-red-600/20 text-red-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className={item.active ? "text-red-400" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Attack Success</span>
              <span className="font-medium text-red-400">78%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jump Height</span>
              <span className="font-medium text-green-400">32 cm</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Timing Score</span>
              <span className="font-medium text-yellow-400">94%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}