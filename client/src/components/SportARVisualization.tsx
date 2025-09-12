/**
 * Sport-Specific AR Visualization Component
 * Real computer vision overlays for different sports - NO PLACEHOLDERS
 */

import React, { useRef, useEffect, useState } from 'react';
import { AnalysisResult } from '@/lib/mediapipe-analyzer';

interface SportARVisualizationProps {
  sport: string;
  analysisResult: AnalysisResult | null;
  videoElement: HTMLVideoElement | null;
  selectedVenue?: any;
}

export function SportARVisualization({ 
  sport, 
  analysisResult, 
  videoElement,
  selectedVenue 
}: SportARVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!canvasRef.current || !videoElement || !analysisResult) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawOverlay = () => {
      // Match canvas size to video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw sport-specific overlays based on landmarks
      drawSportSpecificOverlay(ctx, sport, analysisResult);

      animationFrameRef.current = requestAnimationFrame(drawOverlay);
    };

    drawOverlay();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sport, analysisResult, videoElement]);

  const drawSportSpecificOverlay = (
    ctx: CanvasRenderingContext2D, 
    sport: string, 
    result: AnalysisResult
  ) => {
    const { landmarks } = result;
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Set up drawing styles
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 3;
    ctx.fillStyle = '#00ff00';
    ctx.font = '16px Arial';

    switch (sport) {
      case 'basketball':
        drawBasketballOverlay(ctx, landmarks, width, height);
        break;
      case 'archery':
        drawArcheryOverlay(ctx, landmarks, width, height);
        break;
      case 'tennis':
        drawTennisOverlay(ctx, landmarks, width, height);
        break;
      case 'swimming':
        drawSwimmingOverlay(ctx, landmarks, width, height);
        break;
      case 'football':
        drawFootballOverlay(ctx, landmarks, width, height);
        break;
      case 'volleyball':
        drawVolleyballOverlay(ctx, landmarks, width, height);
        break;
      default:
        drawGeneralOverlay(ctx, landmarks, width, height);
    }

    // Draw performance score
    drawPerformanceScore(ctx, result.score, width, height);
    
    // Draw venue environment if selected
    if (selectedVenue) {
      drawVenueEnvironment(ctx, selectedVenue, sport, width, height);
    }
  };

  const drawBasketballOverlay = (
    ctx: CanvasRenderingContext2D,
    landmarks: any,
    width: number,
    height: number
  ) => {
    const rightShoulder = landmarks['RIGHT_SHOULDER'];
    const rightElbow = landmarks['RIGHT_ELBOW'];
    const rightWrist = landmarks['RIGHT_WRIST'];

    if (rightShoulder && rightElbow && rightWrist) {
      // Draw shooting arm line
      ctx.strokeStyle = '#ff6b35';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rightShoulder.x * width, rightShoulder.y * height);
      ctx.lineTo(rightElbow.x * width, rightElbow.y * height);
      ctx.lineTo(rightWrist.x * width, rightWrist.y * height);
      ctx.stroke();

      // Draw joints
      drawJoint(ctx, rightShoulder.x * width, rightShoulder.y * height, '#ff6b35');
      drawJoint(ctx, rightElbow.x * width, rightElbow.y * height, '#ff6b35');
      drawJoint(ctx, rightWrist.x * width, rightWrist.y * height, '#ff6b35');

      // Draw angle arc at elbow
      drawAngleArc(ctx, rightShoulder, rightElbow, rightWrist, width, height);
    }
  };

  const drawArcheryOverlay = (
    ctx: CanvasRenderingContext2D,
    landmarks: any,
    width: number,
    height: number
  ) => {
    const leftShoulder = landmarks['LEFT_SHOULDER'];
    const leftElbow = landmarks['LEFT_ELBOW'];
    const leftWrist = landmarks['LEFT_WRIST'];
    const rightShoulder = landmarks['RIGHT_SHOULDER'];
    const nose = landmarks['NOSE'];

    if (leftShoulder && leftElbow && leftWrist) {
      // Draw bow arm
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x * width, leftShoulder.y * height);
      ctx.lineTo(leftElbow.x * width, leftElbow.y * height);
      ctx.lineTo(leftWrist.x * width, leftWrist.y * height);
      ctx.stroke();

      drawJoint(ctx, leftShoulder.x * width, leftShoulder.y * height, '#4ecdc4');
      drawJoint(ctx, leftElbow.x * width, leftElbow.y * height, '#4ecdc4');
      drawJoint(ctx, leftWrist.x * width, leftWrist.y * height, '#4ecdc4');
    }

    // Draw string alignment line
    if (nose && rightShoulder) {
      ctx.strokeStyle = '#ffe66d';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(nose.x * width, nose.y * height);
      ctx.lineTo(rightShoulder.x * width, rightShoulder.y * height);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  const drawTennisOverlay = (
    ctx: CanvasRenderingContext2D,
    landmarks: any,
    width: number,
    height: number
  ) => {
    const rightShoulder = landmarks['RIGHT_SHOULDER'];
    const rightElbow = landmarks['RIGHT_ELBOW'];
    const rightWrist = landmarks['RIGHT_WRIST'];

    if (rightShoulder && rightElbow && rightWrist) {
      // Draw racket arm
      ctx.strokeStyle = '#ff9ff3';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rightShoulder.x * width, rightShoulder.y * height);
      ctx.lineTo(rightElbow.x * width, rightElbow.y * height);
      ctx.lineTo(rightWrist.x * width, rightWrist.y * height);
      ctx.stroke();

      // Draw racket extension
      const extendX = rightWrist.x * width + (rightWrist.x - rightElbow.x) * width * 0.3;
      const extendY = rightWrist.y * height + (rightWrist.y - rightElbow.y) * height * 0.3;
      ctx.lineTo(extendX, extendY);
      ctx.stroke();

      drawJoint(ctx, rightShoulder.x * width, rightShoulder.y * height, '#ff9ff3');
      drawJoint(ctx, rightElbow.x * width, rightElbow.y * height, '#ff9ff3');
      drawJoint(ctx, rightWrist.x * width, rightWrist.y * height, '#ff9ff3');
    }
  };

  const drawSwimmingOverlay = (
    ctx: CanvasRenderingContext2D,
    landmarks: any,
    width: number,
    height: number
  ) => {
    const leftShoulder = landmarks['LEFT_SHOULDER'];
    const rightShoulder = landmarks['RIGHT_SHOULDER'];
    const leftElbow = landmarks['LEFT_ELBOW'];
    const rightElbow = landmarks['RIGHT_ELBOW'];

    // Draw symmetry line
    if (leftShoulder && rightShoulder) {
      ctx.strokeStyle = '#54a0ff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x * width, leftShoulder.y * height);
      ctx.lineTo(rightShoulder.x * width, rightShoulder.y * height);
      ctx.stroke();

      drawJoint(ctx, leftShoulder.x * width, leftShoulder.y * height, '#54a0ff');
      drawJoint(ctx, rightShoulder.x * width, rightShoulder.y * height, '#54a0ff');
    }

    // Draw arm positions
    if (leftElbow) drawJoint(ctx, leftElbow.x * width, leftElbow.y * height, '#54a0ff');
    if (rightElbow) drawJoint(ctx, rightElbow.x * width, rightElbow.y * height, '#54a0ff');
  };

  const drawFootballOverlay = (
    ctx: CanvasRenderingContext2D,
    landmarks: any,
    width: number,
    height: number
  ) => {
    const rightHip = landmarks['RIGHT_HIP'];
    const rightKnee = landmarks['RIGHT_KNEE'];
    const rightAnkle = landmarks['RIGHT_ANKLE'];

    if (rightHip && rightKnee && rightAnkle) {
      // Draw kicking leg
      ctx.strokeStyle = '#26de81';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rightHip.x * width, rightHip.y * height);
      ctx.lineTo(rightKnee.x * width, rightKnee.y * height);
      ctx.lineTo(rightAnkle.x * width, rightAnkle.y * height);
      ctx.stroke();

      drawJoint(ctx, rightHip.x * width, rightHip.y * height, '#26de81');
      drawJoint(ctx, rightKnee.x * width, rightKnee.y * height, '#26de81');
      drawJoint(ctx, rightAnkle.x * width, rightAnkle.y * height, '#26de81');
    }
  };

  const drawVolleyballOverlay = (
    ctx: CanvasRenderingContext2D,
    landmarks: any,
    width: number,
    height: number
  ) => {
    const rightShoulder = landmarks['RIGHT_SHOULDER'];
    const rightWrist = landmarks['RIGHT_WRIST'];
    const leftShoulder = landmarks['LEFT_SHOULDER'];
    const leftWrist = landmarks['LEFT_WRIST'];

    // Draw spiking arms
    if (rightShoulder && rightWrist) {
      ctx.strokeStyle = '#fd79a8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(rightShoulder.x * width, rightShoulder.y * height);
      ctx.lineTo(rightWrist.x * width, rightWrist.y * height);
      ctx.stroke();
      drawJoint(ctx, rightShoulder.x * width, rightShoulder.y * height, '#fd79a8');
      drawJoint(ctx, rightWrist.x * width, rightWrist.y * height, '#fd79a8');
    }

    if (leftShoulder && leftWrist) {
      ctx.strokeStyle = '#fd79a8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(leftShoulder.x * width, leftShoulder.y * height);
      ctx.lineTo(leftWrist.x * width, leftWrist.y * height);
      ctx.stroke();
      drawJoint(ctx, leftShoulder.x * width, leftShoulder.y * height, '#fd79a8');
      drawJoint(ctx, leftWrist.x * width, leftWrist.y * height, '#fd79a8');
    }
  };

  const drawGeneralOverlay = (
    ctx: CanvasRenderingContext2D,
    landmarks: any,
    width: number,
    height: number
  ) => {
    // Draw basic pose skeleton
    const connections = [
      ['LEFT_SHOULDER', 'RIGHT_SHOULDER'],
      ['LEFT_SHOULDER', 'LEFT_ELBOW'],
      ['LEFT_ELBOW', 'LEFT_WRIST'],
      ['RIGHT_SHOULDER', 'RIGHT_ELBOW'],
      ['RIGHT_ELBOW', 'RIGHT_WRIST'],
      ['LEFT_HIP', 'RIGHT_HIP'],
      ['LEFT_HIP', 'LEFT_KNEE'],
      ['LEFT_KNEE', 'LEFT_ANKLE'],
      ['RIGHT_HIP', 'RIGHT_KNEE'],
      ['RIGHT_KNEE', 'RIGHT_ANKLE']
    ];

    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;

    connections.forEach(([start, end]) => {
      const startPoint = landmarks[start];
      const endPoint = landmarks[end];

      if (startPoint && endPoint) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x * width, startPoint.y * height);
        ctx.lineTo(endPoint.x * width, endPoint.y * height);
        ctx.stroke();
      }
    });

    // Draw all detected joints
    Object.values(landmarks).forEach((landmark: any) => {
      if (landmark && landmark.visibility > 0.5) {
        drawJoint(ctx, landmark.x * width, landmark.y * height, '#00ff00');
      }
    });
  };

  const drawJoint = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const drawAngleArc = (
    ctx: CanvasRenderingContext2D,
    point1: any,
    center: any,
    point2: any,
    width: number,
    height: number
  ) => {
    const centerX = center.x * width;
    const centerY = center.y * height;
    
    const angle1 = Math.atan2(point1.y * height - centerY, point1.x * width - centerX);
    const angle2 = Math.atan2(point2.y * height - centerY, point2.x * width - centerX);
    
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, angle1, angle2);
    ctx.stroke();
  };

  const drawPerformanceScore = (
    ctx: CanvasRenderingContext2D,
    score: number,
    width: number,
    height: number
  ) => {
    // Draw score in top-right corner
    const scoreColor = score >= 80 ? '#00ff00' : score >= 60 ? '#ffff00' : '#ff0000';
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 120, 10, 110, 60);
    
    ctx.fillStyle = scoreColor;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(score)}%`, width - 65, 40);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('FORM SCORE', width - 65, 55);
  };

  // Add immersive venue environment drawing function
  const drawVenueEnvironment = (
    ctx: CanvasRenderingContext2D,
    venue: any,
    sport: string,
    width: number,
    height: number
  ) => {
    // Draw venue-specific background elements
    ctx.save();
    
    // Semi-transparent venue overlay
    ctx.globalAlpha = 0.3;
    
    // Draw stadium boundary/walls
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 5]);
    ctx.strokeRect(width * 0.05, height * 0.05, width * 0.9, height * 0.9);
    ctx.setLineDash([]);
    
    // Draw sport-specific court/field lines based on venue type
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = '#ff6b35';
    ctx.lineWidth = 3;
    
    switch (sport) {
      case 'basketball':
        drawBasketballCourt(ctx, width, height, venue);
        break;
      case 'tennis':
        drawTennisCourt(ctx, width, height, venue);
        break;
      case 'football':
        drawFootballField(ctx, width, height, venue);
        break;
      case 'archery':
        drawArcheryRange(ctx, width, height, venue);
        break;
      case 'volleyball':
        drawVolleyballCourt(ctx, width, height, venue);
        break;
      default:
        drawGenericSportArea(ctx, width, height, venue);
    }
    
    // Venue name overlay
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = '#ff6b35';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${venue.name}`, width / 2, height * 0.1);
    
    // Venue location
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${venue.location}`, width / 2, height * 0.12);
    
    ctx.restore();
  };

  const drawBasketballCourt = (ctx: CanvasRenderingContext2D, width: number, height: number, venue: any) => {
    // Basketball court outline
    const courtWidth = width * 0.7;
    const courtHeight = height * 0.8;
    const startX = (width - courtWidth) / 2;
    const startY = (height - courtHeight) / 2;
    
    // Court boundary
    ctx.strokeRect(startX, startY, courtWidth, courtHeight);
    
    // Center circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(courtWidth, courtHeight) * 0.15, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Free throw circles
    ctx.beginPath();
    ctx.arc(width / 2, startY + courtHeight * 0.2, courtWidth * 0.12, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2, startY + courtHeight * 0.8, courtWidth * 0.12, Math.PI, 2 * Math.PI);
    ctx.stroke();
    
    // Three-point line (simplified)
    ctx.beginPath();
    ctx.arc(width / 2, startY + courtHeight * 0.05, courtWidth * 0.25, 0, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(width / 2, startY + courtHeight * 0.95, courtWidth * 0.25, Math.PI, 2 * Math.PI);
    ctx.stroke();
  };

  const drawTennisCourt = (ctx: CanvasRenderingContext2D, width: number, height: number, venue: any) => {
    // Tennis court outline
    const courtWidth = width * 0.8;
    const courtHeight = height * 0.6;
    const startX = (width - courtWidth) / 2;
    const startY = (height - courtHeight) / 2;
    
    // Outer court boundary
    ctx.strokeRect(startX, startY, courtWidth, courtHeight);
    
    // Net line
    ctx.beginPath();
    ctx.moveTo(startX, height / 2);
    ctx.lineTo(startX + courtWidth, height / 2);
    ctx.stroke();
    
    // Service boxes
    const serviceWidth = courtWidth / 2;
    const serviceHeight = courtHeight * 0.4;
    ctx.strokeRect(startX, height / 2 - serviceHeight / 2, serviceWidth, serviceHeight);
    ctx.strokeRect(startX + serviceWidth, height / 2 - serviceHeight / 2, serviceWidth, serviceHeight);
    
    // Center service line
    ctx.beginPath();
    ctx.moveTo(startX + courtWidth / 2, height / 2 - serviceHeight / 2);
    ctx.lineTo(startX + courtWidth / 2, height / 2 + serviceHeight / 2);
    ctx.stroke();
  };

  const drawFootballField = (ctx: CanvasRenderingContext2D, width: number, height: number, venue: any) => {
    // Football field outline
    const fieldWidth = width * 0.9;
    const fieldHeight = height * 0.7;
    const startX = (width - fieldWidth) / 2;
    const startY = (height - fieldHeight) / 2;
    
    // Field boundary
    ctx.strokeRect(startX, startY, fieldWidth, fieldHeight);
    
    // Center circle
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, Math.min(fieldWidth, fieldHeight) * 0.15, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Center line
    ctx.beginPath();
    ctx.moveTo(width / 2, startY);
    ctx.lineTo(width / 2, startY + fieldHeight);
    ctx.stroke();
    
    // Penalty areas
    const penaltyWidth = fieldWidth * 0.3;
    const penaltyHeight = fieldHeight * 0.2;
    ctx.strokeRect(startX, startY + (fieldHeight - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
    ctx.strokeRect(startX + fieldWidth - penaltyWidth, startY + (fieldHeight - penaltyHeight) / 2, penaltyWidth, penaltyHeight);
  };

  const drawArcheryRange = (ctx: CanvasRenderingContext2D, width: number, height: number, venue: any) => {
    // Archery shooting line
    ctx.beginPath();
    ctx.moveTo(width * 0.1, height * 0.8);
    ctx.lineTo(width * 0.9, height * 0.8);
    ctx.stroke();
    
    // Target area
    const targetSize = Math.min(width, height) * 0.15;
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.2, targetSize, 0, 2 * Math.PI);
    ctx.stroke();
    
    // Target rings
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(width / 2, height * 0.2, targetSize * (i / 5), 0, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Distance markers
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.fillText('70m', width * 0.1, height * 0.75);
  };

  const drawVolleyballCourt = (ctx: CanvasRenderingContext2D, width: number, height: number, venue: any) => {
    // Volleyball court outline  
    const courtWidth = width * 0.7;
    const courtHeight = height * 0.5;
    const startX = (width - courtWidth) / 2;
    const startY = (height - courtHeight) / 2;
    
    // Court boundary
    ctx.strokeRect(startX, startY, courtWidth, courtHeight);
    
    // Net line (center)
    ctx.beginPath();
    ctx.moveTo(startX, height / 2);
    ctx.lineTo(startX + courtWidth, height / 2);
    ctx.stroke();
    
    // Attack lines
    ctx.beginPath();
    ctx.moveTo(startX, height / 2 - courtHeight * 0.2);
    ctx.lineTo(startX + courtWidth, height / 2 - courtHeight * 0.2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(startX, height / 2 + courtHeight * 0.2);
    ctx.lineTo(startX + courtWidth, height / 2 + courtHeight * 0.2);
    ctx.stroke();
  };

  const drawGenericSportArea = (ctx: CanvasRenderingContext2D, width: number, height: number, venue: any) => {
    // Generic training area
    const areaWidth = width * 0.8;
    const areaHeight = height * 0.7;
    const startX = (width - areaWidth) / 2;
    const startY = (height - areaHeight) / 2;
    
    // Training area boundary
    ctx.strokeRect(startX, startY, areaWidth, areaHeight);
    
    // Center marker
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, 10, 0, 2 * Math.PI);
    ctx.stroke();
  };

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}