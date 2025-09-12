/**
 * Real-Time Analytics Dashboard
 * Integrates with the production-grade AI backend systems including:
 * - Multi-Object Tracking Pipeline with ByteTrack
 * - Sport-Specific Detection Models with YOLO
 * - Decision Logic Engine for AI recommendations
 * - Context Understanding Engine
 * - Dynamic Overlay Renderer
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, Target, TrendingUp, Users, Zap, Eye, BarChart3, PlayCircle, 
  PauseCircle, RotateCcw, Settings, AlertTriangle, CheckCircle, 
  Brain, Cpu, Camera, Layers, Grid, ArrowRight, Clock, Shield
} from 'lucide-react';
import { SportAnalyticsController } from './SportAnalyticsController';
import { TrackingVisualization } from './TrackingVisualization';
import { DecisionEnginePanel } from './DecisionEnginePanel';
import { PerformanceMetricsPanel } from './PerformanceMetricsPanel';
import { SportDetectionPanel } from './SportDetectionPanel';

// Type definitions matching the backend AI systems
interface MultiObjectTrackResult {
  track_id: number;
  category: string;
  confidence: number;
  velocity: { x: number; y: number };
  frames_tracked: number;
  state: 'new' | 'tracked' | 'lost' | 'removed';
  sport_specific_data: any;
  history: Array<{
    bbox: any;
    confidence: number;
    timestamp: number;
    velocity: { x: number; y: number };
  }>;
}

interface SportDetectionResult {
  object_type: string;
  category: string;
  bbox: { x1: number; y1: number; x2: number; y2: number };
  confidence: number;
  sport_confidence: number;
  features: Record<string, any>;
  timestamp: number;
  detection_id: string;
}

interface DecisionAnalysis {
  sport_name: string;
  primary_decision: SportDecision;
  alternative_decisions: SportDecision[];
  situation_summary: string;
  key_factors: string[];
  constraints: string[];
  opportunities: string[];
  overall_confidence: number;
  recommended_visualization: Record<string, any>;
}

interface SportDecision {
  decision_id: string;
  decision_type: string;
  title: string;
  description: string;
  recommendation: string;
  confidence: string;
  urgency: string;
  expected_impact: number;
  success_probability: number;
  risk_assessment: number;
  implementation_steps: string[];
}

interface ContextData {
  context_type: string;
  sport_phase: string;
  game_state: Record<string, any>;
  environmental_factors: Record<string, any>;
  player_states: Record<string, any>;
  tactical_situation: Record<string, any>;
}

interface AnalyticsState {
  sport: string;
  isLive: boolean;
  
  // Multi-Object Tracking Data
  activeTracks: MultiObjectTrackResult[];
  trackingMetrics: {
    total_tracks: number;
    active_tracks: number;
    lost_tracks: number;
    tracking_accuracy: number;
    processing_time_ms: number;
  };
  
  // Sport Detection Data
  detections: SportDetectionResult[];
  detectionMetrics: {
    objects_detected: number;
    detection_accuracy: number;
    sport_confidence: number;
    categories_found: string[];
  };
  
  // Decision Engine Data
  currentDecisions: DecisionAnalysis[];
  decisionHistory: SportDecision[];
  
  // Context Understanding
  contextData: ContextData | null;
  
  // Performance Metrics
  systemMetrics: {
    fps: number;
    total_processing_time: number;
    ai_model_latency: number;
    memory_usage: number;
    gpu_utilization: number;
    api_response_time: number;
  };
  
  // Game Events and Analysis
  gameEvents: Array<{
    event_type: string;
    timestamp: number;
    description: string;
    confidence: number;
    impact_score: number;
    participants: string[];
  }>;
}

const SUPPORTED_SPORTS = [
  'basketball', 'tennis', 'football', 'volleyball', 'archery', 'swimming',
  'cricket', 'badminton', 'golf', 'boxing', 'wrestling', 'gymnastics'
];

export function RealTimeAnalyticsDashboard() {
  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    sport: 'basketball',
    isLive: false,
    activeTracks: [],
    trackingMetrics: {
      total_tracks: 0,
      active_tracks: 0,
      lost_tracks: 0,
      tracking_accuracy: 0,
      processing_time_ms: 0
    },
    detections: [],
    detectionMetrics: {
      objects_detected: 0,
      detection_accuracy: 0,
      sport_confidence: 0,
      categories_found: []
    },
    currentDecisions: [],
    decisionHistory: [],
    contextData: null,
    systemMetrics: {
      fps: 0,
      total_processing_time: 0,
      ai_model_latency: 0,
      memory_usage: 0,
      gpu_utilization: 0,
      api_response_time: 0
    },
    gameEvents: []
  });

  const [selectedSport, setSelectedSport] = useState('basketball');
  const [activeTab, setActiveTab] = useState('overview');
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const analyticsController = useRef(new SportAnalyticsController());

  // Initialize AI systems
  const initializeAnalytics = useCallback(async () => {
    try {
      setIsInitializing(true);
      
      // Initialize all backend AI systems
      await analyticsController.current.initializeSystems(selectedSport);
      
      // Setup video stream
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, frameRate: 30 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      setAnalyticsState(prev => ({ ...prev, isLive: true }));
      startRealTimeAnalysis();
      
    } catch (error) {
      console.error('Failed to initialize analytics systems:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [selectedSport]);

  // Real-time analysis pipeline integration
  const startRealTimeAnalysis = useCallback(async () => {
    if (!videoRef.current) return;

    const processFrame = async () => {
      try {
        if (!videoRef.current || !analyticsState.isLive) return;

        const frameData = captureFrameData();
        
        // Multi-Object Tracking Pipeline
        const trackingResults = await analyticsController.current.processTracking(
          frameData, selectedSport
        );
        
        // Sport-Specific Detection
        const detectionResults = await analyticsController.current.processDetection(
          frameData, selectedSport
        );
        
        // Context Understanding
        const contextResults = await analyticsController.current.processContext(
          trackingResults, detectionResults, selectedSport
        );
        
        // Decision Logic Engine
        const decisionResults = await analyticsController.current.generateDecisions(
          contextResults, selectedSport
        );
        
        // Performance Metrics
        const performanceMetrics = await analyticsController.current.getPerformanceMetrics();

        // Update state with all results
        setAnalyticsState(prev => ({
          ...prev,
          activeTracks: trackingResults.tracks || [],
          trackingMetrics: trackingResults.metrics || prev.trackingMetrics,
          detections: detectionResults.detections || [],
          detectionMetrics: detectionResults.metrics || prev.detectionMetrics,
          currentDecisions: decisionResults.analyses || [],
          contextData: contextResults || null,
          systemMetrics: performanceMetrics || prev.systemMetrics
        }));

        // Process game events
        const newEvents = extractGameEvents(trackingResults, detectionResults, contextResults);
        if (newEvents.length > 0) {
          setAnalyticsState(prev => ({
            ...prev,
            gameEvents: [...prev.gameEvents.slice(-19), ...newEvents].slice(-20)
          }));
        }

        // Render visualizations
        renderTrackingOverlay(trackingResults);
        renderDecisionOverlay(decisionResults);
        
      } catch (error) {
        console.error('Frame processing error:', error);
      }
    };

    // Run at 30 FPS for real-time analysis
    intervalRef.current = setInterval(processFrame, 33);
  }, [analyticsState.isLive, selectedSport]);

  const captureFrameData = () => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return null;
    
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    return {
      imageData: canvas.toDataURL('image/jpeg', 0.9),
      timestamp: Date.now() / 1000,
      dimensions: { width: canvas.width, height: canvas.height }
    };
  };

  const extractGameEvents = (tracking: any, detection: any, context: any) => {
    const events = [];
    
    // Ball possession changes
    if (context?.game_state?.ball_possession_changed) {
      events.push({
        event_type: 'possession_change',
        timestamp: Date.now(),
        description: `Ball possession changed to ${context.game_state.current_possessor}`,
        confidence: 0.95,
        impact_score: 0.8,
        participants: [context.game_state.current_possessor, context.game_state.previous_possessor]
      });
    }
    
    // High-speed movements
    const highSpeedTracks = tracking?.tracks?.filter((track: any) => 
      Math.sqrt(track.velocity.x ** 2 + track.velocity.y ** 2) > 50
    ) || [];
    
    if (highSpeedTracks.length > 0) {
      events.push({
        event_type: 'high_speed_movement',
        timestamp: Date.now(),
        description: `High-speed movement detected (${highSpeedTracks.length} objects)`,
        confidence: 0.85,
        impact_score: 0.6,
        participants: highSpeedTracks.map((track: any) => `track_${track.track_id}`)
      });
    }
    
    // Equipment interactions
    const equipmentDetections = detection?.detections?.filter((det: any) => 
      det.category === 'equipment'
    ) || [];
    
    if (equipmentDetections.length > 0) {
      events.push({
        event_type: 'equipment_interaction',
        timestamp: Date.now(),
        description: `Equipment interaction: ${equipmentDetections[0].object_type}`,
        confidence: equipmentDetections[0].confidence,
        impact_score: 0.4,
        participants: ['player', equipmentDetections[0].object_type]
      });
    }
    
    return events;
  };

  const renderTrackingOverlay = (trackingResults: any) => {
    if (!overlayCanvasRef.current || !trackingResults?.tracks) return;
    
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw tracking boxes and trajectories
    trackingResults.tracks.forEach((track: MultiObjectTrackResult) => {
      const { category, confidence, velocity, track_id } = track;
      
      // Color based on category
      const colors = {
        player: '#00ff00',
        ball: '#ff6600',
        equipment: '#0066ff',
        referee: '#ffff00'
      };
      const color = colors[category as keyof typeof colors] || '#ffffff';
      
      // Draw tracking box
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(
        track.sport_specific_data?.bbox?.x1 || 0,
        track.sport_specific_data?.bbox?.y1 || 0,
        (track.sport_specific_data?.bbox?.x2 || 0) - (track.sport_specific_data?.bbox?.x1 || 0),
        (track.sport_specific_data?.bbox?.y2 || 0) - (track.sport_specific_data?.bbox?.y1 || 0)
      );
      
      // Draw track ID and confidence
      ctx.fillStyle = color;
      ctx.font = '14px Arial';
      ctx.fillText(
        `ID:${track_id} (${(confidence * 100).toFixed(0)}%)`,
        track.sport_specific_data?.bbox?.x1 || 0,
        (track.sport_specific_data?.bbox?.y1 || 0) - 5
      );
      
      // Draw velocity vector
      if (velocity.x !== 0 || velocity.y !== 0) {
        const centerX = ((track.sport_specific_data?.bbox?.x1 || 0) + (track.sport_specific_data?.bbox?.x2 || 0)) / 2;
        const centerY = ((track.sport_specific_data?.bbox?.y1 || 0) + (track.sport_specific_data?.bbox?.y2 || 0)) / 2;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + velocity.x, centerY + velocity.y);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(velocity.y, velocity.x);
        const headLength = 10;
        ctx.lineTo(
          centerX + velocity.x - headLength * Math.cos(angle - Math.PI / 6),
          centerY + velocity.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(centerX + velocity.x, centerY + velocity.y);
        ctx.lineTo(
          centerX + velocity.x - headLength * Math.cos(angle + Math.PI / 6),
          centerY + velocity.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });
  };

  const renderDecisionOverlay = (decisionResults: any) => {
    if (!overlayCanvasRef.current || !decisionResults?.analyses?.length) return;
    
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw AI recommendations overlay
    const primaryDecision = decisionResults.analyses[0]?.primary_decision;
    if (primaryDecision) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(10, canvas.height - 120, 400, 110);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('AI RECOMMENDATION', 20, canvas.height - 95);
      
      ctx.font = '14px Arial';
      ctx.fillText(primaryDecision.title, 20, canvas.height - 75);
      
      ctx.font = '12px Arial';
      const words = primaryDecision.description.split(' ');
      let line = '';
      let y = canvas.height - 55;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const testWidth = ctx.measureText(testLine).width;
        if (testWidth > 370 && i > 0) {
          ctx.fillText(line, 20, y);
          line = words[i] + ' ';
          y += 15;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 20, y);
      
      // Confidence indicator
      const confidenceColor = primaryDecision.confidence === 'very_high' ? '#00ff00' :
                            primaryDecision.confidence === 'high' ? '#88ff00' :
                            primaryDecision.confidence === 'medium' ? '#ffff00' : '#ff8800';
      ctx.fillStyle = confidenceColor;
      ctx.fillRect(350, canvas.height - 100, 50, 8);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px Arial';
      ctx.fillText(primaryDecision.confidence.toUpperCase(), 352, canvas.height - 85);
    }
  };

  const stopAnalysis = useCallback(() => {
    setAnalyticsState(prev => ({ ...prev, isLive: false }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    analyticsController.current.cleanup();
  }, []);

  const resetAnalytics = useCallback(async () => {
    await analyticsController.current.resetSystems(selectedSport);
    setAnalyticsState(prev => ({
      ...prev,
      activeTracks: [],
      detections: [],
      currentDecisions: [],
      gameEvents: []
    }));
  }, [selectedSport]);

  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header with AI System Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3">
                <Brain className="w-6 h-6 text-blue-600" />
                Real-Time Sports AI Analytics Dashboard
              </CardTitle>
              <p className="text-gray-600 mt-1">
                Multi-Object Tracking • Sport Detection • Decision Engine • Context Understanding
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Select value={selectedSport} onValueChange={setSelectedSport} disabled={analyticsState.isLive}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_SPORTS.map(sport => (
                    <SelectItem key={sport} value={sport}>
                      {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={analyticsState.isLive ? stopAnalysis : initializeAnalytics}
                disabled={isInitializing}
                className={analyticsState.isLive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
              >
                {isInitializing ? (
                  <>
                    <Cpu className="w-4 h-4 mr-2 animate-spin" />
                    Initializing AI...
                  </>
                ) : analyticsState.isLive ? (
                  <>
                    <PauseCircle className="w-4 h-4 mr-2" />
                    Stop Analysis
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Start AI Analysis
                  </>
                )}
              </Button>
              
              <Button onClick={resetAnalytics} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
          
          {/* AI System Status Indicators */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${analyticsState.isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
              <span className="text-sm font-medium">
                {analyticsState.isLive ? 'AI Systems Active' : 'Systems Offline'}
              </span>
            </div>
            
            {analyticsState.isLive && (
              <>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {analyticsState.trackingMetrics.active_tracks} Tracks
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {analyticsState.detectionMetrics.objects_detected} Objects
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  {analyticsState.currentDecisions.length} Decisions
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {analyticsState.systemMetrics.fps.toFixed(1)} FPS
                </Badge>
              </>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Video Stream with AI Overlays */}
      <Card>
        <CardContent className="p-0">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-[500px] object-cover"
              autoPlay
              playsInline
              muted
            />
            
            {/* AI Analysis Overlays */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none opacity-0"
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ mixBlendMode: 'screen' }}
            />

            {/* Status Overlays */}
            {analyticsState.isLive && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE AI ANALYSIS
              </div>
            )}

            {analyticsState.isLive && (
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <Badge className="bg-black/80 text-white">
                  Tracking: {(analyticsState.trackingMetrics.tracking_accuracy * 100).toFixed(1)}%
                </Badge>
                <Badge className="bg-black/80 text-white">
                  Detection: {(analyticsState.detectionMetrics.detection_accuracy * 100).toFixed(1)}%
                </Badge>
                <Badge className="bg-black/80 text-white">
                  Latency: {analyticsState.systemMetrics.ai_model_latency.toFixed(1)}ms
                </Badge>
              </div>
            )}

            {!analyticsState.isLive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">AI Sports Analytics Ready</p>
                  <p className="text-sm opacity-75">Advanced multi-object tracking, detection, and decision analysis</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracking">Multi-Object Tracking</TabsTrigger>
          <TabsTrigger value="detection">Sport Detection</TabsTrigger>
          <TabsTrigger value="decisions">AI Decisions</TabsTrigger>
          <TabsTrigger value="context">Context Engine</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Active Tracks</p>
                    <p className="text-3xl font-bold">{analyticsState.trackingMetrics.active_tracks}</p>
                    <p className="text-xs opacity-75">
                      {analyticsState.trackingMetrics.tracking_accuracy > 0 && 
                        `${(analyticsState.trackingMetrics.tracking_accuracy * 100).toFixed(1)}% accuracy`}
                    </p>
                  </div>
                  <Target className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Objects Detected</p>
                    <p className="text-3xl font-bold">{analyticsState.detectionMetrics.objects_detected}</p>
                    <p className="text-xs opacity-75">
                      {analyticsState.detectionMetrics.categories_found.length} categories
                    </p>
                  </div>
                  <Eye className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">AI Decisions</p>
                    <p className="text-3xl font-bold">{analyticsState.currentDecisions.length}</p>
                    <p className="text-xs opacity-75">Real-time recommendations</p>
                  </div>
                  <Brain className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">System Performance</p>
                    <p className="text-3xl font-bold">{analyticsState.systemMetrics.fps.toFixed(0)}</p>
                    <p className="text-xs opacity-75">FPS • {analyticsState.systemMetrics.ai_model_latency.toFixed(0)}ms latency</p>
                  </div>
                  <Zap className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Game Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Game Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {analyticsState.gameEvents.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No game events detected yet</p>
                ) : (
                  analyticsState.gameEvents.slice().reverse().map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="capitalize">
                          {event.event_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm">{event.description}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Impact: {(event.impact_score * 100).toFixed(0)}%</span>
                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multi-Object Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <TrackingVisualization 
            tracks={analyticsState.activeTracks}
            metrics={analyticsState.trackingMetrics}
            sport={selectedSport}
          />
        </TabsContent>

        {/* Sport Detection Tab */}
        <TabsContent value="detection" className="space-y-6">
          <SportDetectionPanel 
            detections={analyticsState.detections}
            metrics={analyticsState.detectionMetrics}
            sport={selectedSport}
          />
        </TabsContent>

        {/* AI Decisions Tab */}
        <TabsContent value="decisions" className="space-y-6">
          <DecisionEnginePanel 
            decisions={analyticsState.currentDecisions}
            history={analyticsState.decisionHistory}
            sport={selectedSport}
          />
        </TabsContent>

        {/* Context Engine Tab */}
        <TabsContent value="context" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Context Understanding Engine
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsState.contextData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Game State</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Context Type:</span>
                        <Badge variant="secondary">{analyticsState.contextData.context_type}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Sport Phase:</span>
                        <span className="text-sm font-medium">{analyticsState.contextData.sport_phase}</span>
                      </div>
                      {Object.entries(analyticsState.contextData.game_state || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-sm">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Environmental Factors</h4>
                    <div className="space-y-2">
                      {Object.entries(analyticsState.contextData.environmental_factors || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-sm">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No context data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <PerformanceMetricsPanel 
            metrics={analyticsState.systemMetrics}
            trackingMetrics={analyticsState.trackingMetrics}
            detectionMetrics={analyticsState.detectionMetrics}
            isLive={analyticsState.isLive}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}