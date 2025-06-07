import { useState, useRef, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// Comprehensive sport-specific analysis data
const getSportAnalysisConfig = (sport: string) => {
  const sportConfigs = {
    basketball: {
      title: "Basketball AR Analysis",
      description: "Real-time basketball technique analysis and improvement recommendations",
      analysisTypes: [
        "Shooting Form", "Free Throw", "Dribbling", "Defensive Stance", "Jump Shot", "Layup Technique"
      ],
      keyMetrics: [
        { name: "Shot Accuracy", icon: "🎯", description: "Shooting percentage and form consistency" },
        { name: "Release Point", icon: "📏", description: "Optimal release height and angle" },
        { name: "Shooting Mechanics", icon: "⚙️", description: "Form breakdown and analysis" },
        { name: "Balance & Footwork", icon: "👟", description: "Stance stability and positioning" },
        { name: "Follow Through", icon: "🤲", description: "Wrist snap and finger release" },
        { name: "Arc Trajectory", icon: "📈", description: "Shot arc optimization" }
      ]
    },
    archery: {
      title: "Archery AR Analysis", 
      description: "Precision archery form analysis and accuracy improvement",
      analysisTypes: [
        "Draw Technique", "Release Form", "Stance Analysis", "Anchor Point", "Aiming Consistency", "Follow Through"
      ],
      keyMetrics: [
        { name: "Draw Consistency", icon: "🏹", description: "Draw length and power consistency" },
        { name: "Anchor Point", icon: "📍", description: "Hand placement repeatability" },
        { name: "Release Quality", icon: "✋", description: "Clean finger release technique" },
        { name: "Stance Stability", icon: "🏛️", description: "Body position and balance" },
        { name: "Sight Alignment", icon: "👁️", description: "Aiming precision and focus" },
        { name: "Back Tension", icon: "💪", description: "Proper muscle engagement" }
      ]
    },
    swimming: {
      title: "Swimming AR Analysis",
      description: "Comprehensive stroke analysis and technique optimization", 
      analysisTypes: [
        "Freestyle Stroke", "Backstroke", "Breaststroke", "Butterfly", "Starts & Turns", "Breathing Technique"
      ],
      keyMetrics: [
        { name: "Stroke Rate", icon: "🏊‍♀️", description: "Strokes per minute efficiency" },
        { name: "Body Position", icon: "📐", description: "Horizontal alignment and streamline" },
        { name: "Catch Phase", icon: "🤲", description: "Early vertical forearm technique" },
        { name: "Breathing Pattern", icon: "💨", description: "Bilateral breathing rhythm" },
        { name: "Kick Technique", icon: "🦵", description: "Leg drive and tempo" },
        { name: "Turn Efficiency", icon: "🔄", description: "Wall push-off and rotation" }
      ]
    },
    cricket: {
      title: "Cricket AR Analysis",
      description: "Advanced batting, bowling, and fielding technique analysis",
      analysisTypes: [
        "Batting Stance", "Bowling Action", "Fielding Position", "Shot Selection", "Footwork", "Wicket Keeping"
      ],
      keyMetrics: [
        { name: "Batting Average", icon: "🏏", description: "Shot accuracy and timing" },
        { name: "Bowling Speed", icon: "⚡", description: "Pace and consistency" },
        { name: "Footwork", icon: "👟", description: "Movement and positioning" },
        { name: "Shot Power", icon: "💥", description: "Ball strike force" },
        { name: "Field Position", icon: "📍", description: "Optimal positioning" },
        { name: "Reaction Time", icon: "⏱️", description: "Response speed" }
      ]
    },
    tennis: {
      title: "Tennis AR Analysis",
      description: "Professional tennis stroke analysis and court movement",
      analysisTypes: [
        "Forehand", "Backhand", "Serve Technique", "Volley", "Footwork", "Court Positioning"
      ],
      keyMetrics: [
        { name: "Serve Speed", icon: "🎾", description: "First and second serve velocity" },
        { name: "Stroke Power", icon: "💪", description: "Groundstroke force generation" },
        { name: "Court Coverage", icon: "🏃‍♂️", description: "Movement efficiency" },
        { name: "Shot Accuracy", icon: "🎯", description: "Target precision" },
        { name: "Spin Rate", icon: "🌪️", description: "Topspin and slice technique" },
        { name: "Recovery Time", icon: "⚡", description: "Position reset speed" }
      ]
    },
    football: {
      title: "Football AR Analysis",
      description: "Complete football skill analysis and tactical awareness",
      analysisTypes: [
        "Shooting", "Passing", "Dribbling", "Defending", "Heading", "Ball Control"
      ],
      keyMetrics: [
        { name: "Shot Accuracy", icon: "⚽", description: "Goal scoring precision" },
        { name: "Pass Completion", icon: "📨", description: "Passing success rate" },
        { name: "Ball Control", icon: "🎮", description: "First touch quality" },
        { name: "Sprint Speed", icon: "💨", description: "Running velocity" },
        { name: "Agility", icon: "🔄", description: "Change of direction" },
        { name: "Stamina", icon: "❤️", description: "Endurance levels" }
      ]
    },
    kabaddi: {
      title: "Kabaddi AR Analysis",
      description: "Traditional kabaddi technique and tactical analysis",
      analysisTypes: [
        "Raiding Technique", "Defense Formation", "Tackle Strength", "Escape Skills", "Team Coordination", "Breathing Control"
      ],
      keyMetrics: [
        { name: "Raid Success", icon: "🏃‍♂️", description: "Successful raid percentage" },
        { name: "Tackle Power", icon: "💪", description: "Defensive strength" },
        { name: "Agility Score", icon: "🤸‍♂️", description: "Movement flexibility" },
        { name: "Breath Control", icon: "💨", description: "Cant duration" },
        { name: "Escape Rate", icon: "🎯", description: "Successful escapes" },
        { name: "Team Sync", icon: "👥", description: "Coordination efficiency" }
      ]
    },
    kho_kho: {
      title: "Kho Kho AR Analysis",
      description: "Traditional kho kho running and chasing technique analysis",
      analysisTypes: [
        "Running Form", "Direction Change", "Pole Technique", "Chasing Strategy", "Sitting Position", "Turn Speed"
      ],
      keyMetrics: [
        { name: "Chase Success", icon: "🏃‍♀️", description: "Successful chase percentage" },
        { name: "Turn Speed", icon: "🔄", description: "Direction change velocity" },
        { name: "Sitting Form", icon: "🪑", description: "Proper sitting technique" },
        { name: "Pole Touch", icon: "📏", description: "Pole contact accuracy" },
        { name: "Stamina", icon: "❤️", description: "Endurance capacity" },
        { name: "Strategy", icon: "🧠", description: "Game awareness" }
      ]
    },
    gymnastics: {
      title: "Gymnastics AR Analysis",
      description: "Comprehensive gymnastics form and routine analysis",
      analysisTypes: [
        "Floor Routine", "Balance Beam", "Uneven Bars", "Vault", "Rings", "Pommel Horse"
      ],
      keyMetrics: [
        { name: "Form Score", icon: "🤸‍♀️", description: "Technical execution quality" },
        { name: "Balance", icon: "⚖️", description: "Stability and control" },
        { name: "Flexibility", icon: "🤲", description: "Range of motion" },
        { name: "Strength", icon: "💪", description: "Power generation" },
        { name: "Timing", icon: "⏱️", description: "Routine pacing" },
        { name: "Landing", icon: "👟", description: "Dismount accuracy" }
      ]
    },
    para_archery: {
      title: "Para Archery AR Analysis",
      description: "Adaptive archery technique analysis for para athletes",
      analysisTypes: [
        "Seated Draw", "Standing Form", "Mouth Draw", "Adaptive Release", "Sight Alignment", "Stability Control"
      ],
      keyMetrics: [
        { name: "Draw Adaptation", icon: "🏹", description: "Adaptive draw technique" },
        { name: "Stability Score", icon: "🏛️", description: "Position control" },
        { name: "Release Quality", icon: "✋", description: "Adaptive release method" },
        { name: "Sight Focus", icon: "👁️", description: "Aiming precision" },
        { name: "Consistency", icon: "📊", description: "Shot repeatability" },
        { name: "Equipment Sync", icon: "⚙️", description: "Adaptive gear efficiency" }
      ]
    }
  };
  
  return sportConfigs[sport as keyof typeof sportConfigs] || sportConfigs.basketball;
};

interface User {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  name: string;
  primarySport?: string;
}

interface ARToolsProps {
  user?: User;
}

export default function ARTools({ user }: ARToolsProps = {}) {
  const [userPrimarySport, setUserPrimarySport] = useState<string>(user?.primarySport || "basketball");
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // WebSocket integration
  const { isConnected, currentResult, connect, disconnect } = useWebSocketAnalysis();

  // Connect to AI server on component mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Get sport configuration
  const sportConfig = getSportAnalysisConfig(userPrimarySport);

  // Get dynamic metrics based on user's sport
  const getMetricsForSport = (sport: string) => {
    const metrics = {
      basketball: [
        { label: "Release Height", value: "8'2\" (+2\")", color: "text-blue-400" },
        { label: "Release Angle", value: "42° (Optimal: 45°)", color: "text-yellow-400" },
        { label: "Elbow Alignment", value: "85% (-3%)", color: "text-yellow-400" },
        { label: "Balance", value: "78% (-2%)", color: "text-red-400" },
        { label: "Follow Through", value: "82% (-4%)", color: "text-green-400", span: true }
      ],
      swimming: [
        { label: "Stroke Rate", value: "32 SPM (+2)", color: "text-blue-400" },
        { label: "Body Position", value: "88% (Optimal)", color: "text-green-400" },
        { label: "Kick Timing", value: "76% (-4%)", color: "text-yellow-400" },
        { label: "Breathing Pattern", value: "Every 3rd (+1)", color: "text-blue-400" },
        { label: "Efficiency Index", value: "84% (+2%)", color: "text-green-400", span: true }
      ],
      tennis: [
        { label: "Racquet Speed", value: "95 mph (+3)", color: "text-blue-400" },
        { label: "Contact Point", value: "92% (Good)", color: "text-green-400" },
        { label: "Follow Through", value: "78% (-5%)", color: "text-yellow-400" },
        { label: "Footwork", value: "85% (+1%)", color: "text-blue-400" },
        { label: "Shot Accuracy", value: "81% (-2%)", color: "text-yellow-400", span: true }
      ],
      archery: [
        { label: "Anchor Point", value: "96% (Consistent)", color: "text-green-400" },
        { label: "Draw Length", value: "28.5\" (Optimal)", color: "text-green-400" },
        { label: "Release Timing", value: "82% (-3%)", color: "text-yellow-400" },
        { label: "Bow Arm Stability", value: "89% (+2%)", color: "text-blue-400" },
        { label: "Arrow Grouping", value: "7.2\" radius", color: "text-blue-400", span: true }
      ]
    };
    return metrics[sport as keyof typeof metrics] || metrics.basketball;
  };
  
  const currentMetrics = getMetricsForSport(userPrimarySport);

  // Initialize analysis type
  useEffect(() => {
    if (!selectedAnalysisType && sportConfig.analysisTypes.length > 0) {
      setSelectedAnalysisType(sportConfig.analysisTypes[0]);
    }
  }, [userPrimarySport, sportConfig, selectedAnalysisType]);

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

  const startCamera = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      toast({
        title: "Camera Started",
        description: `Analyzing ${sportConfig.title.split(' ')[0]} technique in real-time.`,
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access to use AR analysis.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
    }
  }, [toast, sportConfig]);

  const stopCamera = useCallback(() => {
    setIsAnalyzing(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>{sportConfig.title} | Ekalavya</title>
        <meta name="description" content={sportConfig.description} />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Mobile Header */}
        <div className="lg:hidden bg-orange-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">E</span>
              </div>
              <span className="text-white font-semibold">Ekalavya</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                <span className="text-orange-900 font-bold text-sm">A</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:flex w-64 bg-orange-600 flex-col min-h-screen">
            {/* Logo */}
            <div className="p-4 border-b border-orange-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">E</span>
                </div>
                <span className="text-white font-semibold">Ekalavya</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 py-4">
              <div className="space-y-1 px-3">
                <div className="flex items-center gap-3 px-3 py-2 text-orange-200 hover:bg-orange-700 rounded">
                  <BarChart3 className="h-5 w-5" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-orange-200 hover:bg-orange-700 rounded">
                  <Target className="h-5 w-5" />
                  <span>Analytics</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-orange-200 hover:bg-orange-700 rounded">
                  <Video className="h-5 w-5" />
                  <span>Schedule</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-orange-200 hover:bg-orange-700 rounded">
                  <Trophy className="h-5 w-5" />
                  <span>Coaches</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-orange-200 hover:bg-orange-700 rounded">
                  <Zap className="h-5 w-5" />
                  <span>Training</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 bg-green-700 text-white rounded">
                  <Camera className="h-5 w-5" />
                  <span>AR Tools</span>
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-orange-200 hover:bg-orange-700 rounded">
                  <AlertCircle className="h-5 w-5" />
                  <span>Profile</span>
                </div>
              </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-orange-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-orange-900 font-bold text-sm">A</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Arjuna</div>
                  <div className="text-xs text-orange-200">Athlete</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full text-orange-600 border-orange-400 hover:bg-orange-50">
                Logout
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Desktop Header */}
            <div className="hidden lg:block bg-gray-800 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera className="h-6 w-6 text-gray-400" />
                  <h1 className="text-xl font-semibold text-white">AI-Powered Motion Analysis</h1>
                </div>
                <div className="flex items-center gap-3">
                  {/* AI Connection Status */}
                  <Alert className={`${isConnected ? 'border-green-500 bg-green-900/20' : 'border-orange-500 bg-orange-900/20'} border px-3 py-1`}>
                    <div className="flex items-center gap-2">
                      {isConnected ? <Check className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-orange-400" />}
                      <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-orange-400'}`}>
                        AI Server: {isConnected ? 'Connected' : 'Connecting...'}
                      </span>
                    </div>
                  </Alert>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Video
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Start Analysis
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 lg:p-6">
              {/* Mobile AI Connection Status */}
              <div className="lg:hidden mb-4">
                <Alert className={`${isConnected ? 'border-green-500 bg-green-900/20' : 'border-orange-500 bg-orange-900/20'} border px-3 py-2`}>
                  <div className="flex items-center gap-2">
                    {isConnected ? <Check className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-orange-400" />}
                    <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-orange-400'}`}>
                      AI Server: {isConnected ? 'Connected' : 'Connecting...'}
                    </span>
                  </div>
                </Alert>
              </div>

              {/* Player Header - Dynamic based on logged-in user */}
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Player: {user?.name || 'Unknown Player'}
                </h2>
                <p className="text-gray-400">{sportConfig.analysisTypes[0]} Analysis</p>
              </div>

              {/* Dynamic Metrics Grid - Changes based on user's sport */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-right">
                {currentMetrics.map((metric, index) => (
                  <div key={index} className={metric.span ? "sm:col-span-2" : ""}>
                    <div className="text-sm text-gray-400">{metric.label}:</div>
                    <div className={`text-lg font-semibold ${metric.color}`}>{metric.value}</div>
                  </div>
                ))}
              </div>

              {/* Video Analysis Area */}
              <div className="bg-gray-800 rounded-lg mb-6 flex items-center justify-center h-60 lg:h-80 border-2 border-dashed border-gray-600">
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
                    <Camera className="h-12 lg:h-16 w-12 lg:w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">Basketball Motion Analysis</h3>
                    <p className="text-gray-400 text-sm lg:text-base">Upload video or start live analysis</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 mb-6">
                <Button className="bg-orange-600 hover:bg-orange-700 flex-1 sm:flex-none" onClick={startCamera}>
                  <Play className="h-4 w-4 mr-2" />
                  <span className="text-white font-medium">Start Analysis</span>
                </Button>
                <div className="flex gap-3 flex-1 sm:flex-none">
                  <Button variant="outline" className="bg-gray-800 border-orange-500 text-orange-400 hover:bg-orange-900 hover:text-white flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="font-medium">Upload Video</span>
                  </Button>
                  <Button variant="outline" className="bg-gray-800 border-orange-500 text-orange-400 hover:bg-orange-900 hover:text-white flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    <span className="font-medium">Export Data</span>
                  </Button>
                </div>
              </div>

              {/* Analysis Tabs */}
              <div className="mb-6">
                <div className="flex gap-2 lg:gap-4 mb-4 border-b border-gray-700 overflow-x-auto">
                  <button className="pb-2 px-1 text-sm font-medium border-b-2 border-orange-500 text-orange-400 whitespace-nowrap">
                    Shooting
                  </button>
                  <button className="pb-2 px-1 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white whitespace-nowrap">
                    Dribbling
                  </button>
                  <button className="pb-2 px-1 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white whitespace-nowrap">
                    Movement
                  </button>
                  <button className="pb-2 px-1 text-sm font-medium border-b-2 border-transparent text-gray-400 hover:text-white whitespace-nowrap">
                    Defense
                  </button>
                </div>
              </div>

              {/* AI Motion Analysis Results */}
              <div className="mb-8">
                <h3 className="text-lg lg:text-xl font-bold text-white mb-4">AI Motion Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      ✓
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-green-400">Follow through is excellent</h4>
                      <p className="text-gray-300 text-sm">Full extension with proper wrist snap creates optimal backspin. Continue to emphasize this technique.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      ⚠
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-yellow-400">Elbow alignment needs adjustment</h4>
                      <p className="text-gray-300 text-sm">Your shooting elbow is slightly out at a +2° angle. Try to keep it at 45° for better accuracy and consistency.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      ✗
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1 text-red-400">Balance is shifting during release</h4>
                      <p className="text-gray-300 text-sm">Your weight distribution is uneven (70%). Focus on maintaining a stable base through the entire shot motion.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Drills */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg lg:text-xl font-bold text-white">Recommended Drills</h3>
                  <button className="text-blue-400 hover:text-blue-300 text-sm">View All ›</button>
                </div>
                <div className="space-y-3">
                  <div className="bg-orange-600 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">🏀</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Form Shooting Drill</h4>
                        <p className="text-sm text-gray-200">Focus on elbow alignment and balance - Your top priority</p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="sm:flex-shrink-0">
                      Add to Plan
                    </Button>
                  </div>
                  <div className="bg-blue-600 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">⚡</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Balance Training</h4>
                        <p className="text-sm text-gray-200">Improve shooting stance stability - Critical improvement</p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="sm:flex-shrink-0">
                      Add to Plan
                    </Button>
                  </div>
                  <div className="bg-green-600 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="text-2xl">🎯</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">Release Technique</h4>
                        <p className="text-sm text-gray-200">Perfect your follow-through motion - Essential skill</p>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary" className="sm:flex-shrink-0">
                      Add to Plan
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}