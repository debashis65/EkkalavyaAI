/**
 * Web Room Mode AR Component
 * Integrates MediaPipe pose detection with room constraint analysis
 * Provides 2D marker overlays for confined space training
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pose, POSE_LANDMARKS } from '@mediapipe/pose';
import { MediaPipeAnalyzer, AnalysisResult, LandmarkPoint } from '@/lib/mediapipe-analyzer';
import { RoomModeDetector, RoomConstraints, RoomMarker } from '@/lib/room-mode-detector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, Square, Play, Pause, AlertCircle, Target, 
  Home, Maximize, Shield, Activity, Settings, 
  AlertTriangle, CheckCircle, Scan, Eye, Zap
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRoomModeSync, type RoomSessionData, type SyncData } from '../hooks/useRoomModeSync';

interface WebRoomModeARProps {
  sport: string;
  onAnalysisComplete?: (result: AnalysisResult) => void;
  onRoomDetected?: (constraints: RoomConstraints) => void;
}

interface TrainingSession {
  sport: string;
  pattern: string;
  startTime: number;
  targets: number;
  hits: number;
  score: number;
  safetyWarnings: string[];
}

const DRILL_PATTERNS = {
  'dribble_box': { name: 'Dribble Box', description: '2×2m control area for ball handling', minArea: 4.0 },
  'micro_ladder': { name: 'Micro Ladder', description: '6-rung footwork pattern', minArea: 2.4 },
  'figure_8': { name: 'Figure-8', description: 'Direction change training', minArea: 3.0 },
  'wall_rebound': { name: 'Wall Rebound', description: 'Wall-assisted training', minArea: 2.0 },
  'seated_control': { name: 'Seated Control', description: 'Accessibility training mode', minArea: 1.6 }
};

export function WebRoomModeAR({ sport, onAnalysisComplete, onRoomDetected }: WebRoomModeARProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // MediaPipe and Room Detection
  const [pose, setPose] = useState<Pose | null>(null);
  const [analyzer] = useState(() => new MediaPipeAnalyzer());
  const [roomDetector, setRoomDetector] = useState<RoomModeDetector | null>(null);
  
  // State management
  const [isLive, setIsLive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRoomMode, setIsRoomMode] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [roomConstraints, setRoomConstraints] = useState<RoomConstraints | null>(null);
  const [currentPattern, setCurrentPattern] = useState<string>('dribble_box');
  const [roomMarkers, setRoomMarkers] = useState<RoomMarker[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Training session
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [safetyWarnings, setSafetyWarnings] = useState<string[]>([]);
  
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const roomAnalysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize MediaPipe Pose
  useEffect(() => {
    const initializePose = async () => {
      try {
        const poseInstance = new Pose({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
        });

        // Dynamic MediaPipe configuration based on mode
        const poseOptions = {
          modelComplexity: isRoomMode ? 0 : 1 as 0 | 1 | 2,
          smoothLandmarks: isRoomMode ? false : true,
          enableSegmentation: false,
          smoothSegmentation: isRoomMode ? false : true,
          minDetectionConfidence: isRoomMode ? 0.3 : 0.5,
          minTrackingConfidence: isRoomMode ? 0.3 : 0.5
        };

        poseInstance.setOptions(poseOptions);

        setPose(poseInstance);
      } catch (err) {
        setError('Failed to initialize MediaPipe Pose for Room Mode');
        console.error('MediaPipe initialization error:', err);
      }
    };

    initializePose();
  }, []);

  // Initialize Room Detector when video and canvas are ready
  useEffect(() => {
    if (videoRef.current && overlayCanvasRef.current && !roomDetector) {
      const detector = new RoomModeDetector(videoRef.current, overlayCanvasRef.current);
      setRoomDetector(detector);
    }
  }, [videoRef.current, overlayCanvasRef.current, roomDetector]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    try {
      setError(null);
      // Room Mode optimized camera settings for 60 FPS performance
      const videoConstraints = isRoomMode ? {
        // Downsampled resolution for room mode performance
        width: { ideal: 320, max: 480 },
        height: { ideal: 240, max: 360 },
        frameRate: { ideal: 60, min: 30 },
        facingMode: 'user'
      } : {
        // Standard resolution for venue mode
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 },
        facingMode: 'user'
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints
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
    stopSession();
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (roomAnalysisIntervalRef.current) {
      clearInterval(roomAnalysisIntervalRef.current);
      roomAnalysisIntervalRef.current = null;
    }
  }, [stream]);

  // Analyze room constraints
  const analyzeRoom = useCallback(async () => {
    if (!roomDetector || !isLive) return;

    try {
      setIsScanning(true);
      const constraints = await roomDetector.analyzeRoomConstraints();
      setRoomConstraints(constraints);
      setIsRoomMode(constraints.isRoomMode);
      setIsScanning(false);
      
      // Generate markers for current pattern if room mode is active
      if (constraints.isRoomMode && overlayCanvasRef.current) {
        const markers = roomDetector.generateRoomMarkers(
          currentPattern,
          constraints.usableArea,
          overlayCanvasRef.current.width,
          overlayCanvasRef.current.height
        );
        setRoomMarkers(markers);
      }
      
      onRoomDetected?.(constraints);
    } catch (err) {
      console.error('Room analysis error:', err);
      setError('Failed to analyze room constraints');
      setIsScanning(false);
    }
  }, [roomDetector, isLive, currentPattern, onRoomDetected]);

  // Start training session
  const startSession = useCallback(() => {
    if (!roomConstraints) {
      setError('Room analysis required before starting session');
      return;
    }

    const newSession: TrainingSession = {
      sport,
      pattern: currentPattern,
      startTime: Date.now(),
      targets: 0,
      hits: 0,
      score: 0,
      safetyWarnings: []
    };

    setSession(newSession);
    setIsAnalyzing(true);

    // Start pose analysis
    startPoseAnalysis();

    // Start room monitoring
    roomAnalysisIntervalRef.current = setInterval(analyzeRoom, 5000); // Every 5 seconds
  }, [roomConstraints, currentPattern, sport, analyzeRoom]);

  // Stop training session
  const stopSession = useCallback(() => {
    setIsAnalyzing(false);
    setSession(null);
    
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
    if (roomAnalysisIntervalRef.current) {
      clearInterval(roomAnalysisIntervalRef.current);
      roomAnalysisIntervalRef.current = null;
    }
  }, []);

  // Start pose analysis with room mode integration
  const startPoseAnalysis = useCallback(() => {
    if (!pose || !videoRef.current || !isLive || !roomDetector) return;

    const analyzeFrame = async () => {
      try {
        if (!pose || !videoRef.current || !isLive || !roomDetector) return;

        // Set up pose detection callback
        pose.onResults((results) => {
          try {
            if (results.poseLandmarks && results.poseLandmarks.length > 0) {
              // Convert MediaPipe landmarks to our format
              const landmarks: LandmarkPoint[] = results.poseLandmarks.map((landmark: any) => ({
                x: landmark.x,
                y: landmark.y,
                z: landmark.z,
                visibility: landmark.visibility
              }));

              // Validate pose safety in room mode
              if (isRoomMode) {
                const safetyCheck = roomDetector.validatePoseSafety(landmarks);
                setSafetyWarnings(safetyCheck.warnings);
                
                if (!safetyCheck.safe) {
                  // Update session with safety warnings
                  setSession(prev => prev ? {
                    ...prev,
                    safetyWarnings: [...prev.safetyWarnings, ...safetyCheck.warnings]
                  } : null);
                }
              }

              // Perform sport analysis
              analyzer.analyzeImage(videoRef.current!, sport).then(analysisResult => {
                setCurrentResult(analysisResult);
                onAnalysisComplete?.(analysisResult);
                
                // Update training session
                updateSessionStats(analysisResult);
                
                // Draw overlays
                drawPoseOverlay(results);
                if (isRoomMode) {
                  drawRoomMarkers();
                }
              }).catch(err => {
                console.error('Sport analysis error:', err);
              });
            }
          } catch (err) {
            console.error('Frame analysis error:', err);
          }
        });

        // Send frame to MediaPipe
        await pose.send({ image: videoRef.current });
      } catch (err) {
        console.error('Pose analysis error:', err);
      }
    };

    // Dynamic FPS based on room mode requirements
    const analysisInterval = isRoomMode ? 16 : 33; // 60 FPS for room mode, 30 FPS for venue mode
    analysisIntervalRef.current = setInterval(analyzeFrame, analysisInterval);
  }, [pose, sport, isLive, isRoomMode, roomDetector, analyzer, onAnalysisComplete]);

  // Update training session statistics
  const updateSessionStats = useCallback((result: AnalysisResult) => {
    if (!session) return;

    setSession(prev => {
      if (!prev) return null;

      const newTargets = prev.targets + 1;
      const newHits = result.score > 70 ? prev.hits + 1 : prev.hits;
      const newScore = (newHits / newTargets) * 100;

      return {
        ...prev,
        targets: newTargets,
        hits: newHits,
        score: newScore
      };
    });
  }, [session]);

  // Draw pose overlay on canvas
  const drawPoseOverlay = (results: any) => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.poseLandmarks) {
      // Draw pose landmarks with room mode styling
      ctx.fillStyle = isRoomMode ? '#00ff88' : '#00ff00';
      ctx.strokeStyle = isRoomMode ? '#008844' : '#008800';
      ctx.lineWidth = isRoomMode ? 3 : 2;

      // Draw connections
      const connections = [
        [11, 12], // Shoulders
        [11, 13], [13, 15], // Left arm
        [12, 14], [14, 16], // Right arm
        [23, 24], // Hips
        [23, 25], [25, 27], // Left leg
        [24, 26], [26, 28]  // Right leg
      ];

      connections.forEach(([start, end]) => {
        const startPoint = results.poseLandmarks[start];
        const endPoint = results.poseLandmarks[end];

        if (startPoint && endPoint && startPoint.visibility > 0.5 && endPoint.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(startPoint.x * canvas.width, startPoint.y * canvas.height);
          ctx.lineTo(endPoint.x * canvas.width, endPoint.y * canvas.height);
          ctx.stroke();
        }
      });

      // Draw landmarks
      results.poseLandmarks.forEach((landmark: any, index: number) => {
        if (landmark.visibility > 0.5) {
          ctx.beginPath();
          ctx.arc(landmark.x * canvas.width, landmark.y * canvas.height, 6, 0, 2 * Math.PI);
          ctx.fill();
        }
      });

      // Room mode specific overlays
      if (isRoomMode) {
        drawRoomModeOverlay(ctx, canvas.width, canvas.height);
      }
    }
  };

  // Draw room mode specific overlays
  const drawRoomModeOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!session || !roomConstraints) return;

    // Draw room mode indicator
    ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
    ctx.fillRect(10, 10, 180, 100);
    
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('ROOM MODE ACTIVE', 20, 35);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Pattern: ${DRILL_PATTERNS[currentPattern as keyof typeof DRILL_PATTERNS]?.name}`, 20, 55);
    ctx.fillText(`Area: ${roomConstraints.usableArea.width.toFixed(1)}×${roomConstraints.usableArea.height.toFixed(1)}m`, 20, 75);
    ctx.fillText(`Safety: ${roomConstraints.safetyScore}%`, 20, 95);

    // Draw session stats
    if (session) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(width - 150, 10, 140, 80);
      
      const scoreColor = session.score >= 80 ? '#00ff00' : session.score >= 60 ? '#ffff00' : '#ff0000';
      ctx.fillStyle = scoreColor;
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round(session.score)}%`, width - 80, 40);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.fillText(`${session.hits}/${session.targets} targets`, width - 80, 60);
      ctx.fillText(`${Math.round((Date.now() - session.startTime) / 1000)}s`, width - 80, 80);
    }

    // Draw safety warnings
    if (safetyWarnings.length > 0) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.9)';
      ctx.fillRect(10, height - 100, width - 20, 90);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('SAFETY WARNINGS:', 20, height - 75);
      
      ctx.font = '12px Arial';
      safetyWarnings.slice(0, 3).forEach((warning, index) => {
        ctx.fillText(`• ${warning}`, 20, height - 55 + (index * 15));
      });
    }
  };

  // Draw room markers on overlay canvas
  const drawRoomMarkers = () => {
    if (!roomDetector || !overlayCanvasRef.current) return;

    const overlayCanvas = overlayCanvasRef.current;
    const videoElement = videoRef.current;
    
    if (!videoElement) return;

    // Match overlay canvas to video dimensions
    overlayCanvas.width = videoElement.videoWidth;
    overlayCanvas.height = videoElement.videoHeight;

    // Generate current markers
    const markers = roomDetector.generateRoomMarkers(
      currentPattern,
      roomConstraints?.usableArea || { width: 2, height: 2, area: 4, aspectRatio: 1 },
      overlayCanvas.width,
      overlayCanvas.height
    );

    roomDetector.renderRoomMarkers(markers);
  };

  // Change training pattern
  const changePattern = useCallback((newPattern: string) => {
    setCurrentPattern(newPattern);
    
    if (roomDetector && roomConstraints && overlayCanvasRef.current) {
      const markers = roomDetector.generateRoomMarkers(
        newPattern,
        roomConstraints.usableArea,
        overlayCanvasRef.current.width,
        overlayCanvasRef.current.height
      );
      setRoomMarkers(markers);
    }
  }, [roomDetector, roomConstraints]);

  // Get available patterns based on room constraints
  const getAvailablePatterns = () => {
    if (!roomConstraints) return ['seated_control'];
    
    return Object.entries(DRILL_PATTERNS)
      .filter(([_, config]) => roomConstraints.usableArea.area >= config.minArea)
      .map(([key]) => key);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-6">
      {/* Room Mode Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Web Room Mode AR - {sport.charAt(0).toUpperCase() + sport.slice(1)}
            {isRoomMode && <Badge variant="secondary" className="ml-2">Room Mode Active</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Maximize className="h-4 w-4" />
              <span className="text-sm">
                Space: {roomConstraints ? 
                  `${roomConstraints.dimensions.width.toFixed(1)}×${roomConstraints.dimensions.height.toFixed(1)}m` : 
                  'Not analyzed'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">
                Safety: {roomConstraints?.safetyScore || 0}%
              </span>
            </div>
            {roomConstraints && (
              <Badge variant={roomConstraints.safetyScore >= 80 ? "default" : "destructive"}>
                {roomConstraints.safetyScore >= 80 ? "Safe" : "Caution"}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Camera and Analysis View */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-[400px] object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* MediaPipe Pose Overlay Canvas */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ mixBlendMode: 'screen' }}
            />

            {/* Room Markers Overlay Canvas */}
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ mixBlendMode: 'multiply' }}
            />

            {/* Room Scanning Instructions */}
            {isScanning && (
              <div className="absolute top-20 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 z-40">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Scan className="w-5 h-5 text-blue-600 animate-spin" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">Scanning Space</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Move your device to map the training area. We'll automatically detect if you're in a confined space.
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Looking for flat surfaces...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Room Mode Detection Modal */}
            {isRoomMode && roomConstraints && !session && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md mx-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Home className="w-8 h-8 text-orange-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Room Mode Detected
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Switching to confined space training with adapted drill patterns
                    </p>
                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <p>• Increased tolerances for small spaces</p>
                      <p>• Safety-aware target placement</p>
                      <p>• Optimized for {roomConstraints.dimensions.width?.toFixed(1)}m × {roomConstraints.dimensions.height?.toFixed(1)}m</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-xs text-blue-600 font-medium">Width</p>
                        <p className="text-lg font-bold text-blue-800">{roomConstraints.dimensions.width?.toFixed(1)}m</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <p className="text-xs text-green-600 font-medium">Depth</p>
                        <p className="text-lg font-bold text-green-800">{roomConstraints.dimensions.height?.toFixed(1)}m</p>
                      </div>
                    </div>
                    <button
                      onClick={startSession}
                      className="w-full bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Continue Room Training
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Safety Warnings Overlay */}
            {safetyWarnings.length > 0 && session && (
              <div className="absolute bottom-20 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg p-3 z-40">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">Safety Alerts</h4>
                    <div className="space-y-1">
                      {safetyWarnings.slice(0, 2).map((warning, idx) => (
                        <p key={idx} className="text-sm text-white/90">• {warning}</p>
                      ))}
                      {safetyWarnings.length > 2 && (
                        <p className="text-xs text-white/70">+{safetyWarnings.length - 2} more warnings</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Room Constraint Visualization */}
            {isRoomMode && roomConstraints && session && (
              <div className="absolute top-4 right-4 bg-black/70 text-white p-3 rounded-lg z-40">
                <div className="text-center">
                  <h4 className="text-sm font-medium mb-2">Room Constraints</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-300">Area</p>
                      <p className="font-bold">{roomConstraints.usableArea.area.toFixed(1)}m²</p>
                    </div>
                    <div>
                      <p className="text-gray-300">Mode</p>
                      <p className="font-bold text-orange-400">ROOM</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-center space-x-1">
                    {roomConstraints.safetyScore >= 80 ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-xs">
                      {roomConstraints.safetyScore >= 80 ? 'Safe Environment' : 'Caution Required'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Status Indicators */}
            {isLive && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
            )}

            {isAnalyzing && (
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                <Activity className="h-3 w-3 animate-pulse" />
                TRAINING
              </div>
            )}

            {/* No Camera Overlay */}
            {!isLive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Home className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Room Mode AR Ready</p>
                  <p className="text-sm opacity-75">Start camera to begin room analysis</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls and Pattern Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Camera Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex gap-2">
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

                {isLive && !roomConstraints && (
                  <Button onClick={analyzeRoom} variant="secondary" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Analyze Room
                  </Button>
                )}

                {isLive && roomConstraints && !session && (
                  <Button onClick={startSession} className="flex items-center gap-2">
                    <Play className="h-4 w-4" />
                    Start Training
                  </Button>
                )}

                {session && (
                  <Button onClick={stopSession} variant="destructive" className="flex items-center gap-2">
                    <Pause className="h-4 w-4" />
                    Stop Training
                  </Button>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Training Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Select value={currentPattern} onValueChange={changePattern}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailablePatterns().map(pattern => (
                    <SelectItem key={pattern} value={pattern}>
                      {DRILL_PATTERNS[pattern as keyof typeof DRILL_PATTERNS]?.name || pattern}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentPattern && DRILL_PATTERNS[currentPattern as keyof typeof DRILL_PATTERNS] && (
                <p className="text-sm text-gray-600">
                  {DRILL_PATTERNS[currentPattern as keyof typeof DRILL_PATTERNS].description}
                </p>
              )}

              {roomConstraints && roomConstraints.recommendedPatterns.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Recommended for your space:</p>
                  <div className="flex flex-wrap gap-1">
                    {roomConstraints.recommendedPatterns.map(pattern => (
                      <Badge 
                        key={pattern} 
                        variant={pattern === currentPattern ? "default" : "outline"}
                        className="text-xs cursor-pointer"
                        onClick={() => changePattern(pattern)}
                      >
                        {DRILL_PATTERNS[pattern as keyof typeof DRILL_PATTERNS]?.name || pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Session Stats */}
      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Training Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{session.hits}</p>
                <p className="text-sm text-gray-600">Targets Hit</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{session.targets}</p>
                <p className="text-sm text-gray-600">Total Targets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{Math.round(session.score)}%</p>
                <p className="text-sm text-gray-600">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {Math.round((Date.now() - session.startTime) / 1000)}s
                </p>
                <p className="text-sm text-gray-600">Duration</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">{session.hits}/{session.targets}</span>
              </div>
              <Progress value={session.targets > 0 ? (session.hits / session.targets) * 100 : 0} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Warnings */}
      {safetyWarnings.length > 0 && (
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">Safety Warnings:</p>
            <ul className="list-disc list-inside space-y-1">
              {safetyWarnings.map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}