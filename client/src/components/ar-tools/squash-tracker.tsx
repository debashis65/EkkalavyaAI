import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SquashTrackerProps {
  landmarks: any[];
  userId: number;
}

export const SquashTracker: React.FC<SquashTrackerProps> = ({ landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    racketPreparation: 0,
    bodyRotation: 0,
    footwork: 0,
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
      const shoulder_right = landmarks[12];
      const elbow_right = landmarks[14];
      const wrist_right = landmarks[16];
      const hip_left = landmarks[23];
      const hip_right = landmarks[24];

      const racket_angle = calculateAngle(shoulder_right, elbow_right, wrist_right);
      const racketPreparation = Math.max(0, racket_angle > 90 && racket_angle < 140 ? 100 : 100 - Math.abs(racket_angle - 115) * 2);
      
      const hip_rotation = Math.abs(hip_left.x - hip_right.x) * 200;
      const bodyRotation = Math.min(100, hip_rotation);
      
      const stance_width = Math.abs(landmarks[27].x - landmarks[28].x) * 120;
      const footwork = Math.min(100, stance_width);
      
      const follow_extension = wrist_right.y - shoulder_right.y;
      const followThrough = Math.max(0, follow_extension > 0 ? 100 : 70);

      const overallScore = (racketPreparation + bodyRotation + footwork + followThrough) / 4;

      setAnalysis({
        racketPreparation: Math.round(racketPreparation),
        bodyRotation: Math.round(bodyRotation),
        footwork: Math.round(footwork),
        followThrough: Math.round(followThrough),
        overallScore: Math.round(overallScore)
      });
    }
  }, [landmarks]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎾 Squash Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Racket Prep</span>
              <span className="text-sm font-medium">{analysis.racketPreparation}%</span>
            </div>
            <Progress value={analysis.racketPreparation} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Body Rotation</span>
              <span className="text-sm font-medium">{analysis.bodyRotation}%</span>
            </div>
            <Progress value={analysis.bodyRotation} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Footwork</span>
              <span className="text-sm font-medium">{analysis.footwork}%</span>
            </div>
            <Progress value={analysis.footwork} className="h-2" />
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
          <p>• {analysis.racketPreparation > 80 ? "✓ Good racket position" : "⚠ Prepare racket early"}</p>
          <p>• {analysis.bodyRotation > 70 ? "✓ Good hip rotation" : "⚠ Rotate body more"}</p>
          <p>• {analysis.footwork > 65 ? "✓ Good stance" : "⚠ Widen your stance"}</p>
        </div>
      </CardContent>
    </Card>
  );
};