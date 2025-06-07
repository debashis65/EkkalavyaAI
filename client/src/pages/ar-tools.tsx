import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, 
  Upload, 
  Play, 
  Square, 
  RotateCcw,
  Zap,
  Activity,
  Target,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

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

interface AnalysisResult {
  sport: string;
  score: number;
  metrics: Record<string, number>;
  feedback: string[];
  timestamp: string;
  drill_recommendations?: any[];
}

export default function ARTools({ user }: ARToolsProps = {}) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const userPrimarySport = user?.primarySport || 'basketball';

  // Check AI backend connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        setIsConnected(response.ok);
      } catch (error) {
        console.log('AI backend connection check failed:', error);
        setIsConnected(false);
      }
    };
    checkConnection().catch(err => console.log('Connection check error:', err));
  }, []);

  // Generate 8 essential metrics from analysis result
  const getMetricsForSport = (sport: string) => {
    if (!analysisResult) {
      return [
        { label: "Technical Form", value: "Start analysis", color: "text-gray-500" },
        { label: "Power Output", value: "Start analysis", color: "text-gray-500" },
        { label: "Consistency", value: "Start analysis", color: "text-gray-500" },
        { label: "Timing", value: "Start analysis", color: "text-gray-500" },
        { label: "Balance", value: "Start analysis", color: "text-gray-500" },
        { label: "Accuracy", value: "Start analysis", color: "text-gray-500" },
        { label: "Speed", value: "Start analysis", color: "text-gray-500" },
        { label: "Overall Score", value: "Start analysis", color: "text-gray-500" }
      ];
    }

    // Generate metrics from real analysis data
    const metrics = analysisResult.metrics || {};
    const score = analysisResult.score || 0;
    
    return [
      { label: "Technical Form", value: `${metrics.form || score}%`, color: getScoreColor(metrics.form || score) },
      { label: "Power Output", value: `${metrics.power || score}%`, color: getScoreColor(metrics.power || score) },
      { label: "Consistency", value: `${metrics.consistency || score}%`, color: getScoreColor(metrics.consistency || score) },
      { label: "Timing", value: `${metrics.timing || score}%`, color: getScoreColor(metrics.timing || score) },
      { label: "Balance", value: `${metrics.balance || score}%`, color: getScoreColor(metrics.balance || score) },
      { label: "Accuracy", value: `${metrics.accuracy || score}%`, color: getScoreColor(metrics.accuracy || score) },
      { label: "Speed", value: `${metrics.speed || score}%`, color: getScoreColor(metrics.speed || score) },
      { label: "Overall Score", value: `${Math.round(score)}%`, color: getScoreColor(score) }
    ];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  // Start camera capture
  const startCamera = async () => {
    try {
      setIsAnalyzing(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        toast({
          title: "Camera Started",
          description: "Click Start Analysis to begin processing"
        });
      }
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  // Process video frame for analysis
  const processVideo = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      setIsAnalyzing(true);
      
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      
      const frameData = canvas.toDataURL('image/jpeg', 0.8);
      
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: userPrimarySport,
          analysis_type: 'real_time',
          frames: [frameData],
          timestamp: new Date().toISOString(),
          user_id: user?.id || 'anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await response.json();
      setAnalysisResult(analysisData);
      
      toast({
        title: "Analysis Complete",
        description: `${userPrimarySport} analysis completed successfully`
      });
    } catch (error) {
      toast({
        title: "Analysis Error",
        description: "Failed to process video frame",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle video file upload
  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File",
        description: "Please select a valid video file",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      
      video.onloadedmetadata = async () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const frames: string[] = [];
          const frameCount = Math.min(10, Math.floor(video.duration));
          
          for (let i = 0; i < frameCount; i++) {
            video.currentTime = (video.duration / frameCount) * i;
            await new Promise(resolve => video.onseeked = resolve);
            
            ctx.drawImage(video, 0, 0);
            frames.push(canvas.toDataURL('image/jpeg', 0.8));
          }
          
          const response = await fetch('/api/analyze-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sport: userPrimarySport,
              analysis_type: 'video_upload',
              frames,
              timestamp: new Date().toISOString(),
              user_id: user?.id || 'anonymous',
              filename: file.name
            }),
          });

          if (!response.ok) {
            throw new Error('Analysis failed');
          }

          const analysisData = await response.json();
          setAnalysisResult(analysisData);
          
          URL.revokeObjectURL(video.src);
          
          toast({
            title: "Video Processed",
            description: `Analysis complete for ${file.name}`
          });
          
          setIsAnalyzing(false);
        } catch (uploadError) {
          console.log('Video upload processing error:', uploadError);
          setIsAnalyzing(false);
          toast({
            title: "Processing Error",
            description: "Failed to analyze video file",
            variant: "destructive"
          });
        }
      };
    } catch (error) {
      setIsAnalyzing(false);
      toast({
        title: "Upload Error",
        description: "Failed to process video file",
        variant: "destructive"
      });
    }
  };

  const currentMetrics = getMetricsForSport(userPrimarySport);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Helmet>
        <title>Realtime Sports Connect AI Analysis - Ekkalavya Sports AI</title>
        <meta name="description" content="Real-time AR sports analysis and performance tracking" />
      </Helmet>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Realtime Sports Connect AI Analysis
          </h1>
          <p className="text-gray-400 text-lg">
            Advanced AR Analysis for {userPrimarySport.charAt(0).toUpperCase() + userPrimarySport.slice(1)}
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-400">
              AI Backend {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Video Analysis Section */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Live Analysis Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Video Display */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Analysis Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Analyzing Movement...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                onClick={startCamera}
                disabled={isAnalyzing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </Button>
              
              <Button
                onClick={processVideo}
                disabled={!videoRef.current?.srcObject || isAnalyzing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Analyze Frame
              </Button>
              
              <label className="cursor-pointer">
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {currentMetrics.map((metric, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4 text-center">
                <div className="text-sm text-gray-400 mb-1">{metric.label}</div>
                <div className={`text-lg font-semibold ${metric.color}`}>
                  {metric.value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Performance Feedback</h3>
                  <div className="space-y-2">
                    {analysisResult.feedback?.map((feedback, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-300 text-sm">{feedback}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Recommended Drills</h3>
                  <div className="space-y-2">
                    {analysisResult.drill_recommendations?.slice(0, 3).map((drill, index) => (
                      <div key={index} className="bg-slate-700/50 p-3 rounded-lg">
                        <div className="font-medium text-white text-sm">{drill.name}</div>
                        <div className="text-gray-400 text-xs mt-1">{drill.description}</div>
                      </div>
                    )) || (
                      <p className="text-gray-400 text-sm">No drill recommendations available</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}