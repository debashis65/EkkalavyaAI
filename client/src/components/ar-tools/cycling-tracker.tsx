import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CyclingTrackerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  landmarks: any[];
  userId: number;
}

export const CyclingTracker: React.FC<CyclingTrackerProps> = ({ canvasRef, landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    backAngle: 0,
    kneeExtension: 0,
    pedalingForm: 0,
    aerodynamics: 0,
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
      const hip_left = landmarks[23];
      const knee_left = landmarks[25];
      const ankle_left = landmarks[27];
      const shoulder_right = landmarks[12];

      // Back angle for aerodynamics
      const back_angle = calculateAngle(shoulder_left, hip_left, knee_left);
      const backAngle = Math.max(0, back_angle < 45 ? 100 : 100 - (back_angle - 45) * 2);

      // Knee extension analysis
      const knee_extension = calculateAngle(hip_left, knee_left, ankle_left);
      const kneeExtension = Math.max(0, knee_extension > 150 ? 100 : knee_extension / 150 * 100);

      // Pedaling form symmetry
      const hip_stability = 100 - Math.abs(landmarks[23].y - landmarks[24].y) * 200;
      const pedalingForm = Math.max(0, hip_stability);

      // Aerodynamic position
      const shoulder_drop = shoulder_left.y - hip_left.y;
      const aerodynamics = Math.max(0, shoulder_drop > 0.1 ? 100 : 50);

      const overallScore = (backAngle + kneeExtension + pedalingForm + aerodynamics) / 4;

      setAnalysis({
        backAngle: Math.round(backAngle),
        kneeExtension: Math.round(kneeExtension),
        pedalingForm: Math.round(pedalingForm),
        aerodynamics: Math.round(aerodynamics),
        overallScore: Math.round(overallScore)
      });
    }
  }, [landmarks, canvasRef]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🚴‍♂️ Cycling Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Back Angle</span>
              <span className="text-sm font-medium">{analysis.backAngle}%</span>
            </div>
            <Progress value={analysis.backAngle} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Knee Extension</span>
              <span className="text-sm font-medium">{analysis.kneeExtension}%</span>
            </div>
            <Progress value={analysis.kneeExtension} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Pedaling Form</span>
              <span className="text-sm font-medium">{analysis.pedalingForm}%</span>
            </div>
            <Progress value={analysis.pedalingForm} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Aerodynamics</span>
              <span className="text-sm font-medium">{analysis.aerodynamics}%</span>
            </div>
            <Progress value={analysis.aerodynamics} className="h-2" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.backAngle > 80 ? "✓ Good aerodynamic position" : "⚠ Lower your torso"}</p>
          <p>• {analysis.kneeExtension > 75 ? "✓ Good leg extension" : "⚠ Extend legs fully"}</p>
          <p>• {analysis.pedalingForm > 70 ? "✓ Smooth pedaling" : "⚠ Stabilize your hips"}</p>
        </div>
      </CardContent>
    </Card>
  );
};