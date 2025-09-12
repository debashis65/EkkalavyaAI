import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PoleVaultTrackerProps {
  landmarks: any[];
  userId: number;
}

export const PoleVaultTracker: React.FC<PoleVaultTrackerProps> = ({ landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    poleAngle: 0,
    plantTechnique: 0,
    swingUp: 0,
    barClearance: 0,
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
      const hip_center = { x: (landmarks[23].x + landmarks[24].x) / 2, y: (landmarks[23].y + landmarks[24].y) / 2 };
      const knee_left = landmarks[25];

      const pole_angle = calculateAngle(shoulder_right, elbow_right, wrist_right);
      const poleAngle = Math.max(0, pole_angle > 170 ? 100 : pole_angle / 170 * 100);
      
      const plant_position = Math.abs(wrist_right.y - shoulder_right.y);
      const plantTechnique = Math.max(0, plant_position > 0.2 ? 100 : plant_position / 0.2 * 100);
      
      const swing_momentum = hip_center.y;
      const swingUp = Math.max(0, swing_momentum < 0.5 ? 100 : 70);
      
      const clearance_height = hip_center.y;
      const barClearance = Math.max(0, clearance_height < 0.4 ? 100 : 80);

      const overallScore = (poleAngle + plantTechnique + swingUp + barClearance) / 4;

      setAnalysis({
        poleAngle: Math.round(poleAngle),
        plantTechnique: Math.round(plantTechnique),
        swingUp: Math.round(swingUp),
        barClearance: Math.round(barClearance),
        overallScore: Math.round(overallScore)
      });
    }
  }, [landmarks]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏃‍♂️ Pole Vault Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Pole Angle</span>
              <span className="text-sm font-medium">{analysis.poleAngle}%</span>
            </div>
            <Progress value={analysis.poleAngle} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Plant Technique</span>
              <span className="text-sm font-medium">{analysis.plantTechnique}%</span>
            </div>
            <Progress value={analysis.plantTechnique} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Swing Up</span>
              <span className="text-sm font-medium">{analysis.swingUp}%</span>
            </div>
            <Progress value={analysis.swingUp} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Bar Clearance</span>
              <span className="text-sm font-medium">{analysis.barClearance}%</span>
            </div>
            <Progress value={analysis.barClearance} className="h-2" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.poleAngle > 85 ? "✓ Good pole positioning" : "⚠ Keep pole vertical"}</p>
          <p>• {analysis.plantTechnique > 80 ? "✓ Strong plant technique" : "⚠ Plant pole firmly"}</p>
          <p>• {analysis.swingUp > 75 ? "✓ Good swing momentum" : "⚠ Drive knees up higher"}</p>
        </div>
      </CardContent>
    </Card>
  );
};