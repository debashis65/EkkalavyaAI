import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface WeightliftingTrackerProps {
  landmarks: any[];
  userId: number;
}

export const WeightliftingTracker: React.FC<WeightliftingTrackerProps> = ({ landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    backAlignment: 0,
    kneeTracking: 0,
    barPath: 0,
    depthPosition: 0,
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
      const shoulder_center = { x: (landmarks[11].x + landmarks[12].x) / 2, y: (landmarks[11].y + landmarks[12].y) / 2 };
      const hip_center = { x: (landmarks[23].x + landmarks[24].x) / 2, y: (landmarks[23].y + landmarks[24].y) / 2 };
      const knee_left = landmarks[25];
      const knee_right = landmarks[26];
      const ankle_left = landmarks[27];
      const ankle_right = landmarks[28];

      // Back alignment analysis
      const spine_angle = Math.atan2(shoulder_center.y - hip_center.y, shoulder_center.x - hip_center.x) * 180 / Math.PI;
      const backAlignment = Math.max(0, Math.abs(spine_angle) < 15 ? 100 : 100 - Math.abs(spine_angle) * 4);
      
      // Knee tracking (knees should track over toes)
      const knee_alignment_left = Math.abs(knee_left.x - ankle_left.x) * 300;
      const knee_alignment_right = Math.abs(knee_right.x - ankle_right.x) * 300;
      const kneeTracking = Math.max(0, 100 - (knee_alignment_left + knee_alignment_right) / 2);
      
      // Bar path (simulated - shoulders should stay over bar)
      const bar_deviation = Math.abs(shoulder_center.x - hip_center.x) * 200;
      const barPath = Math.max(0, 100 - bar_deviation);
      
      // Squat depth (hip below knee level)
      const squat_depth = hip_center.y - knee_left.y;
      const depthPosition = Math.max(0, squat_depth > 0.05 ? 100 : squat_depth / 0.05 * 100);

      const overallScore = (backAlignment + kneeTracking + barPath + depthPosition) / 4;

      setAnalysis({
        backAlignment: Math.round(backAlignment),
        kneeTracking: Math.round(kneeTracking),
        barPath: Math.round(barPath),
        depthPosition: Math.round(depthPosition),
        overallScore: Math.round(overallScore)
      });
    }
  }, [landmarks]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏋️‍♂️ Weightlifting Analysis
          <Badge variant={analysis.overallScore > 80 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Back Alignment</span>
              <span className="text-sm font-medium">{analysis.backAlignment}%</span>
            </div>
            <Progress value={analysis.backAlignment} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Knee Tracking</span>
              <span className="text-sm font-medium">{analysis.kneeTracking}%</span>
            </div>
            <Progress value={analysis.kneeTracking} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Bar Path</span>
              <span className="text-sm font-medium">{analysis.barPath}%</span>
            </div>
            <Progress value={analysis.barPath} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Squat Depth</span>
              <span className="text-sm font-medium">{analysis.depthPosition}%</span>
            </div>
            <Progress value={analysis.depthPosition} className="h-2" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.backAlignment > 85 ? "✓ Excellent spinal position" : "⚠ Keep chest up, back straight"}</p>
          <p>• {analysis.kneeTracking > 80 ? "✓ Good knee alignment" : "⚠ Track knees over toes"}</p>
          <p>• {analysis.depthPosition > 75 ? "✓ Good squat depth" : "⚠ Squat deeper, hips below knees"}</p>
        </div>
      </CardContent>
    </Card>
  );
};