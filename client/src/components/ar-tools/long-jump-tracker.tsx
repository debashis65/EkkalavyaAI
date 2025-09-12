import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface LongJumpTrackerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  landmarks: any[];
  userId: number;
}

export const LongJumpTracker: React.FC<LongJumpTrackerProps> = ({ canvasRef, landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    takeoffAngle: 0,
    kneeDrive: 0,
    armSwing: 0,
    landingPrep: 0,
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
      const hip_left = landmarks[23];
      const knee_left = landmarks[25];
      const ankle_left = landmarks[27];
      const shoulder_left = landmarks[11];
      const wrist_left = landmarks[15];
      const hip_right = landmarks[24];

      // Takeoff angle analysis
      const takeoff_trajectory = Math.atan2(hip_left.y - ankle_left.y, hip_left.x - ankle_left.x) * 180 / Math.PI;
      const takeoffAngle = Math.max(0, takeoff_trajectory > 15 && takeoff_trajectory < 30 ? 100 : 100 - Math.abs(takeoff_trajectory - 22.5) * 4);

      // Knee drive analysis
      const knee_drive_angle = calculateAngle(hip_left, knee_left, ankle_left);
      const kneeDrive = Math.max(0, knee_drive_angle > 90 ? 100 : knee_drive_angle / 90 * 100);

      // Arm swing coordination
      const arm_position = shoulder_left.y - wrist_left.y;
      const armSwing = Math.max(0, arm_position > 0.1 ? 100 : arm_position / 0.1 * 100);

      // Landing preparation
      const hip_height = Math.abs(hip_left.y - hip_right.y);
      const landingPrep = Math.max(0, 100 - hip_height * 500);

      const overallScore = (takeoffAngle + kneeDrive + armSwing + landingPrep) / 4;

      setAnalysis({
        takeoffAngle: Math.round(takeoffAngle),
        kneeDrive: Math.round(kneeDrive),
        armSwing: Math.round(armSwing),
        landingPrep: Math.round(landingPrep),
        overallScore: Math.round(overallScore)
      });

      // Draw jump trajectory visualization
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.strokeStyle = takeoffAngle > 80 ? '#22c55e' : '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ankle_left.x * canvas.width, ankle_left.y * canvas.height);
          ctx.lineTo(hip_left.x * canvas.width, hip_left.y * canvas.height);
          ctx.stroke();
        }
      }
    }
  }, [landmarks, canvasRef]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏃‍♂️ Long Jump Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Takeoff Angle</span>
              <span className="text-sm font-medium">{analysis.takeoffAngle}%</span>
            </div>
            <Progress value={analysis.takeoffAngle} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Knee Drive</span>
              <span className="text-sm font-medium">{analysis.kneeDrive}%</span>
            </div>
            <Progress value={analysis.kneeDrive} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Arm Swing</span>
              <span className="text-sm font-medium">{analysis.armSwing}%</span>
            </div>
            <Progress value={analysis.armSwing} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Landing Prep</span>
              <span className="text-sm font-medium">{analysis.landingPrep}%</span>
            </div>
            <Progress value={analysis.landingPrep} className="h-2" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.takeoffAngle > 80 ? "✓ Optimal takeoff angle" : "⚠ Adjust takeoff angle (18-25°)"}</p>
          <p>• {analysis.kneeDrive > 75 ? "✓ Strong knee drive" : "⚠ Drive knee higher"}</p>
          <p>• {analysis.armSwing > 70 ? "✓ Good arm coordination" : "⚠ Use arms for momentum"}</p>
        </div>
      </CardContent>
    </Card>
  );
};