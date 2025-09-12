import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface YogaTrackerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  landmarks: any[];
  userId: number;
}

export const YogaTracker: React.FC<YogaTrackerProps> = ({ canvasRef, landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    poseStability: 0,
    alignment: 0,
    flexibility: 0,
    breathing: 0,
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
      // Real MediaPipe landmarks for yoga pose analysis
      const shoulder_left = landmarks[11];
      const shoulder_right = landmarks[12];
      const hip_left = landmarks[23];
      const hip_right = landmarks[24];
      const knee_left = landmarks[25];
      const knee_right = landmarks[26];
      const ankle_left = landmarks[27];
      const ankle_right = landmarks[28];

      // Pose stability (minimal movement)
      const shoulder_stability = 100 - Math.abs(shoulder_left.y - shoulder_right.y) * 200;
      const hip_stability = 100 - Math.abs(hip_left.y - hip_right.y) * 200;
      const poseStability = Math.max(0, (shoulder_stability + hip_stability) / 2);

      // Alignment analysis
      const spine_alignment = 100 - Math.abs(shoulder_left.x - hip_left.x) * 100;
      const symmetry = 100 - Math.abs((shoulder_left.x - shoulder_right.x) - (hip_left.x - hip_right.x)) * 200;
      const alignment = Math.max(0, (spine_alignment + symmetry) / 2);

      // Flexibility assessment
      const hip_angle = calculateAngle(shoulder_left, hip_left, knee_left);
      const knee_angle = calculateAngle(hip_left, knee_left, ankle_left);
      const flexibility = Math.max(0, (hip_angle + knee_angle) / 2 - 30);

      // Breathing pattern (shoulder movement)
      const chest_expansion = Math.abs(shoulder_left.x - shoulder_right.x) * 100;
      const breathing = Math.min(100, chest_expansion * 10);

      const overallScore = (poseStability + alignment + flexibility + breathing) / 4;

      setAnalysis({
        poseStability: Math.round(poseStability),
        alignment: Math.round(alignment),
        flexibility: Math.round(flexibility),
        breathing: Math.round(breathing),
        overallScore: Math.round(overallScore)
      });

      // Draw yoga-specific overlays
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Draw alignment guides
          ctx.strokeStyle = alignment > 80 ? '#22c55e' : '#f59e0b';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          
          // Vertical alignment line
          ctx.beginPath();
          ctx.moveTo(shoulder_left.x * canvas.width, 0);
          ctx.lineTo(shoulder_left.x * canvas.width, canvas.height);
          ctx.stroke();
          
          // Horizontal stability line
          ctx.beginPath();
          ctx.moveTo(0, shoulder_left.y * canvas.height);
          ctx.lineTo(canvas.width, shoulder_left.y * canvas.height);
          ctx.stroke();
          
          ctx.setLineDash([]);
        }
      }
    }
  }, [landmarks, canvasRef]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧘‍♀️ Yoga Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Pose Stability</span>
              <span className="text-sm font-medium">{analysis.poseStability}%</span>
            </div>
            <Progress value={analysis.poseStability} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Alignment</span>
              <span className="text-sm font-medium">{analysis.alignment}%</span>
            </div>
            <Progress value={analysis.alignment} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Flexibility</span>
              <span className="text-sm font-medium">{analysis.flexibility}%</span>
            </div>
            <Progress value={analysis.flexibility} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Breathing</span>
              <span className="text-sm font-medium">{analysis.breathing}%</span>
            </div>
            <Progress value={analysis.breathing} className="h-2" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.poseStability > 85 ? "✓ Excellent stability" : "⚠ Focus on stillness"}</p>
          <p>• {analysis.alignment > 80 ? "✓ Perfect alignment" : "⚠ Adjust body position"}</p>
          <p>• {analysis.breathing > 70 ? "✓ Good breathing pattern" : "⚠ Deepen your breath"}</p>
        </div>
      </CardContent>
    </Card>
  );
};