/**
 * Real-Time AR Analysis Component
 * Uses actual MediaPipe computer vision - NO PLACEHOLDERS
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MediaPipeAnalyzer, AnalysisResult } from '@/lib/mediapipe-analyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Square, Play, Pause, AlertCircle, Target } from 'lucide-react';

interface RealTimeARAnalysisProps {
  sport: string;
  analysisType?: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
}

export function RealTimeARAnalysis({ 
  sport, 
  analysisType = 'general',
  onAnalysisComplete 
}: RealTimeARAnalysisProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyzer] = useState(() => new MediaPipeAnalyzer());
  const [isLive, setIsLive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setStream(mediaStream);
        setIsLive(true);
      }
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera access error:', err);
    }
  }, []);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsLive(false);
    setIsAnalyzing(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, [stream]);

  // Start real-time analysis
  const startAnalysis = useCallback(async () => {
    if (!videoRef.current || !isLive) return;

    setIsAnalyzing(true);
    setError(null);

    const analyzeFrame = async () => {
      try {
        if (!videoRef.current || !isLive) return;

        const result = await analyzer.analyzeImage(videoRef.current, sport);
        setCurrentResult(result);
        onAnalysisComplete?.(result);
      } catch (err) {
        console.error('Analysis error:', err);
        setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    // Analyze every 500ms for real-time feedback
    analysisIntervalRef.current = setInterval(analyzeFrame, 500);
  }, [analyzer, sport, isLive, onAnalysisComplete]);

  // Stop analysis
  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="space-y-6">
      {/* Camera and Analysis View */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Real-Time {sport.charAt(0).toUpperCase() + sport.slice(1)} Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Video Feed */}
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-[400px] object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {/* Analysis Overlay */}
              {isAnalyzing && currentResult && (
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white">
                  <div className="text-sm font-medium mb-2">Live Analysis</div>
                  <div className={`text-2xl font-bold ${getScoreColor(currentResult.score)}`}>
                    {Math.round(currentResult.score)}%
                  </div>
                  <div className="text-xs opacity-75">
                    {currentResult.sport.toUpperCase()}
                  </div>
                </div>
              )}

              {/* Recording Indicator */}
              {isLive && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
              )}

              {/* No Camera Overlay */}
              {!isLive && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Camera Not Active</p>
                    <p className="text-sm opacity-75">Click "Start Camera" to begin</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3">
              {!isLive ? (
                <Button onClick={startCamera} className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="flex items-center gap-2">
                  <Square className="h-4 w-4" />
                  Stop Camera
                </Button>
              )}

              {isLive && !isAnalyzing && (
                <Button onClick={startAnalysis} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Start Analysis
                </Button>
              )}

              {isAnalyzing && (
                <Button onClick={stopAnalysis} variant="outline" className="flex items-center gap-2">
                  <Pause className="h-4 w-4" />
                  Stop Analysis
                </Button>
              )}

              <Badge variant="secondary">
                Sport: {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </Badge>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Metrics */}
      {isAnalyzing && currentResult && (
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Overall Score */}
              <div className={`p-4 rounded-lg ${getScoreBg(currentResult.score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Overall Form Score</span>
                  <span className={`text-2xl font-bold ${getScoreColor(currentResult.score)}`}>
                    {Math.round(currentResult.score)}%
                  </span>
                </div>
                <Progress value={currentResult.score} className="h-2" />
              </div>

              {/* Individual Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(currentResult.metrics).map(([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {typeof value === 'number' ? Math.round(value) : value}
                      {typeof value === 'number' && key.includes('angle') ? '°' : ''}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Feedback */}
              {currentResult.feedback.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Live Coaching Feedback</h4>
                  {currentResult.feedback.map((feedback, index) => (
                    <Alert key={index} className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-800">
                        {feedback}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}

              {/* Joint Angles */}
              {Object.keys(currentResult.jointAngles).length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Joint Angles</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(currentResult.jointAngles).map(([joint, angle]) => (
                      <div key={joint} className="text-center p-2 bg-gray-100 rounded">
                        <div className="text-xs text-gray-600">{joint}</div>
                        <div className="font-bold">{Math.round(angle)}°</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}