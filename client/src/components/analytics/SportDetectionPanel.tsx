/**
 * Sport Detection Panel Component
 * Displays real-time detection results from YOLO-based sport-specific models
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Eye, Target, Layers, Zap } from 'lucide-react';

interface SportDetectionPanelProps {
  detections: any[];
  metrics: any;
  sport: string;
}

export function SportDetectionPanel({ detections, metrics, sport }: SportDetectionPanelProps) {
  const getObjectIcon = (objectType: string) => {
    const icons: Record<string, string> = {
      basketball: '🏀',
      football: '⚽',
      soccer_ball: '⚽',
      tennis_ball: '🎾',
      volleyball: '🏐',
      cricket_ball: '🏏',
      golf_ball: '⛳',
      basketball_hoop: '🥅',
      soccer_goal: '🥅',
      tennis_net: '🎾',
      volleyball_net: '🏐',
      tennis_racket: '🎾',
      cricket_bat: '🏏',
      golf_club: '⛳',
      person: '👤',
      player: '👤',
      referee: '👨‍⚖️'
    };
    return icons[objectType] || '📦';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ball: 'bg-orange-100 text-orange-800',
      equipment: 'bg-blue-100 text-blue-800',
      player: 'bg-green-100 text-green-800',
      goal: 'bg-purple-100 text-purple-800',
      net: 'bg-indigo-100 text-indigo-800',
      boundary: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const groupDetectionsByCategory = () => {
    const grouped: Record<string, any[]> = {};
    detections.forEach(detection => {
      if (!grouped[detection.category]) {
        grouped[detection.category] = [];
      }
      grouped[detection.category].push(detection);
    });
    return grouped;
  };

  const groupedDetections = groupDetectionsByCategory();

  return (
    <div className="space-y-6">
      {/* Detection Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Objects Detected</p>
                <p className="text-2xl font-bold">{metrics.objects_detected || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Detection Accuracy</p>
                <p className="text-2xl font-bold">{((metrics.detection_accuracy || 0) * 100).toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={(metrics.detection_accuracy || 0) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sport Confidence</p>
                <p className="text-2xl font-bold">{((metrics.sport_confidence || 0) * 100).toFixed(1)}%</p>
              </div>
              <Zap className="w-8 h-8 text-purple-500" />
            </div>
            <Progress value={(metrics.sport_confidence || 0) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories Found</p>
                <p className="text-2xl font-bold">{metrics.categories_found?.length || 0}</p>
              </div>
              <Layers className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Detection Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {(metrics.categories_found || []).map((category: string, index: number) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl mb-1">{getObjectIcon(category)}</p>
                <Badge className={getCategoryColor(category)} variant="secondary">
                  {category}
                </Badge>
                <p className="text-xs text-gray-500 mt-1">
                  {groupedDetections[category]?.length || 0} objects
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Detections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Current Detections ({detections.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {detections.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No objects detected</p>
            ) : (
              detections.map((detection, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getObjectIcon(detection.object_type)}</span>
                      <div>
                        <h4 className="font-medium capitalize">
                          {detection.object_type.replace('_', ' ')}
                        </h4>
                        <Badge className={getCategoryColor(detection.category)} variant="secondary">
                          {detection.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getConfidenceColor(detection.confidence)}`}>
                        {(detection.confidence * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Sport: {(detection.sport_confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Position</p>
                      <p className="font-medium">
                        ({detection.bbox.x1.toFixed(0)}, {detection.bbox.y1.toFixed(0)})
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Size</p>
                      <p className="font-medium">
                        {(detection.bbox.x2 - detection.bbox.x1).toFixed(0)} × {(detection.bbox.y2 - detection.bbox.y1).toFixed(0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Detection ID</p>
                      <p className="font-medium font-mono text-xs">
                        {detection.detection_id.slice(0, 8)}...
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Timestamp</p>
                      <p className="font-medium">
                        {new Date(detection.timestamp * 1000).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  {detection.features && Object.keys(detection.features).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        {Object.entries(detection.features).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-gray-500 capitalize">{key.replace('_', ' ')}</p>
                            <p className="font-medium">
                              {typeof value === 'number' ? value.toFixed(2) : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Confidence Breakdown */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">Confidence Breakdown</p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Object Detection</span>
                          <span>{(detection.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={detection.confidence * 100} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>Sport Relevance</span>
                          <span>{(detection.sport_confidence * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={detection.sport_confidence * 100} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detection Statistics by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Category Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(groupedDetections).map(([category, categoryDetections]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(category)} variant="secondary">
                      {category}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {categoryDetections.length} object{categoryDetections.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Avg Confidence: {(categoryDetections.reduce((acc, det) => acc + det.confidence, 0) / categoryDetections.length * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Most Confident</p>
                    <p className="font-medium">
                      {Math.max(...categoryDetections.map(d => d.confidence * 100)).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Least Confident</p>
                    <p className="font-medium">
                      {Math.min(...categoryDetections.map(d => d.confidence * 100)).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Object Types</p>
                    <p className="font-medium">
                      {Array.from(new Set(categoryDetections.map(d => d.object_type))).length}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}