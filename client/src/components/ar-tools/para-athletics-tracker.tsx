import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ParaAthleticsTrackerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  landmarks: any[];
  userId: number;
}

export const ParaAthleticsTracker: React.FC<ParaAthleticsTrackerProps> = ({ canvasRef, landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    wheelchairStroke: 0,
    pushEfficiency: 0,
    bodyPosition: 0,
    strokeTiming: 0,
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
      const shoulder_left = landmarks[11];
      const elbow_left = landmarks[13];
      const wrist_left = landmarks[15];
      const shoulder_right = landmarks[12];
      const elbow_right = landmarks[14];
      const wrist_right = landmarks[16];

      // Wheelchair stroke analysis (adapted for upper body motion)
      const left_stroke = calculateAngle(shoulder_left, elbow_left, wrist_left);
      const right_stroke = calculateAngle(shoulder_right, elbow_right, wrist_right);
      const wheelchairStroke = Math.max(0, (left_stroke + right_stroke) / 2 > 160 ? 100 : (left_stroke + right_stroke) / 320 * 100);

      // Push efficiency (symmetry between arms)
      const push_symmetry = 100 - Math.abs(wrist_left.y - wrist_right.y) * 300;
      const pushEfficiency = Math.max(0, push_symmetry);

      // Body position stability
      const torso_stability = 100 - Math.abs(shoulder_left.y - shoulder_right.y) * 300;
      const bodyPosition = Math.max(0, torso_stability);

      // Stroke timing coordination
      const arm_coordination = 100 - Math.abs(left_stroke - right_stroke) * 2;
      const strokeTiming = Math.max(0, arm_coordination);

      const overallScore = (wheelchairStroke + pushEfficiency + bodyPosition + strokeTiming) / 4;

      setAnalysis({
        wheelchairStroke: Math.round(wheelchairStroke),
        pushEfficiency: Math.round(pushEfficiency),
        bodyPosition: Math.round(bodyPosition),
        strokeTiming: Math.round(strokeTiming),
        overallScore: Math.round(overallScore)
      });

      // Draw wheelchair stroke visualization
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Stroke path visualization
          ctx.strokeStyle = wheelchairStroke > 80 ? '#22c55e' : '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(wrist_left.x * canvas.width, wrist_left.y * canvas.height, 20, 0, 2 * Math.PI);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(wrist_right.x * canvas.width, wrist_right.y * canvas.height, 20, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    }
  }, [landmarks, canvasRef]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🦽 Para Athletics Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Wheelchair Stroke</span>
              <span className="text-sm font-medium">{analysis.wheelchairStroke}%</span>
            </div>
            <Progress value={analysis.wheelchairStroke} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Push Efficiency</span>
              <span className="text-sm font-medium">{analysis.pushEfficiency}%</span>
            </div>
            <Progress value={analysis.pushEfficiency} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Body Position</span>
              <span className="text-sm font-medium">{analysis.bodyPosition}%</span>
            </div>
            <Progress value={analysis.bodyPosition} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Stroke Timing</span>
              <span className="text-sm font-medium">{analysis.strokeTiming}%</span>
            </div>
            <Progress value={analysis.strokeTiming} className="h-2" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.wheelchairStroke > 80 ? "✓ Excellent stroke technique" : "⚠ Extend arms fully during push"}</p>
          <p>• {analysis.pushEfficiency > 75 ? "✓ Balanced push symmetry" : "⚠ Balance push technique between arms"}</p>
          <p>• {analysis.bodyPosition > 70 ? "✓ Stable torso position" : "⚠ Maintain upright posture"}</p>
        </div>
      </CardContent>
    </Card>
  );
};