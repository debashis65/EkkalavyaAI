import { useState, useRef, useCallback, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Upload, Play, BarChart3, Target, Zap, Trophy, AlertCircle, Check, Share2, Download, Menu } from "lucide-react";
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

export default function ARToolsMobile({ user }: ARToolsProps = {}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const performanceRef = useRef<HTMLDivElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userPrimarySport, setUserPrimarySport] = useState(user?.primarySport || 'basketball');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('general');
  const { toast } = useToast();
  const { analysisResult, isConnected, sendAnalysisRequest } = useWebSocketAnalysis();

  // Screenshot sharing functionality
  const sharePerformanceScreenshot = useCallback(async () => {
    if (!performanceRef.current) return;

    try {
      // Use html2canvas to capture the performance metrics area
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(performanceRef.current, {
        backgroundColor: '#111827',
        scale: 2,
        logging: false,
        useCORS: true
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
        const file = new File([blob], 'performance-analysis.png', { type: 'image/png' });
        
        if (navigator.share && navigator.canShare({ files: [file] })) {
          // Native mobile sharing
          await navigator.share({
            title: 'Ekalavya Sports AI - Performance Analysis',
            text: `My ${userPrimarySport} performance analysis from Ekalavya Sports AI`,
            files: [file]
          });
          
          toast({
            title: "Performance shared!",
            description: "Your analysis has been shared successfully.",
          });
        } else {
          // Fallback: download the image
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `ekalavya-${userPrimarySport}-analysis-${new Date().toISOString().slice(0, 10)}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          toast({
            title: "Performance downloaded!",
            description: "Your analysis screenshot has been saved.",
          });
        }
      }, 'image/png');
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to capture performance screenshot.",
        variant: "destructive"
      });
    }
  }, [userPrimarySport, toast]);

  // Start camera analysis
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' },
        audio: false 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsAnalyzing(true);
        
        // Send analysis request to AI backend
        sendAnalysisRequest({
          sport: userPrimarySport,
          analysis_type: selectedAnalysisType
        });
        
        toast({
          title: "Analysis started",
          description: "Real-time AI analysis is now active."
        });
      }
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access for motion analysis.",
        variant: "destructive"
      });
    }
  }, [userPrimarySport, selectedAnalysisType, sendAnalysisRequest, toast]);

  // Get current metrics based on sport and analysis result
  const currentMetrics = useCallback(() => {
    if (analysisResult && analysisResult.sport === userPrimarySport) {
      const metrics = analysisResult.metrics || {};
      return [
        { label: "Form Score", value: `${Math.round(metrics.form || analysisResult.score)}%`, color: metrics.form > 80 ? "text-green-400" : metrics.form > 60 ? "text-yellow-400" : "text-red-400" },
        { label: "Power Output", value: `${Math.round(metrics.power || (analysisResult.score * 1.2))}%`, color: "text-blue-400" },
        { label: "Consistency", value: `${Math.round(metrics.consistency || (analysisResult.score * 0.9))}%`, color: "text-green-400" },
        { label: "Timing", value: `${Math.round(metrics.timing || (analysisResult.score * 1.1))}%`, color: "text-yellow-400" },
        { label: "Balance", value: `${Math.round(metrics.balance || (analysisResult.score * 0.95))}%`, color: "text-blue-400" },
        { label: "Accuracy", value: `${Math.round(metrics.accuracy || (analysisResult.score * 1.05))}%`, color: "text-green-400" },
        { label: "Speed", value: `${Math.round(metrics.speed || (analysisResult.score * 0.85))}%`, color: "text-yellow-400" },
        { label: "Overall Performance", value: `${Math.round(analysisResult.score)}%`, color: analysisResult.score > 80 ? "text-green-400" : analysisResult.score > 60 ? "text-yellow-400" : "text-red-400" }
      ];
    }

    // Default loading state with 8 metrics
    return [
      { label: "Form Score", value: "Analyzing...", color: "text-gray-400" },
      { label: "Power Output", value: "Analyzing...", color: "text-gray-400" },
      { label: "Consistency", value: "Analyzing...", color: "text-gray-400" },
      { label: "Timing", value: "Analyzing...", color: "text-gray-400" },
      { label: "Balance", value: "Analyzing...", color: "text-gray-400" },
      { label: "Accuracy", value: "Analyzing...", color: "text-gray-400" },
      { label: "Speed", value: "Analyzing...", color: "text-gray-400" },
      { label: "Overall Score", value: "Start analysis", color: "text-gray-400" }
    ];
  }, [analysisResult, userPrimarySport]);

  const metrics = currentMetrics();

  return (
    <>
      <Helmet>
        <title>Realtime Sports Connect AI Analysis - Ekalavya</title>
        <meta name="description" content="AI-powered real-time sports performance analysis" />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Mobile Header with Navigation */}
        <div className="bg-orange-600 p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">Ekalavya</h1>
                <p className="text-orange-100 text-xs">AI Sports Analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Connection Status */}
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
              <Menu className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Main Content - Mobile First */}
        <div className="p-4 space-y-4">
          {/* Title Section */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              Realtime Sports Connect AI Analysis
            </h2>
            <p className="text-sm text-gray-400">
              Player: {user?.name || 'Unknown Player'}
            </p>
          </div>

          {/* Sport Selector */}
          <div className="mb-4">
            <Select value={userPrimarySport} onValueChange={setUserPrimarySport}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="basketball" className="text-white">🏀 Basketball</SelectItem>
                <SelectItem value="archery" className="text-white">🏹 Archery</SelectItem>
                <SelectItem value="swimming" className="text-white">🏊‍♀️ Swimming</SelectItem>
                <SelectItem value="cricket" className="text-white">🏏 Cricket</SelectItem>
                <SelectItem value="football" className="text-white">⚽ Football</SelectItem>
                <SelectItem value="tennis" className="text-white">🎾 Tennis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Video Analysis Area - TOP PRIORITY MOBILE FIRST */}
          <Card className="bg-gray-800 border-gray-700 mb-4">
            <CardContent className="p-4">
              <div className="bg-gray-900 rounded-lg flex items-center justify-center h-56 border-2 border-dashed border-gray-600 mb-4">
                {isAnalyzing ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-lg"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className="text-center p-6">
                    <Camera className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {userPrimarySport.charAt(0).toUpperCase() + userPrimarySport.slice(1)} Analysis
                    </h3>
                    <p className="text-sm text-gray-400">Tap Start Analysis to begin</p>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 flex-1" 
                  onClick={startCamera}
                  disabled={isAnalyzing}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                </Button>
                <Button 
                  variant="outline" 
                  className="bg-gray-800 border-orange-500 text-orange-400 hover:bg-orange-900"
                  onClick={sharePerformanceScreenshot}
                  disabled={!analysisResult}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics - BELOW VIDEO */}
          <Card className="bg-gray-800 border-gray-700" ref={performanceRef}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Performance Metrics</h3>
                <Badge className="bg-orange-600 text-white">8 Essential Metrics</Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {metrics.slice(0, 7).map((metric, index) => (
                  <div key={index} className="bg-gray-900 p-3 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">{metric.label}</div>
                    <div className={`text-sm font-bold ${metric.color}`}>{metric.value}</div>
                    {analysisResult && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(analysisResult.timestamp).toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 8th Metric - Overall Performance - Full Width */}
              <div className="bg-gray-900 p-4 rounded-lg border border-orange-600/30">
                <div className="text-sm text-gray-400 mb-1">{metrics[7].label}</div>
                <div className={`text-xl font-bold ${metrics[7].color}`}>{metrics[7].value}</div>
                {analysisResult && (
                  <div className="text-xs text-gray-500 mt-1">
                    Last updated: {new Date(analysisResult.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* AI Feedback */}
              {analysisResult && analysisResult.feedback && (
                <div className="mt-4 p-3 bg-blue-900/20 rounded-lg border border-blue-600/30">
                  <h4 className="text-sm font-semibold text-blue-400 mb-2">AI Coach Feedback</h4>
                  <ul className="space-y-1">
                    {analysisResult.feedback.map((feedback, index) => (
                      <li key={index} className="text-xs text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        {feedback}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="bg-gray-800 border-gray-600 text-white flex-1"
              onClick={sharePerformanceScreenshot}
              disabled={!analysisResult}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Performance
            </Button>
            <Button 
              variant="outline" 
              className="bg-gray-800 border-gray-600 text-white flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}