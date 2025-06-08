import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWebSocketAnalysis } from "@/hooks/useWebSocketAnalysis";
import { Camera, Play, Square, Target, TrendingUp, Award, Clock } from "lucide-react";

interface SportConfig {
  name: string;
  analysisTypes: string[];
  keyMetrics: string[];
  commonDrills: Array<{
    name: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
  }>;
  tips: string[];
}

const SPORT_CONFIGS: Record<string, SportConfig> = {
  basketball: {
    name: "Basketball",
    analysisTypes: ["Shooting Form", "Dribbling", "Defensive Stance", "Free Throw"],
    keyMetrics: ["Shot Accuracy", "Release Point", "Follow Through", "Balance"],
    commonDrills: [
      { name: "Form Shooting", description: "Perfect your shooting mechanics close to the basket", difficulty: "Beginner", duration: "15 min" },
      { name: "Spot Shooting", description: "Practice shots from specific positions on court", difficulty: "Intermediate", duration: "20 min" },
      { name: "Game Speed Shooting", description: "Shooting under pressure with movement", difficulty: "Advanced", duration: "25 min" }
    ],
    tips: ["Keep your elbow under the ball", "Follow through with a flick of the wrist", "Use your legs for power"]
  },
  swimming: {
    name: "Swimming",
    analysisTypes: ["Freestyle Stroke", "Backstroke", "Breaststroke", "Butterfly", "Diving"],
    keyMetrics: ["Stroke Rate", "Distance Per Stroke", "Body Position", "Breathing Rhythm"],
    commonDrills: [
      { name: "Catch-Up Freestyle", description: "One arm at a time to perfect technique", difficulty: "Beginner", duration: "10 min" },
      { name: "Bilateral Breathing", description: "Alternate breathing sides for balance", difficulty: "Intermediate", duration: "15 min" },
      { name: "High Elbow Catch", description: "Maximize water catch efficiency", difficulty: "Advanced", duration: "20 min" }
    ],
    tips: ["Maintain streamlined body position", "High elbow catch for efficiency", "Breathe bilaterally"]
  },
  tennis: {
    name: "Tennis",
    analysisTypes: ["Forehand", "Backhand", "Serve", "Volley", "Return"],
    keyMetrics: ["Racquet Speed", "Contact Point", "Follow Through", "Footwork"],
    commonDrills: [
      { name: "Shadow Swings", description: "Practice form without ball", difficulty: "Beginner", duration: "10 min" },
      { name: "Fed Ball Rally", description: "Consistent groundstroke practice", difficulty: "Intermediate", duration: "20 min" },
      { name: "Live Ball Points", description: "Match simulation practice", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Turn your shoulders early", "Keep your eye on the ball", "Follow through across your body"]
  },
  archery: {
    name: "Archery",
    analysisTypes: ["Draw Technique", "Anchor Point", "Release", "Follow Through", "Stance"],
    keyMetrics: ["Draw Length", "Anchor Consistency", "Sight Alignment", "Release Timing"],
    commonDrills: [
      { name: "Blank Bale", description: "Focus on form without target pressure", difficulty: "Beginner", duration: "15 min" },
      { name: "Close Range Precision", description: "Build accuracy at short distance", difficulty: "Intermediate", duration: "20 min" },
      { name: "Competition Simulation", description: "Practice under pressure", difficulty: "Advanced", duration: "30 min" }
    ],
    tips: ["Consistent anchor point", "Smooth release without punching", "Follow through naturally"]
  },
  football: {
    name: "Football",
    analysisTypes: ["Passing", "Shooting", "Dribbling", "Heading", "Defending"],
    keyMetrics: ["Ball Control", "Passing Accuracy", "Shot Power", "First Touch"],
    commonDrills: [
      { name: "Wall Passes", description: "Improve passing accuracy and first touch", difficulty: "Beginner", duration: "15 min" },
      { name: "Cone Dribbling", description: "Enhance ball control through obstacles", difficulty: "Intermediate", duration: "20 min" },
      { name: "1v1 Finishing", description: "Improve shooting under pressure", difficulty: "Advanced", duration: "25 min" }
    ],
    tips: ["Keep the ball close when dribbling", "Use both feet equally", "Practice with both power and placement"]
  }
};

interface SportSpecificARToolsProps {
  userSport: string;
  userId: number;
}

export const SportSpecificARTools: React.FC<SportSpecificARToolsProps> = ({ userSport, userId }) => {
  const {
    isConnected,
    isAnalyzing,
    currentResult,
    error,
    videoRef,
    canvasRef,
    connect,
    disconnect,
    startCamera,
    startAnalysis,
    stopAnalysis,
    stopCamera
  } = useWebSocketAnalysis();

  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);

  const sportConfig = SPORT_CONFIGS[userSport] || SPORT_CONFIGS.basketball;

  useEffect(() => {
    if (sportConfig.analysisTypes.length > 0) {
      setSelectedAnalysisType(sportConfig.analysisTypes[0]);
    }
  }, [sportConfig]);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
      stopCamera();
    };
  }, [connect, disconnect, stopCamera]);

  useEffect(() => {
    if (currentResult) {
      setAnalysisHistory(prev => [currentResult, ...prev.slice(0, 4)]);
    }
  }, [currentResult]);

  const handleStartCamera = async () => {
    const success = await startCamera();
    if (success) {
      setCameraActive(true);
    }
  };

  const handleStopCamera = () => {
    stopCamera();
    setCameraActive(false);
    if (isAnalyzing) {
      stopAnalysis();
    }
  };

  const handleStartAnalysis = () => {
    if (!cameraActive) {
      handleStartCamera().then(() => {
        startAnalysis(userId, userSport, selectedAnalysisType);
      });
    } else {
      startAnalysis(userId, userSport, selectedAnalysisType);
    }
  };

  const handleStopAnalysis = () => {
    stopAnalysis();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">{sportConfig.name} AR Analysis</h1>
          <p className="text-gray-600">Real-time technique analysis and improvement recommendations</p>
        </div>

        {/* Connection Status */}
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">
                  {isConnected ? 'Connected to AI Analysis' : 'Connecting...'}
                </span>
              </div>
              {error && (
                <Badge variant="destructive">{error}</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Camera Feed and Analysis */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Live Analysis</span>
                </CardTitle>
                <CardDescription>
                  Position yourself in front of the camera and start analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Analysis Type Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Analysis Type</label>
                  <select
                    value={selectedAnalysisType}
                    onChange={(e) => setSelectedAnalysisType(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    disabled={isAnalyzing}
                  >
                    {sportConfig.analysisTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Camera Feed */}
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                  />
                  <canvas
                    ref={canvasRef}
                    className="hidden"
                  />
                  
                  {!cameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                      <div className="text-center text-white">
                        <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Camera not active</p>
                      </div>
                    </div>
                  )}

                  {isAnalyzing && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-600 text-white animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full mr-2" />
                        ANALYZING
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div className="flex space-x-2">
                  {!cameraActive ? (
                    <Button onClick={handleStartCamera} className="bg-orange-600 hover:bg-orange-700">
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                  ) : (
                    <Button onClick={handleStopCamera} variant="outline">
                      <Square className="w-4 h-4 mr-2" />
                      Stop Camera
                    </Button>
                  )}

                  {cameraActive && !isAnalyzing && (
                    <Button onClick={handleStartAnalysis} className="bg-green-600 hover:bg-green-700">
                      <Play className="w-4 h-4 mr-2" />
                      Start Analysis
                    </Button>
                  )}

                  {isAnalyzing && (
                    <Button onClick={handleStopAnalysis} variant="destructive">
                      <Square className="w-4 h-4 mr-2" />
                      Stop Analysis
                    </Button>
                  )}
                </div>

                {/* Current Analysis Result */}
                {currentResult && (
                  <Card className="border-green-200 bg-green-50">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Real-time Feedback</h4>
                          <Badge className="bg-green-600">Score: {currentResult.score}/100</Badge>
                        </div>
                        
                        <Progress value={currentResult.score} className="h-2" />
                        
                        <div className="space-y-1">
                          {currentResult.feedback.map((feedback, index) => (
                            <p key={index} className="text-sm text-gray-700">• {feedback}</p>
                          ))}
                        </div>
                        
                        {Object.keys(currentResult.metrics).length > 0 && (
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(currentResult.metrics).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="font-medium">{key}:</span>
                                <span>{typeof value === 'number' ? value.toFixed(1) : value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar with sport-specific content */}
          <div className="space-y-4">
            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Key Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sportConfig.keyMetrics.map((metric) => (
                    <div key={metric} className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-sm">{metric}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended Drills */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Recommended Drills</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sportConfig.commonDrills.map((drill, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium text-sm">{drill.name}</h5>
                        <Badge variant={drill.difficulty === 'Beginner' ? 'default' : drill.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}>
                          {drill.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{drill.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{drill.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Pro Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sportConfig.tips.map((tip, index) => (
                    <div key={index} className="flex space-x-2">
                      <span className="text-orange-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analysis History */}
            {analysisHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisHistory.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="text-sm">
                          <p className="font-medium">{result.analysis_type}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(result.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <Badge>{result.score}/100</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};