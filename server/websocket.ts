import WebSocket, { WebSocketServer } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';

interface AnalysisSession {
  sessionId: string;
  userId: number;
  sport: string;
  analysisType: string;
  isActive: boolean;
  startedAt: Date;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private activeSessions: Map<string, AnalysisSession> = new Map();
  private clientConnections: Map<string, WebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info) => {
        // Add authentication verification here if needed
        return true;
      }
    });

    this.wss.on('connection', this.handleConnection.bind(this));
  }

  private handleConnection(ws: WebSocket, request: any) {
    const sessionId = uuidv4();
    console.log(`New WebSocket connection: ${sessionId}`);

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(ws, sessionId, message);
      } catch (error) {
        console.error('Invalid message format:', error);
        ws.send(JSON.stringify({ error: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log(`WebSocket connection closed: ${sessionId}`);
      this.cleanupSession(sessionId);
    });

    ws.on('error', (error) => {
      console.error(`WebSocket error for session ${sessionId}:`, error);
      this.cleanupSession(sessionId);
    });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection_established',
      sessionId,
      timestamp: new Date().toISOString()
    }));
  }

  private async handleMessage(ws: WebSocket, sessionId: string, message: any) {
    switch (message.type) {
      case 'start_analysis':
        await this.startAnalysisSession(ws, sessionId, message);
        break;
        
      case 'camera_frame':
        await this.processFrame(ws, sessionId, message);
        break;
        
      case 'end_analysis':
        await this.endAnalysisSession(ws, sessionId, message);
        break;
        
      default:
        ws.send(JSON.stringify({ error: 'Unknown message type' }));
    }
  }

  private async startAnalysisSession(ws: WebSocket, sessionId: string, message: any) {
    const { userId, sport, analysisType } = message;
    
    const session: AnalysisSession = {
      sessionId,
      userId,
      sport,
      analysisType,
      isActive: true,
      startedAt: new Date()
    };

    this.activeSessions.set(sessionId, session);
    this.clientConnections.set(sessionId, ws);

    // Send confirmation to client
    ws.send(JSON.stringify({
      type: 'analysis_started',
      sessionId,
      sport,
      analysisType,
      timestamp: new Date().toISOString()
    }));

    console.log(`Analysis session started: ${sessionId} for user ${userId} - ${sport}`);
  }

  private async processFrame(ws: WebSocket, sessionId: string, message: any) {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.isActive) {
      ws.send(JSON.stringify({ error: 'No active analysis session' }));
      return;
    }

    try {
      // Forward frame to AI backend for analysis
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sport: session.sport,
          analysis_type: session.analysisType,
          image_data: message.frameData,
          session_id: sessionId
        })
      });

      if (response.ok) {
        const analysisResult = await response.json();
        
        // Send real-time feedback to client
        ws.send(JSON.stringify({
          type: 'analysis_result',
          sessionId,
          result: analysisResult,
          timestamp: new Date().toISOString()
        }));
      } else {
        ws.send(JSON.stringify({
          type: 'analysis_error',
          error: 'AI analysis failed',
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Frame processing error:', error);
      ws.send(JSON.stringify({
        type: 'analysis_error',
        error: 'Processing failed',
        timestamp: new Date().toISOString()
      }));
    }
  }

  private async endAnalysisSession(ws: WebSocket, sessionId: string, message: any) {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      ws.send(JSON.stringify({ error: 'No analysis session found' }));
      return;
    }

    session.isActive = false;
    
    // Generate final session report
    try {
      const response = await fetch('http://localhost:8000/generate_report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          user_id: session.userId,
          sport: session.sport,
          analysis_type: session.analysisType
        })
      });

      if (response.ok) {
        const report = await response.json();
        
        ws.send(JSON.stringify({
          type: 'session_complete',
          sessionId,
          report,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Report generation error:', error);
    }

    this.cleanupSession(sessionId);
    console.log(`Analysis session ended: ${sessionId}`);
  }

  private cleanupSession(sessionId: string) {
    this.activeSessions.delete(sessionId);
    this.clientConnections.delete(sessionId);
  }

  public getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }

  public getSessionInfo(sessionId: string): AnalysisSession | undefined {
    return this.activeSessions.get(sessionId);
  }
}

export default WebSocketManager;