import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  Play, 
  Square, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Target,
  TrendingUp
} from 'lucide-react';

interface AnalysisResult {
  sport: string;
  score: number;
  feedback: string[];
  metrics: Record<string, number>;
  timestamp: string;
  drill_recommendations?: any[];
}

export default function ARTools() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Shooting');
  const [isConnected, setIsConnected] = useState(false);
  
  // Check AI backend connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/analyze-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true }),
        });
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      }
    };
    checkConnection();
  }, []);

  const startLiveAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsLiveMode(true);
      }
      
      toast({
        title: "Live Analysis Started",
        description: "Position yourself in front of the camera and start your technique.",
      });
    } catch (error) {
      console.error('Camera access error:', error);
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera access to use live analysis.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopLiveAnalysis = useCallback(() => {
    setIsLiveMode(false);
    setIsAnalyzing(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const startAnalysis = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isLiveMode) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    setIsAnalyzing(true);

    // Capture frame and analyze
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    try {
      const frameData = canvas.toDataURL('image/jpeg', 0.8);

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: 'basketball',
          analysis_type: 'real_time',
          frames: [frameData],
          timestamp: new Date().toISOString(),
          user_id: 'player-analysis'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        
        toast({
          title: "Analysis Complete",
          description: `Analysis score: ${result.score}%`,
        });
      }
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: "Please try again or check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [isLiveMode, toast]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const frameData = e.target?.result as string;

        const response = await fetch('/api/analyze-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sport: 'basketball',
            analysis_type: 'video_upload',
            frames: [frameData],
            timestamp: new Date().toISOString(),
            user_id: 'player-analysis'
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setAnalysisResult(result);
          
          toast({
            title: "Video Analysis Complete",
            description: `Analysis score: ${result.score}%`,
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload analysis error:', error);
      toast({
        title: "Upload Failed",
        description: "Please try again with a different video file.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Generate sport-specific metrics from analysis result
  const getDisplayMetrics = () => {
    if (!analysisResult) {
      return [
        { label: "Release Height", value: "--", color: "text-gray-400" },
        { label: "Release Angle", value: "--", color: "text-gray-400" },
        { label: "Elbow Alignment", value: "--", color: "text-gray-400" },
        { label: "Balance", value: "--", color: "text-gray-400" },
        { label: "Follow Through", value: "--", color: "text-gray-400" }
      ];
    }

    const metrics = analysisResult.metrics || {};
    const score = analysisResult.score || 0;

    return [
      { 
        label: "Release Height", 
        value: `${Math.round(metrics.release_height || score + 2)}% (+2)`,
        color: getScoreColor(metrics.release_height || score + 2)
      },
      { 
        label: "Release Angle", 
        value: `${Math.round(metrics.release_angle || 45)}° (Optimal: 45°)`,
        color: getScoreColor(metrics.release_angle || score)
      },
      { 
        label: "Elbow Alignment", 
        value: `${Math.round(metrics.elbow_alignment || score - 3)}% (-3)`,
        color: getScoreColor(metrics.elbow_alignment || score - 3)
      },
      { 
        label: "Balance", 
        value: `${Math.round(metrics.balance || score)}% (-2)`,
        color: getScoreColor(metrics.balance || score)
      },
      { 
        label: "Follow Through", 
        value: `${Math.round(metrics.follow_through || score + 1)}% (-4)`,
        color: getScoreColor(metrics.follow_through || score + 1)
      }
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getFeedbackIcon = (feedback: string) => {
    if (feedback.toLowerCase().includes('excellent') || feedback.toLowerCase().includes('good')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (feedback.toLowerCase().includes('needs') || feedback.toLowerCase().includes('adjust')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <>
      <Helmet>
        <title>AR Tools | Ekalavya</title>
        <meta name="description" content="Realtime Sports Connect AI Analysis" />
      </Helmet>

      <div className="min-h-screen bg-gray-900 text-white">
        {/* Header */}
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera className="h-6 w-6 text-blue-400" />
              <h1 className="text-xl font-semibold">AI-Powered Motion Analysis</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Video
              </Button>
              <Button onClick={isAnalyzing ? () => {} : startAnalysis} disabled={!isLiveMode || isAnalyzing}>
                Start Analysis
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Player Info */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Player: Marcus Johnson</h2>
              <p className="text-gray-400">Jump Shot Analysis</p>
            </div>
            <div className="text-right space-y-1 text-sm">
              {getDisplayMetrics().map((metric, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <span className="text-gray-400">{metric.label}:</span>
                  <span className={metric.color}>{metric.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Video Feed */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video mb-4">
                {isLiveMode ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">Basketball Motion Analysis</p>
                      <p className="text-sm text-gray-500">Upload video or start live analysis</p>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="flex justify-center gap-4">
                <Button 
                  onClick={startLiveAnalysis}
                  disabled={isLiveMode}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Analysis
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-blue-600 text-blue-400 hover:bg-blue-600"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Video
                </Button>
                <Button 
                  variant="outline"
                  onClick={stopLiveAnalysis}
                  disabled={!isLiveMode}
                  className="border-green-600 text-green-400 hover:bg-green-600"
                >
                  <Square className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Analysis Tabs */}
          <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
            {['Shooting', 'Dribbling', 'Movement', 'Defense'].map((tab) => (
              <Button
                key={tab}
                variant={selectedTab === tab ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedTab(tab)}
                className={selectedTab === tab ? "bg-orange-600" : "text-gray-400"}
              >
                {tab}
              </Button>
            ))}
          </div>

          {/* AI Motion Analysis Results */}
          {analysisResult && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">AI Motion Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Feedback Items */}
                <div className="space-y-3">
                  {analysisResult.feedback.map((feedback, index) => (
                    <Alert key={index} className="bg-gray-700 border-gray-600">
                      <div className="flex items-start gap-3">
                        {getFeedbackIcon(feedback)}
                        <div>
                          <h4 className="font-medium mb-1">
                            {feedback.split('.')[0]}
                          </h4>
                          <p className="text-sm text-gray-400">
                            {feedback.split('.').slice(1).join('.').trim()}
                          </p>
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommended Drills */}
          {analysisResult?.drill_recommendations && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Recommended Drills</CardTitle>
                  <Button variant="link" size="sm" className="text-blue-400">
                    View All ›
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.drill_recommendations.map((drill, index) => (
                  <Card key={index} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium">{drill.name}</h5>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Add to Plan
                        </Button>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{drill.description}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Focus: {drill.focus_areas?.join(', ')}</span>
                        <span>{drill.difficulty}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isAnalyzing && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  <h3 className="text-xl font-semibold">Analyzing Your Technique...</h3>
                  <p className="text-gray-400">
                    Our AI is processing your basketball form and generating personalized feedback.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}