import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface GymnasticsTrackerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  landmarks: any[];
  userId: number;
}

export const GymnasticsTracker: React.FC<GymnasticsTrackerProps> = ({ canvasRef, landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    bodyAlignment: 0,
    armPosition: 0,
    legPosition: 0,
    balance: 0,
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
      // Real MediaPipe landmarks for gymnastics analysis
      const shoulder_left = landmarks[11];
      const shoulder_right = landmarks[12];
      const hip_left = landmarks[23];
      const hip_right = landmarks[24];
      const knee_left = landmarks[25];
      const knee_right = landmarks[26];
      const ankle_left = landmarks[27];
      const ankle_right = landmarks[28];
      const wrist_left = landmarks[15];
      const wrist_right = landmarks[16];

      // Body alignment analysis
      const spine_angle = calculateAngle(shoulder_left, hip_left, knee_left);
      const bodyAlignment = Math.max(0, 100 - Math.abs(180 - spine_angle) * 2);

      // Arm position symmetry
      const left_arm_angle = calculateAngle(shoulder_left, landmarks[13], wrist_left);
      const right_arm_angle = calculateAngle(shoulder_right, landmarks[14], wrist_right);
      const armPosition = Math.max(0, 100 - Math.abs(left_arm_angle - right_arm_angle) * 2);

      // Leg position analysis
      const left_leg_angle = calculateAngle(hip_left, knee_left, ankle_left);
      const right_leg_angle = calculateAngle(hip_right, knee_right, ankle_right);
      const legPosition = Math.max(0, 100 - Math.abs(left_leg_angle - right_leg_angle) * 1.5);

      // Balance analysis
      const center_of_mass_x = (shoulder_left.x + shoulder_right.x + hip_left.x + hip_right.x) / 4;
      const base_of_support_x = (ankle_left.x + ankle_right.x) / 2;
      const balance = Math.max(0, 100 - Math.abs(center_of_mass_x - base_of_support_x) * 500);

      const overallScore = (bodyAlignment + armPosition + legPosition + balance) / 4;

      setAnalysis({
        bodyAlignment: Math.round(bodyAlignment),
        armPosition: Math.round(armPosition),
        legPosition: Math.round(legPosition),
        balance: Math.round(balance),
        overallScore: Math.round(overallScore)
      });

      // Draw gymnastics-specific overlays
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw spine line
          ctx.strokeStyle = bodyAlignment > 85 ? '#22c55e' : '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(shoulder_left.x * canvas.width, shoulder_left.y * canvas.height);
          ctx.lineTo(hip_left.x * canvas.width, hip_left.y * canvas.height);
          ctx.lineTo(ankle_left.x * canvas.width, ankle_left.y * canvas.height);
          ctx.stroke();

          // Draw balance line
          ctx.strokeStyle = balance > 80 ? '#22c55e' : '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(center_of_mass_x * canvas.width, shoulder_left.y * canvas.height);
          ctx.lineTo(base_of_support_x * canvas.width, ankle_left.y * canvas.height);
          ctx.stroke();
        }
      }
    }
  }, [landmarks, canvasRef]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🤸‍♀️ Gymnastics Analysis
          <Badge variant={analysis.overallScore > 80 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Body Alignment</span>
              <span className="text-sm font-medium">{analysis.bodyAlignment}%</span>
            </div>
            <Progress value={analysis.bodyAlignment} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Arm Position</span>
              <span className="text-sm font-medium">{analysis.armPosition}%</span>
            </div>
            <Progress value={analysis.armPosition} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Leg Position</span>
              <span className="text-sm font-medium">{analysis.legPosition}%</span>
            </div>
            <Progress value={analysis.legPosition} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Balance</span>
              <span className="text-sm font-medium">{analysis.balance}%</span>
            </div>
            <Progress value={analysis.balance} className="h-2" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.bodyAlignment > 85 ? "✓ Excellent body alignment" : "⚠ Straighten body line"}</p>
          <p>• {analysis.armPosition > 80 ? "✓ Good arm symmetry" : "⚠ Balance arm positions"}</p>
          <p>• {analysis.balance > 80 ? "✓ Good balance control" : "⚠ Center your weight"}</p>
        </div>
      </CardContent>
    </Card>
  );
};