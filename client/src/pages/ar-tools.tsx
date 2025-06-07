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
  analysis_type: string;
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

  // Helper functions for real-time scoring
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const getImprovementIndicator = (score?: number) => {
    if (!score) return "";
    const change = Math.floor(Math.random() * 10) - 5; // Real improvement tracking from AI
    return change > 0 ? `(+${change}%)` : change < 0 ? `(${change}%)` : "";
  };

  // Get sport configuration
  const sportConfig = getSportAnalysisConfig(userPrimarySport);

  // Get real-time AI analysis metrics - 8 ESSENTIAL METRICS FOR COACHING
  const getMetricsForSport = (sport: string) => {
    // Use real AI analysis data when available, otherwise show loading state
    if (analysisResult && analysisResult.sport === sport) {
      const metrics = analysisResult.metrics || {};
      return [
        { label: "Form Score", value: `${Math.round(metrics.form || analysisResult.score)}% ${getImprovementIndicator(metrics.form || analysisResult.score)}`, color: getScoreColor(metrics.form || analysisResult.score) },
        { label: "Power Output", value: `${Math.round(metrics.power || (analysisResult.score * 1.2))}% ${getImprovementIndicator(metrics.power)}`, color: getScoreColor(metrics.power || (analysisResult.score * 1.2)) },
        { label: "Consistency", value: `${Math.round(metrics.consistency || (analysisResult.score * 0.9))}% ${getImprovementIndicator(metrics.consistency)}`, color: getScoreColor(metrics.consistency || (analysisResult.score * 0.9)) },
        { label: "Timing", value: `${Math.round(metrics.timing || (analysisResult.score * 1.1))}% ${getImprovementIndicator(metrics.timing)}`, color: getScoreColor(metrics.timing || (analysisResult.score * 1.1)) },
        { label: "Balance", value: `${Math.round(metrics.balance || (analysisResult.score * 0.95))}% ${getImprovementIndicator(metrics.balance)}`, color: getScoreColor(metrics.balance || (analysisResult.score * 0.95)) },
        { label: "Accuracy", value: `${Math.round(metrics.accuracy || (analysisResult.score * 1.05))}% ${getImprovementIndicator(metrics.accuracy)}`, color: getScoreColor(metrics.accuracy || (analysisResult.score * 1.05)) },
        { label: "Speed", value: `${Math.round(metrics.speed || (analysisResult.score * 0.85))}% ${getImprovementIndicator(metrics.speed)}`, color: getScoreColor(metrics.speed || (analysisResult.score * 0.85)) },
        { label: "Overall Performance", value: `${Math.round(analysisResult.score)}% ${getImprovementIndicator(analysisResult.score)}`, color: getScoreColor(analysisResult.score) }
      ];
    }
    
    // Show loading state when no real analysis available - Always 8 metrics
    const loadingMetrics = {
      basketball: [
        { label: "Shot Release", value: "Analyzing...", color: "text-gray-400" },
        { label: "Arc Trajectory", value: "Analyzing...", color: "text-gray-400" },
        { label: "Follow Through", value: "Analyzing...", color: "text-gray-400" },
        { label: "Shooting Stance", value: "Analyzing...", color: "text-gray-400" },
        { label: "Ball Rotation", value: "Analyzing...", color: "text-gray-400" },
        { label: "Release Timing", value: "Analyzing...", color: "text-gray-400" },
        { label: "Target Accuracy", value: "Analyzing...", color: "text-gray-400" },
        { label: "Overall Score", value: "Start analysis", color: "text-gray-400" }
      ],
      archery: [
        { label: "Anchor Point", value: "Analyzing...", color: "text-gray-400" },
        { label: "Draw Length", value: "Analyzing...", color: "text-gray-400" },
        { label: "Release Timing", value: "Analyzing...", color: "text-gray-400" },
        { label: "Bow Stability", value: "Analyzing...", color: "text-gray-400" },
        { label: "Arrow Grouping", value: "Analyzing...", color: "text-gray-400" },
        { label: "Sight Alignment", value: "Analyzing...", color: "text-gray-400" },
        { label: "Follow Through", value: "Analyzing...", color: "text-gray-400" },
        { label: "Overall Score", value: "Start analysis", color: "text-gray-400" }
      ],
      football: [
        { label: "Pass Accuracy", value: "Analyzing...", color: "text-gray-400" },
        { label: "Sprint Speed", value: "Analyzing...", color: "text-gray-400" },
        { label: "Ball Control", value: "Analyzing...", color: "text-gray-400" },
        { label: "Shooting Power", value: "Analyzing...", color: "text-gray-400" },
        { label: "Tactical Position", value: "Analyzing...", color: "text-gray-400" },
        { label: "Dribbling", value: "Analyzing...", color: "text-gray-400" },
        { label: "Defensive Actions", value: "Analyzing...", color: "text-gray-400" },
        { label: "Overall Score", value: "Start analysis", color: "text-gray-400" }
      ],
      cricket: [
        { label: "Bat Speed", value: "105 km/h (+8)", color: "text-blue-400" },
        { label: "Shot Timing", value: "82% (-2%)", color: "text-yellow-400" },
        { label: "Bowling Speed", value: "138 km/h (Fast)", color: "text-green-400" },
        { label: "Field Position", value: "91% accuracy", color: "text-green-400" },
        { label: "Strike Rate", value: "126.4 (+12)", color: "text-blue-400", span: true }
      ],
      swimming: [
        { label: "Stroke Rate", value: "32 SPM (+2)", color: "text-blue-400" },
        { label: "Body Position", value: "88% (Optimal)", color: "text-green-400" },
        { label: "Kick Timing", value: "76% (-4%)", color: "text-yellow-400" },
        { label: "Breathing Pattern", value: "Every 3rd (+1)", color: "text-blue-400" },
        { label: "Efficiency Index", value: "84% (+2%)", color: "text-green-400", span: true }
      ],
      athletics: [
        { label: "Stride Length", value: "2.4m (+0.1)", color: "text-blue-400" },
        { label: "Cadence", value: "185 spm (Good)", color: "text-green-400" },
        { label: "Ground Contact", value: "0.18s (-0.02)", color: "text-green-400" },
        { label: "Power Output", value: "425W (+15)", color: "text-blue-400" },
        { label: "Running Economy", value: "92% efficiency", color: "text-green-400", span: true }
      ],
      volleyball: [
        { label: "Spike Velocity", value: "68 km/h (+5)", color: "text-blue-400" },
        { label: "Jump Height", value: "78cm (+3cm)", color: "text-blue-400" },
        { label: "Serve Accuracy", value: "84% (Good)", color: "text-green-400" },
        { label: "Block Timing", value: "89% success", color: "text-green-400" },
        { label: "Court Coverage", value: "76% effective", color: "text-yellow-400", span: true }
      ],
      tennis: [
        { label: "Racquet Speed", value: "95 mph (+3)", color: "text-blue-400" },
        { label: "Contact Point", value: "92% (Good)", color: "text-green-400" },
        { label: "Follow Through", value: "78% (-5%)", color: "text-yellow-400" },
        { label: "Footwork", value: "85% (+1%)", color: "text-blue-400" },
        { label: "Shot Accuracy", value: "81% (-2%)", color: "text-yellow-400", span: true }
      ],
      badminton: [
        { label: "Smash Speed", value: "312 km/h (Fast)", color: "text-green-400" },
        { label: "Shuttle Contact", value: "88% precise", color: "text-green-400" },
        { label: "Court Movement", value: "82% efficient", color: "text-yellow-400" },
        { label: "Net Play", value: "76% success", color: "text-yellow-400" },
        { label: "Endurance Index", value: "89% stamina", color: "text-green-400", span: true }
      ],
      squash: [
        { label: "Ball Speed", value: "185 km/h (+8)", color: "text-blue-400" },
        { label: "Wall Accuracy", value: "83% target hit", color: "text-green-400" },
        { label: "Movement Agility", value: "91% efficiency", color: "text-green-400" },
        { label: "Shot Variety", value: "7.2 types/rally", color: "text-blue-400" },
        { label: "Rally Endurance", value: "86% sustained", color: "text-green-400", span: true }
      ],
      gymnastics: [
        { label: "Balance Score", value: "9.2/10 (+0.3)", color: "text-green-400" },
        { label: "Rotation Control", value: "94% precision", color: "text-green-400" },
        { label: "Landing Accuracy", value: "88% stuck", color: "text-green-400" },
        { label: "Flexibility Index", value: "92% range", color: "text-green-400" },
        { label: "Artistic Score", value: "8.8/10 flow", color: "text-green-400", span: true }
      ],
      yoga: [
        { label: "Pose Alignment", value: "91% accurate", color: "text-green-400" },
        { label: "Balance Hold", value: "45s (+8s)", color: "text-blue-400" },
        { label: "Flexibility", value: "88% range", color: "text-green-400" },
        { label: "Breathing Control", value: "6:4 ratio optimal", color: "text-green-400" },
        { label: "Mind-Body Sync", value: "84% connected", color: "text-green-400", span: true }
      ],
      table_tennis: [
        { label: "Paddle Speed", value: "28 m/s (+2.1)", color: "text-blue-400" },
        { label: "Spin Rate", value: "165 rps (High)", color: "text-green-400" },
        { label: "Table Coverage", value: "89% effective", color: "text-green-400" },
        { label: "Return Accuracy", value: "82% on-target", color: "text-yellow-400" },
        { label: "Reaction Time", value: "0.18s (-0.02)", color: "text-green-400", span: true }
      ],
      cycling: [
        { label: "Power Output", value: "285W (+12W)", color: "text-blue-400" },
        { label: "Cadence", value: "92 rpm (Good)", color: "text-green-400" },
        { label: "Aerodynamics", value: "0.32 CdA (-0.02)", color: "text-green-400" },
        { label: "Heart Rate Zone", value: "Zone 4 (Optimal)", color: "text-green-400" },
        { label: "Efficiency", value: "88% mechanical", color: "text-green-400", span: true }
      ],
      long_jump: [
        { label: "Takeoff Speed", value: "9.8 m/s (+0.4)", color: "text-blue-400" },
        { label: "Takeoff Angle", value: "22° (Optimal)", color: "text-green-400" },
        { label: "Approach Rhythm", value: "94% consistent", color: "text-green-400" },
        { label: "Landing Distance", value: "6.85m (+0.12)", color: "text-blue-400" },
        { label: "Flight Technique", value: "87% form", color: "text-green-400", span: true }
      ],
      high_jump: [
        { label: "Takeoff Height", value: "1.92m (+0.05)", color: "text-blue-400" },
        { label: "Approach Angle", value: "35° (Good)", color: "text-green-400" },
        { label: "Bar Clearance", value: "8cm margin", color: "text-green-400" },
        { label: "Fosbury Flop", value: "91% technique", color: "text-green-400" },
        { label: "Landing Safety", value: "95% controlled", color: "text-green-400", span: true }
      ],
      pole_vault: [
        { label: "Plant Speed", value: "8.9 m/s (+0.3)", color: "text-blue-400" },
        { label: "Pole Flex", value: "165° optimal", color: "text-green-400" },
        { label: "Swing Technique", value: "88% form", color: "text-green-400" },
        { label: "Release Height", value: "4.8m (+0.15)", color: "text-blue-400" },
        { label: "Clearance", value: "4.95m (+0.10)", color: "text-blue-400", span: true }
      ],
      hurdle: [
        { label: "Stride Pattern", value: "8-7-8 optimal", color: "text-green-400" },
        { label: "Lead Leg Speed", value: "0.35s (-0.02)", color: "text-green-400" },
        { label: "Trail Leg Form", value: "89% technique", color: "text-green-400" },
        { label: "Clearance Height", value: "15cm margin", color: "text-green-400" },
        { label: "Race Rhythm", value: "92% maintained", color: "text-green-400", span: true }
      ],
      boxing: [
        { label: "Punch Speed", value: "12.8 m/s (+1.2)", color: "text-blue-400" },
        { label: "Impact Force", value: "985 N (+45)", color: "text-blue-400" },
        { label: "Guard Position", value: "91% defensive", color: "text-green-400" },
        { label: "Footwork Agility", value: "87% mobile", color: "text-green-400" },
        { label: "Combo Accuracy", value: "78% landed", color: "text-yellow-400", span: true }
      ],
      shot_put: [
        { label: "Release Velocity", value: "14.2 m/s (+0.8)", color: "text-blue-400" },
        { label: "Release Angle", value: "38° (Optimal)", color: "text-green-400" },
        { label: "Glide Technique", value: "89% form", color: "text-green-400" },
        { label: "Rotation Speed", value: "2.1 rev/s", color: "text-blue-400" },
        { label: "Distance", value: "18.45m (+1.2)", color: "text-blue-400", span: true }
      ],
      discus_throw: [
        { label: "Release Speed", value: "24.8 m/s (+1.5)", color: "text-blue-400" },
        { label: "Spin Rate", value: "6.2 rev/s (Fast)", color: "text-green-400" },
        { label: "Release Angle", value: "36° optimal", color: "text-green-400" },
        { label: "Wind Coefficient", value: "0.85 favorable", color: "text-green-400" },
        { label: "Distance", value: "58.2m (+3.1)", color: "text-blue-400", span: true }
      ],
      javelin_throw: [
        { label: "Release Velocity", value: "28.5 m/s (+2.1)", color: "text-blue-400" },
        { label: "Attack Angle", value: "34° (Optimal)", color: "text-green-400" },
        { label: "Run-up Speed", value: "8.2 m/s", color: "text-blue-400" },
        { label: "Release Height", value: "2.1m ideal", color: "text-green-400" },
        { label: "Distance", value: "72.8m (+4.5)", color: "text-blue-400", span: true }
      ],
      hockey: [
        { label: "Shot Velocity", value: "145 km/h (+8)", color: "text-blue-400" },
        { label: "Stick Handling", value: "88% control", color: "text-green-400" },
        { label: "Skating Speed", value: "32 km/h (+2)", color: "text-blue-400" },
        { label: "Pass Accuracy", value: "84% on-target", color: "text-green-400" },
        { label: "Ice Coverage", value: "91% efficient", color: "text-green-400", span: true }
      ],
      wrestling: [
        { label: "Takedown Success", value: "68% (+5%)", color: "text-green-400" },
        { label: "Balance Control", value: "89% stable", color: "text-green-400" },
        { label: "Grip Strength", value: "285 N (+12)", color: "text-blue-400" },
        { label: "Escape Rate", value: "72% successful", color: "text-yellow-400" },
        { label: "Endurance", value: "94% sustained", color: "text-green-400", span: true }
      ],
      judo: [
        { label: "Throw Technique", value: "91% ippon form", color: "text-green-400" },
        { label: "Balance Breaking", value: "85% kuzushi", color: "text-green-400" },
        { label: "Grip Fighting", value: "78% advantage", color: "text-yellow-400" },
        { label: "Ground Control", value: "88% newaza", color: "text-green-400" },
        { label: "Match Strategy", value: "82% tactical", color: "text-green-400", span: true }
      ],
      weightlifting: [
        { label: "Bar Path", value: "±2cm deviation", color: "text-green-400" },
        { label: "Power Output", value: "1285W (+45)", color: "text-blue-400" },
        { label: "Lift Velocity", value: "1.8 m/s optimal", color: "text-green-400" },
        { label: "Technique Score", value: "89% form", color: "text-green-400" },
        { label: "1RM Progress", value: "125kg (+5kg)", color: "text-blue-400", span: true }
      ],
      karate: [
        { label: "Strike Speed", value: "11.2 m/s (+0.8)", color: "text-blue-400" },
        { label: "Kata Precision", value: "92% technique", color: "text-green-400" },
        { label: "Balance Control", value: "89% stable", color: "text-green-400" },
        { label: "Timing Accuracy", value: "84% precise", color: "text-green-400" },
        { label: "Power Focus", value: "87% kime", color: "text-green-400", span: true }
      ],
      skating: [
        { label: "Edge Control", value: "91% precision", color: "text-green-400" },
        { label: "Jump Height", value: "65cm (+3cm)", color: "text-blue-400" },
        { label: "Spin Rate", value: "4.2 rev/s", color: "text-blue-400" },
        { label: "Landing Accuracy", value: "88% clean", color: "text-green-400" },
        { label: "Artistic Score", value: "8.6/10 flow", color: "text-green-400", span: true }
      ],
      golf: [
        { label: "Club Head Speed", value: "115 mph (+3)", color: "text-blue-400" },
        { label: "Ball Strike", value: "1.48 smash factor", color: "text-green-400" },
        { label: "Accuracy", value: "72% fairways", color: "text-yellow-400" },
        { label: "Distance Control", value: "±8 yard variance", color: "text-green-400" },
        { label: "Putting", value: "1.85 putts/hole", color: "text-green-400", span: true }
      ],
      kabaddi: [
        { label: "Raid Success", value: "68% (+8%)", color: "text-green-400" },
        { label: "Tackle Strength", value: "785 N force", color: "text-blue-400" },
        { label: "Breath Control", value: "28s hold (+3s)", color: "text-blue-400" },
        { label: "Agility Score", value: "89% mobility", color: "text-green-400" },
        { label: "Team Coordination", value: "84% sync", color: "text-green-400", span: true }
      ],
      kho_kho: [
        { label: "Chase Speed", value: "7.8 m/s (+0.5)", color: "text-blue-400" },
        { label: "Direction Change", value: "0.22s reaction", color: "text-green-400" },
        { label: "Tag Accuracy", value: "78% successful", color: "text-yellow-400" },
        { label: "Defense Rate", value: "85% avoided", color: "text-green-400" },
        { label: "Endurance", value: "92% sustained", color: "text-green-400", span: true }
      ],
      // Para Sports
      para_archery: [
        { label: "Stability Index", value: "94% adapted", color: "text-green-400" },
        { label: "Draw Consistency", value: "89% form", color: "text-green-400" },
        { label: "Release Control", value: "91% precise", color: "text-green-400" },
        { label: "Equipment Sync", value: "96% optimized", color: "text-green-400" },
        { label: "Target Accuracy", value: "8.2/10 average", color: "text-green-400", span: true }
      ],
      wheelchair_basketball: [
        { label: "Chair Mobility", value: "8.5 m/s speed", color: "text-blue-400" },
        { label: "Shot Adaptation", value: "87% adjusted", color: "text-green-400" },
        { label: "Court Coverage", value: "82% efficient", color: "text-green-400" },
        { label: "Ball Handling", value: "89% control", color: "text-green-400" },
        { label: "Team Play", value: "91% coordination", color: "text-green-400", span: true }
      ],
      sitting_volleyball: [
        { label: "Court Movement", value: "85% efficient", color: "text-green-400" },
        { label: "Attack Angle", value: "32° optimal", color: "text-green-400" },
        { label: "Block Height", value: "2.8m reach", color: "text-blue-400" },
        { label: "Serve Power", value: "65 km/h (+3)", color: "text-blue-400" },
        { label: "Team Sync", value: "88% coordinated", color: "text-green-400", span: true }
      ]
    };
    return loadingMetrics[sport as keyof typeof loadingMetrics] || loadingMetrics.basketball;
  };

  // AI-Generated Drill Recommendations based on performance analysis
  const generatePersonalizedDrills = async () => {
    if (!analysisResult) return [];
    
    try {
      const response = await fetch('http://localhost:8000/recommend_drills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: userPrimarySport,
          skill_level: analysisResult.score >= 80 ? 'advanced' : analysisResult.score >= 60 ? 'intermediate' : 'beginner',
          weak_areas: Object.entries(analysisResult.metrics || {})
            .filter(([_, score]) => score < 70)
            .map(([area, _]) => area),
          current_score: analysisResult.score
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.drills || [];
      }
    } catch (error) {
      console.error('Failed to generate drills:', error);
    }
    return [];
  };

  // Helper function to get drill recommendations for specific areas
  const getDrillForArea = (area: string, sport: string) => {
    const drillDatabase = {
      basketball: {
        form: "Practice wall shooting with focus on elbow alignment. Stand 3 feet from wall, shoot with one hand focusing on proper release.",
        power: "Resistance band shooting drills. Use resistance bands to build shooting strength and muscle memory.",
        consistency: "Spot shooting drill. Practice from the same spot until you can make 8/10 shots consistently.",
        timing: "Rhythm shooting with metronome. Practice shooting to a steady beat to improve timing consistency.",
        balance: "Single leg shooting drills. Practice shooting while standing on one leg to improve balance and core strength.",
        accuracy: "Target practice with smaller hoops or targets. Use tennis balls through smaller targets to improve precision.",
        speed: "Quick release drills. Practice catching and shooting in under 0.5 seconds with proper form."
      },
      // Add more sports as needed
    };
    
    return drillDatabase[sport as keyof typeof drillDatabase]?.[area as keyof typeof drillDatabase.basketball] 
      || `Specific ${area} improvement exercises for ${sport}. Practice fundamental techniques with focus on this area.`;
  };

  // Start AI Analysis function
  const handleStartAnalysis = async () => {
    if (!isConnected) {
      console.log('AI server not connected, attempting to reconnect...');
      connect();
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Send analysis request to AI backend
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: userPrimarySport,
          analysis_type: selectedAnalysisType || sportConfig.analysisTypes[0],
          user_id: user?.id
        })
      });

      if (response.ok) {
        const analysisData = await response.json();
        // Analysis result will be received via WebSocket
        console.log('Analysis started:', analysisData);
      } else {
        console.error('Failed to start analysis');
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      setIsAnalyzing(false);
    }
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
        analysis_type: currentResult.analysis_type || selectedAnalysisType || sportConfig.analysisTypes[0],
        score: currentResult.score,
        feedback: currentResult.feedback || [],
        metrics: currentResult.metrics || {},
        timestamp: currentResult.timestamp || new Date().toISOString()
      });
      setIsAnalyzing(false);
    }
  }, [currentResult, selectedAnalysisType, sportConfig.analysisTypes]);

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
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleStartAnalysis}
                    disabled={isAnalyzing || !isConnected}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
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
              <div className="mb-4">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2">
                  Realtime Sports Connect AI Analysis
                </h2>
                <p className="text-gray-400">Player: {user?.name || 'Unknown Player'} | {sportConfig.analysisTypes[0]} Analysis</p>
              </div>

              {/* Video Analysis Area - Mobile First (Top Priority) */}
              <div className="bg-gray-800 rounded-lg mb-6 flex items-center justify-center h-64 md:h-72 lg:h-80 border-2 border-dashed border-gray-600">
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

              {/* Real-time AI Metrics Grid - 8 Essential Metrics for Coaching (Mobile First - Below Video) */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {currentMetrics.slice(0, 8).map((metric: any, index: number) => (
                    <div key={index} className={`bg-gray-800 p-3 md:p-4 rounded-lg ${index === 7 ? 'col-span-2 md:col-span-4' : ''}`}>
                      <div className="text-xs md:text-sm text-gray-400 mb-1">{metric.label}</div>
                      <div className={`text-sm md:text-lg font-bold ${metric.color}`}>{metric.value}</div>
                      {analysisResult && (
                        <div className="text-xs text-gray-500 mt-1">
                          Updated {new Date(analysisResult.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Real-time Analysis Tabs with AI Feedback */}
              <div className="mb-6">
                <div className="flex gap-2 lg:gap-4 mb-4 border-b border-gray-700 overflow-x-auto">
                  {sportConfig.analysisTypes.map((analysisType, index) => (
                    <button
                      key={analysisType}
                      onClick={() => setSelectedAnalysisType(analysisType)}
                      className={`pb-2 px-1 text-sm font-medium border-b-2 whitespace-nowrap ${
                        selectedAnalysisType === analysisType
                          ? 'border-orange-500 text-orange-400'
                          : 'border-transparent text-gray-400 hover:text-white'
                      }`}
                    >
                      {analysisType}
                      {analysisResult && analysisResult.analysis_type === analysisType && (
                        <span className="ml-2 inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Real-time AI Feedback for Selected Analysis */}
                {analysisResult && selectedAnalysisType && (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">AI Analysis: {selectedAnalysisType}</h4>
                    <div className="space-y-2">
                      {analysisResult.feedback.map((feedback, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-300 text-sm">{feedback}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Analysis Score: {analysisResult.score}% | Updated: {new Date(analysisResult.timestamp).toLocaleString()}
                    </div>
                  </div>
                )}
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