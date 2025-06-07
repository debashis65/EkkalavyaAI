import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Zap, Trophy, AlertCircle, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VideoProcessor } from "@/components/VideoProcessor";
import { 
  RealTimeSportsAnalyzer, 
  getSportConfig, 
  getEssentialMetrics, 
  generateDrillRecommendations,
  type RealTimeAnalysis,
  type DrillRecommendation,
  type AnalysisMetric
} from "@/lib/sportsAnalysis";

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
  const { toast } = useToast();
  
  // Real user data and authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(user || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  
  // Real-time analysis system
  const [analyzer] = useState(() => new RealTimeSportsAnalyzer());
  const [isConnected, setIsConnected] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<RealTimeAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<RealTimeAnalysis[]>([]);
  
  // Sport and analysis configuration
  const [selectedSport, setSelectedSport] = useState<string>(user?.primarySport || 'basketball');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string>('');
  const [drillRecommendations, setDrillRecommendations] = useState<DrillRecommendation[]>([]);
  
  // Real-time metrics (no placeholder data)
  const [liveMetrics, setLiveMetrics] = useState<AnalysisMetric[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize analysis system on component mount
  useEffect(() => {
    const initializeAnalyzer = async () => {
      try {
        const connected = await analyzer.connectToAnalysisServer();
        setIsConnected(connected);
        
        if (connected) {
          analyzer.onAnalysisUpdate((analysis) => {
            setCurrentAnalysis(analysis);
            setLiveMetrics(analysis.metrics);
            setAnalysisHistory(prev => [analysis, ...prev.slice(0, 9)]);
            
            // Generate drill recommendations based on real analysis
            if (analysis.metrics.length > 0) {
              generateDrillRecommendations(
                analysis.sport, 
                analysis.metrics, 
                currentUser?.role === 'athlete' ? 'intermediate' : 'advanced'
              ).then(setDrillRecommendations).catch(console.error);
            }
          });
          
          toast({
            title: "Analysis System Ready",
            description: "Connected to real-time AI analysis server"
          });
        } else {
          toast({
            title: "Connection Failed",
            description: "Unable to connect to analysis server",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Failed to initialize analyzer:', error);
        toast({
          title: "System Error",
          description: "Failed to initialize analysis system",
          variant: "destructive"
        });
      }
    };

    initializeAnalyzer();
    
    return () => {
      analyzer.disconnect();
    };
  }, [analyzer, toast, currentUser?.role]);

  // Get real sport configuration
  const sportConfig = getSportConfig(selectedSport);
  const essentialMetrics = getEssentialMetrics(selectedSport);

  // Set default analysis type when sport changes
  useEffect(() => {
    if (sportConfig && sportConfig.analysisTypes.length > 0) {
      setSelectedAnalysisType(sportConfig.analysisTypes[0]);
    }
  }, [sportConfig]);

  // Handle video analysis completion
  const handleAnalysisComplete = async (analysisData: any) => {
    try {
      setIsAnalyzing(false);
      
      if (analysisData && analysisData.metrics) {
        const realTimeAnalysis: RealTimeAnalysis = {
          sport: selectedSport,
          timestamp: new Date().toISOString(),
          session_id: `session_${Date.now()}`,
          athlete_id: currentUser?.id || 'anonymous',
          metrics: analysisData.metrics,
          overall_score: analysisData.overall_score || 0,
          improvement_areas: analysisData.improvement_areas || [],
          drill_recommendations: analysisData.drill_recommendations || []
        };
        
        setCurrentAnalysis(realTimeAnalysis);
        setLiveMetrics(realTimeAnalysis.metrics);
        setDrillRecommendations(realTimeAnalysis.drill_recommendations);
        
        toast({
          title: "Analysis Complete",
          description: `${selectedSport} analysis completed successfully`
        });
      }
    } catch (error) {
      console.error('Analysis processing failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Unable to process analysis results",
        variant: "destructive"
      });
    }
  };

  // Handle analysis errors
  const handleAnalysisError = (error: string) => {
    setIsAnalyzing(false);
    toast({
      title: "Analysis Error",
      description: error,
      variant: "destructive"
    });
  };

  // Get metric color based on performance score
  const getMetricColor = (metric: AnalysisMetric): string => {
    const [min, max] = metric.optimal_range;
    const percentage = ((metric.value - min) / (max - min)) * 100;
    
    if (percentage >= 80) return 'text-green-400';
    if (percentage >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  // Authentication check
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Authentication Required</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in to access the AR Sports Analysis tools.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sport configuration not found
  if (!sportConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <Card className="w-full max-w-md bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-center">Sport Not Supported</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Analysis for {selectedSport} is not yet available.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Realtime Sports Connect AI Analysis - Ekkalavya Sports AI</title>
        <meta name="description" content="Real-time AI-powered sports performance analysis and coaching" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="container mx-auto px-4 py-6">
          
          {/* Header with real user data */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Realtime Sports Connect AI Analysis
            </h1>
            <div className="flex items-center justify-between">
              <p className="text-gray-400">
                Athlete: {currentUser.name} | Sport: {sportConfig.name}
              </p>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <Badge variant="secondary" className="bg-green-900 text-green-100">
                    <Wifi className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Connection status alert */}
          {!isConnected && (
            <Alert className="mb-6 bg-red-900/20 border-red-500">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-200">
                Analysis server is disconnected. Real-time analysis is not available.
              </AlertDescription>
            </Alert>
          )}

          {/* Sport and analysis type selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sport
              </label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basketball">Basketball</SelectItem>
                  <SelectItem value="archery">Archery</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                  <SelectItem value="athletics">Athletics</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="tennis">Tennis</SelectItem>
                  <SelectItem value="volleyball">Volleyball</SelectItem>
                  <SelectItem value="cricket">Cricket</SelectItem>
                  <SelectItem value="badminton">Badminton</SelectItem>
                  <SelectItem value="gymnastics">Gymnastics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Analysis Type
              </label>
              <Select value={selectedAnalysisType} onValueChange={setSelectedAnalysisType}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sportConfig.analysisTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Video processing component */}
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Video Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <VideoProcessor
                sport={selectedSport}
                analysisType={selectedAnalysisType}
                onAnalysisComplete={handleAnalysisComplete}
                onError={handleAnalysisError}
              />
            </CardContent>
          </Card>

          {/* Real-time metrics display (8 essential metrics only) */}
          {liveMetrics.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {liveMetrics.slice(0, 8).map((metric, index) => (
                  <Card key={metric.name} className={`bg-gray-800 border-gray-700 ${index === 7 ? 'col-span-2 md:col-span-4' : ''}`}>
                    <CardContent className="p-3 md:p-4">
                      <div className="text-xs md:text-sm text-gray-400 mb-1">
                        {metric.name}
                      </div>
                      <div className={`text-sm md:text-lg font-bold ${getMetricColor(metric)}`}>
                        {metric.value}{metric.unit}
                      </div>
                      {currentAnalysis && (
                        <div className="text-xs text-gray-500 mt-1">
                          Updated {new Date(currentAnalysis.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* AI-generated drill recommendations */}
          {drillRecommendations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white mb-4">Recommended Drills</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drillRecommendations.slice(0, 4).map((drill) => (
                  <Card key={drill.id} className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm">{drill.name}</CardTitle>
                        <Badge variant={drill.difficulty === 'beginner' ? 'secondary' : drill.difficulty === 'intermediate' ? 'default' : 'destructive'}>
                          {drill.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-2">{drill.description}</p>
                      <div className="text-xs text-gray-400">
                        Duration: {drill.duration} | Focus: {drill.focus_areas.join(', ')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Analysis history */}
          {analysisHistory.length > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Analysis Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisHistory.slice(0, 5).map((analysis, index) => (
                    <div key={`${analysis.session_id}-${index}`} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{analysis.sport}</div>
                        <div className="text-gray-400 text-sm">
                          {new Date(analysis.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold">{analysis.overall_score}%</div>
                        <div className="text-gray-400 text-sm">Overall Score</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}