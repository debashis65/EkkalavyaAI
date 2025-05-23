import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Camera, BarChart3, Download, Upload } from "lucide-react";

export default function ARTools() {
  const [selectedSport, setSelectedSport] = useState("basketball");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-orange-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6" />
          <h1 className="text-xl font-semibold">
            {selectedSport === "basketball" ? "Advanced Motion Tracking" : "Swimming AR Analysis"}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Button className="bg-orange-700 hover:bg-orange-800">
            AI Analysis
          </Button>
        </div>
      </div>

      {/* Sport Selection */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex gap-4">
          <Button
            variant={selectedSport === "basketball" ? "default" : "outline"}
            onClick={() => setSelectedSport("basketball")}
            className={selectedSport === "basketball" ? "bg-orange-600" : ""}
          >
            Basketball
          </Button>
          <Button
            variant={selectedSport === "swimming" ? "default" : "outline"}
            onClick={() => setSelectedSport("swimming")}
            className={selectedSport === "swimming" ? "bg-orange-600" : ""}
          >
            Swimming
          </Button>
        </div>
      </div>

      {selectedSport === "basketball" ? (
        <BasketballAnalysis isAnalyzing={isAnalyzing} setIsAnalyzing={setIsAnalyzing} />
      ) : (
        <SwimmingAnalysis isAnalyzing={isAnalyzing} setIsAnalyzing={setIsAnalyzing} />
      )}
    </div>
  );
}

function BasketballAnalysis({ isAnalyzing, setIsAnalyzing }: { isAnalyzing: boolean; setIsAnalyzing: (val: boolean) => void }) {
  return (
    <div className="flex">
      {/* Main Video Area */}
      <div className="flex-1 p-6">
        <div className="bg-gray-800 rounded-lg h-96 flex items-center justify-center mb-6 relative">
          {/* Player Name */}
          <div className="absolute top-4 left-4 text-white">
            <h3 className="font-semibold">Player: Marcus Johnson</h3>
            <p className="text-sm text-gray-300">Jump Shot Analysis</p>
          </div>

          {/* Analysis Metrics Overlay */}
          <div className="absolute top-4 right-4 text-right">
            <div className="space-y-1 text-sm">
              <div>Release Height: <span className="text-green-400">8'2" (+2")</span></div>
              <div>Release Angle: <span className="text-yellow-400">42° (Optimal: 45°)</span></div>
              <div>Elbow Alignment: <span className="text-red-400">85% (-3%)</span></div>
              <div>Balance: <span className="text-green-400">78% (-2%)</span></div>
              <div>Follow Through: <span className="text-red-400">82% (-4%)</span></div>
            </div>
          </div>

          {/* Skeleton overlay placeholder */}
          <div className="text-gray-400 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4" />
            <p>Basketball Motion Analysis</p>
            <p className="text-sm">Upload video or start live analysis</p>
          </div>

          {/* Feedback Popup */}
          {isAnalyzing && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-orange-600 text-white px-4 py-2 rounded-lg">
                Elbow angle needs adjustment
              </div>
            </div>
          )}
        </div>

        {/* Video Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsAnalyzing(!isAnalyzing)}
          >
            <Play className="w-4 h-4" />
            {isAnalyzing ? "00:04 / 00:13" : "Start Analysis"}
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload Video
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Data
          </Button>
        </div>

        {/* Analysis Tabs */}
        <div className="border-b border-gray-700 mb-4">
          <div className="flex gap-6">
            <button className="pb-2 border-b-2 border-orange-600 text-orange-600">Shooting</button>
            <button className="pb-2 text-gray-400 hover:text-white">Dribbling</button>
            <button className="pb-2 text-gray-400 hover:text-white">Movement</button>
            <button className="pb-2 text-gray-400 hover:text-white">Defense</button>
          </div>
        </div>

        {/* AI Motion Analysis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI Motion Analysis</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                ✓
              </div>
              <div>
                <h4 className="font-medium text-green-400">Follow through is excellent</h4>
                <p className="text-sm text-gray-300">Full extension with proper wrist snap creates optimal backspin. Continue to emphasize this technique.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                ⚠
              </div>
              <div>
                <h4 className="font-medium text-yellow-400">Elbow alignment needs adjustment</h4>
                <p className="text-sm text-gray-300">Your shooting elbow is slightly out at a +2° angle. Try to keep it at 45° for better accuracy and consistency.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                ✗
              </div>
              <div>
                <h4 className="font-medium text-red-400">Balance is shifting during release</h4>
                <p className="text-sm text-gray-300">Your weight distribution is uneven (70%). Focus on maintaining a stable base through the entire shot motion.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Drills */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recommended Drills</h3>
            <Button variant="ghost" size="sm" className="text-orange-400">View All ›</Button>
          </div>
          
          <Card className="bg-gray-800 border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                ⚡
              </div>
              <div className="flex-1">
                <h4 className="font-medium">Form Shooting Drill</h4>
                <p className="text-sm text-gray-400">Focus on elbow alignment and balance</p>
              </div>
              <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                Add to Plan
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SwimmingAnalysis({ isAnalyzing, setIsAnalyzing }: { isAnalyzing: boolean; setIsAnalyzing: (val: boolean) => void }) {
  return (
    <div className="p-6">
      {/* Swimming Video Analysis */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg h-48 flex items-center justify-center mb-6 relative overflow-hidden">
        <div className="absolute top-4 left-4 text-white text-sm">
          <span className="bg-red-600 px-2 py-1 rounded">REC 00:32</span>
        </div>
        
        <div className="absolute top-4 right-4 text-right text-white text-sm">
          <div>Pull Angle: 75°</div>
          <div>Target: 78°</div>
        </div>

        <div className="absolute bottom-4 right-4 text-white text-sm">
          <div>Stroke Rate: 32 spm</div>
          <div>Efficiency: 85%</div>
          <div>DPS: 1.85m</div>
        </div>

        {/* Underwater camera view indicator */}
        <div className="text-center text-white">
          <div className="text-sm mb-2">Underwater Camera View</div>
          <div className="text-lg">🏊‍♂️ Freestyle Technique</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button className="bg-orange-600 hover:bg-orange-700">📹 Record</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">📊 Analyze</Button>
        <Button className="bg-green-600 hover:bg-green-700">✅ Submit</Button>
      </div>

      {/* Recent Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Swimming Analysis</h3>
          <Button variant="ghost" size="sm" className="text-orange-400">View All</Button>
        </div>

        <div className="space-y-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Freestyle Technique</h4>
                  <p className="text-sm text-gray-400">Today, 13:45</p>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">+2% Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Turn Analysis</h4>
                  <p className="text-sm text-gray-400">Yesterday, 11:30</p>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-semibold">-0.4s Improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Swimming Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">32</div>
              <div className="text-sm text-gray-400">SWOLF</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">31.2s</div>
              <div className="text-sm text-gray-400">50m Split</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">1.85m</div>
              <div className="text-sm text-gray-400">DPS</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">0.82</div>
              <div className="text-sm text-gray-400">Drag Factor</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}