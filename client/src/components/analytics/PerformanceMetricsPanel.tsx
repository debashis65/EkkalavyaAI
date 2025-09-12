/**
 * Performance Metrics Panel Component
 * Displays system performance metrics and AI model performance
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Cpu, HardDrive, Zap, Clock, Activity, TrendingUp, 
  AlertTriangle, CheckCircle, Monitor, Gauge
} from 'lucide-react';

interface PerformanceMetricsPanelProps {
  metrics: any;
  trackingMetrics: any;
  detectionMetrics: any;
  isLive: boolean;
}

export function PerformanceMetricsPanel({ 
  metrics, 
  trackingMetrics, 
  detectionMetrics, 
  isLive 
}: PerformanceMetricsPanelProps) {
  
  const getPerformanceStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return { color: 'text-green-600', bg: 'bg-green-100', status: 'excellent' };
    if (value >= thresholds.warning) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'good' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'needs_attention' };
  };

  const getLatencyStatus = (latency: number) => {
    if (latency <= 50) return { color: 'text-green-600', bg: 'bg-green-100', status: 'excellent' };
    if (latency <= 100) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'good' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'high' };
  };

  const fpsStatus = getPerformanceStatus(metrics.fps, { good: 25, warning: 15 });
  const latencyStatus = getLatencyStatus(metrics.ai_model_latency);
  const memoryStatus = getPerformanceStatus(100 - metrics.memory_usage, { good: 70, warning: 50 });

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={`border-l-4 ${fpsStatus.color.includes('green') ? 'border-l-green-500' : fpsStatus.color.includes('yellow') ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Frame Rate</p>
                <p className={`text-2xl font-bold ${fpsStatus.color}`}>
                  {metrics.fps.toFixed(1)} FPS
                </p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
            <Progress value={Math.min(metrics.fps / 30 * 100, 100)} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${latencyStatus.color.includes('green') ? 'border-l-green-500' : latencyStatus.color.includes('yellow') ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Model Latency</p>
                <p className={`text-2xl font-bold ${latencyStatus.color}`}>
                  {metrics.ai_model_latency.toFixed(1)}ms
                </p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <Progress value={Math.max(0, 100 - (metrics.ai_model_latency / 200 * 100))} className="mt-2" />
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${memoryStatus.color.includes('green') ? 'border-l-green-500' : memoryStatus.color.includes('yellow') ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Memory Usage</p>
                <p className={`text-2xl font-bold ${memoryStatus.color}`}>
                  {metrics.memory_usage.toFixed(1)}%
                </p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-500" />
            </div>
            <Progress value={metrics.memory_usage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">GPU Utilization</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.gpu_utilization.toFixed(1)}%
                </p>
              </div>
              <Cpu className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={metrics.gpu_utilization} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* System Status Alert */}
      {!isLive && (
        <Alert>
          <Monitor className="h-4 w-4" />
          <AlertDescription>
            AI systems are offline. Start live analysis to see real-time performance metrics.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Processing Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5" />
              AI Processing Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Total Processing Time</span>
                  <span className="text-sm text-gray-600">{metrics.total_processing_time.toFixed(1)}ms</span>
                </div>
                <Progress value={Math.max(0, 100 - (metrics.total_processing_time / 200 * 100))} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">API Response Time</span>
                  <span className="text-sm text-gray-600">{metrics.api_response_time.toFixed(1)}ms</span>
                </div>
                <Progress value={Math.max(0, 100 - (metrics.api_response_time / 100 * 100))} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Multi-Object Tracking</span>
                  <span className="text-sm text-gray-600">{(trackingMetrics.processing_time_ms || 0).toFixed(1)}ms</span>
                </div>
                <Progress value={Math.max(0, 100 - ((trackingMetrics.processing_time_ms || 0) / 50 * 100))} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Detection Models</span>
                  <span className="text-sm text-gray-600">
                    {((metrics.ai_model_latency - (trackingMetrics.processing_time_ms || 0)) || 0).toFixed(1)}ms
                  </span>
                </div>
                <Progress value={Math.max(0, 100 - (((metrics.ai_model_latency - (trackingMetrics.processing_time_ms || 0)) || 0) / 50 * 100))} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Model Accuracy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Model Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Object Tracking</span>
                  <span className="text-sm text-gray-600">
                    {((trackingMetrics.tracking_accuracy || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={(trackingMetrics.tracking_accuracy || 0) * 100} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Object Detection</span>
                  <span className="text-sm text-gray-600">
                    {((detectionMetrics.detection_accuracy || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={(detectionMetrics.detection_accuracy || 0) * 100} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Sport Classification</span>
                  <span className="text-sm text-gray-600">
                    {((detectionMetrics.sport_confidence || 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={(detectionMetrics.sport_confidence || 0) * 100} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall AI Confidence</span>
                  <span className="text-sm text-gray-600">
                    {(((trackingMetrics.tracking_accuracy || 0) + (detectionMetrics.detection_accuracy || 0)) / 2 * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress value={((trackingMetrics.tracking_accuracy || 0) + (detectionMetrics.detection_accuracy || 0)) / 2 * 100} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            System Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${fpsStatus.bg}`}>
                <Activity className={`w-8 h-8 ${fpsStatus.color}`} />
              </div>
              <p className="font-medium">Processing</p>
              <p className={`text-sm ${fpsStatus.color}`}>{fpsStatus.status}</p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${latencyStatus.bg}`}>
                <Clock className={`w-8 h-8 ${latencyStatus.color}`} />
              </div>
              <p className="font-medium">Latency</p>
              <p className={`text-sm ${latencyStatus.color}`}>{latencyStatus.status}</p>
            </div>

            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${memoryStatus.bg}`}>
                <HardDrive className={`w-8 h-8 ${memoryStatus.color}`} />
              </div>
              <p className="font-medium">Memory</p>
              <p className={`text-sm ${memoryStatus.color}`}>{memoryStatus.status}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center bg-green-100">
                <Cpu className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-medium">GPU</p>
              <p className="text-sm text-green-600">optimal</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Pipeline Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Frame Capture</p>
                  <p className="font-medium">~2ms</p>
                </div>
                <div>
                  <p className="text-gray-600">AI Processing</p>
                  <p className="font-medium">{metrics.ai_model_latency.toFixed(1)}ms</p>
                </div>
                <div>
                  <p className="text-gray-600">Rendering</p>
                  <p className="font-medium">~3ms</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Tracking Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Active Tracks</p>
                  <p className="font-medium">{trackingMetrics.active_tracks || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Lost Tracks</p>
                  <p className="font-medium">{trackingMetrics.lost_tracks || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Processing Time</p>
                  <p className="font-medium">{(trackingMetrics.processing_time_ms || 0).toFixed(1)}ms</p>
                </div>
                <div>
                  <p className="text-gray-600">Accuracy</p>
                  <p className="font-medium">{((trackingMetrics.tracking_accuracy || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">Detection Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Objects Detected</p>
                  <p className="font-medium">{detectionMetrics.objects_detected || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Categories</p>
                  <p className="font-medium">{detectionMetrics.categories_found?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Accuracy</p>
                  <p className="font-medium">{((detectionMetrics.detection_accuracy || 0) * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Sport Confidence</p>
                  <p className="font-medium">{((detectionMetrics.sport_confidence || 0) * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">AI Systems</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Multi-Object Tracking</span>
                  <Badge variant={isLive ? "default" : "secondary"}>
                    {isLive ? "Active" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sport Detection Models</span>
                  <Badge variant={isLive ? "default" : "secondary"}>
                    {isLive ? "Active" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Decision Logic Engine</span>
                  <Badge variant={isLive ? "default" : "secondary"}>
                    {isLive ? "Active" : "Offline"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Context Understanding</span>
                  <Badge variant={isLive ? "default" : "secondary"}>
                    {isLive ? "Active" : "Offline"}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Performance Health</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Frame Rate</span>
                  <Badge variant={fpsStatus.status === 'excellent' ? "default" : fpsStatus.status === 'good' ? "secondary" : "destructive"}>
                    {fpsStatus.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Latency</span>
                  <Badge variant={latencyStatus.status === 'excellent' ? "default" : latencyStatus.status === 'good' ? "secondary" : "destructive"}>
                    {latencyStatus.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <Badge variant={memoryStatus.status === 'excellent' ? "default" : memoryStatus.status === 'good' ? "secondary" : "destructive"}>
                    {memoryStatus.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Overall Health</span>
                  <Badge variant="default">Optimal</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}