import { useState, useCallback } from 'react';

export interface RoomSessionData {
  sessionId?: number;
  userId: number;
  roomWidth: number;
  roomHeight: number;
  roomArea: number;
  ceilingHeight?: number;
  isFlat: boolean;
  aspectRatio: number;
  calibrationType: string;
  baselineDistance: number;
  roomCenter: { x: number; y: number; z: number };
  scaleFactor: number;
  safetyScore: number;
  obstacleCount: number;
  lightingConditions?: string;
  reflectiveSurfaces: boolean;
  platform: 'web_mediapipe' | 'flutter_unity';
  averageFps?: number;
  trackingQuality?: number;
}

export interface SyncData {
  averageFps?: number;
  trackingQuality?: number;
  safetyScore?: number;
  roomCenter?: { x: number; y: number; z: number };
  scaleFactor?: number;
  obstacleCount?: number;
  lightingConditions?: string;
  reflectiveSurfaces?: boolean;
}

export interface SafetyLogData {
  roomSessionId: number;
  userId: number;
  incidentType: 'boundary_violation' | 'collision_risk' | 'pose_unsafe' | 'tracking_lost';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  userPosition?: { x: number; y: number; z: number };
  drillPattern?: string;
  automaticResponse?: string;
  userResponse?: string;
}

export interface PerformanceMetricData {
  roomSessionId: number;
  userId: number;
  sport: string;
  adaptationScore: number;
  spaceUtilization: number;
  movementEfficiency: number;
  safetyCompliance: number;
  drillsModified?: number;
  targetAdjustments?: number;
  speedReductions?: number;
  roomModeScore: number;
  venueEquivalentScore?: number;
  improvementPotential?: number;
}

export const useRoomModeSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoomSession = useCallback(async (sessionData: RoomSessionData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/room-mode-sync/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create room session: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncRoomSession = useCallback(async (
    sessionId: number, 
    platform: 'web_mediapipe' | 'flutter_unity',
    syncData: SyncData
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/room-mode-sync/session/sync', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          platform,
          syncData,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to sync room session: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserRoomSessions = useCallback(async (userId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/room-mode-sync/sessions/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get user sessions: ${response.statusText}`);
      }
      
      const result = await response.json();
      return {
        sessions: result.sessions,
        sessionsByPlatform: result.sessionsByPlatform,
        totalSessions: result.totalSessions
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logSafetyIncident = useCallback(async (logData: SafetyLogData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/room-mode-sync/safety-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to log safety incident: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.safetyLog;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const recordPerformanceMetric = useCallback(async (metricData: PerformanceMetricData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/room-mode-sync/performance-metric', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metricData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to record performance metric: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.metric;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSyncStatus = useCallback(async (sessionId: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/room-mode-sync/sync-status/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get sync status: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.syncStatus;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createRoomSession,
    syncRoomSession,
    getUserRoomSessions,
    logSafetyIncident,
    recordPerformanceMetric,
    getSyncStatus,
    isLoading,
    error,
  };
};