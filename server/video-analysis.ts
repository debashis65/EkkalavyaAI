import { Request, Response } from 'express';
import fetch from 'node-fetch';

interface VideoAnalysisRequest {
  sport: string;
  analysis_type: string;
  frames?: string[];
  frame_data?: string;
  timestamp: string;
  user_id: string;
  filename?: string;
}

export const analyzeVideo = async (req: Request, res: Response) => {
  try {
    const analysisRequest: VideoAnalysisRequest = req.body;
    
    // Forward to AI backend for real analysis
    const aiResponse = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sport: analysisRequest.sport,
        analysis_type: analysisRequest.analysis_type,
        frames: analysisRequest.frames || [analysisRequest.frame_data],
        timestamp: analysisRequest.timestamp
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI analysis failed');
    }

    const analysisResult = await aiResponse.json();
    
    // Generate authentic drill recommendations
    const drillsResponse = await fetch('http://localhost:8000/recommend_drills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sport: analysisRequest.sport,
        metrics: analysisResult.metrics,
        skill_level: 'intermediate'
      }),
    });

    const drillRecommendations = drillsResponse.ok ? await drillsResponse.json() : { drills: [] };

    const response = {
      ...analysisResult,
      drill_recommendations: drillRecommendations.drills,
      user_id: analysisRequest.user_id,
      filename: analysisRequest.filename
    };

    res.json(response);
  } catch (error) {
    console.error('Video analysis error:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const generateDrills = async (req: Request, res: Response) => {
  try {
    const { sport, metrics, athlete_level } = req.body;
    
    const response = await fetch('http://localhost:8000/recommend_drills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sport,
        metrics,
        skill_level: athlete_level
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate drills');
    }

    const drillData = await response.json();
    res.json(drillData.drills || []);
  } catch (error) {
    console.error('Drill generation error:', error);
    res.status(500).json({ 
      error: 'Drill generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};