import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TableTennisTrackerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  landmarks: any[];
  userId: number;
}

export const TableTennisTracker: React.FC<TableTennisTrackerProps> = ({ canvasRef, landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    paddleAngle: 0,
    wristPosition: 0,
    footwork: 0,
    bodyRotation: 0,
    overallScore: 0
  });

  const calculateAngle = (a: any, b: any, c: any): number => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  };

  useEffect(() => {
    if (landmarks && landmarks.length >= 33) {
      const shoulder_right = landmarks[12];
      const elbow_right = landmarks[14];
      const wrist_right = landmarks[16];
      const hip_left = landmarks[23];
      const hip_right = landmarks[24];
      const ankle_left = landmarks[27];
      const ankle_right = landmarks[28];

      // Paddle angle analysis
      const paddle_angle = calculateAngle(shoulder_right, elbow_right, wrist_right);
      const paddleAngle = Math.max(0, 100 - Math.abs(paddle_angle - 67.5) * 2);

      // Wrist stability
      const wrist_stability = 100 - Math.abs(wrist_right.y - elbow_right.y) * 300;
      const wristPosition = Math.max(0, wrist_stability);

      // Footwork analysis
      const stance_width = Math.abs(ankle_left.x - ankle_right.x) * 100;
      const footwork = Math.min(100, stance_width * 8);

      // Body rotation
      const hip_rotation = Math.abs(hip_left.x - hip_right.x) * 150;
      const bodyRotation = Math.min(100, hip_rotation);

      const overallScore = (paddleAngle + wristPosition + footwork + bodyRotation) / 4;

      setAnalysis({
        paddleAngle: Math.round(paddleAngle),
        wristPosition: Math.round(wristPosition),
        footwork: Math.round(footwork),
        bodyRotation: Math.round(bodyRotation),
        overallScore: Math.round(overallScore)
      });
    }
  }, [landmarks, canvasRef]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏓 Table Tennis Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Paddle Angle</span>
              <span className="text-sm font-medium">{analysis.paddleAngle}%</span>
            </div>
            <Progress value={analysis.paddleAngle} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Wrist Control</span>
              <span className="text-sm font-medium">{analysis.wristPosition}%</span>
            </div>
            <Progress value={analysis.wristPosition} className="h-2" />
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
              <span className="text-sm">Body Rotation</span>
              <span className="text-sm font-medium">{analysis.bodyRotation}%</span>
            </div>
            <Progress value={analysis.bodyRotation} className="h-2" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.paddleAngle > 75 ? "✓ Good paddle control" : "⚠ Adjust paddle angle"}</p>
          <p>• {analysis.wristPosition > 70 ? "✓ Stable wrist position" : "⚠ Keep wrist firm"}</p>
          <p>• {analysis.footwork > 65 ? "✓ Good stance" : "⚠ Widen your stance"}</p>
        </div>
      </CardContent>
    </Card>
  );
};