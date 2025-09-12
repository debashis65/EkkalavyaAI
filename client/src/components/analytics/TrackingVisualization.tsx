/**
 * Multi-Object Tracking Visualization Component
 * Displays real-time tracking data from the ByteTrack integration
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Activity, TrendingUp, Users } from 'lucide-react';

interface TrackingVisualizationProps {
  tracks: any[];
  metrics: any;
  sport: string;
}

export function TrackingVisualization({ tracks, metrics, sport }: TrackingVisualizationProps) {
  const getTrackStateColor = (state: string) => {
    switch (state) {
      case 'tracked': return 'bg-green-100 text-green-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'lost': return 'bg-yellow-100 text-yellow-800';
      case 'removed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'player': return '👤';
      case 'ball': return '⚽';
      case 'equipment': return '🏒';
      case 'referee': return '👨‍⚖️';
      default: return '📦';
    }
  };

  const calculateSpeed = (velocity: { x: number; y: number }) => {
    return Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
  };

  return (
    <div className="space-y-6">
      {/* Tracking Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tracks</p>
                <p className="text-2xl font-bold">{metrics.total_tracks || 0}</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tracks</p>
                <p className="text-2xl font-bold text-green-600">{metrics.active_tracks || 0}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tracking Accuracy</p>
                <p className="text-2xl font-bold">{((metrics.tracking_accuracy || 0) * 100).toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
            <Progress value={(metrics.tracking_accuracy || 0) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Processing Time</p>
                <p className="text-2xl font-bold">{(metrics.processing_time_ms || 0).toFixed(1)}ms</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Tracks Detail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Active Tracks ({tracks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tracks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active tracks</p>
            ) : (
              tracks.map((track, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(track.category)}</span>
                      <div>
                        <Badge variant="outline" className="mr-2">
                          Track #{track.track_id}
                        </Badge>
                        <Badge className={getTrackStateColor(track.state)}>
                          {track.state}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Confidence: {(track.confidence * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Frames: {track.frames_tracked}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Category</p>
                      <p className="font-medium capitalize">{track.category}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Speed</p>
                      <p className="font-medium">
                        {calculateSpeed(track.velocity).toFixed(1)} px/s
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Velocity</p>
                      <p className="font-medium">
                        ({track.velocity.x.toFixed(1)}, {track.velocity.y.toFixed(1)})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Duration</p>
                      <p className="font-medium">
                        {(track.frames_tracked / 30).toFixed(1)}s
                      </p>
                    </div>
                  </div>

                  {/* Sport-specific data */}
                  {track.sport_specific_data && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Sport-Specific Data:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {Object.entries(track.sport_specific_data).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                            <p className="font-medium">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Track history visualization */}
                  {track.history && track.history.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Recent History ({track.history.length} points)
                      </p>
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {track.history.slice(-10).map((point: any, idx: number) => (
                          <div 
                            key={idx}
                            className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500"
                            style={{ 
                              opacity: 0.3 + (idx / 10) * 0.7,
                              transform: `scale(${0.5 + (idx / 10) * 0.5})`
                            }}
                            title={`t=${point.timestamp}, conf=${(point.confidence * 100).toFixed(0)}%`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Track Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {tracks.filter(t => t.state === 'tracked').length}
              </p>
              <p className="text-sm text-gray-600">Actively Tracked</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {tracks.filter(t => t.state === 'new').length}
              </p>
              <p className="text-sm text-gray-600">New Tracks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {tracks.filter(t => t.state === 'lost').length}
              </p>
              <p className="text-sm text-gray-600">Lost Tracks</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {tracks.length > 0 ? 
                  (tracks.reduce((acc, t) => acc + t.frames_tracked, 0) / tracks.length).toFixed(0) : 
                  0}
              </p>
              <p className="text-sm text-gray-600">Avg. Duration</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}