import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ARMetrics } from "@/types";
import { cn } from "@/lib/utils";

interface BoxingTrackerProps {
  recentSessions: ARMetrics[];
  metrics: Record<string, number | string>;
}

export function BoxingTracker({ recentSessions, metrics }: BoxingTrackerProps) {
  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-800 flex flex-row items-center justify-between p-3">
          <div className="flex items-center text-white">
            <i className="fas fa-fist-raised mr-2"></i>
            <h1 className="font-medium">Boxing AR Analysis</h1>
          </div>
          <Button variant="secondary" className="bg-white text-gray-800 hover:bg-white/90">
            Live Demo
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="bg-gray-900 rounded-lg p-4 relative">
            <div className="flex justify-between items-center text-white mb-2 text-xs">
              <span className="bg-red-600 px-2 py-1 rounded-full flex items-center">
                <span className="w-2 h-2 bg-white rounded-full mr-1"></span>
                REC 02:45
              </span>
            </div>
            <div className="h-[160px] relative flex items-center justify-center">
              <div className="relative w-[90%] h-32">
                {/* Boxing ring */}
                <div className="absolute inset-2 border-2 border-red-500"></div>
                {/* Corner posts */}
                <div className="absolute top-0 left-0 w-2 h-2 bg-red-500"></div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-red-500"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-red-500"></div>
                {/* Boxer position */}
                <div className="absolute bottom-8 left-1/3 w-3 h-3 bg-red-400 rounded-full"></div>
                {/* Heavy bag */}
                <div className="absolute top-4 right-1/3 w-4 h-16 bg-yellow-700 rounded"></div>
                {/* Punch trajectory */}
                <div className="absolute bottom-6 left-2/5 w-1 h-8 bg-red-400 transform rotate-45"></div>
              </div>
              <div className="text-white text-xs text-center absolute bottom-2">
                Ring Camera View - Heavy Bag Training
              </div>
              <div className="absolute right-4 top-4 bg-black bg-opacity-70 p-2 rounded text-white text-xs">
                <div>Punch Speed: 12 m/s</div>
                <div>Power: 850 N</div>
                <div>Accuracy: 89%</div>
                <div>Guard Position: 92%</div>
                <div>Footwork: 85%</div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-around mt-4 mb-6">
            {[
              { icon: "fa-fist-raised", label: "Punching", active: true },
              { icon: "fa-shield-alt", label: "Defense", active: false },
              { icon: "fa-running", label: "Footwork", active: false },
              { icon: "fa-bullseye", label: "Accuracy", active: false }
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
              <span className="text-muted-foreground">Punch Power</span>
              <span className="font-medium text-red-400">850 N</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-medium text-green-400">89%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Guard Score</span>
              <span className="font-medium text-yellow-400">92%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}