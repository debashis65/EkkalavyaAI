/**
 * Sport Analytics Controller
 * Coordinates all AI backend systems including multi-object tracking,
 * sport-specific detection, decision logic engine, and context understanding
 */

export class SportAnalyticsController {
  private isInitialized = false;
  private currentSport = '';
  private trackingEndpoint = '';
  private detectionEndpoint = '';
  private decisionEndpoint = '';
  private contextEndpoint = '';

  constructor() {
    this.trackingEndpoint = '/api/ai-backend/tracking';
    this.detectionEndpoint = '/api/ai-backend/detection';
    this.decisionEndpoint = '/api/ai-backend/decisions';
    this.contextEndpoint = '/api/ai-backend/context';
  }

  async initializeSystems(sport: string): Promise<void> {
    this.currentSport = sport;
    
    try {
      // Initialize Multi-Object Tracking Pipeline
      await fetch(`${this.trackingEndpoint}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport_name: sport })
      });

      // Initialize Sport-Specific Detection Models
      await fetch(`${this.detectionEndpoint}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport_name: sport })
      });

      // Initialize Decision Logic Engine
      await fetch(`${this.decisionEndpoint}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport_name: sport })
      });

      // Initialize Context Understanding Engine
      await fetch(`${this.contextEndpoint}/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport_name: sport })
      });

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize AI systems:', error);
      throw error;
    }
  }

  async processTracking(frameData: any, sport: string): Promise<any> {
    if (!this.isInitialized) throw new Error('Systems not initialized');

    try {
      const response = await fetch(`${this.trackingEndpoint}/process-frame`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport_name: sport,
          frame_data: frameData.imageData,
          timestamp: frameData.timestamp,
          frame_metadata: frameData.dimensions
        })
      });

      if (!response.ok) throw new Error('Tracking processing failed');
      return await response.json();
    } catch (error) {
      console.error('Tracking processing error:', error);
      return { tracks: [], metrics: {} };
    }
  }

  async processDetection(frameData: any, sport: string): Promise<any> {
    if (!this.isInitialized) throw new Error('Systems not initialized');

    try {
      const response = await fetch(`${this.detectionEndpoint}/detect-objects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport_name: sport,
          image_data: frameData.imageData.split(',')[1], // Remove base64 prefix
          timestamp: frameData.timestamp,
          frame_metadata: frameData.dimensions
        })
      });

      if (!response.ok) throw new Error('Detection processing failed');
      return await response.json();
    } catch (error) {
      console.error('Detection processing error:', error);
      return { detections: [], metrics: {} };
    }
  }

  async processContext(trackingResults: any, detectionResults: any, sport: string): Promise<any> {
    if (!this.isInitialized) throw new Error('Systems not initialized');

    try {
      const response = await fetch(`${this.contextEndpoint}/analyze-context`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport_name: sport,
          tracking_data: trackingResults,
          detection_data: detectionResults,
          timestamp: Date.now() / 1000
        })
      });

      if (!response.ok) throw new Error('Context processing failed');
      return await response.json();
    } catch (error) {
      console.error('Context processing error:', error);
      return null;
    }
  }

  async generateDecisions(contextData: any, sport: string): Promise<any> {
    if (!this.isInitialized) throw new Error('Systems not initialized');

    try {
      const response = await fetch(`${this.decisionEndpoint}/generate-decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport_name: sport,
          context_data: contextData,
          timestamp: Date.now() / 1000
        })
      });

      if (!response.ok) throw new Error('Decision generation failed');
      return await response.json();
    } catch (error) {
      console.error('Decision generation error:', error);
      return { analyses: [] };
    }
  }

  async getPerformanceMetrics(): Promise<any> {
    try {
      const response = await fetch('/api/ai-backend/performance/metrics', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Performance metrics fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Performance metrics error:', error);
      return {
        fps: 0,
        total_processing_time: 0,
        ai_model_latency: 0,
        memory_usage: 0,
        gpu_utilization: 0,
        api_response_time: 0
      };
    }
  }

  async resetSystems(sport: string): Promise<void> {
    try {
      await Promise.all([
        fetch(`${this.trackingEndpoint}/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sport_name: sport })
        }),
        fetch(`${this.detectionEndpoint}/reset-stats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sport_name: sport })
        }),
        fetch(`${this.decisionEndpoint}/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sport_name: sport })
        }),
        fetch(`${this.contextEndpoint}/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sport_name: sport })
        })
      ]);
    } catch (error) {
      console.error('Reset systems error:', error);
    }
  }

  cleanup(): void {
    this.isInitialized = false;
    this.currentSport = '';
  }
}