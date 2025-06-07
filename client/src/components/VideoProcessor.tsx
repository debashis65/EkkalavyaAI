import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, Upload, Video, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface VideoProcessorProps {
  sport: string;
  analysisType: string;
  onAnalysisComplete: (analysis: any) => void;
  onError: (error: string) => void;
}

export const VideoProcessor: React.FC<VideoProcessorProps> = ({
  sport,
  analysisType,
  onAnalysisComplete,
  onError
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentMode, setCurrentMode] = useState<'camera' | 'upload' | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [analysisFrames, setAnalysisFrames] = useState<string[]>([]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCurrentMode('camera');
      }
    } catch (error) {
      onError('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCurrentMode(null);
    setIsRecording(false);
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
      setCurrentMode('upload');
      
      if (videoRef.current) {
        const url = URL.createObjectURL(file);
        videoRef.current.src = url;
        videoRef.current.onloadedmetadata = () => {
          URL.revokeObjectURL(url);
        };
      }
    } else {
      onError('Please select a valid video file.');
    }
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d')!;
    
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const processVideo = async () => {
    if (!videoRef.current) {
      onError('No video source available');
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);
    setAnalysisFrames([]);

    try {
      const video = videoRef.current;
      const duration = video.duration || 10; // Default 10 seconds for live camera
      const frameInterval = Math.max(0.5, duration / 20); // Capture up to 20 frames
      const frames: string[] = [];

      if (currentMode === 'camera') {
        // For live camera, capture frames over time
        const frameCount = 10;
        for (let i = 0; i < frameCount; i++) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms between frames
          const frame = captureFrame();
          if (frame) {
            frames.push(frame);
            setAnalysisFrames(prev => [...prev, frame]);
          }
          setProcessingProgress((i + 1) / frameCount * 50);
        }
      } else {
        // For uploaded video, seek through and capture frames
        video.currentTime = 0;
        await new Promise(resolve => {
          video.oncanplay = resolve;
        });

        for (let time = 0; time < duration; time += frameInterval) {
          video.currentTime = time;
          await new Promise(resolve => {
            video.onseeked = resolve;
          });
          
          const frame = captureFrame();
          if (frame) {
            frames.push(frame);
            setAnalysisFrames(prev => [...prev, frame]);
          }
          setProcessingProgress((time / duration) * 50);
        }
      }

      // Send frames for AI analysis
      const analysisData = await analyzeFrames(frames);
      setProcessingProgress(100);
      
      onAnalysisComplete(analysisData);
    } catch (error) {
      onError('Failed to process video: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeFrames = async (frames: string[]): Promise<any> => {
    const response = await fetch('/api/analyze-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sport,
        analysis_type: analysisType,
        frames,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      throw new Error('Analysis failed');
    }

    return response.json();
  };

  return (
    <div className="space-y-4">
      {/* Video Display Area */}
      <div className="relative bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-64 md:h-80 object-cover"
          autoPlay
          muted
          playsInline
          style={{ display: currentMode ? 'block' : 'none' }}
        />
        
        {!currentMode && (
          <div className="flex items-center justify-center h-64 md:h-80">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Start camera or upload video for analysis</p>
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Control Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {!currentMode && (
          <>
            <Button onClick={startCamera} className="bg-orange-600 hover:bg-orange-700 flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Camera Analysis
            </Button>
            
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              className="bg-gray-800 border-orange-500 text-orange-400 hover:bg-orange-900 flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Video
            </Button>
          </>
        )}

        {currentMode === 'camera' && (
          <>
            <Button 
              onClick={processVideo} 
              disabled={isProcessing}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Video className="h-4 w-4 mr-2" />
              )}
              {isProcessing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
            
            <Button onClick={stopCamera} variant="outline" className="flex-1">
              Stop Camera
            </Button>
          </>
        )}

        {currentMode === 'upload' && videoFile && (
          <Button 
            onClick={processVideo} 
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700 flex-1"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Video className="h-4 w-4 mr-2" />
            )}
            {isProcessing ? 'Processing...' : `Analyze ${videoFile.name}`}
          </Button>
        )}
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Processing video frames...</span>
            <span>{Math.round(processingProgress)}%</span>
          </div>
          <Progress value={processingProgress} className="w-full" />
          
          {analysisFrames.length > 0 && (
            <div className="text-xs text-gray-500">
              Captured {analysisFrames.length} frames for analysis
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />
    </div>
  );
};