import { useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Upload, Play, BarChart3, Target, Zap, Trophy, AlertCircle, Video, Image, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnalysisResult {
  sport: string;
  score: number;
  feedback: string[];
  metrics: Record<string, number>;
  timestamp: string;
}

export default function ARTools() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedSport, setSelectedSport] = useState<"basketball" | "archery">("basketball");
  const [isLiveMode, setIsLiveMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('sport', selectedSport);
      formData.append('analysis_type', 'form');

      const response = await fetch('http://localhost:8000/api/analyze/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete!",
        description: `Your ${selectedSport} form has been analyzed with a score of ${result.score}%.`,
      });
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
  }, [selectedSport, toast]);

  const startLiveAnalysis = useCallback(async () => {
    setIsLiveMode(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
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
      setIsLiveMode(false);
    }
  }, [toast]);

  const stopLiveAnalysis = useCallback(() => {
    setIsLiveMode(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    setIsAnalyzing(true);

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append('file', blob, 'capture.jpg');
        formData.append('sport', selectedSport);
        formData.append('analysis_type', 'form');

        const response = await fetch('http://localhost:8000/api/analyze/image', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          setAnalysisResult(result);
          
          toast({
            title: "Live Analysis Complete!",
            description: `Score: ${result.score}% - Check your feedback below.`,
          });
        }
      }, 'image/jpeg', 0.8);
    } catch (error) {
      console.error('Live analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze the frame. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedSport, toast]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-50";
    if (score >= 60) return "bg-yellow-50";
    return "bg-red-50";
  };

  return (
    <>
      <Helmet>
        <title>AI Analysis Tools | Ekalavya</title>
        <meta
          name="description"
          content="Advanced AI-powered biomechanical analysis for Basketball and Archery technique improvement with real-time feedback."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">AI Analysis Tools</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI-powered biomechanical analysis for sports technique improvement
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Real-time Analysis</h3>
                <p className="text-gray-600">Instant feedback on your technique</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <BarChart3 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Performance Metrics</h3>
                <p className="text-gray-600">Detailed biomechanical scoring</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <Trophy className="h-12 w-12 text-purple-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Progress Tracking</h3>
                <p className="text-gray-600">Monitor improvement over time</p>
              </CardContent>
            </Card>
          </div>

          {/* Sport Selection */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant={selectedSport === "basketball" ? "default" : "outline"}
              onClick={() => setSelectedSport("basketball")}
              className="flex items-center gap-2"
            >
              🏀 Basketball
            </Button>
            <Button
              variant={selectedSport === "archery" ? "default" : "outline"}
              onClick={() => setSelectedSport("archery")}
              className="flex items-center gap-2"
            >
              🏹 Archery
            </Button>
          </div>

          {/* Live Video Analysis */}
          {isLiveMode && (
            <Card className="mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Live Analysis - {selectedSport === "basketball" ? "Basketball" : "Archery"}
                  </span>
                  <Button variant="outline" size="sm" onClick={stopLiveAnalysis}>
                    <X className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    ref={videoRef}
                    className="w-full h-96 object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex justify-center">
                  <Button 
                    onClick={captureFrame}
                    disabled={isAnalyzing}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    {isAnalyzing ? "Analyzing..." : "Capture & Analyze"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Analysis Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Basketball Analysis */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  🏀 Basketball Analysis
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Dynamic
                  </Badge>
                </CardTitle>
                <CardDescription className="text-orange-100">
                  Shooting form, movement patterns, and technique analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Real-time shooting form analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Elbow positioning and alignment</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Follow-through consistency</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Stance and balance analysis</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      onClick={startLiveAnalysis}
                      disabled={isLiveMode || selectedSport !== "basketball"}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Live Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedSport("basketball");
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Archery Analysis */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  🏹 Archery Analysis
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Precision
                  </Badge>
                </CardTitle>
                <CardDescription className="text-green-100">
                  Form analysis, stance stability, and accuracy tracking
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Stance stability analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Draw technique consistency</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Anchor point tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Release timing analysis</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-green-500 hover:bg-green-600"
                      onClick={startLiveAnalysis}
                      disabled={isLiveMode || selectedSport !== "archery"}
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Live Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedSport("archery");
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <Card className="mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart3 className="h-6 w-6" />
                  Analysis Results - {analysisResult.sport.charAt(0).toUpperCase() + analysisResult.sport.slice(1)}
                  <Badge 
                    className={`${getScoreBg(analysisResult.score)} ${getScoreColor(analysisResult.score)} border-current`}
                    variant="outline"
                  >
                    {analysisResult.score}% Score
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Overall Performance</span>
                      <span className={`font-bold ${getScoreColor(analysisResult.score)}`}>
                        {analysisResult.score}%
                      </span>
                    </div>
                    <Progress value={analysisResult.score} className="h-3" />
                  </div>

                  {/* Detailed Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analysisResult.metrics).map(([metric, value]) => {
                      const percentage = Math.round(value * 100);
                      return (
                        <div key={metric} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium capitalize">
                              {metric.replace(/_/g, " ")}
                            </span>
                            <span className={`text-sm font-bold ${getScoreColor(percentage)}`}>
                              {percentage}%
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-blue-600" />
                      Coaching Feedback
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.feedback.map((feedback, index) => (
                        <Alert key={index} className="border-blue-200 bg-blue-50">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            {feedback}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Loading State */}
          {isAnalyzing && (
            <Card className="mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <h3 className="text-xl font-semibold">Analyzing Your Technique...</h3>
                  <p className="text-gray-600">
                    Our AI is processing your {selectedSport} form and generating personalized feedback.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Coming Soon Section */}
          <div className="mt-12">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-900">Coming Soon</CardTitle>
                <CardDescription>More sports analysis tools in development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg opacity-60">
                    <div className="text-2xl mb-2">🏊‍♀️</div>
                    <div className="font-medium">Swimming</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg opacity-60">
                    <div className="text-2xl mb-2">🏐</div>
                    <div className="font-medium">Volleyball</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg opacity-60">
                    <div className="text-2xl mb-2">🎾</div>
                    <div className="font-medium">Tennis</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg opacity-60">
                    <div className="text-2xl mb-2">🥊</div>
                    <div className="font-medium">Boxing</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Alert */}
          <div className="mt-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">AI Analysis Ready</h3>
                    <p className="text-blue-800 text-sm">
                      Our AI system is trained on professional techniques. 
                      Upload an image or use live analysis to get instant feedback on your form!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
