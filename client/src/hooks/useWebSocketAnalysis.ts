import { useState, useRef, useCallback, useEffect } from 'react';

interface AnalysisResult {
  sport: string;
  analysis_type: string;
  score: number;
  feedback: string[];
  metrics: Record<string, any>;
  timestamp: string;
}

interface WebSocketMessage {
  type: string;
  sessionId?: string;
  result?: AnalysisResult;
  error?: string;
  timestamp: string;
}

export const useWebSocketAnalysis = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const ws = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      // Connect to VPS backend server (not localhost)
      const host = 'your-vps-domain.com:8000'; // Replace with actual VPS domain
      const wsUrl = `${protocol}//${host}/ws/realtime`;
      
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        setError(null);
        console.log('Connected to analysis server');
      };
      
      ws.current.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        
        switch (message.type) {
          case 'connection_established':
            setSessionId(message.sessionId || null);
            break;
            
          case 'analysis_started':
            setIsAnalyzing(true);
            break;
            
          case 'analysis_result':
            if (message.result) {
              setCurrentResult(message.result);
            }
            break;
            
          case 'analysis_error':
            setError(message.error || 'Analysis failed');
            break;
            
          case 'session_complete':
            setIsAnalyzing(false);
            break;
        }
      };
      
      ws.current.onclose = () => {
        setIsConnected(false);
        setIsAnalyzing(false);
        console.log('Disconnected from analysis server');
      };
      
      ws.current.onerror = () => {
        setError('Connection error');
        setIsConnected(false);
      };
      
    } catch (err) {
      setError('Failed to connect to analysis server');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setIsConnected(false);
    setIsAnalyzing(false);
    setSessionId(null);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      // Request higher quality video for better analysis
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280, max: 1920 }, 
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      return true;
    } catch (err: any) {
      console.error('Camera access error:', err);
      const errorMessage = err.name === 'NotAllowedError' 
        ? 'Camera permission denied. Please allow camera access.'
        : 'Unable to access camera. Please check if camera is available.';
      setError(errorMessage);
      return false;
    }
  }, []);

  const startAnalysis = useCallback((userId: number, sport: string, analysisType: string) => {
    if (!ws.current || !isConnected) {
      setError('Not connected to analysis server');
      return;
    }
    
    ws.current.send(JSON.stringify({
      type: 'start_analysis',
      userId,
      sport,
      analysisType
    }));
    
    // Start sending frames every 100ms
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      if (videoRef.current && canvasRef.current && ws.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');
        
        if (ctx && video.readyState === 4) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0);
          
          const frameData = canvas.toDataURL('image/jpeg', 0.8);
          
          ws.current?.send(JSON.stringify({
            type: 'camera_frame',
            frameData
          }));
        }
      }
    }, 100);
    
  }, [isConnected]);

  const stopAnalysis = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (ws.current && isConnected) {
      ws.current.send(JSON.stringify({
        type: 'end_analysis'
      }));
    }
    
    setIsAnalyzing(false);
  }, [isConnected]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
      stopCamera();
    };
  }, [disconnect, stopCamera]);

  return {
    isConnected,
    isAnalyzing,
    currentResult,
    sessionId,
    error,
    videoRef,
    canvasRef,
    connect,
    disconnect,
    startCamera,
    startAnalysis,
    stopAnalysis,
    stopCamera
  };
};