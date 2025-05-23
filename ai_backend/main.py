"""
Ekalavya AI Backend - Sports Analysis Platform
FastAPI backend with AI-powered analysis for Basketball and Archery
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import cv2
import mediapipe as mp
import numpy as np
import json
import base64
from typing import Dict, List, Optional
import asyncio
from datetime import datetime
from pydantic import BaseModel
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Ekalavya AI Sports Analysis",
    description="AI-powered sports analysis for Basketball and Archery",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Pydantic models
class AnalysisRequest(BaseModel):
    sport: str
    analysis_type: str
    user_id: Optional[int] = None

class AnalysisResult(BaseModel):
    sport: str
    analysis_type: str
    score: float
    feedback: List[str]
    metrics: Dict
    timestamp: str
    frame_analysis: Optional[Dict] = None

class BasketballAnalysis:
    """Basketball shooting form and movement analysis"""
    
    def __init__(self):
        self.pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            enable_segmentation=False,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
    
    def analyze_shooting_motion(self, frame_sequence) -> Dict:
        """Analyze basketball shooting motion across multiple frames"""
        try:
            if len(frame_sequence) < 3:
                return self.analyze_shooting_form(frame_sequence[-1])
            
            # Analyze motion across frames
            motion_analysis = self._analyze_shooting_trajectory(frame_sequence)
            
            # Get latest frame analysis
            latest_analysis = self.analyze_shooting_form(frame_sequence[-1])
            
            # Combine motion and form analysis
            combined_metrics = {
                **latest_analysis["metrics"],
                "shot_arc": motion_analysis["arc_consistency"],
                "release_timing": motion_analysis["release_timing"],
                "jump_balance": motion_analysis["jump_balance"],
                "motion_smoothness": motion_analysis["motion_smoothness"]
            }
            
            # Calculate enhanced score
            score = sum(combined_metrics.values()) / len(combined_metrics) * 100
            
            return {
                "score": round(score, 2),
                "metrics": combined_metrics,
                "feedback": self._generate_motion_feedback(combined_metrics, motion_analysis)
            }
            
        except Exception as e:
            logger.error(f"Basketball motion analysis error: {e}")
            return {"score": 0, "metrics": {}, "feedback": ["Motion analysis failed"]}

    def analyze_shooting_form(self, landmarks) -> Dict:
        """Analyze basketball shooting form from single frame"""
        try:
            # Key shooting form points
            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW]
            right_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW]
            left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
            right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
            left_knee = landmarks[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            analysis = {
                "shooting_hand_alignment": self._check_shooting_alignment(right_shoulder, right_elbow, right_wrist),
                "elbow_position": self._check_elbow_position(right_shoulder, right_elbow, right_wrist),
                "stance_balance": self._check_stance_balance(left_hip, right_hip, left_knee, right_knee),
                "follow_through": self._check_follow_through(right_elbow, right_wrist),
                "body_square": self._check_body_square(left_shoulder, right_shoulder, left_hip, right_hip)
            }
            
            # Calculate overall score
            score = sum(analysis.values()) / len(analysis) * 100
            
            return {
                "score": round(score, 2),
                "metrics": analysis,
                "feedback": self._generate_basketball_feedback(analysis)
            }
            
        except Exception as e:
            logger.error(f"Basketball analysis error: {e}")
            return {"score": 0, "metrics": {}, "feedback": ["Analysis failed"]}
    
    def _analyze_shooting_trajectory(self, frame_sequence) -> Dict:
        """Analyze shooting motion across multiple frames"""
        try:
            wrist_positions = []
            elbow_positions = []
            
            for landmarks in frame_sequence:
                wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
                elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW]
                wrist_positions.append((wrist.x, wrist.y))
                elbow_positions.append((elbow.x, elbow.y))
            
            # Calculate trajectory metrics
            arc_consistency = self._calculate_arc_consistency(wrist_positions)
            release_timing = self._calculate_release_timing(wrist_positions, elbow_positions)
            jump_balance = self._calculate_jump_balance(frame_sequence)
            motion_smoothness = self._calculate_motion_smoothness(wrist_positions)
            
            return {
                "arc_consistency": arc_consistency,
                "release_timing": release_timing,
                "jump_balance": jump_balance,
                "motion_smoothness": motion_smoothness
            }
            
        except Exception as e:
            logger.error(f"Trajectory analysis error: {e}")
            return {
                "arc_consistency": 0.5,
                "release_timing": 0.5,
                "jump_balance": 0.5,
                "motion_smoothness": 0.5
            }
    
    def _calculate_arc_consistency(self, positions) -> float:
        """Calculate shooting arc consistency"""
        if len(positions) < 3:
            return 0.5
        
        # Simple arc analysis - check if trajectory follows parabolic path
        y_values = [pos[1] for pos in positions]
        if len(y_values) < 3:
            return 0.5
        
        # Check for upward then downward motion (shooting arc)
        has_peak = False
        ascending = True
        
        for i in range(1, len(y_values)):
            if ascending and y_values[i] > y_values[i-1]:
                continue
            elif ascending and y_values[i] <= y_values[i-1]:
                ascending = False
                has_peak = True
            elif not ascending and y_values[i] < y_values[i-1]:
                continue
            else:
                # Motion is inconsistent
                return max(0, 0.8 - (i * 0.1))
        
        return 0.9 if has_peak else 0.6
    
    def _calculate_release_timing(self, wrist_positions, elbow_positions) -> float:
        """Calculate release timing consistency"""
        if len(wrist_positions) < 3:
            return 0.5
        
        # Analyze wrist snap motion
        wrist_velocities = []
        for i in range(1, len(wrist_positions)):
            dx = wrist_positions[i][0] - wrist_positions[i-1][0]
            dy = wrist_positions[i][1] - wrist_positions[i-1][1]
            velocity = (dx**2 + dy**2)**0.5
            wrist_velocities.append(velocity)
        
        # Good release should show acceleration then deceleration
        if len(wrist_velocities) >= 2:
            peak_velocity = max(wrist_velocities)
            peak_index = wrist_velocities.index(peak_velocity)
            
            # Check if peak is in middle portion of motion
            if 0.3 <= peak_index / len(wrist_velocities) <= 0.7:
                return 0.85
            else:
                return 0.65
        
        return 0.5
    
    def _calculate_jump_balance(self, frame_sequence) -> float:
        """Calculate jump balance during shooting motion"""
        if len(frame_sequence) < 3:
            return 0.5
        
        try:
            hip_stability = []
            for landmarks in frame_sequence:
                left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
                right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
                hip_level = abs(left_hip.y - right_hip.y)
                hip_stability.append(hip_level)
            
            # Good balance shows consistent hip level
            stability_variance = sum(hip_stability) / len(hip_stability)
            balance_score = max(0, 1 - stability_variance * 10)
            
            return balance_score
        except:
            return 0.5
    
    def _calculate_motion_smoothness(self, positions) -> float:
        """Calculate overall motion smoothness"""
        if len(positions) < 4:
            return 0.5
        
        # Calculate acceleration changes (jerk)
        velocities = []
        for i in range(1, len(positions)):
            dx = positions[i][0] - positions[i-1][0]
            dy = positions[i][1] - positions[i-1][1]
            velocity = (dx**2 + dy**2)**0.5
            velocities.append(velocity)
        
        accelerations = []
        for i in range(1, len(velocities)):
            accel = abs(velocities[i] - velocities[i-1])
            accelerations.append(accel)
        
        if accelerations:
            avg_jerk = sum(accelerations) / len(accelerations)
            smoothness = max(0, 1 - avg_jerk * 20)
            return smoothness
        
        return 0.5
    
    def _generate_motion_feedback(self, metrics: Dict, motion_analysis: Dict) -> List[str]:
        """Generate enhanced basketball feedback including motion analysis"""
        feedback = []
        
        # Form feedback
        if metrics["shooting_hand_alignment"] < 0.7:
            feedback.append("Keep your shooting hand aligned vertically - elbow under wrist under shoulder")
        
        if metrics["elbow_position"] < 0.7:
            feedback.append("Position your elbow directly under the ball for better accuracy")
        
        # Motion feedback
        if metrics["shot_arc"] < 0.7:
            feedback.append("Work on consistent shooting arc - follow through high and smooth")
        
        if metrics["release_timing"] < 0.7:
            feedback.append("Focus on release timing - snap wrist at the peak of your shot")
        
        if metrics["jump_balance"] < 0.7:
            feedback.append("Maintain better balance during your jump shot")
        
        if metrics["motion_smoothness"] < 0.7:
            feedback.append("Practice smoother shooting motion - avoid jerky movements")
        
        if not feedback:
            feedback.append("Excellent shooting motion! Great form and consistency")
        
        return feedback
    
    def _check_shooting_alignment(self, shoulder, elbow, wrist) -> float:
        """Check if shooting hand is properly aligned"""
        try:
            # Calculate alignment score based on vertical alignment
            elbow_shoulder_diff = abs(elbow.x - shoulder.x)
            wrist_elbow_diff = abs(wrist.x - elbow.x)
            alignment_score = max(0, 1 - (elbow_shoulder_diff + wrist_elbow_diff) * 2)
            return alignment_score
        except:
            return 0.5
    
    def _check_elbow_position(self, shoulder, elbow, wrist) -> float:
        """Check proper elbow positioning"""
        try:
            # Elbow should be under the ball (below shoulder level)
            elbow_height = shoulder.y - elbow.y
            optimal_position = 0.1  # Optimal elbow position relative to shoulder
            position_score = max(0, 1 - abs(elbow_height - optimal_position) * 5)
            return position_score
        except:
            return 0.5
    
    def _check_stance_balance(self, left_hip, right_hip, left_knee, right_knee) -> float:
        """Check shooting stance balance"""
        try:
            # Check hip and knee alignment
            hip_balance = 1 - abs(left_hip.y - right_hip.y) * 5
            knee_balance = 1 - abs(left_knee.y - right_knee.y) * 5
            balance_score = (hip_balance + knee_balance) / 2
            return max(0, min(1, balance_score))
        except:
            return 0.5
    
    def _check_follow_through(self, elbow, wrist) -> float:
        """Check shooting follow-through"""
        try:
            # Wrist should be below elbow on follow-through
            follow_through = wrist.y - elbow.y
            if follow_through > 0:
                return min(1, follow_through * 3)
            return 0
        except:
            return 0.5
    
    def _check_body_square(self, left_shoulder, right_shoulder, left_hip, right_hip) -> float:
        """Check if body is square to the basket"""
        try:
            shoulder_alignment = 1 - abs(left_shoulder.y - right_shoulder.y) * 3
            hip_alignment = 1 - abs(left_hip.y - right_hip.y) * 3
            square_score = (shoulder_alignment + hip_alignment) / 2
            return max(0, min(1, square_score))
        except:
            return 0.5
    
    def _generate_basketball_feedback(self, analysis: Dict) -> List[str]:
        """Generate basketball coaching feedback"""
        feedback = []
        
        if analysis["shooting_hand_alignment"] < 0.7:
            feedback.append("Keep your shooting hand aligned vertically - elbow under wrist under shoulder")
        
        if analysis["elbow_position"] < 0.7:
            feedback.append("Position your elbow directly under the ball for better accuracy")
        
        if analysis["stance_balance"] < 0.7:
            feedback.append("Improve your stance balance - keep feet shoulder-width apart")
        
        if analysis["follow_through"] < 0.7:
            feedback.append("Snap your wrist down on the follow-through for better arc")
        
        if analysis["body_square"] < 0.7:
            feedback.append("Square your shoulders and hips to the basket")
        
        if not feedback:
            feedback.append("Excellent shooting form! Keep practicing to maintain consistency")
        
        return feedback

class ArcheryAnalysis:
    """Archery form and technique analysis"""
    
    def __init__(self):
        self.pose = mp_pose.Pose(
            static_image_mode=False,
            model_complexity=2,
            enable_segmentation=False,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
    
    def analyze_archery_form(self, landmarks) -> Dict:
        """Analyze archery shooting form"""
        try:
            # Key archery form points
            left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_elbow = landmarks[mp_pose.PoseLandmark.LEFT_ELBOW]
            right_elbow = landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW]
            left_wrist = landmarks[mp_pose.PoseLandmark.LEFT_WRIST]
            right_wrist = landmarks[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_hip = landmarks[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks[mp_pose.PoseLandmark.RIGHT_HIP]
            nose = landmarks[mp_pose.PoseLandmark.NOSE]
            
            analysis = {
                "stance_stability": self._check_stance_stability(left_hip, right_hip),
                "bow_arm_position": self._check_bow_arm_position(left_shoulder, left_elbow, left_wrist),
                "draw_arm_alignment": self._check_draw_arm_alignment(right_shoulder, right_elbow, right_wrist),
                "anchor_point": self._check_anchor_point(right_wrist, nose),
                "shoulder_alignment": self._check_shoulder_alignment(left_shoulder, right_shoulder),
                "back_tension": self._check_back_tension(left_shoulder, right_shoulder, right_elbow)
            }
            
            # Calculate overall score
            score = sum(analysis.values()) / len(analysis) * 100
            
            return {
                "score": round(score, 2),
                "metrics": analysis,
                "feedback": self._generate_archery_feedback(analysis)
            }
            
        except Exception as e:
            logger.error(f"Archery analysis error: {e}")
            return {"score": 0, "metrics": {}, "feedback": ["Analysis failed"]}
    
    def _check_stance_stability(self, left_hip, right_hip) -> float:
        """Check archery stance stability"""
        try:
            # Check hip level and balance
            hip_level = 1 - abs(left_hip.y - right_hip.y) * 5
            return max(0, min(1, hip_level))
        except:
            return 0.5
    
    def _check_bow_arm_position(self, shoulder, elbow, wrist) -> float:
        """Check bow arm positioning"""
        try:
            # Bow arm should be straight and level
            arm_straightness = 1 - abs((shoulder.y - elbow.y) - (elbow.y - wrist.y)) * 3
            arm_level = 1 - abs(shoulder.y - wrist.y) * 3
            bow_arm_score = (arm_straightness + arm_level) / 2
            return max(0, min(1, bow_arm_score))
        except:
            return 0.5
    
    def _check_draw_arm_alignment(self, shoulder, elbow, wrist) -> float:
        """Check draw arm alignment"""
        try:
            # Draw arm should be in line with arrow
            elbow_height = shoulder.y - elbow.y
            optimal_height = 0.05  # Slight elbow elevation
            alignment_score = max(0, 1 - abs(elbow_height - optimal_height) * 10)
            return alignment_score
        except:
            return 0.5
    
    def _check_anchor_point(self, wrist, nose) -> float:
        """Check consistent anchor point"""
        try:
            # Draw hand should be at consistent anchor point near face
            anchor_distance = abs(wrist.x - nose.x) + abs(wrist.y - nose.y)
            optimal_distance = 0.15
            anchor_score = max(0, 1 - abs(anchor_distance - optimal_distance) * 5)
            return anchor_score
        except:
            return 0.5
    
    def _check_shoulder_alignment(self, left_shoulder, right_shoulder) -> float:
        """Check shoulder alignment"""
        try:
            shoulder_level = 1 - abs(left_shoulder.y - right_shoulder.y) * 3
            return max(0, min(1, shoulder_level))
        except:
            return 0.5
    
    def _check_back_tension(self, left_shoulder, right_shoulder, right_elbow) -> float:
        """Check proper back tension"""
        try:
            # Right elbow should be behind the line of shoulders
            shoulder_line = (left_shoulder.x + right_shoulder.x) / 2
            elbow_position = right_elbow.x - shoulder_line
            tension_score = min(1, max(0, elbow_position * 5))
            return tension_score
        except:
            return 0.5
    
    def _generate_archery_feedback(self, analysis: Dict) -> List[str]:
        """Generate archery coaching feedback"""
        feedback = []
        
        if analysis["stance_stability"] < 0.7:
            feedback.append("Improve stance stability - keep feet parallel and hip-width apart")
        
        if analysis["bow_arm_position"] < 0.7:
            feedback.append("Keep your bow arm straight and level with your shoulder")
        
        if analysis["draw_arm_alignment"] < 0.7:
            feedback.append("Align your draw arm - elbow should be level with the arrow")
        
        if analysis["anchor_point"] < 0.7:
            feedback.append("Maintain consistent anchor point - same spot every time")
        
        if analysis["shoulder_alignment"] < 0.7:
            feedback.append("Keep shoulders level and square to the target")
        
        if analysis["back_tension"] < 0.7:
            feedback.append("Use proper back tension - pull with your back muscles, not just arms")
        
        if not feedback:
            feedback.append("Excellent form! Focus on consistency and follow-through")
        
        return feedback

# Initialize analysis engines
basketball_analyzer = BasketballAnalysis()
archery_analyzer = ArcheryAnalysis()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Active connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Active connections: {len(self.active_connections)}")
    
    async def send_analysis_result(self, websocket: WebSocket, result: Dict):
        await websocket.send_text(json.dumps(result))

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Ekalavya AI Sports Analysis Backend", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/analyze/image")
async def analyze_image(
    file: UploadFile = File(...),
    sport: str = "basketball",
    analysis_type: str = "form"
):
    """Analyze uploaded image for sports technique"""
    try:
        # Read uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Convert BGR to RGB for MediaPipe
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Process with MediaPipe
        if sport.lower() == "basketball":
            with basketball_analyzer.pose as pose:
                results = pose.process(rgb_image)
                
                if results.pose_landmarks:
                    analysis_result = basketball_analyzer.analyze_shooting_form(
                        results.pose_landmarks.landmark
                    )
                else:
                    analysis_result = {
                        "score": 0,
                        "metrics": {},
                        "feedback": ["No pose detected in image"]
                    }
        
        elif sport.lower() == "archery":
            with archery_analyzer.pose as pose:
                results = pose.process(rgb_image)
                
                if results.pose_landmarks:
                    analysis_result = archery_analyzer.analyze_archery_form(
                        results.pose_landmarks.landmark
                    )
                else:
                    analysis_result = {
                        "score": 0,
                        "metrics": {},
                        "feedback": ["No pose detected in image"]
                    }
        else:
            raise HTTPException(status_code=400, detail=f"Sport '{sport}' not supported yet")
        
        return AnalysisResult(
            sport=sport,
            analysis_type=analysis_type,
            score=analysis_result["score"],
            feedback=analysis_result["feedback"],
            metrics=analysis_result["metrics"],
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.websocket("/ws/analyze")
async def websocket_analyze(websocket: WebSocket):
    """WebSocket endpoint for real-time video analysis"""
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive frame data
            data = await websocket.receive_text()
            frame_data = json.loads(data)
            
            sport = frame_data.get("sport", "basketball")
            
            # Decode base64 image
            image_data = base64.b64decode(frame_data["image"])
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is not None:
                rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                
                # Analyze based on sport
                if sport.lower() == "basketball":
                    with basketball_analyzer.pose as pose:
                        results = pose.process(rgb_image)
                        
                        if results.pose_landmarks:
                            analysis_result = basketball_analyzer.analyze_shooting_form(
                                results.pose_landmarks.landmark
                            )
                        else:
                            analysis_result = {
                                "score": 0,
                                "metrics": {},
                                "feedback": ["No pose detected"]
                            }
                
                elif sport.lower() == "archery":
                    with archery_analyzer.pose as pose:
                        results = pose.process(rgb_image)
                        
                        if results.pose_landmarks:
                            analysis_result = archery_analyzer.analyze_archery_form(
                                results.pose_landmarks.landmark
                            )
                        else:
                            analysis_result = {
                                "score": 0,
                                "metrics": {},
                                "feedback": ["No pose detected"]
                            }
                
                # Send analysis result
                response = {
                    "type": "analysis_result",
                    "sport": sport,
                    "score": analysis_result["score"],
                    "feedback": analysis_result["feedback"],
                    "metrics": analysis_result["metrics"],
                    "timestamp": datetime.now().isoformat()
                }
                
                await manager.send_analysis_result(websocket, response)
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.get("/api/sports")
async def get_supported_sports():
    """Get list of supported sports"""
    return {
        "sports": [
            {
                "name": "Basketball",
                "id": "basketball",
                "analysis_types": ["shooting_form", "movement", "dribbling"],
                "description": "Shooting form, movement patterns, and dribbling technique analysis"
            },
            {
                "name": "Archery",
                "id": "archery", 
                "analysis_types": ["form", "stance", "consistency"],
                "description": "Shooting form, stance stability, and consistency analysis"
            }
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )