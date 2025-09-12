import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ShotputTrackerProps {
  landmarks: any[];
  userId: number;
}

export const ShotputTracker: React.FC<ShotputTrackerProps> = ({ landmarks, userId }) => {
  const [analysis, setAnalysis] = useState({
    glidePhase: 0,
    releaseAngle: 0,
    powerPosition: 0,
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
      const hip_right = landmarks[24];
      const knee_right = landmarks[26];

      // Glide phase stability
      const hip_stability = 100 - Math.abs(landmarks[23].y - landmarks[24].y) * 200;
      const glidePhase = Math.max(0, hip_stability);
      
      // Release angle optimization
      const release_angle = calculateAngle(shoulder_right, elbow_right, wrist_right);
      const releaseAngle = Math.max(0, release_angle > 130 && release_angle < 150 ? 100 : 100 - Math.abs(release_angle - 140) * 3);
      
      // Power position analysis
      const leg_drive = calculateAngle(hip_right, knee_right, landmarks[28]);
      const powerPosition = Math.max(0, leg_drive > 160 ? 100 : leg_drive / 160 * 100);
      
      // Follow through extension
      const arm_extension = wrist_right.y - shoulder_right.y;
      const followThrough = Math.max(0, arm_extension > 0.15 ? 100 : arm_extension / 0.15 * 100);

      const overallScore = (glidePhase + releaseAngle + powerPosition + followThrough) / 4;

      setAnalysis({
        glidePhase: Math.round(glidePhase),
        releaseAngle: Math.round(releaseAngle),
        powerPosition: Math.round(powerPosition),
        followThrough: Math.round(followThrough),
        overallScore: Math.round(overallScore)
      });
    }
  }, [landmarks]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🥎 Shot Put Analysis
          <Badge variant={analysis.overallScore > 75 ? "default" : "secondary"}>
            Score: {analysis.overallScore}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Glide Phase</span>
              <span className="text-sm font-medium">{analysis.glidePhase}%</span>
            </div>
            <Progress value={analysis.glidePhase} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Release Angle</span>
              <span className="text-sm font-medium">{analysis.releaseAngle}%</span>
            </div>
            <Progress value={analysis.releaseAngle} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Power Position</span>
              <span className="text-sm font-medium">{analysis.powerPosition}%</span>
            </div>
            <Progress value={analysis.powerPosition} className="h-2" />
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
          <p>• {analysis.glidePhase > 80 ? "✓ Stable glide technique" : "⚠ Keep hips level during glide"}</p>
          <p>• {analysis.releaseAngle > 75 ? "✓ Good release angle" : "⚠ Optimize release angle (38-42°)"}</p>
          <p>• {analysis.powerPosition > 70 ? "✓ Strong leg drive" : "⚠ Drive through legs more"}</p>
        </div>
      </CardContent>
    </Card>
  );
};