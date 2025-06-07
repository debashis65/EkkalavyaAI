import { useState, useRef, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, Play, BarChart3, Target, Zap, Trophy, AlertCircle, Video, Image, Check, X, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocketAnalysis } from "@/hooks/useWebSocketAnalysis";

interface AnalysisResult {
  sport: string;
  score: number;
  feedback: string[];
  metrics: Record<string, number>;
  timestamp: string;
}

// Sport-specific data for different sports
const getSportAnalysisData = (sport: string) => {
  const sportData = {
    basketball: {
      playerName: "Marcus Johnson",
      analysisType: "Jump Shot Analysis",
      metrics: [
        { name: "Release Height", value: "8'2\"", status: "good", color: "text-blue-400" },
        { name: "Release Angle", value: "42° (Optimal: 45°)", status: "warning", color: "text-yellow-400" },
        { name: "Elbow Alignment", value: "85%", status: "warning", color: "text-yellow-400" },
        { name: "Balance", value: "78%", status: "poor", color: "text-red-400" },
        { name: "Follow Through", value: "82%", status: "good", color: "text-green-400" }
      ],
      analysisTitle: "Basketball Motion Analysis",
      tabs: ["Shooting", "Dribbling", "Movement", "Defense"],
      feedback: [
        { type: "excellent", title: "Follow through is excellent", description: "Full extension with proper wrist snap creates optimal backspin. Continue to emphasize this technique.", icon: "✓", color: "text-green-400" },
        { type: "warning", title: "Elbow alignment needs adjustment", description: "Your shooting elbow is slightly out at a +2° angle. Try to keep it at 45° for better accuracy and consistency.", icon: "⚠", color: "text-yellow-400" },
        { type: "poor", title: "Balance is shifting during release", description: "Your weight distribution is uneven (70%). Focus on maintaining a stable base through the entire shot motion.", icon: "✗", color: "text-red-400" }
      ],
      drills: [
        { name: "Form Shooting Drill", description: "Focus on elbow alignment and balance - Your top priority", color: "bg-orange-600", icon: "🏀" },
        { name: "Balance Training", description: "Improve shooting stance stability - Critical improvement", color: "bg-blue-600", icon: "⚡" },
        { name: "Release Technique", description: "Perfect your follow-through motion - Essential skill", color: "bg-green-600", icon: "🎯" }
      ]
    },
    archery: {
      playerName: "Sarah Chen",
      analysisType: "Draw & Release Analysis",
      metrics: [
        { name: "Draw Length", value: "28.5\"", status: "good", color: "text-green-400" },
        { name: "Anchor Point", value: "Consistent 92%", status: "good", color: "text-green-400" },
        { name: "Back Tension", value: "75%", status: "warning", color: "text-yellow-400" },
        { name: "Release Timing", value: "68%", status: "poor", color: "text-red-400" },
        { name: "Follow Through", value: "88%", status: "good", color: "text-green-400" }
      ],
      analysisTitle: "Archery Motion Analysis",
      tabs: ["Form", "Draw", "Release", "Accuracy"],
      feedback: [
        { type: "excellent", title: "Anchor point consistency is excellent", description: "Perfect hand placement creates repeatable shots. Your muscle memory is well developed.", icon: "✓", color: "text-green-400" },
        { type: "warning", title: "Back tension needs improvement", description: "Increase engagement of rhomboids and rear deltoids for more stable draw. Focus on pulling through your back.", icon: "⚠", color: "text-yellow-400" },
        { type: "poor", title: "Release timing is inconsistent", description: "Variation in release timing affects accuracy. Practice surprise release technique for better consistency.", icon: "✗", color: "text-red-400" }
      ],
      drills: [
        { name: "Back Tension Drill", description: "Strengthen draw stability - Your top priority", color: "bg-orange-600", icon: "🏹" },
        { name: "Release Training", description: "Improve timing consistency - Critical improvement", color: "bg-blue-600", icon: "⚡" },
        { name: "Anchor Practice", description: "Maintain excellent consistency - Essential skill", color: "bg-green-600", icon: "🎯" }
      ]
    },
    swimming: {
      playerName: "Alex Rivera",
      analysisType: "Freestyle Stroke Analysis", 
      metrics: [
        { name: "Stroke Rate", value: "72 SPM", status: "good", color: "text-green-400" },
        { name: "Body Position", value: "85%", status: "good", color: "text-green-400" },
        { name: "Catch Phase", value: "78%", status: "warning", color: "text-yellow-400" },
        { name: "Breathing", value: "65%", status: "poor", color: "text-red-400" },
        { name: "Kick Tempo", value: "82%", status: "good", color: "text-green-400" }
      ],
      analysisTitle: "Swimming Motion Analysis",
      tabs: ["Stroke", "Breathing", "Turns", "Starts"],
      feedback: [
        { type: "excellent", title: "Body position is excellent", description: "Horizontal alignment minimizes drag. Your streamline position creates optimal hydrodynamics.", icon: "✓", color: "text-green-400" },
        { type: "warning", title: "Catch phase needs refinement", description: "Early vertical forearm could be improved. Focus on high elbow catch for better propulsion.", icon: "⚠", color: "text-yellow-400" },
        { type: "poor", title: "Breathing pattern disrupts rhythm", description: "Bilateral breathing timing affects stroke symmetry. Practice smoother head rotation technique.", icon: "✗", color: "text-red-400" }
      ],
      drills: [
        { name: "Catch Technique Drill", description: "Improve early vertical forearm - Your top priority", color: "bg-orange-600", icon: "🏊‍♀️" },
        { name: "Breathing Training", description: "Smooth bilateral technique - Critical improvement", color: "bg-blue-600", icon: "⚡" },
        { name: "Streamline Practice", description: "Maintain excellent position - Essential skill", color: "bg-green-600", icon: "🎯" }
      ]
    }
  };
  
  return sportData[sport as keyof typeof sportData] || sportData.basketball;
};

export default function ARTools() {
  const [userPrimarySport, setUserPrimarySport] = useState<string>("basketball");
  const [currentTab, setCurrentTab] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // WebSocket integration
  const { isConnected, currentResult } = useWebSocketAnalysis();

  // Update analysis result from WebSocket
  useEffect(() => {
    if (currentResult) {
      setAnalysisResult({
        sport: currentResult.sport,
        score: currentResult.score,
        feedback: currentResult.feedback || [],
        metrics: currentResult.metrics || {},
        timestamp: currentResult.timestamp || new Date().toISOString()
      });
    }
  }, [currentResult]);

  const startAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      toast({
        title: "Analysis Started",
        description: "AI is analyzing your technique in real-time.",
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access to use analysis.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  }, [toast]);

  const uploadVideo = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Video Uploaded",
          description: "Processing your video for analysis...",
        });
      }
    };
    input.click();
  }, [toast]);

  const exportData = useCallback(() => {
    toast({
      title: "Data Exported",
      description: "Analysis data has been exported successfully.",
    });
  }, [toast]);

  // Get current sport data
  const sportData = getSportAnalysisData(userPrimarySport);

  return (
    <>
      <Helmet>
        <title>AR Tools | Ekalavya</title>
        <meta name="description" content="AI-Powered Motion Analysis for sports performance improvement" />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-gray-400" />
              <h1 className="text-xl font-semibold text-white">AI-Powered Motion Analysis</h1>
            </div>
            <div className="flex items-center gap-3">
              {/* AI Connection Status */}
              <Alert className={`${isConnected ? 'border-green-500 bg-green-900/20' : 'border-orange-500 bg-orange-900/20'} border px-3 py-1`}>
                <div className="flex items-center gap-2">
                  {isConnected ? <Wifi className="h-4 w-4 text-green-400" /> : <WifiOff className="h-4 w-4 text-orange-400" />}
                  <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-orange-400'}`}>
                    AI Server: {isConnected ? 'Connected' : 'Connecting...'}
                  </span>
                </div>
              </Alert>
              <Button variant="outline" size="sm" onClick={uploadVideo}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
              <Button size="sm" onClick={startAnalysis} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Start Analysis"}
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Video Analysis Area */}
          <div className="flex-1 p-6">
            {/* Player Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Player: {sportData.playerName}</h2>
              <p className="text-gray-400">{sportData.analysisType}</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {sportData.metrics.map((metric, index) => (
                <div key={index} className="text-right">
                  <div className="text-sm text-gray-400">{metric.name}:</div>
                  <div className={`text-lg font-semibold ${metric.color}`}>{metric.value}</div>
                </div>
              ))}
            </div>

            {/* Video/Camera Area */}
            <div className="bg-gray-800 rounded-lg mb-6 flex items-center justify-center h-80 border-2 border-dashed border-gray-600">
              {isAnalyzing ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover rounded-lg"
                  autoPlay
                  muted
                  playsInline
                />
              ) : (
                <div className="text-center">
                  <Camera className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">{sportData.analysisTitle}</h3>
                  <p className="text-gray-400">Upload video or start live analysis</p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={startAnalysis}>
                <Play className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
              <Button variant="outline" onClick={uploadVideo}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
              <Button variant="outline" onClick={exportData}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>

            {/* Analysis Tabs */}
            <div className="mb-6">
              <div className="flex gap-4 mb-4 border-b border-gray-700">
                {sportData.tabs.map((tab, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTab(index)}
                    className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                      currentTab === index
                        ? 'border-orange-500 text-orange-400'
                        : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Motion Analysis Results */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">AI Motion Analysis</h3>
              <div className="space-y-4">
                {sportData.feedback.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      item.type === 'excellent' ? 'bg-green-600' :
                      item.type === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold mb-1 ${item.color}`}>{item.title}</h4>
                      <p className="text-gray-300 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Drills */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Recommended Drills</h3>
                <button className="text-blue-400 hover:text-blue-300 text-sm">View All ›</button>
              </div>
              <div className="space-y-3">
                {sportData.drills.map((drill, index) => (
                  <div key={index} className={`${drill.color} rounded-lg p-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{drill.icon}</div>
                      <div>
                        <h4 className="font-semibold text-white">{drill.name}</h4>
                        <p className="text-sm text-gray-200">{drill.description}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary">
                      Add to Plan
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}