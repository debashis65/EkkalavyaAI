import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GolfTrackerProps {
  landmarks: any[];
  userId: number;
}

export const GolfTracker: React.FC<GolfTrackerProps> = ({ landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    posture: 0,
    backswing: 0,
    hipRotation: 0,
    followThrough: 0,
    overallScore: 0
  });

  const calculateAngle = (a: any, b: any, c: any): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  };

  useEffect(() => {
    if (landmarks && landmarks.length >= 33) {
      const shoulder_left = landmarks[11];
      const shoulder_right = landmarks[12];
      const hip_left = landmarks[23];
      const hip_right = landmarks[24];
      const knee_left = landmarks[25];
      const wrist_left = landmarks[15];

      // Golf posture analysis
      const spine_angle = calculateAngle(shoulder_left, hip_left, knee_left);
      const posture = Math.max(0, spine_angle > 150 && spine_angle < 170 ? 100 : 100 - Math.abs(spine_angle - 160) * 3);
      
      // Backswing shoulder turn
      const shoulder_turn = Math.abs(shoulder_left.x - shoulder_right.x) * 150;
      const backswing = Math.min(100, shoulder_turn);
      
      // Hip rotation analysis
      const hip_rotation = Math.abs(hip_left.x - hip_right.x) * 120;
      const hipRotation = Math.min(100, hip_rotation);
      
      // Follow through arm extension
      const arm_extension = wrist_left.y - shoulder_left.y;
      const followThrough = Math.max(0, arm_extension > 0.1 ? 100 : arm_extension / 0.1 * 100);

      const overallScore = (posture + backswing + hipRotation + followThrough) / 4;

      setAnalysis({
        posture: Math.round(posture),
        backswing: Math.round(backswing),
        hipRotation: Math.round(hipRotation),
        followThrough: Math.round(followThrough),
        overallScore: Math.round(overallScore)
      });
    }
  }, [landmarks]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ⛳ Golf Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Posture</span>
              <span className="text-sm font-medium">{analysis.posture}%</span>
            </div>
            <Progress value={analysis.posture} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Backswing</span>
              <span className="text-sm font-medium">{analysis.backswing}%</span>
            </div>
            <Progress value={analysis.backswing} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Hip Rotation</span>
              <span className="text-sm font-medium">{analysis.hipRotation}%</span>
            </div>
            <Progress value={analysis.hipRotation} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Follow Through</span>
              <span className="text-sm font-medium">{analysis.followThrough}%</span>
            </div>
            <Progress value={analysis.followThrough} className="h-2" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.posture > 80 ? "✓ Good address posture" : "⚠ Improve spine angle at address"}</p>
          <p>• {analysis.backswing > 70 ? "✓ Good shoulder turn" : "⚠ Turn shoulders more in backswing"}</p>
          <p>• {analysis.hipRotation > 65 ? "✓ Good hip rotation" : "⚠ Rotate hips through impact"}</p>
        </div>
      </CardContent>
    </Card>
  );
};