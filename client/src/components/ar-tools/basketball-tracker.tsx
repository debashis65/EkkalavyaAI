import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface BasketballTrackerProps {
  recentSessions: ARMetrics[];
  metrics: Record<string, number | string>;
}

export function BasketballTracker({ recentSessions, metrics }: BasketballTrackerProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-orange-600 flex flex-row items-center justify-between p-3">
          <div className="flex items-center text-white">
            <i className="fas fa-basketball-ball mr-2"></i>
            <h1 className="font-medium">Basketball AR Analysis</h1>
          </div>
          <Button variant="secondary" className="bg-white text-orange-600 hover:bg-white/90">
            Live Demo
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-orange-900 rounded-lg p-4 relative">
            <div className="flex justify-between items-center text-white mb-2 text-xs">
              <span className="bg-red-600 px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                REC 01:15
              </span>
            </div>
            <div className="h-[160px] relative flex items-center justify-center">
              {/* Basketball Court Visualization */}
              <div className="relative w-[90%] h-32">
                {/* Court outline */}
                <div className="absolute inset-0 border-2 border-white rounded-lg"></div>
                {/* Free throw line */}
                <div className="absolute top-4 left-1/4 right-1/4 h-0.5 bg-white"></div>
                {/* Three-point arc */}
                <div className="absolute top-0 left-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-8"></div>
                {/* Basketball hoop */}
                <div className="absolute top-2 left-1/2 w-6 h-1 bg-orange-400 rounded transform -translate-x-1/2"></div>
                {/* Player position indicator */}
                <div className="absolute bottom-4 left-1/2 w-3 h-3 bg-yellow-400 rounded-full transform -translate-x-1/2"></div>
              </div>
              <div className="text-white text-xs text-center absolute bottom-2">
                Court Camera View - Shooting Analysis
              </div>
              <div className="absolute right-4 top-4 bg-black bg-opacity-70 p-2 rounded text-white text-xs">
                <div>Shot Arc: 45°</div>
                <div>Target: 48°</div>
                <div>Release: 92%</div>
                <div>Follow Through: 89%</div>
                <div>Balance: 85%</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4 mb-6">
            {[
              { icon: "fa-basketball-ball", label: "Shot Form", active: true },
              { icon: "fa-running", label: "Footwork", active: false },
              { icon: "fa-hand-paper", label: "Dribbling", active: false },
              { icon: "fa-shield-alt", label: "Defense", active: false }
            ].map((item, index) => (
              <button 
                key={index}
                className="flex flex-col items-center text-xs"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mb-1",
                  item.active 
                    ? "bg-orange-600/20 text-orange-400" 
                    : "bg-muted text-muted-foreground"
                )}>
                  <i className={`fas ${item.icon}`}></i>
                </div>
                <span className={item.active ? "text-orange-400" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shot Accuracy</span>
              <span className="font-medium text-orange-400">78%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Release Consistency</span>
              <span className="font-medium text-green-400">92%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Form Score</span>
              <span className="font-medium text-yellow-400">85/100</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}