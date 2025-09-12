import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface HighJumpTrackerProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  landmarks: any[];
  userId: number;
}

export const HighJumpTracker: React.FC<HighJumpTrackerProps> = ({ canvasRef, landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    approachLean: 0,
    takeoffDrive: 0,
    barClearance: 0,
    bodyArch: 0,
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
      const shoulder_center = { 
        x: (landmarks[11].x + landmarks[12].x) / 2, 
        y: (landmarks[11].y + landmarks[12].y) / 2, 
        z: (landmarks[11].z + landmarks[12].z) / 2 
      };
      const hip_center = { 
        x: (landmarks[23].x + landmarks[24].x) / 2, 
        y: (landmarks[23].y + landmarks[24].y) / 2, 
        z: (landmarks[23].z + landmarks[24].z) / 2 
      };
      const knee_left = landmarks[25];
      const ankle_left = landmarks[27];

      // Approach lean analysis
      const lean_angle = Math.atan2(shoulder_center.x - hip_center.x, shoulder_center.y - hip_center.y) * 180 / Math.PI;
      const approachLean = Math.max(0, Math.abs(lean_angle) > 15 && Math.abs(lean_angle) < 25 ? 100 : 100 - Math.abs(Math.abs(lean_angle) - 20) * 4);

      // Takeoff drive analysis
      const takeoff_drive = calculateAngle(landmarks[23], knee_left, ankle_left);
      const takeoffDrive = Math.max(0, takeoff_drive > 70 ? 100 : takeoff_drive / 70 * 100);

      // Bar clearance simulation
      const jump_height = hip_center.y;
      const barClearance = Math.max(0, jump_height < 0.6 ? 100 : 50);

      // Body arch analysis
      const spine_curve = Math.abs(shoulder_center.y - hip_center.y) - 0.3;
      const bodyArch = Math.max(0, spine_curve > 0 ? 100 : 70);

      const overallScore = (approachLean + takeoffDrive + barClearance + bodyArch) / 4;

      setAnalysis({
        approachLean: Math.round(approachLean),
        takeoffDrive: Math.round(takeoffDrive),
        barClearance: Math.round(barClearance),
        bodyArch: Math.round(bodyArch),
        overallScore: Math.round(overallScore)
      });
    }
  }, [landmarks, canvasRef]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏃‍♂️ High Jump Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Approach Lean</span>
              <span className="text-sm font-medium">{analysis.approachLean}%</span>
            </div>
            <Progress value={analysis.approachLean} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Takeoff Drive</span>
              <span className="text-sm font-medium">{analysis.takeoffDrive}%</span>
            </div>
            <Progress value={analysis.takeoffDrive} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Bar Clearance</span>
              <span className="text-sm font-medium">{analysis.barClearance}%</span>
            </div>
            <Progress value={analysis.barClearance} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Body Arch</span>
              <span className="text-sm font-medium">{analysis.bodyArch}%</span>
            </div>
            <Progress value={analysis.bodyArch} className="h-2" />
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.approachLean > 80 ? "✓ Good approach lean" : "⚠ Lean into the curve"}</p>
          <p>• {analysis.takeoffDrive > 75 ? "✓ Strong vertical drive" : "⚠ Drive up more forcefully"}</p>
          <p>• {analysis.bodyArch > 70 ? "✓ Good body arch" : "⚠ Arch back over bar"}</p>
        </div>
      </CardContent>
    </Card>
  );
};