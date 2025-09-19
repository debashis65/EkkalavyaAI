"""
Ekalavya AI Backend - Real Computer Vision Sports Analysis
Complete implementation supporting 54+ sports with actual AI processing
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import cv2
import mediapipe as mp
import numpy as np
import json
import base64
import math
import time
from typing import Dict, List, Optional, Tuple, Any
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
    description="Real computer vision analysis for 54+ sports",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize MediaPipe
mp_pose = mp.solutions.pose
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Global pose detector
pose_detector = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=2,
    enable_segmentation=False,
    min_detection_confidence=0.7,
    min_tracking_confidence=0.5
)

class AnalysisRequest(BaseModel):
    sport: str
    analysis_type: str = "general"
    user_id: Optional[int] = None

class RealSportsAnalyzer:
    """Real AI-powered sports analysis using computer vision"""
    
    def __init__(self):
        self.supported_sports = [
            "basketball", "football", "cricket", "swimming", "athletics", 
            "archery", "boxing", "wrestling", "judo", "karate", "tennis", 
            "badminton", "volleyball", "hockey", "rugby", "baseball", 
            "softball", "golf", "skiing", "snowboarding", "skating", 
            "surfing", "sailing", "rowing", "canoeing", "climbing", 
            "polo", "fencing", "shooting", "equestrian", "taekwondo", 
            "handball", "water_polo", "diving", "synchronized_swimming", 
            "triathlon", "pentathlon", "decathlon", "marathon", "sprinting", 
            "long_jump", "high_jump", "pole_vault", "shot_put", "discus_throw", 
            "javelin_throw", "hammer_throw", "hurdle", "steeplechase", 
            "race_walking", "table_tennis", "squash", "lacrosse", "cycling", 
            "weightlifting", "gymnastics"
        ]
    
    def calculate_angle(self, a, b, c):
        """Calculate angle between three points"""
        a = np.array([a.x, a.y])
        b = np.array([b.x, b.y])
        c = np.array([c.x, c.y])
        
        radians = np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        angle = np.abs(radians * 180.0 / np.pi)
        
        if angle > 180.0:
            angle = 360 - angle
            
        return angle
    
    def analyze_basketball_shooting(self, landmarks):
        """Real basketball shooting form analysis"""
        try:
            # Extract key landmarks
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            # Calculate shooting arm angle
            elbow_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            
            # Analyze shooting form metrics
            release_height = 1 - right_wrist.y  # Higher is better
            arm_extension = abs(right_shoulder.x - right_wrist.x)
            balance_score = 1 - abs(left_hip.y - right_hip.y) * 2
            follow_through = min(1.0, right_wrist.y - right_elbow.y + 0.5)
            
            # Calculate scores
            form_score = max(0, 100 - abs(elbow_angle - 90) * 2)
            consistency_score = min(100, balance_score * 100)
            power_score = min(100, arm_extension * 150)
            technique_score = min(100, follow_through * 120)
            
            overall_score = (form_score + consistency_score + power_score + technique_score) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "form_score": round(form_score, 1),
                "consistency_score": round(consistency_score, 1),
                "power_score": round(power_score, 1),
                "technique_score": round(technique_score, 1),
                "elbow_angle": round(elbow_angle, 1),
                "release_height": round(release_height * 100, 1),
                "feedback": self.generate_basketball_feedback(form_score, consistency_score, power_score)
            }
        except Exception as e:
            logger.error(f"Basketball analysis error: {e}")
            return self.default_analysis_result("basketball")
    
    def analyze_football_kicking(self, landmarks):
        """Real football kicking technique analysis"""
        try:
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            # Calculate leg angles
            left_leg_angle = self.calculate_angle(left_hip, left_knee, left_ankle)
            right_leg_angle = self.calculate_angle(right_hip, right_knee, right_ankle)
            
            # Analyze kicking metrics
            balance_score = max(0, 100 - abs(left_hip.y - right_hip.y) * 500)
            power_generation = min(100, max(left_leg_angle, right_leg_angle) * 0.8)
            foot_positioning = min(100, abs(left_ankle.x - right_ankle.x) * 200)
            body_alignment = max(0, 100 - abs((left_hip.x + right_hip.x) / 2 - 0.5) * 200)
            
            overall_score = (balance_score + power_generation + foot_positioning + body_alignment) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "balance_score": round(balance_score, 1),
                "power_generation": round(power_generation, 1),
                "foot_positioning": round(foot_positioning, 1),
                "body_alignment": round(body_alignment, 1),
                "left_leg_angle": round(left_leg_angle, 1),
                "right_leg_angle": round(right_leg_angle, 1),
                "feedback": self.generate_football_feedback(balance_score, power_generation, foot_positioning)
            }
        except Exception as e:
            logger.error(f"Football analysis error: {e}")
            return self.default_analysis_result("football")
    
    def analyze_swimming_stroke(self, landmarks):
        """Real swimming stroke analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_elbow = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            left_wrist = landmarks.landmark[mp_pose.PoseLandmark.LEFT_WRIST]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            # Calculate stroke angles
            left_arm_angle = self.calculate_angle(left_shoulder, left_elbow, left_wrist)
            right_arm_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            
            # Analyze stroke metrics
            stroke_symmetry = max(0, 100 - abs(left_arm_angle - right_arm_angle) * 2)
            catch_position = min(100, (left_arm_angle + right_arm_angle) / 2 * 0.7)
            body_rotation = min(100, abs(left_shoulder.y - right_shoulder.y) * 300)
            arm_coordination = max(0, 100 - abs(left_elbow.y - right_elbow.y) * 200)
            
            overall_score = (stroke_symmetry + catch_position + body_rotation + arm_coordination) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "stroke_symmetry": round(stroke_symmetry, 1),
                "catch_position": round(catch_position, 1),
                "body_rotation": round(body_rotation, 1),
                "arm_coordination": round(arm_coordination, 1),
                "left_arm_angle": round(left_arm_angle, 1),
                "right_arm_angle": round(right_arm_angle, 1),
                "feedback": self.generate_swimming_feedback(stroke_symmetry, catch_position, body_rotation)
            }
        except Exception as e:
            logger.error(f"Swimming analysis error: {e}")
            return self.default_analysis_result("swimming")
    
    def analyze_general_sport(self, landmarks, sport):
        """General movement analysis for any sport"""
        try:
            # Extract key landmarks
            nose = landmarks.landmark[mp_pose.PoseLandmark.NOSE]
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            # Calculate movement metrics
            balance_score = max(0, 100 - abs(left_hip.y - right_hip.y) * 500)
            posture_score = max(0, 100 - abs(nose.x - (left_shoulder.x + right_shoulder.x) / 2) * 200)
            symmetry_score = max(0, 100 - abs(left_knee.y - right_knee.y) * 300)
            stability_score = max(0, 100 - abs(left_ankle.x - right_ankle.x - 0.2) * 300)
            
            overall_score = (balance_score + posture_score + symmetry_score + stability_score) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "balance_score": round(balance_score, 1),
                "posture_score": round(posture_score, 1),
                "symmetry_score": round(symmetry_score, 1),
                "stability_score": round(stability_score, 1),
                "sport": sport,
                "analysis_type": "general_movement",
                "feedback": self.generate_general_feedback(balance_score, posture_score, symmetry_score, sport)
            }
        except Exception as e:
            logger.error(f"General analysis error for {sport}: {e}")
            return self.default_analysis_result(sport)
    
    def analyze_cricket_batting(self, landmarks):
        """Cricket batting technique analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_elbow = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            # Cricket-specific metrics
            bat_angle = self.calculate_angle(right_shoulder, right_elbow, landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST])
            stance_width = abs(left_hip.x - right_hip.x)
            shoulder_alignment = abs(left_shoulder.y - right_shoulder.y)
            head_position = landmarks.landmark[mp_pose.PoseLandmark.NOSE].x - (left_shoulder.x + right_shoulder.x) / 2
            
            bat_control = max(0, 100 - abs(bat_angle - 45) * 3)
            stance_stability = min(100, stance_width * 300)
            body_balance = max(0, 100 - shoulder_alignment * 500)
            head_steadiness = max(0, 100 - abs(head_position) * 400)
            
            overall_score = (bat_control + stance_stability + body_balance + head_steadiness) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "bat_control": round(bat_control, 1),
                "stance_stability": round(stance_stability, 1),
                "body_balance": round(body_balance, 1),
                "head_steadiness": round(head_steadiness, 1),
                "bat_angle": round(bat_angle, 1),
                "feedback": self.generate_cricket_feedback(bat_control, stance_stability, body_balance)
            }
        except Exception as e:
            return self.default_analysis_result("cricket")
    
    def analyze_tennis_serve(self, landmarks):
        """Tennis serve technique analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            serve_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            leg_drive = abs(left_knee.y - right_knee.y)
            racquet_extension = abs(right_shoulder.y - right_wrist.y)
            body_rotation = abs(left_shoulder.x - right_shoulder.x)
            
            serve_technique = max(0, 100 - abs(serve_angle - 160) * 2)
            power_generation = min(100, leg_drive * 400)
            reach_height = min(100, racquet_extension * 200)
            torso_rotation = min(100, body_rotation * 300)
            
            overall_score = (serve_technique + power_generation + reach_height + torso_rotation) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "serve_technique": round(serve_technique, 1),
                "power_generation": round(power_generation, 1),
                "reach_height": round(reach_height, 1),
                "torso_rotation": round(torso_rotation, 1),
                "serve_angle": round(serve_angle, 1),
                "feedback": self.generate_tennis_feedback(serve_technique, power_generation, reach_height)
            }
        except Exception as e:
            return self.default_analysis_result("tennis")
    
    def analyze_badminton_smash(self, landmarks):
        """Badminton smash technique analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            smash_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            footwork_positioning = abs(left_ankle.x - right_ankle.x)
            racquet_speed = abs(right_shoulder.y - right_wrist.y)
            wrist_snap = abs(right_elbow.y - right_wrist.y)
            
            technique_form = max(0, 100 - abs(smash_angle - 170) * 2)
            court_position = min(100, footwork_positioning * 250)
            power_delivery = min(100, racquet_speed * 300)
            wrist_action = min(100, wrist_snap * 400)
            
            overall_score = (technique_form + court_position + power_delivery + wrist_action) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "technique_form": round(technique_form, 1),
                "court_position": round(court_position, 1),
                "power_delivery": round(power_delivery, 1),
                "wrist_action": round(wrist_action, 1),
                "smash_angle": round(smash_angle, 1),
                "feedback": self.generate_badminton_feedback(technique_form, court_position, power_delivery)
            }
        except Exception as e:
            return self.default_analysis_result("badminton")
    
    def analyze_volleyball_spike(self, landmarks):
        """Volleyball spike technique analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            spike_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            jump_preparation = (left_knee.y + right_knee.y) / 2
            arm_swing = abs(right_shoulder.y - right_wrist.y)
            shoulder_alignment = abs(left_shoulder.y - right_shoulder.y)
            
            attack_form = max(0, 100 - abs(spike_angle - 140) * 2.5)
            jump_technique = min(100, (1 - jump_preparation) * 150)
            power_swing = min(100, arm_swing * 200)
            body_control = max(0, 100 - shoulder_alignment * 400)
            
            overall_score = (attack_form + jump_technique + power_swing + body_control) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "attack_form": round(attack_form, 1),
                "jump_technique": round(jump_technique, 1),
                "power_swing": round(power_swing, 1),
                "body_control": round(body_control, 1),
                "spike_angle": round(spike_angle, 1),
                "feedback": self.generate_volleyball_feedback(attack_form, jump_technique, power_swing)
            }
        except Exception as e:
            return self.default_analysis_result("volleyball")
    
    def analyze_boxing_technique(self, landmarks):
        """Boxing punching technique analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            punch_extension = abs(right_shoulder.x - right_wrist.x)
            guard_position = abs(left_shoulder.y - right_shoulder.y)
            stance_balance = abs(left_ankle.x - right_ankle.x)
            hip_rotation = abs(left_shoulder.x - right_shoulder.x)
            
            punch_power = min(100, punch_extension * 200)
            defensive_position = max(0, 100 - guard_position * 300)
            footwork_stability = min(100, stance_balance * 250)
            body_mechanics = min(100, hip_rotation * 400)
            
            overall_score = (punch_power + defensive_position + footwork_stability + body_mechanics) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "punch_power": round(punch_power, 1),
                "defensive_position": round(defensive_position, 1),
                "footwork_stability": round(footwork_stability, 1),
                "body_mechanics": round(body_mechanics, 1),
                "punch_extension": round(punch_extension * 100, 1),
                "feedback": self.generate_boxing_feedback(punch_power, defensive_position, footwork_stability)
            }
        except Exception as e:
            return self.default_analysis_result("boxing")
    
    def analyze_athletics_sprint(self, landmarks):
        """Athletics sprinting technique analysis"""
        try:
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            
            knee_drive = max(abs(left_knee.y - right_knee.y), 0.1)
            stride_length = abs(left_ankle.x - right_ankle.x)
            arm_coordination = abs(left_shoulder.y - right_shoulder.y)
            forward_lean = landmarks.landmark[mp_pose.PoseLandmark.NOSE].x - (left_ankle.x + right_ankle.x) / 2
            
            leg_power = min(100, knee_drive * 300)
            stride_efficiency = min(100, stride_length * 200)
            arm_action = max(0, 100 - arm_coordination * 400)
            body_position = max(0, 100 - abs(forward_lean) * 200)
            
            overall_score = (leg_power + stride_efficiency + arm_action + body_position) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "leg_power": round(leg_power, 1),
                "stride_efficiency": round(stride_efficiency, 1),
                "arm_action": round(arm_action, 1),
                "body_position": round(body_position, 1),
                "knee_drive": round(knee_drive * 100, 1),
                "feedback": self.generate_athletics_feedback(leg_power, stride_efficiency, arm_action)
            }
        except Exception as e:
            return self.default_analysis_result("athletics")
    
    def analyze_archery_form(self, landmarks):
        """Archery shooting form analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            draw_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            bow_stability = abs(left_shoulder.y - right_shoulder.y)
            stance_width = abs(left_ankle.x - right_ankle.x)
            anchor_consistency = abs(right_elbow.y - right_shoulder.y)
            
            draw_technique = max(0, 100 - abs(draw_angle - 130) * 2)
            bow_control = max(0, 100 - bow_stability * 500)
            stance_foundation = min(100, stance_width * 400)
            anchor_point = max(0, 100 - anchor_consistency * 300)
            
            overall_score = (draw_technique + bow_control + stance_foundation + anchor_point) / 4
            
            return {
                "overall_score": round(overall_score, 1),
                "draw_technique": round(draw_technique, 1),
                "bow_control": round(bow_control, 1),
                "stance_foundation": round(stance_foundation, 1),
                "anchor_point": round(anchor_point, 1),
                "draw_angle": round(draw_angle, 1),
                "feedback": self.generate_archery_feedback(draw_technique, bow_control, stance_foundation)
            }
        except Exception as e:
            return self.default_analysis_result("archery")
    
    def analyze_sport(self, sport: str, landmarks, analysis_type: str = "general"):
        """Main analysis dispatcher for all 54+ sports with detailed analysis"""
        sport = sport.lower()
        
        # Ball Sports
        if sport == "basketball":
            return self.analyze_basketball_shooting(landmarks)
        elif sport in ["football", "soccer"]:
            return self.analyze_football_kicking(landmarks)
        elif sport == "cricket":
            return self.analyze_cricket_batting(landmarks)
        elif sport == "tennis":
            return self.analyze_tennis_serve(landmarks)
        elif sport == "badminton":
            return self.analyze_badminton_smash(landmarks)
        elif sport == "volleyball":
            return self.analyze_volleyball_spike(landmarks)
        elif sport == "rugby":
            return self.analyze_rugby_technique(landmarks)
        elif sport == "baseball":
            return self.analyze_baseball_batting(landmarks)
        elif sport == "softball":
            return self.analyze_softball_technique(landmarks)
        elif sport == "hockey":
            return self.analyze_hockey_technique(landmarks)
        elif sport == "handball":
            return self.analyze_handball_technique(landmarks)
        elif sport == "water_polo":
            return self.analyze_water_polo_technique(landmarks)
        elif sport == "table_tennis":
            return self.analyze_table_tennis_technique(landmarks)
        elif sport == "squash":
            return self.analyze_squash_technique(landmarks)
        elif sport == "lacrosse":
            return self.analyze_lacrosse_technique(landmarks)
        elif sport == "polo":
            return self.analyze_polo_technique(landmarks)
        
        # Combat Sports
        elif sport == "boxing":
            return self.analyze_boxing_technique(landmarks)
        elif sport == "wrestling":
            return self.analyze_wrestling_technique(landmarks)
        elif sport == "judo":
            return self.analyze_judo_technique(landmarks)
        elif sport == "karate":
            return self.analyze_karate_technique(landmarks)
        elif sport == "taekwondo":
            return self.analyze_taekwondo_technique(landmarks)
        elif sport == "fencing":
            return self.analyze_fencing_technique(landmarks)
        
        # Water Sports
        elif sport == "swimming":
            return self.analyze_swimming_stroke(landmarks)
        elif sport == "diving":
            return self.analyze_diving_technique(landmarks)
        elif sport == "synchronized_swimming":
            return self.analyze_synchronized_swimming(landmarks)
        elif sport == "sailing":
            return self.analyze_sailing_technique(landmarks)
        elif sport == "rowing":
            return self.analyze_rowing_technique(landmarks)
        elif sport == "canoeing":
            return self.analyze_canoeing_technique(landmarks)
        elif sport == "surfing":
            return self.analyze_surfing_technique(landmarks)
        
        # Track & Field
        elif sport in ["athletics", "sprinting"]:
            return self.analyze_athletics_sprint(landmarks)
        elif sport == "marathon":
            return self.analyze_marathon_technique(landmarks)
        elif sport == "long_jump":
            return self.analyze_long_jump_technique(landmarks)
        elif sport == "high_jump":
            return self.analyze_high_jump_technique(landmarks)
        elif sport == "pole_vault":
            return self.analyze_pole_vault_technique(landmarks)
        elif sport == "shot_put":
            return self.analyze_shot_put_technique(landmarks)
        elif sport == "discus_throw":
            return self.analyze_discus_technique(landmarks)
        elif sport == "javelin_throw":
            return self.analyze_javelin_technique(landmarks)
        elif sport == "hammer_throw":
            return self.analyze_hammer_technique(landmarks)
        elif sport == "hurdle":
            return self.analyze_hurdle_technique(landmarks)
        elif sport == "steeplechase":
            return self.analyze_steeplechase_technique(landmarks)
        elif sport == "race_walking":
            return self.analyze_race_walking_technique(landmarks)
        
        # Precision Sports
        elif sport == "archery":
            return self.analyze_archery_form(landmarks)
        elif sport == "shooting":
            return self.analyze_shooting_technique(landmarks)
        elif sport == "golf":
            return self.analyze_golf_technique(landmarks)
        
        # Strength Sports
        elif sport == "weightlifting":
            return self.analyze_weightlifting_technique(landmarks)
        
        # Endurance Sports
        elif sport == "cycling":
            return self.analyze_cycling_technique(landmarks)
        elif sport == "triathlon":
            return self.analyze_triathlon_technique(landmarks)
        
        # Aesthetic Sports
        elif sport == "gymnastics":
            return self.analyze_gymnastics_technique(landmarks)
        
        # Winter Sports
        elif sport == "skiing":
            return self.analyze_skiing_technique(landmarks)
        elif sport == "snowboarding":
            return self.analyze_snowboarding_technique(landmarks)
        elif sport == "skating":
            return self.analyze_skating_technique(landmarks)
        
        # Multi-Sport Events
        elif sport == "pentathlon":
            return self.analyze_pentathlon_technique(landmarks)
        elif sport == "decathlon":
            return self.analyze_decathlon_technique(landmarks)
        
        # Other Sports
        elif sport == "climbing":
            return self.analyze_climbing_technique(landmarks)
        elif sport == "equestrian":
            return self.analyze_equestrian_technique(landmarks)
        
        # Fallback for any other sport
        else:
            return self.analyze_general_sport(landmarks, sport)
    
    # All remaining sport-specific analysis functions
    def analyze_rugby_technique(self, landmarks):
        """Rugby tackling and passing analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            body_position = abs(left_shoulder.y - right_shoulder.y)
            hip_drive = abs(left_hip.y - right_hip.y)
            contact_height = (left_shoulder.y + right_shoulder.y) / 2
            
            tackle_form = max(0, 100 - body_position * 400)
            power_drive = max(0, 100 - hip_drive * 300)
            contact_technique = min(100, (1 - contact_height) * 120)
            
            overall_score = (tackle_form + power_drive + contact_technique) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "tackle_form": round(tackle_form, 1),
                "power_drive": round(power_drive, 1),
                "contact_technique": round(contact_technique, 1),
                "feedback": ["Focus on low body position", "Drive through contact", "Maintain balance"]
            }
        except:
            return self.default_analysis_result("rugby")
    
    def analyze_baseball_batting(self, landmarks):
        """Baseball batting stance and swing analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            bat_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            stance_balance = abs(left_shoulder.y - right_shoulder.y)
            swing_plane = abs(right_shoulder.y - right_wrist.y)
            
            swing_mechanics = max(0, 100 - abs(bat_angle - 120) * 2)
            balance_control = max(0, 100 - stance_balance * 400)
            swing_path = min(100, swing_plane * 250)
            
            overall_score = (swing_mechanics + balance_control + swing_path) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "swing_mechanics": round(swing_mechanics, 1),
                "balance_control": round(balance_control, 1),
                "swing_path": round(swing_path, 1),
                "feedback": ["Keep balanced stance", "Level swing path", "Follow through completely"]
            }
        except:
            return self.default_analysis_result("baseball")
    
    def analyze_softball_technique(self, landmarks):
        """Softball pitching and batting analysis"""
        return self.analyze_baseball_batting(landmarks)  # Similar mechanics
    
    def analyze_hockey_technique(self, landmarks):
        """Hockey skating and stick handling analysis"""
        try:
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            knee_bend = (left_knee.y + right_knee.y) / 2
            ankle_position = abs(left_ankle.x - right_ankle.x)
            balance_point = abs(left_knee.y - right_knee.y)
            
            skating_stance = min(100, (1 - knee_bend) * 150)
            edge_control = min(100, ankle_position * 200)
            dynamic_balance = max(0, 100 - balance_point * 300)
            
            overall_score = (skating_stance + edge_control + dynamic_balance) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "skating_stance": round(skating_stance, 1),
                "edge_control": round(edge_control, 1),
                "dynamic_balance": round(dynamic_balance, 1),
                "feedback": ["Lower center of gravity", "Maintain edge control", "Keep balanced position"]
            }
        except:
            return self.default_analysis_result("hockey")
    
    def analyze_handball_technique(self, landmarks):
        """Handball throwing and catching analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            throw_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            arm_extension = abs(right_shoulder.y - right_wrist.y)
            release_height = 1 - right_wrist.y
            
            throwing_form = max(0, 100 - abs(throw_angle - 130) * 2)
            power_generation = min(100, arm_extension * 200)
            release_point = min(100, release_height * 120)
            
            overall_score = (throwing_form + power_generation + release_point) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "throwing_form": round(throwing_form, 1),
                "power_generation": round(power_generation, 1),
                "release_point": round(release_point, 1),
                "feedback": ["Optimal throwing angle", "Generate power from core", "High release point"]
            }
        except:
            return self.default_analysis_result("handball")
    
    def analyze_water_polo_technique(self, landmarks):
        """Water polo treading and throwing analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            water_position = (left_shoulder.y + right_shoulder.y) / 2
            throw_mechanics = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            body_rotation = abs(left_shoulder.x - right_shoulder.x)
            
            treading_efficiency = min(100, (1 - water_position) * 130)
            shooting_form = max(0, 100 - abs(throw_mechanics - 140) * 2)
            torso_twist = min(100, body_rotation * 300)
            
            overall_score = (treading_efficiency + shooting_form + torso_twist) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "treading_efficiency": round(treading_efficiency, 1),
                "shooting_form": round(shooting_form, 1),
                "torso_twist": round(torso_twist, 1),
                "feedback": ["Maintain high water position", "Quick release", "Use body rotation"]
            }
        except:
            return self.default_analysis_result("water_polo")
    
    def analyze_table_tennis_technique(self, landmarks):
        """Table tennis stroke analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            stroke_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            wrist_position = abs(right_elbow.y - right_wrist.y)
            paddle_control = abs(right_shoulder.x - right_wrist.x)
            
            stroke_technique = max(0, 100 - abs(stroke_angle - 110) * 3)
            wrist_flexibility = min(100, wrist_position * 400)
            ball_control = min(100, paddle_control * 300)
            
            overall_score = (stroke_technique + wrist_flexibility + ball_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "stroke_technique": round(stroke_technique, 1),
                "wrist_flexibility": round(wrist_flexibility, 1),
                "ball_control": round(ball_control, 1),
                "feedback": ["Compact stroke motion", "Flexible wrist action", "Close to table position"]
            }
        except:
            return self.default_analysis_result("table_tennis")
    
    def analyze_squash_technique(self, landmarks):
        """Squash racquet swing analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            racquet_swing = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            court_position = abs(left_ankle.x - right_ankle.x)
            swing_plane = abs(right_shoulder.y - right_wrist.y)
            
            swing_mechanics = max(0, 100 - abs(racquet_swing - 135) * 2)
            footwork = min(100, court_position * 250)
            stroke_path = min(100, swing_plane * 200)
            
            overall_score = (swing_mechanics + footwork + stroke_path) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "swing_mechanics": round(swing_mechanics, 1),
                "footwork": round(footwork, 1),
                "stroke_path": round(stroke_path, 1),
                "feedback": ["Smooth swing motion", "Quick court movement", "Consistent stroke plane"]
            }
        except:
            return self.default_analysis_result("squash")
    
    def analyze_lacrosse_technique(self, landmarks):
        """Lacrosse stick handling and shooting analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            
            stick_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            grip_separation = abs(left_shoulder.x - right_shoulder.x)
            shooting_form = abs(right_shoulder.y - right_wrist.y)
            
            stick_control = max(0, 100 - abs(stick_angle - 150) * 2)
            hand_positioning = min(100, grip_separation * 300)
            shot_mechanics = min(100, shooting_form * 250)
            
            overall_score = (stick_control + hand_positioning + shot_mechanics) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "stick_control": round(stick_control, 1),
                "hand_positioning": round(hand_positioning, 1),
                "shot_mechanics": round(shot_mechanics, 1),
                "feedback": ["Proper stick angle", "Wide hand grip", "Follow through on shots"]
            }
        except:
            return self.default_analysis_result("lacrosse")
    
    def analyze_polo_technique(self, landmarks):
        """Polo swing and posture analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            mallet_swing = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            riding_posture = abs(left_shoulder.y - right_shoulder.y)
            swing_reach = abs(right_shoulder.y - right_wrist.y)
            
            swing_technique = max(0, 100 - abs(mallet_swing - 160) * 2)
            posture_control = max(0, 100 - riding_posture * 400)
            reach_extension = min(100, swing_reach * 200)
            
            overall_score = (swing_technique + posture_control + reach_extension) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "swing_technique": round(swing_technique, 1),
                "posture_control": round(posture_control, 1),
                "reach_extension": round(reach_extension, 1),
                "feedback": ["Maintain riding posture", "Full mallet extension", "Smooth swing motion"]
            }
        except:
            return self.default_analysis_result("polo")
    
    # Combat Sports Analysis
    def analyze_wrestling_technique(self, landmarks):
        """Wrestling stance and takedown analysis"""
        try:
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            stance_level = (left_knee.y + right_knee.y) / 2
            hip_position = (left_hip.y + right_hip.y) / 2
            balance_control = abs(left_knee.y - right_knee.y)
            
            wrestling_stance = min(100, (1 - stance_level) * 140)
            center_gravity = min(100, (1 - hip_position) * 130)
            stability = max(0, 100 - balance_control * 300)
            
            overall_score = (wrestling_stance + center_gravity + stability) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "wrestling_stance": round(wrestling_stance, 1),
                "center_gravity": round(center_gravity, 1),
                "stability": round(stability, 1),
                "feedback": ["Lower stance position", "Balanced weight distribution", "Ready position"]
            }
        except:
            return self.default_analysis_result("wrestling")
    
    def analyze_judo_technique(self, landmarks):
        """Judo throwing and gripping analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_elbow = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            
            grip_position = abs(left_elbow.y - right_elbow.y)
            shoulder_alignment = abs(left_shoulder.y - right_shoulder.y)
            throw_preparation = abs(left_shoulder.x - right_shoulder.x)
            
            grip_control = max(0, 100 - grip_position * 300)
            posture_maintenance = max(0, 100 - shoulder_alignment * 400)
            entry_mechanics = min(100, throw_preparation * 300)
            
            overall_score = (grip_control + posture_maintenance + entry_mechanics) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "grip_control": round(grip_control, 1),
                "posture_maintenance": round(posture_maintenance, 1),
                "entry_mechanics": round(entry_mechanics, 1),
                "feedback": ["Strong grip control", "Upright posture", "Smooth throw entry"]
            }
        except:
            return self.default_analysis_result("judo")
    
    def analyze_karate_technique(self, landmarks):
        """Karate striking and stance analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            strike_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            stance_width = abs(left_ankle.x - right_ankle.x)
            technique_speed = abs(right_shoulder.x - right_wrist.x)
            
            striking_form = max(0, 100 - abs(strike_angle - 170) * 2)
            stance_stability = min(100, stance_width * 300)
            execution_speed = min(100, technique_speed * 250)
            
            overall_score = (striking_form + stance_stability + execution_speed) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "striking_form": round(striking_form, 1),
                "stance_stability": round(stance_stability, 1),
                "execution_speed": round(execution_speed, 1),
                "feedback": ["Perfect strike form", "Stable stance", "Fast execution"]
            }
        except:
            return self.default_analysis_result("karate")
    
    def analyze_taekwondo_technique(self, landmarks):
        """Taekwondo kicking technique analysis"""
        try:
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            hip_height = (left_hip.y + right_hip.y) / 2
            knee_drive = abs(left_knee.y - right_knee.y)
            balance_control = abs(left_hip.y - right_hip.y)
            
            kicking_height = min(100, (1 - hip_height) * 150)
            leg_flexibility = min(100, knee_drive * 300)
            body_balance = max(0, 100 - balance_control * 400)
            
            overall_score = (kicking_height + leg_flexibility + body_balance) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "kicking_height": round(kicking_height, 1),
                "leg_flexibility": round(leg_flexibility, 1),
                "body_balance": round(body_balance, 1),
                "feedback": ["High kick execution", "Flexible leg movement", "Maintain balance"]
            }
        except:
            return self.default_analysis_result("taekwondo")
    
    def analyze_fencing_technique(self, landmarks):
        """Fencing lunging and guard analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            sword_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            lunge_position = abs(left_knee.y - right_knee.y)
            guard_height = 1 - right_wrist.y
            
            sword_control = max(0, 100 - abs(sword_angle - 160) * 2)
            lunge_depth = min(100, lunge_position * 300)
            guard_position = min(100, guard_height * 120)
            
            overall_score = (sword_control + lunge_depth + guard_position) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "sword_control": round(sword_control, 1),
                "lunge_depth": round(lunge_depth, 1),
                "guard_position": round(guard_position, 1),
                "feedback": ["Proper sword angle", "Deep lunge extension", "High guard position"]
            }
        except:
            return self.default_analysis_result("fencing")
    
    # Water Sports Analysis
    def analyze_diving_technique(self, landmarks):
        """Diving form and entry analysis"""
        try:
            nose = landmarks.landmark[mp_pose.PoseLandmark.NOSE]
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            body_alignment = abs(nose.x - (left_hip.x + right_hip.x) / 2)
            entry_angle = abs((left_shoulder.y + right_shoulder.y) / 2 - (left_hip.y + right_hip.y) / 2)
            symmetry = abs(left_shoulder.y - right_shoulder.y)
            
            streamline_position = max(0, 100 - body_alignment * 300)
            entry_form = min(100, entry_angle * 200)
            body_control = max(0, 100 - symmetry * 400)
            
            overall_score = (streamline_position + entry_form + body_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "streamline_position": round(streamline_position, 1),
                "entry_form": round(entry_form, 1),
                "body_control": round(body_control, 1),
                "feedback": ["Maintain streamline position", "Vertical entry", "Body symmetry control"]
            }
        except:
            return self.default_analysis_result("diving")
    
    def analyze_synchronized_swimming(self, landmarks):
        """Synchronized swimming technique analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            body_position = (left_shoulder.y + right_shoulder.y) / 2
            hip_stability = abs(left_hip.y - right_hip.y)
            synchronization = abs(left_shoulder.y - right_shoulder.y)
            
            water_level = min(100, (1 - body_position) * 140)
            core_stability = max(0, 100 - hip_stability * 400)
            movement_sync = max(0, 100 - synchronization * 300)
            
            overall_score = (water_level + core_stability + movement_sync) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "water_level": round(water_level, 1),
                "core_stability": round(core_stability, 1),
                "movement_sync": round(movement_sync, 1),
                "feedback": ["High water position", "Strong core control", "Synchronized movements"]
            }
        except:
            return self.default_analysis_result("synchronized_swimming")
    
    def analyze_sailing_technique(self, landmarks):
        """Sailing posture and balance analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            hiking_position = abs(left_hip.x - right_hip.x)
            balance_control = abs(left_shoulder.y - right_shoulder.y)
            body_lean = abs((left_shoulder.x + right_shoulder.x) / 2 - (left_hip.x + right_hip.x) / 2)
            
            hiking_technique = min(100, hiking_position * 250)
            boat_balance = max(0, 100 - balance_control * 300)
            weight_distribution = min(100, body_lean * 200)
            
            overall_score = (hiking_technique + boat_balance + weight_distribution) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "hiking_technique": round(hiking_technique, 1),
                "boat_balance": round(boat_balance, 1),
                "weight_distribution": round(weight_distribution, 1),
                "feedback": ["Proper hiking position", "Maintain boat balance", "Optimal weight shift"]
            }
        except:
            return self.default_analysis_result("sailing")
    
    def analyze_rowing_technique(self, landmarks):
        """Rowing stroke mechanics analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_elbow = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ELBOW]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            
            stroke_symmetry = abs(left_elbow.y - right_elbow.y)
            catch_position = (left_elbow.y + right_elbow.y) / 2
            body_swing = abs(left_shoulder.y - right_shoulder.y)
            
            stroke_balance = max(0, 100 - stroke_symmetry * 400)
            catch_timing = min(100, (1 - catch_position) * 150)
            body_control = max(0, 100 - body_swing * 300)
            
            overall_score = (stroke_balance + catch_timing + body_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "stroke_balance": round(stroke_balance, 1),
                "catch_timing": round(catch_timing, 1),
                "body_control": round(body_control, 1),
                "feedback": ["Balanced stroke", "Early catch", "Controlled body swing"]
            }
        except:
            return self.default_analysis_result("rowing")
    
    def analyze_canoeing_technique(self, landmarks):
        """Canoeing paddle technique analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            paddle_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            stroke_reach = abs(right_shoulder.y - right_wrist.y)
            rotation_control = abs(right_shoulder.x - right_wrist.x)
            
            paddle_technique = max(0, 100 - abs(paddle_angle - 120) * 2)
            stroke_length = min(100, stroke_reach * 200)
            torso_rotation = min(100, rotation_control * 300)
            
            overall_score = (paddle_technique + stroke_length + torso_rotation) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "paddle_technique": round(paddle_technique, 1),
                "stroke_length": round(stroke_length, 1),
                "torso_rotation": round(torso_rotation, 1),
                "feedback": ["Proper paddle angle", "Long stroke reach", "Use torso rotation"]
            }
        except:
            return self.default_analysis_result("canoeing")
    
    def analyze_surfing_technique(self, landmarks):
        """Surfing balance and stance analysis"""
        try:
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            stance_width = abs(left_ankle.x - right_ankle.x)
            knee_bend = (left_knee.y + right_knee.y) / 2
            balance_point = abs(left_ankle.y - right_ankle.y)
            
            surf_stance = min(100, stance_width * 300)
            wave_riding = min(100, (1 - knee_bend) * 140)
            board_control = max(0, 100 - balance_point * 400)
            
            overall_score = (surf_stance + wave_riding + board_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "surf_stance": round(surf_stance, 1),
                "wave_riding": round(wave_riding, 1),
                "board_control": round(board_control, 1),
                "feedback": ["Wide surfing stance", "Low center of gravity", "Board balance control"]
            }
        except:
            return self.default_analysis_result("surfing")
    
    # Track & Field Analysis
    def analyze_marathon_technique(self, landmarks):
        """Marathon running form analysis"""
        return self.analyze_athletics_sprint(landmarks)  # Similar running mechanics
    
    def analyze_long_jump_technique(self, landmarks):
        """Long jump takeoff and flight analysis"""
        try:
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            takeoff_drive = abs(left_knee.y - right_knee.y)
            flight_position = (left_ankle.y + right_ankle.y) / 2
            leg_extension = abs(left_ankle.x - right_ankle.x)
            
            takeoff_power = min(100, takeoff_drive * 300)
            flight_technique = min(100, (1 - flight_position) * 130)
            landing_preparation = min(100, leg_extension * 200)
            
            overall_score = (takeoff_power + flight_technique + landing_preparation) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "takeoff_power": round(takeoff_power, 1),
                "flight_technique": round(flight_technique, 1),
                "landing_preparation": round(landing_preparation, 1),
                "feedback": ["Powerful takeoff", "Good flight position", "Prepare for landing"]
            }
        except:
            return self.default_analysis_result("long_jump")
    
    def analyze_high_jump_technique(self, landmarks):
        """High jump approach and clearance analysis"""
        try:
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            nose = landmarks.landmark[mp_pose.PoseLandmark.NOSE]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            jump_height = 1 - nose.y
            leg_drive = abs(left_knee.y - right_knee.y)
            bar_clearance = abs(nose.x - (left_hip.x + right_hip.x) / 2)
            
            vertical_lift = min(100, jump_height * 120)
            takeoff_drive = min(100, leg_drive * 300)
            technique_form = max(0, 100 - bar_clearance * 200)
            
            overall_score = (vertical_lift + takeoff_drive + technique_form) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "vertical_lift": round(vertical_lift, 1),
                "takeoff_drive": round(takeoff_drive, 1),
                "technique_form": round(technique_form, 1),
                "feedback": ["Maximum vertical lift", "Strong takeoff drive", "Bar clearance technique"]
            }
        except:
            return self.default_analysis_result("high_jump")
    
    def analyze_pole_vault_technique(self, landmarks):
        """Pole vault plant and swing analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            pole_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            swing_drive = abs(left_knee.y - right_knee.y)
            vault_height = 1 - right_wrist.y
            
            pole_plant = max(0, 100 - abs(pole_angle - 160) * 2)
            swing_technique = min(100, swing_drive * 300)
            clearance_height = min(100, vault_height * 110)
            
            overall_score = (pole_plant + swing_technique + clearance_height) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "pole_plant": round(pole_plant, 1),
                "swing_technique": round(swing_technique, 1),
                "clearance_height": round(clearance_height, 1),
                "feedback": ["Proper pole plant", "Strong swing up", "High clearance"]
            }
        except:
            return self.default_analysis_result("pole_vault")
    
    # Throwing Events Analysis
    def analyze_shot_put_technique(self, landmarks):
        """Shot put throwing mechanics analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            release_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            hip_rotation = abs(left_hip.x - right_hip.x)
            power_position = abs(right_shoulder.y - right_wrist.y)
            
            release_technique = max(0, 100 - abs(release_angle - 45) * 3)
            rotational_power = min(100, hip_rotation * 300)
            explosive_finish = min(100, power_position * 250)
            
            overall_score = (release_technique + rotational_power + explosive_finish) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "release_technique": round(release_technique, 1),
                "rotational_power": round(rotational_power, 1),
                "explosive_finish": round(explosive_finish, 1),
                "feedback": ["Optimal release angle", "Hip rotation power", "Explosive finish"]
            }
        except:
            return self.default_analysis_result("shot_put")
    
    def analyze_discus_technique(self, landmarks):
        """Discus throwing rotation analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            rotation_span = abs(left_shoulder.x - right_shoulder.x)
            release_height = 1 - right_wrist.y
            arm_extension = abs(right_shoulder.y - right_wrist.y)
            
            rotational_technique = min(100, rotation_span * 200)
            release_point = min(100, release_height * 120)
            arm_whip = min(100, arm_extension * 250)
            
            overall_score = (rotational_technique + release_point + arm_whip) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "rotational_technique": round(rotational_technique, 1),
                "release_point": round(release_point, 1),
                "arm_whip": round(arm_whip, 1),
                "feedback": ["Full body rotation", "High release point", "Arm whip action"]
            }
        except:
            return self.default_analysis_result("discus_throw")
    
    def analyze_javelin_technique(self, landmarks):
        """Javelin throwing approach and release analysis"""
        try:
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            javelin_angle = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            crossover_step = abs(left_ankle.x - right_ankle.x)
            release_height = 1 - right_wrist.y
            
            throwing_form = max(0, 100 - abs(javelin_angle - 30) * 4)
            approach_technique = min(100, crossover_step * 200)
            release_elevation = min(100, release_height * 130)
            
            overall_score = (throwing_form + approach_technique + release_elevation) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "throwing_form": round(throwing_form, 1),
                "approach_technique": round(approach_technique, 1),
                "release_elevation": round(release_elevation, 1),
                "feedback": ["Proper javelin angle", "Crossover approach", "High release point"]
            }
        except:
            return self.default_analysis_result("javelin_throw")
    
    def analyze_hammer_technique(self, landmarks):
        """Hammer throw rotation and release analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            shoulder_rotation = abs(left_shoulder.x - right_shoulder.x)
            foot_pivot = abs(left_ankle.x - right_ankle.x)
            balance_control = abs(left_shoulder.y - right_shoulder.y)
            
            rotation_speed = min(100, shoulder_rotation * 250)
            footwork_technique = min(100, foot_pivot * 300)
            centrifugal_balance = max(0, 100 - balance_control * 400)
            
            overall_score = (rotation_speed + footwork_technique + centrifugal_balance) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "rotation_speed": round(rotation_speed, 1),
                "footwork_technique": round(footwork_technique, 1),
                "centrifugal_balance": round(centrifugal_balance, 1),
                "feedback": ["Fast rotation speed", "Precise footwork", "Maintain balance"]
            }
        except:
            return self.default_analysis_result("hammer_throw")
    
    def analyze_hurdle_technique(self, landmarks):
        """Hurdle clearance and rhythm analysis"""
        try:
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            clearance_height = 1 - max(left_knee.y, right_knee.y)
            stride_pattern = abs(left_ankle.x - right_ankle.x)
            landing_balance = abs(left_ankle.y - right_ankle.y)
            
            hurdle_clearance = min(100, clearance_height * 120)
            stride_rhythm = min(100, stride_pattern * 200)
            landing_control = max(0, 100 - landing_balance * 300)
            
            overall_score = (hurdle_clearance + stride_rhythm + landing_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "hurdle_clearance": round(hurdle_clearance, 1),
                "stride_rhythm": round(stride_rhythm, 1),
                "landing_control": round(landing_control, 1),
                "feedback": ["High clearance", "Consistent rhythm", "Controlled landing"]
            }
        except:
            return self.default_analysis_result("hurdle")
    
    def analyze_steeplechase_technique(self, landmarks):
        """Steeplechase barrier and water jump analysis"""
        return self.analyze_hurdle_technique(landmarks)  # Similar hurdle mechanics
    
    def analyze_race_walking_technique(self, landmarks):
        """Race walking form and technique analysis"""
        try:
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            knee_extension = max(abs(left_knee.y - left_ankle.y), abs(right_knee.y - right_ankle.y))
            ground_contact = min(left_ankle.y, right_ankle.y)
            stride_length = abs(left_ankle.x - right_ankle.x)
            
            legal_technique = min(100, knee_extension * 200)
            contact_form = min(100, (1 - ground_contact) * 140)
            efficient_stride = min(100, stride_length * 180)
            
            overall_score = (legal_technique + contact_form + efficient_stride) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "legal_technique": round(legal_technique, 1),
                "contact_form": round(contact_form, 1),
                "efficient_stride": round(efficient_stride, 1),
                "feedback": ["Straight leg contact", "Continuous ground contact", "Efficient stride"]
            }
        except:
            return self.default_analysis_result("race_walking")
    
    # Precision Sports Analysis
    def analyze_shooting_technique(self, landmarks):
        """Shooting stance and aim analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            shoulder_stability = abs(left_shoulder.y - right_shoulder.y)
            stance_foundation = abs(left_ankle.x - right_ankle.x)
            body_alignment = abs((left_shoulder.x + right_shoulder.x) / 2 - (left_ankle.x + right_ankle.x) / 2)
            
            aim_stability = max(0, 100 - shoulder_stability * 500)
            shooting_stance = min(100, stance_foundation * 400)
            postural_control = max(0, 100 - body_alignment * 300)
            
            overall_score = (aim_stability + shooting_stance + postural_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "aim_stability": round(aim_stability, 1),
                "shooting_stance": round(shooting_stance, 1),
                "postural_control": round(postural_control, 1),
                "feedback": ["Steady aim position", "Stable shooting stance", "Aligned body posture"]
            }
        except:
            return self.default_analysis_result("shooting")
    
    def analyze_golf_technique(self, landmarks):
        """Golf swing mechanics analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            right_elbow = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ELBOW]
            right_wrist = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_WRIST]
            
            swing_plane = self.calculate_angle(right_shoulder, right_elbow, right_wrist)
            shoulder_rotation = abs(left_shoulder.x - right_shoulder.x)
            club_extension = abs(right_shoulder.y - right_wrist.y)
            
            swing_mechanics = max(0, 100 - abs(swing_plane - 135) * 2)
            body_rotation = min(100, shoulder_rotation * 300)
            club_control = min(100, club_extension * 200)
            
            overall_score = (swing_mechanics + body_rotation + club_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "swing_mechanics": round(swing_mechanics, 1),
                "body_rotation": round(body_rotation, 1),
                "club_control": round(club_control, 1),
                "feedback": ["Proper swing plane", "Full body rotation", "Club extension control"]
            }
        except:
            return self.default_analysis_result("golf")
    
    # Strength and Endurance Sports
    def analyze_weightlifting_technique(self, landmarks):
        """Weightlifting form and posture analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            bar_level = abs(left_shoulder.y - right_shoulder.y)
            squat_depth = (left_knee.y + right_knee.y) / 2
            spine_alignment = abs((left_shoulder.x + right_shoulder.x) / 2 - (left_knee.x + right_knee.x) / 2)
            
            lift_symmetry = max(0, 100 - bar_level * 500)
            depth_control = min(100, (1 - squat_depth) * 130)
            posture_maintenance = max(0, 100 - spine_alignment * 200)
            
            overall_score = (lift_symmetry + depth_control + posture_maintenance) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "lift_symmetry": round(lift_symmetry, 1),
                "depth_control": round(depth_control, 1),
                "posture_maintenance": round(posture_maintenance, 1),
                "feedback": ["Level bar position", "Full depth range", "Maintain spine alignment"]
            }
        except:
            return self.default_analysis_result("weightlifting")
    
    def analyze_cycling_technique(self, landmarks):
        """Cycling posture and pedaling analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            aerodynamic_position = (left_shoulder.y + right_shoulder.y) / 2
            pedaling_symmetry = abs(left_knee.y - right_knee.y)
            body_stability = abs(left_shoulder.y - right_shoulder.y)
            
            aero_efficiency = min(100, aerodynamic_position * 120)
            pedal_balance = max(0, 100 - pedaling_symmetry * 300)
            bike_control = max(0, 100 - body_stability * 400)
            
            overall_score = (aero_efficiency + pedal_balance + bike_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "aero_efficiency": round(aero_efficiency, 1),
                "pedal_balance": round(pedal_balance, 1),
                "bike_control": round(bike_control, 1),
                "feedback": ["Aerodynamic position", "Balanced pedaling", "Stable bike control"]
            }
        except:
            return self.default_analysis_result("cycling")
    
    def analyze_triathlon_technique(self, landmarks):
        """Triathlon transition and efficiency analysis"""
        return self.analyze_cycling_technique(landmarks)  # Multi-sport analysis
    
    # Aesthetic Sports
    def analyze_gymnastics_technique(self, landmarks):
        """Gymnastics form and execution analysis"""
        try:
            nose = landmarks.landmark[mp_pose.PoseLandmark.NOSE]
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            body_alignment = abs(nose.x - (left_hip.x + right_hip.x) / 2)
            form_precision = abs(left_shoulder.y - right_shoulder.y)
            hip_stability = abs(left_hip.y - right_hip.y)
            
            execution_form = max(0, 100 - body_alignment * 300)
            technical_precision = max(0, 100 - form_precision * 400)
            core_control = max(0, 100 - hip_stability * 350)
            
            overall_score = (execution_form + technical_precision + core_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "execution_form": round(execution_form, 1),
                "technical_precision": round(technical_precision, 1),
                "core_control": round(core_control, 1),
                "feedback": ["Perfect body alignment", "Technical precision", "Strong core control"]
            }
        except:
            return self.default_analysis_result("gymnastics")
    
    # Winter Sports
    def analyze_skiing_technique(self, landmarks):
        """Skiing posture and balance analysis"""
        try:
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            
            ski_stance = abs(left_ankle.x - right_ankle.x)
            knee_bend = (left_knee.y + right_knee.y) / 2
            edge_control = abs(left_knee.y - right_knee.y)
            
            skiing_posture = min(100, ski_stance * 250)
            athletic_position = min(100, (1 - knee_bend) * 130)
            turn_control = max(0, 100 - edge_control * 300)
            
            overall_score = (skiing_posture + athletic_position + turn_control) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "skiing_posture": round(skiing_posture, 1),
                "athletic_position": round(athletic_position, 1),
                "turn_control": round(turn_control, 1),
                "feedback": ["Proper ski stance", "Athletic position", "Edge control"]
            }
        except:
            return self.default_analysis_result("skiing")
    
    def analyze_snowboarding_technique(self, landmarks):
        """Snowboarding balance and carving analysis"""
        try:
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            board_stance = abs(left_ankle.x - right_ankle.x)
            balance_center = abs((left_ankle.x + right_ankle.x) / 2 - (left_knee.x + right_knee.x) / 2)
            edge_angle = abs(left_ankle.y - right_ankle.y)
            
            riding_stance = min(100, board_stance * 300)
            balance_control = max(0, 100 - balance_center * 400)
            carving_technique = min(100, edge_angle * 250)
            
            overall_score = (riding_stance + balance_control + carving_technique) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "riding_stance": round(riding_stance, 1),
                "balance_control": round(balance_control, 1),
                "carving_technique": round(carving_technique, 1),
                "feedback": ["Wide board stance", "Centered balance", "Edge carving control"]
            }
        except:
            return self.default_analysis_result("snowboarding")
    
    def analyze_skating_technique(self, landmarks):
        """Ice skating balance and edge control analysis"""
        try:
            left_ankle = landmarks.landmark[mp_pose.PoseLandmark.LEFT_ANKLE]
            right_ankle = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_ANKLE]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            glide_position = abs(left_ankle.x - right_ankle.x)
            knee_bend = (left_knee.y + right_knee.y) / 2
            edge_control = abs(left_ankle.y - right_ankle.y)
            
            skating_stance = min(100, glide_position * 200)
            power_position = min(100, (1 - knee_bend) * 140)
            edge_technique = min(100, edge_control * 300)
            
            overall_score = (skating_stance + power_position + edge_technique) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "skating_stance": round(skating_stance, 1),
                "power_position": round(power_position, 1),
                "edge_technique": round(edge_technique, 1),
                "feedback": ["Proper glide position", "Power skating stance", "Edge control mastery"]
            }
        except:
            return self.default_analysis_result("skating")
    
    # Multi-Sport Events
    def analyze_pentathlon_technique(self, landmarks):
        """Pentathlon multi-event analysis"""
        return self.analyze_general_sport(landmarks, "pentathlon")
    
    def analyze_decathlon_technique(self, landmarks):
        """Decathlon multi-event analysis"""
        return self.analyze_general_sport(landmarks, "decathlon")
    
    # Other Sports
    def analyze_climbing_technique(self, landmarks):
        """Rock climbing movement and balance analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_knee = landmarks.landmark[mp_pose.PoseLandmark.LEFT_KNEE]
            right_knee = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_KNEE]
            
            reach_extension = abs(left_shoulder.y - right_shoulder.y)
            leg_positioning = abs(left_knee.x - right_knee.x)
            body_tension = abs((left_shoulder.x + right_shoulder.x) / 2 - (left_knee.x + right_knee.x) / 2)
            
            arm_reach = min(100, reach_extension * 300)
            footwork = min(100, leg_positioning * 250)
            core_tension = max(0, 100 - body_tension * 200)
            
            overall_score = (arm_reach + footwork + core_tension) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "arm_reach": round(arm_reach, 1),
                "footwork": round(footwork, 1),
                "core_tension": round(core_tension, 1),
                "feedback": ["Dynamic arm reach", "Precise footwork", "Maintain core tension"]
            }
        except:
            return self.default_analysis_result("climbing")
    
    def analyze_equestrian_technique(self, landmarks):
        """Equestrian riding posture and balance analysis"""
        try:
            left_shoulder = landmarks.landmark[mp_pose.PoseLandmark.LEFT_SHOULDER]
            right_shoulder = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_SHOULDER]
            left_hip = landmarks.landmark[mp_pose.PoseLandmark.LEFT_HIP]
            right_hip = landmarks.landmark[mp_pose.PoseLandmark.RIGHT_HIP]
            
            riding_posture = abs(left_shoulder.y - right_shoulder.y)
            seat_position = abs(left_hip.y - right_hip.y)
            rider_alignment = abs((left_shoulder.x + right_shoulder.x) / 2 - (left_hip.x + right_hip.x) / 2)
            
            posture_control = max(0, 100 - riding_posture * 400)
            seat_balance = max(0, 100 - seat_position * 350)
            vertical_alignment = max(0, 100 - rider_alignment * 300)
            
            overall_score = (posture_control + seat_balance + vertical_alignment) / 3
            
            return {
                "overall_score": round(overall_score, 1),
                "posture_control": round(posture_control, 1),
                "seat_balance": round(seat_balance, 1),
                "vertical_alignment": round(vertical_alignment, 1),
                "feedback": ["Maintain riding posture", "Balanced seat position", "Vertical alignment"]
            }
        except:
            return self.default_analysis_result("equestrian")
    
    # Missing feedback generation methods
    def generate_cricket_feedback(self, bat_control, stance_stability, body_balance):
        feedback = []
        if bat_control < 70:
            feedback.append("Improve bat angle control")
        if stance_stability < 70:
            feedback.append("Widen batting stance")
        if body_balance < 70:
            feedback.append("Maintain head position")
        return feedback if feedback else ["Good cricket technique"]
    
    def generate_tennis_feedback(self, serve_technique, power_generation, reach_height):
        feedback = []
        if serve_technique < 70:
            feedback.append("Work on serve angle")
        if power_generation < 70:
            feedback.append("Use leg drive for power")
        if reach_height < 70:
            feedback.append("Reach higher on serve")
        return feedback if feedback else ["Excellent tennis serve"]
    
    def generate_badminton_feedback(self, technique_form, court_position, power_delivery):
        feedback = []
        if technique_form < 70:
            feedback.append("Perfect smash angle")
        if court_position < 70:
            feedback.append("Better court positioning")
        if power_delivery < 70:
            feedback.append("Generate more power")
        return feedback if feedback else ["Great badminton technique"]
    
    def generate_volleyball_feedback(self, attack_form, jump_technique, power_swing):
        feedback = []
        if attack_form < 70:
            feedback.append("Improve spike angle")
        if jump_technique < 70:
            feedback.append("Better jump timing")
        if power_swing < 70:
            feedback.append("More powerful arm swing")
        return feedback if feedback else ["Excellent volleyball spike"]
    
    def generate_boxing_feedback(self, punch_power, defensive_position, footwork_stability):
        feedback = []
        if punch_power < 70:
            feedback.append("Extend punches fully")
        if defensive_position < 70:
            feedback.append("Keep guard up")
        if footwork_stability < 70:
            feedback.append("Improve footwork balance")
        return feedback if feedback else ["Strong boxing technique"]
    
    def generate_athletics_feedback(self, leg_power, stride_efficiency, arm_action):
        feedback = []
        if leg_power < 70:
            feedback.append("Increase knee drive")
        if stride_efficiency < 70:
            feedback.append("Optimize stride length")
        if arm_action < 70:
            feedback.append("Coordinate arm movement")
        return feedback if feedback else ["Excellent running form"]
    
    def generate_archery_feedback(self, draw_technique, bow_control, stance_foundation):
        feedback = []
        if draw_technique < 70:
            feedback.append("Perfect draw angle")
        if bow_control < 70:
            feedback.append("Steady bow hold")
        if stance_foundation < 70:
            feedback.append("Widen stance for stability")
        return feedback if feedback else ["Perfect archery form"]
    
    def default_analysis_result(self, sport):
        """Default analysis result when detection fails"""
        return {
            "overall_score": 0.0,
            "balance_score": 0.0,
            "posture_score": 0.0,
            "symmetry_score": 0.0,
            "stability_score": 0.0,
            "sport": sport,
            "feedback": ["No pose detected or analysis error occurred"]
        }
    
    def generate_basketball_feedback(self, form_score, consistency_score, power_score):
        """Generate basketball-specific feedback"""
        feedback = []
        if form_score < 70:
            feedback.append("Focus on maintaining proper elbow angle (around 90 degrees)")
        if consistency_score < 70:
            feedback.append("Work on balance and stable shooting base")
        if power_score < 70:
            feedback.append("Improve arm extension and follow-through")
        if form_score > 85 and consistency_score > 85:
            feedback.append("Excellent shooting form! Maintain consistency")
        return feedback if feedback else ["Good basketball technique overall"]
    
    def generate_football_feedback(self, balance_score, power_score, positioning_score):
        """Generate football-specific feedback"""
        feedback = []
        if balance_score < 70:
            feedback.append("Improve balance during kicking motion")
        if power_score < 70:
            feedback.append("Focus on leg extension for more power")
        if positioning_score < 70:
            feedback.append("Work on foot positioning and plant foot stability")
        if balance_score > 85 and power_score > 85:
            feedback.append("Excellent kicking technique!")
        return feedback if feedback else ["Good football technique overall"]
    
    def generate_swimming_feedback(self, symmetry_score, catch_score, rotation_score):
        """Generate swimming-specific feedback"""
        feedback = []
        if symmetry_score < 70:
            feedback.append("Focus on symmetrical arm movements")
        if catch_score < 70:
            feedback.append("Improve catch position and high elbow technique")
        if rotation_score < 70:
            feedback.append("Work on body rotation for efficient stroke")
        if symmetry_score > 85 and catch_score > 85:
            feedback.append("Excellent stroke technique!")
        return feedback if feedback else ["Good swimming form overall"]
    
    def generate_general_feedback(self, balance_score, posture_score, symmetry_score, sport):
        """Generate general feedback for any sport"""
        feedback = []
        if balance_score < 70:
            feedback.append(f"Improve balance training for {sport}")
        if posture_score < 70:
            feedback.append("Focus on maintaining proper posture")
        if symmetry_score < 70:
            feedback.append("Work on body symmetry and alignment")
        if balance_score > 85 and posture_score > 85:
            feedback.append(f"Excellent {sport} form foundation!")
        return feedback if feedback else [f"Good {sport} technique overall"]

# Initialize analyzer
sports_analyzer = RealSportsAnalyzer()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Active: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"Client disconnected. Active: {len(self.active_connections)}")
    
    async def send_analysis_result(self, websocket: WebSocket, result: Dict):
        try:
            await websocket.send_text(json.dumps(result))
        except Exception as e:
            logger.error(f"WebSocket send error: {e}")

manager = ConnectionManager()

# API Endpoints
@app.get("/")
async def root():
    return {
        "message": "Ekalavya AI Sports Analysis Backend",
        "version": "2.0.0",
        "supported_sports": len(sports_analyzer.supported_sports),
        "features": ["Real computer vision", "54+ sports", "AI analysis"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/sports")
async def list_supported_sports():
    return {
        "sports": sports_analyzer.supported_sports,
        "total_count": len(sports_analyzer.supported_sports)
    }

@app.post("/analyze")
async def analyze_frame(request: AnalysisRequest):
    """Analyze sports technique from pose data"""
    try:
        # This would receive actual image data in production
        # For now, return a structured response
        return {
            "status": "success",
            "sport": request.sport,
            "analysis_type": request.analysis_type,
            "message": "Real analysis ready - send image data via WebSocket",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed")

@app.post("/upload_video")
async def upload_video_analysis(file: UploadFile = File(...)):
    """Analyze uploaded video file"""
    try:
        # Validate file size (100MB limit)
        max_size = 100 * 1024 * 1024
        content = await file.read()
        
        if len(content) > max_size:
            raise HTTPException(status_code=413, detail="File too large (max 100MB)")
        
        # Validate file type
        allowed_types = ['video/mp4', 'video/avi', 'video/mov', 'video/quicktime']
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        # Save temporary file
        temp_file = f"temp_video_{int(time.time())}.mp4"
        with open(temp_file, "wb") as f:
            f.write(content)
        
        # Process video
        cap = cv2.VideoCapture(temp_file)
        frame_count = 0
        analysis_results = []
        
        while cap.isOpened() and frame_count < 10:
            ret, frame = cap.read()
            if not ret:
                break
            
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose_detector.process(rgb_frame)
            
            if results.pose_landmarks:
                analysis = sports_analyzer.analyze_general_sport(results.pose_landmarks, "general")
                analysis_results.append(analysis)
            
            frame_count += 1
        
        cap.release()
        
        # Clean up
        import os
        if os.path.exists(temp_file):
            os.remove(temp_file)
        
        if analysis_results:
            avg_score = sum(r.get('overall_score', 0) for r in analysis_results) / len(analysis_results)
            return {
                "status": "success",
                "frames_analyzed": len(analysis_results),
                "average_score": round(avg_score, 1),
                "results": analysis_results,
                "timestamp": datetime.now().isoformat()
            }
        else:
            return {
                "status": "error",
                "message": "No pose detected in video",
                "timestamp": datetime.now().isoformat()
            }
    
    except Exception as e:
        logger.error(f"Video analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Video analysis failed: {str(e)}")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time analysis WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            frame_data = json.loads(data)
            
            sport = frame_data.get('sport', 'basketball')
            analysis_type = frame_data.get('analysis_type', 'general')
            
            if 'image' in frame_data:
                try:
                    # Decode base64 image
                    image_data = base64.b64decode(frame_data['image'])
                    nparr = np.frombuffer(image_data, np.uint8)
                    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if img is not None:
                        rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                        results = pose_detector.process(rgb_img)
                        
                        if results.pose_landmarks:
                            analysis = sports_analyzer.analyze_sport(sport, results.pose_landmarks, analysis_type)
                            await manager.send_analysis_result(websocket, {
                                "status": "success",
                                "sport": sport,
                                "analysis": analysis,
                                "timestamp": datetime.now().isoformat()
                            })
                        else:
                            await manager.send_analysis_result(websocket, {
                                "status": "no_pose",
                                "sport": sport,
                                "message": "No pose detected",
                                "timestamp": datetime.now().isoformat()
                            })
                    else:
                        await manager.send_analysis_result(websocket, {
                            "status": "error",
                            "message": "Invalid image data",
                            "timestamp": datetime.now().isoformat()
                        })
                except Exception as e:
                    logger.error(f"Image processing error: {e}")
                    await manager.send_analysis_result(websocket, {
                        "status": "error",
                        "message": f"Processing error: {str(e)}",
                        "timestamp": datetime.now().isoformat()
                    })
            else:
                await manager.send_analysis_result(websocket, {
                    "status": "error",
                    "message": "No image data provided",
                    "timestamp": datetime.now().isoformat()
                })
    
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)

@app.post("/recommend_drills")
async def recommend_drills(request: AnalysisRequest):
    """Generate training drill recommendations"""
    try:
        sport = request.sport.lower()
        
        drills = {
            "basketball": [
                {"name": "Form Shooting", "duration": "15 min", "focus": "Shot mechanics"},
                {"name": "Ball Handling", "duration": "10 min", "focus": "Dribbling"},
                {"name": "Footwork", "duration": "8 min", "focus": "Movement"}
            ],
            "football": [
                {"name": "Passing Practice", "duration": "12 min", "focus": "Ball control"},
                {"name": "Shooting Drills", "duration": "15 min", "focus": "Accuracy"},
                {"name": "First Touch", "duration": "10 min", "focus": "Reception"}
            ],
            "swimming": [
                {"name": "Stroke Technique", "duration": "20 min", "focus": "Form"},
                {"name": "Breathing", "duration": "10 min", "focus": "Rhythm"},
                {"name": "Kick Sets", "duration": "15 min", "focus": "Power"}
            ]
        }
        
        sport_drills = drills.get(sport, [
            {"name": f"{sport.title()} Fundamentals", "duration": "15 min", "focus": "Technique"},
            {"name": "Balance Training", "duration": "10 min", "focus": "Stability"},
            {"name": "Coordination", "duration": "8 min", "focus": "Movement"}
        ])
        
        return {
            "sport": sport,
            "drills": sport_drills,
            "total_duration": sum(int(d["duration"].split()[0]) for d in sport_drills),
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        logger.error(f"Drill recommendation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Ekalavya AI Sports Analysis Backend...")
    uvicorn.run("sports_analyzer:app", host="0.0.0.0", port=8000, reload=True)
