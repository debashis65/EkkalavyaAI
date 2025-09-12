import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface HurdleTrackerProps {
  landmarks: any[];
  userId: number;
}

export const HurdleTracker: React.FC<HurdleTrackerProps> = ({ landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    takeoffDistance: 0,
    leadLeg: 0,
    trailLeg: 0,
    landingTechnique: 0,
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
      const hip_left = landmarks[23];
      const knee_left = landmarks[25];
      const ankle_left = landmarks[27];
      const hip_right = landmarks[24];
      const knee_right = landmarks[26];
      const ankle_right = landmarks[28];

      // Takeoff distance analysis (simulation)
      const approach_angle = Math.atan2(hip_left.y - ankle_left.y, hip_left.x - ankle_left.x) * 180 / Math.PI;
      const takeoffDistance = Math.max(0, approach_angle > 10 && approach_angle < 20 ? 100 : 100 - Math.abs(approach_angle - 15) * 5);
      
      // Lead leg technique
      const lead_leg_angle = calculateAngle(hip_left, knee_left, ankle_left);
      const leadLeg = Math.max(0, lead_leg_angle > 140 ? 100 : lead_leg_angle / 140 * 100);
      
      // Trail leg clearance
      const trail_leg_angle = calculateAngle(hip_right, knee_right, ankle_right);
      const trailLeg = Math.max(0, trail_leg_angle < 90 ? 100 : 100 - (trail_leg_angle - 90) * 2);
      
      // Landing technique
      const landing_position = Math.abs(knee_left.y - knee_right.y);
      const landingTechnique = Math.max(0, 100 - landing_position * 300);

      const overallScore = (takeoffDistance + leadLeg + trailLeg + landingTechnique) / 4;

      setAnalysis({
        takeoffDistance: Math.round(takeoffDistance),
        leadLeg: Math.round(leadLeg),
        trailLeg: Math.round(trailLeg),
        landingTechnique: Math.round(landingTechnique),
        overallScore: Math.round(overallScore)
      });
    }
  }, [landmarks]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏃‍♂️ Hurdle Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Takeoff Distance</span>
              <span className="text-sm font-medium">{analysis.takeoffDistance}%</span>
            </div>
            <Progress value={analysis.takeoffDistance} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Lead Leg</span>
              <span className="text-sm font-medium">{analysis.leadLeg}%</span>
            </div>
            <Progress value={analysis.leadLeg} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Trail Leg</span>
              <span className="text-sm font-medium">{analysis.trailLeg}%</span>
            </div>
            <Progress value={analysis.trailLeg} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Landing</span>
              <span className="text-sm font-medium">{analysis.landingTechnique}%</span>
            </div>
            <Progress value={analysis.landingTechnique} className="h-2" />
          </div>
        </div>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• {analysis.takeoffDistance > 80 ? "✓ Good takeoff distance" : "⚠ Optimize takeoff point"}</p>
          <p>• {analysis.leadLeg > 75 ? "✓ Strong lead leg drive" : "⚠ Drive lead leg higher"}</p>
          <p>• {analysis.trailLeg > 70 ? "✓ Good trail leg clearance" : "⚠ Tuck trail leg tighter"}</p>
        </div>
      </CardContent>
    </Card>
  );
};