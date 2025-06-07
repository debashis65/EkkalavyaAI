import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Camera, BarChart3, Download, Upload } from "lucide-react";

export default function ARTools() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("shooting");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Connect to AI backend WebSocket for real-time analysis
  const startRealTimeAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      const ws = new WebSocket('ws://localhost:8000/ws/analyze');
      wsRef.current = ws;
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('Connected to AI backend');
      };
      
      ws.onmessage = (event) => {
        const result = JSON.parse(event.data);
        setAnalysisResults(result);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setIsAnalyzing(false);
      };

      // Start camera for real-time analysis
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      setIsAnalyzing(false);
    }
  };

  // Upload video file for analysis
  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sport', 'basketball');
    formData.append('analysis_type', 'form');

    try {
      const response = await fetch('http://localhost:8000/analyze-image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setAnalysisResults(result);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Mobile-First Header */}
      <div className="bg-white p-3 sm:p-4 text-black">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/logo.jpeg" 
              alt="Ekalavya AI Logo" 
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded bg-white p-1 flex-shrink-0"
            />
            <Camera className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
            <h1 className="text-sm sm:text-lg md:text-xl font-semibold truncate">AI-Powered Motion Analysis</h1>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
            <Button 
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-gray-300 text-black hover:bg-gray-100 text-xs sm:text-sm"
              size="sm"
            >
              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Upload Video
            </Button>
            <Button 
              onClick={startRealTimeAnalysis}
              disabled={isAnalyzing}
              className="text-white hover:opacity-90 text-xs sm:text-sm" 
              style={{ backgroundColor: '#06036D' }}
              size="sm"
            >
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </div>
        </div>
      </div>

      <BasketballAnalysis 
        isAnalyzing={isAnalyzing} 
        setIsAnalyzing={setIsAnalyzing} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />
    </div>
  );
}

function BasketballAnalysis({ isAnalyzing, setIsAnalyzing, activeTab, setActiveTab }: { 
  isAnalyzing: boolean; 
  setIsAnalyzing: (val: boolean) => void; 
  activeTab: string; 
  setActiveTab: (tab: string) => void; 
}) {
  return (
    <div className="flex flex-col lg:flex-row">
      {/* Mobile-First Main Video Area */}
      <div className="flex-1 p-3 sm:p-4 md:p-6">
        <div className="bg-gray-800 rounded-lg h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center mb-4 sm:mb-6 relative">
          {/* Mobile-First Player Name */}
          <div className="absolute top-2 sm:top-4 left-2 sm:left-4 text-white">
            <h3 className="text-sm sm:text-base font-semibold">Player: Marcus Johnson</h3>
            <p className="text-xs sm:text-sm text-gray-300">Jump Shot Analysis</p>
          </div>

          {/* Mobile-First Analysis Metrics Overlay */}
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-right">
            <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
              <div className="hidden sm:block">Release Height: <span className="text-green-400">8'2" (+2")</span></div>
              <div>Release Angle: <span className="text-yellow-400">42°</span></div>
              <div>Elbow: <span className="text-red-400">85%</span></div>
              <div className="hidden sm:block">Balance: <span className="text-green-400">78% (-2%)</span></div>
              <div>Follow: <span className="text-red-400">82%</span></div>
            </div>
          </div>

          {/* Mobile-First Center Content */}
          <div className="text-gray-400 text-center px-4">
            <Camera className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4" />
            <p className="text-sm sm:text-base">Basketball Motion Analysis</p>
            <p className="text-xs sm:text-sm">Upload video or start live analysis</p>
          </div>

          {/* Mobile-First Feedback Popup */}
          {isAnalyzing && (
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-orange-600 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg text-xs sm:text-sm">
                Elbow angle needs adjustment
              </div>
            </div>
          )}
        </div>

        {/* Mobile-First Video Controls */}
        <div className="space-y-3 mb-4 sm:mb-6">
          {/* Start Analysis - Full Width */}
          <Button
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 text-sm sm:text-base font-medium"
            onClick={() => setIsAnalyzing(!isAnalyzing)}
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            {isAnalyzing ? "Analyzing... 00:04 / 00:13" : "Start Analysis"}
          </Button>
          
          {/* Upload and Export - Horizontal */}
          <div className="flex gap-3">
            <Button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-xs sm:text-sm">
              <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
              Upload Video
            </Button>
            <Button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-xs sm:text-sm">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Mobile-First Analysis Tabs */}
        <div className="border-b border-gray-700 mb-4">
          <div className="flex gap-4 sm:gap-6 overflow-x-auto">
            <button 
              className={`pb-2 border-b-2 whitespace-nowrap text-sm sm:text-base ${activeTab === 'shooting' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('shooting')}
            >
              Shooting
            </button>
            <button 
              className={`pb-2 border-b-2 whitespace-nowrap text-sm sm:text-base ${activeTab === 'dribbling' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('dribbling')}
            >
              Dribbling
            </button>
            <button 
              className={`pb-2 border-b-2 ${activeTab === 'movement' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('movement')}
            >
              Movement
            </button>
            <button 
              className={`pb-2 border-b-2 ${activeTab === 'defense' ? 'border-orange-600 text-orange-600' : 'border-transparent text-gray-400 hover:text-white'}`}
              onClick={() => setActiveTab('defense')}
            >
              Defense
            </button>
          </div>
        </div>

        {/* Mobile-First AI Motion Analysis */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base sm:text-lg font-semibold">AI Motion Analysis</h3>
          
          {activeTab === 'shooting' && (
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                  ✓
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-green-400 text-sm sm:text-base">Follow through is excellent</h4>
                  <p className="text-xs sm:text-sm text-gray-300">Full extension with proper wrist snap creates optimal backspin. Continue to emphasize this technique.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                  ⚠
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-yellow-400 text-sm sm:text-base">Elbow alignment needs adjustment</h4>
                  <p className="text-xs sm:text-sm text-gray-300">Your shooting elbow is slightly out at a +2° angle. Try to keep it at 45° for better accuracy and consistency.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-1 text-xs sm:text-sm">
                  ✗
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-red-400 text-sm sm:text-base">Balance is shifting during release</h4>
                  <p className="text-xs sm:text-sm text-gray-300">Your weight distribution is uneven (70%). Focus on maintaining a stable base through the entire shot motion.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dribbling' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-medium text-green-400">Ball control is strong</h4>
                  <p className="text-sm text-gray-300">Consistent dribble height and rhythm. Good use of fingertips for ball control.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ⚠
                </div>
                <div>
                  <h4 className="font-medium text-yellow-400">Head position needs work</h4>
                  <p className="text-sm text-gray-300">Looking down at the ball 65% of the time. Practice keeping your head up to see the court.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✗
                </div>
                <div>
                  <h4 className="font-medium text-red-400">Weak hand development needed</h4>
                  <p className="text-sm text-gray-300">Left hand dribbling is 40% less controlled. Focus on non-dominant hand training.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movement' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-medium text-green-400">Explosive first step</h4>
                  <p className="text-sm text-gray-300">Quick acceleration from standstill. Good use of triple threat position.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ⚠
                </div>
                <div>
                  <h4 className="font-medium text-yellow-400">Footwork timing inconsistent</h4>
                  <p className="text-sm text-gray-300">Sometimes rushing pivots. Focus on controlled, deliberate foot placement.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✗
                </div>
                <div>
                  <h4 className="font-medium text-red-400">Lateral movement speed</h4>
                  <p className="text-sm text-gray-300">Side-to-side agility is 25% below optimal. Work on defensive slide drills.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'defense' && (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-medium text-green-400">Active hands positioning</h4>
                  <p className="text-sm text-gray-300">Good deflection rate and hand activity in passing lanes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ⚠
                </div>
                <div>
                  <h4 className="font-medium text-yellow-400">Stance width varies</h4>
                  <p className="text-sm text-gray-300">Defensive stance gets too narrow under pressure. Maintain wide base.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  ✗
                </div>
                <div>
                  <h4 className="font-medium text-red-400">Help defense positioning</h4>
                  <p className="text-sm text-gray-300">Slow to rotate on help defense. Need better court awareness and anticipation.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile-First Recommended Drills */}
        <div className="mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Recommended Drills</h3>
            <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300 self-start sm:self-auto text-xs sm:text-sm">View All ›</Button>
          </div>
          
          <div className="space-y-2 sm:space-y-3">
            <Card className="bg-gradient-to-r from-orange-900 to-orange-800 border-orange-600 p-3 sm:p-4 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                  🏀
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm sm:text-base">Form Shooting Drill</h4>
                  <p className="text-xs sm:text-sm text-orange-200">Focus on elbow alignment and balance - Your top priority</p>
                </div>
                <Button size="sm" className="bg-orange-500 hover:bg-orange-400 text-white font-medium px-2 sm:px-4 text-xs sm:text-sm">
                  Add to Plan
                </Button>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-blue-900 to-blue-800 border-blue-600 p-3 sm:p-4 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm sm:text-base">Balance Training</h4>
                  <p className="text-xs sm:text-sm text-blue-200">Improve shooting stance stability - Critical improvement</p>
                </div>
                <Button size="sm" className="bg-blue-500 hover:bg-blue-400 text-white font-medium px-2 sm:px-4 text-xs sm:text-sm">
                  Add to Plan
                </Button>
              </div>
            </Card>

            <Card className="bg-gradient-to-r from-green-900 to-green-800 border-green-600 p-3 sm:p-4 shadow-lg">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center text-base sm:text-lg flex-shrink-0">
                  🎯
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-white text-sm sm:text-base">Release Technique</h4>
                  <p className="text-xs sm:text-sm text-green-200">Perfect your follow-through motion - Essential skill</p>
                </div>
                <Button size="sm" className="bg-green-500 hover:bg-green-400 text-white font-medium px-2 sm:px-4 text-xs sm:text-sm">
                  Add to Plan
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Mobile-First Sidebar */}
      <div className="w-full lg:w-80 p-3 sm:p-4 md:p-6 bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-700">
        {/* Performance Metrics */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <Card className="bg-white border-gray-300 p-2 sm:p-3 shadow-md">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-green-600">82%</div>
                <div className="text-xs sm:text-sm text-gray-700">Accuracy</div>
              </div>
            </Card>
            <Card className="bg-white border-gray-300 p-2 sm:p-3 shadow-md">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-blue-600">7.2</div>
                <div className="text-xs sm:text-sm text-gray-700">Avg Score</div>
              </div>
            </Card>
            <Card className="bg-white border-gray-300 p-2 sm:p-3 shadow-md">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-orange-600">45°</div>
                <div className="text-xs sm:text-sm text-gray-700">Release</div>
              </div>
            </Card>
            <Card className="bg-white border-gray-300 p-2 sm:p-3 shadow-md">
              <div className="text-center">
                <div className="text-lg sm:text-xl font-bold text-purple-600">92%</div>
                <div className="text-xs sm:text-sm text-gray-700">Form</div>
              </div>
            </Card>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Weekly Progress</h3>
          <Card className="bg-white border-gray-300 p-3 sm:p-4 shadow-md">
            <div className="space-y-2 sm:space-y-3">
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1 text-gray-800">
                  <span>Shooting Accuracy</span>
                  <span className="text-green-600 font-semibold">+5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div className="bg-green-500 h-1.5 sm:h-2 rounded-full" style={{width: '82%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1 text-gray-800">
                  <span>Form Consistency</span>
                  <span className="text-blue-600 font-semibold">+3%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div className="bg-blue-500 h-1.5 sm:h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs sm:text-sm mb-1 text-gray-800">
                  <span>Balance</span>
                  <span className="text-orange-600 font-semibold">-2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                  <div className="bg-orange-500 h-1.5 sm:h-2 rounded-full" style={{width: '68%'}}></div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Session History */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Sessions</h3>
          <div className="space-y-2 sm:space-y-3">
            <Card className="bg-white border-gray-300 p-2 sm:p-3 shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-800">Jump Shot Practice</div>
                  <div className="text-xs text-gray-600">2 hours ago</div>
                </div>
                <div className="text-green-600 text-xs sm:text-sm font-semibold">85%</div>
              </div>
            </Card>
            <Card className="bg-white border-gray-300 p-2 sm:p-3 shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-800">Free Throws</div>
                  <div className="text-xs text-gray-600">Yesterday</div>
                </div>
                <div className="text-blue-600 text-xs sm:text-sm font-semibold">78%</div>
              </div>
            </Card>
            <Card className="bg-white border-gray-300 p-2 sm:p-3 shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-gray-800">Layup Drills</div>
                  <div className="text-xs text-gray-600">2 days ago</div>
                </div>
                <div className="text-orange-600 text-xs sm:text-sm font-semibold">91%</div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function SwimmingAnalysis({ isAnalyzing, setIsAnalyzing }: { isAnalyzing: boolean; setIsAnalyzing: (val: boolean) => void }) {
  return (
    <div className="p-6">
      {/* Swimming Video Analysis */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-lg h-48 flex items-center justify-center mb-6 relative overflow-hidden">
        <div className="absolute top-4 left-4 text-white text-sm">
          <span className="bg-red-600 px-2 py-1 rounded">REC 00:32</span>
        </div>
        
        <div className="absolute top-4 right-4 text-right text-white text-sm">
          <div>Pull Angle: 75°</div>
          <div>Target: 78°</div>
        </div>

        <div className="absolute bottom-4 right-4 text-white text-sm">
          <div>Stroke Rate: 32 spm</div>
          <div>Efficiency: 85%</div>
          <div>DPS: 1.85m</div>
        </div>

        {/* Underwater camera view indicator */}
        <div className="text-center text-white">
          <div className="text-sm mb-2">Underwater Camera View</div>
          <div className="text-lg">🏊‍♂️ Freestyle Technique</div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-4 mb-6">
        <Button className="bg-orange-600 hover:bg-orange-700">📹 Record</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">📊 Analyze</Button>
        <Button className="bg-green-600 hover:bg-green-700">✅ Submit</Button>
      </div>

      {/* Recent Analysis */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Swimming Analysis</h3>
          <Button variant="ghost" size="sm" className="text-orange-400">View All</Button>
        </div>

        <div className="space-y-3">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Freestyle Technique</h4>
                  <p className="text-sm text-gray-400">Today, 13:45</p>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-semibold">+2% Efficiency</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Turn Analysis</h4>
                  <p className="text-sm text-gray-400">Yesterday, 11:30</p>
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-semibold">-0.4s Improvement</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Swimming Metrics */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">32</div>
              <div className="text-sm text-gray-400">SWOLF</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">31.2s</div>
              <div className="text-sm text-gray-400">50m Split</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">1.85m</div>
              <div className="text-sm text-gray-400">DPS</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">0.82</div>
              <div className="text-sm text-gray-400">Drag Factor</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}