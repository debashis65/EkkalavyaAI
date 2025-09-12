#!/usr/bin/env python3
"""
Unity AR Bridge System - Real-Time Integration for Unity AR Applications
Provides seamless data exchange between Sport Pack engine and Unity AR systems
with WebSocket communication, AR session management, and Unity-specific data formats
"""

import json
import logging
import asyncio
import math
import numpy as np
from typing import Dict, List, Optional, Any, Tuple, Union, Set
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import websockets
from concurrent.futures import ThreadPoolExecutor
import uuid

from sport_pack_system import sport_pack_loader
from context_understanding_engine import context_understanding_engine, SportContext, ContextType
from basketball_value_model import basketball_value_model, ShotContext, ShotType, DefensivePressure
from dynamic_overlay_renderer import dynamic_overlay_renderer, OverlayType, VisualizationStyle
from decision_logic_engine import decision_logic_engine, DecisionType, ConfidenceLevel, UrgencyLevel

logger = logging.getLogger(__name__)

class ARTrackingState(Enum):
    """AR tracking states"""
    NOT_TRACKING = "not_tracking"
    LIMITED = "limited"
    TRACKING = "tracking"
    RELOCALIZING = "relocalizing"

class ARSessionType(Enum):
    """Types of AR sessions"""
    TRAINING_SESSION = "training_session"
    LIVE_ANALYSIS = "live_analysis"
    DRILL_PRACTICE = "drill_practice"
    PERFORMANCE_REVIEW = "performance_review"
    COACHING_SESSION = "coaching_session"

class UnityDataFormat(Enum):
    """Unity-specific data formats"""
    VECTOR3 = "vector3"
    QUATERNION = "quaternion"
    MATRIX4X4 = "matrix4x4"
    COLOR32 = "color32"
    RECT = "rect"

@dataclass
class UnityVector3:
    """Unity Vector3 representation"""
    x: float
    y: float
    z: float
    
    def to_dict(self) -> Dict[str, float]:
        return {"x": self.x, "y": self.y, "z": self.z}

@dataclass
class UnityQuaternion:
    """Unity Quaternion representation"""
    x: float
    y: float
    z: float
    w: float
    
    def to_dict(self) -> Dict[str, float]:
        return {"x": self.x, "y": self.y, "z": self.z, "w": self.w}

@dataclass
class UnityTransform:
    """Unity Transform representation"""
    position: UnityVector3
    rotation: UnityQuaternion
    scale: UnityVector3
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "position": self.position.to_dict(),
            "rotation": self.rotation.to_dict(),
            "scale": self.scale.to_dict()
        }

@dataclass
class ARTrackableObject:
    """AR trackable object representation"""
    object_id: str
    object_type: str
    transform: UnityTransform
    confidence: float
    tracking_state: ARTrackingState
    is_tracked: bool
    velocity: UnityVector3
    angular_velocity: UnityVector3
    timestamp: float
    metadata: Dict[str, Any]

@dataclass
class ARCourtCalibration:
    """AR court calibration data"""
    sport_name: str
    court_center: UnityVector3
    court_rotation: UnityQuaternion
    court_scale: UnityVector3
    corner_points: List[UnityVector3]
    calibration_confidence: float
    calibration_timestamp: float
    real_world_dimensions: Dict[str, float]
    ar_space_dimensions: Dict[str, float]

@dataclass
class ARAnalysisOverlay:
    """AR overlay for analysis visualization"""
    overlay_id: str
    overlay_type: str
    sport_name: str
    elements: List[Dict[str, Any]]
    transforms: List[UnityTransform]
    colors: List[Dict[str, Any]]
    visibility: bool
    duration: float
    fade_type: str
    priority: int
    metadata: Dict[str, Any]

@dataclass
class ARSessionData:
    """Complete AR session data package"""
    session_id: str
    session_type: ARSessionType
    sport_name: str
    tracking_state: ARTrackingState
    tracked_objects: List[ARTrackableObject]
    court_calibration: Optional[ARCourtCalibration]
    analysis_overlays: List[ARAnalysisOverlay]
    decision_recommendations: List[Dict[str, Any]]
    performance_metrics: Dict[str, float]
    timestamp: float

class UnityARBridge:
    """Unity AR integration bridge for real-time sport analysis"""
    
    def __init__(self):
        self.active_sessions: Dict[str, ARSessionData] = {}
        self.connected_clients: Set[websockets.WebSocketServerProtocol] = set()
        self.session_analytics = {
            'total_sessions': 0,
            'active_sessions': 0,
            'total_objects_tracked': 0,
            'avg_tracking_confidence': 0.0,
            'decisions_generated': 0,
            'overlays_rendered': 0
        }
        
        # Unity-specific configurations
        self.unity_configs = {
            'coordinate_system': 'left_handed',  # Unity uses left-handed coordinates
            'up_vector': 'y_positive',           # Y-up in Unity
            'forward_vector': 'z_positive',      # Z-forward in Unity
            'units': 'meters',                   # Unity units
            'precision': 6                       # Decimal precision for Unity
        }
        
        # AR tracking configurations
        self.ar_configs = {
            'min_tracking_confidence': 0.7,
            'max_trackable_objects': 20,
            'tracking_update_rate': 30.0,  # 30 FPS
            'overlay_update_rate': 15.0,   # 15 FPS for overlays
            'decision_update_rate': 5.0    # 5 FPS for decisions
        }
        
        logger.info("Unity AR Bridge initialized with real-time capabilities")
    
    async def create_ar_session(self, 
                               sport_name: str,
                               session_type: ARSessionType = ARSessionType.TRAINING_SESSION,
                               court_dimensions: Dict[str, float] = {}) -> str:
        """Create new AR session with Unity integration"""
        try:
            session_id = str(uuid.uuid4())
            
            # Initialize court calibration
            court_calibration = await self._initialize_court_calibration(sport_name, court_dimensions)
            
            # Create session data
            session_data = ARSessionData(
                session_id=session_id,
                session_type=session_type,
                sport_name=sport_name,
                tracking_state=ARTrackingState.NOT_TRACKING,
                tracked_objects=[],
                court_calibration=court_calibration,
                analysis_overlays=[],
                decision_recommendations=[],
                performance_metrics={},
                timestamp=datetime.utcnow().timestamp()
            )
            
            self.active_sessions[session_id] = session_data
            self.session_analytics['total_sessions'] += 1
            self.session_analytics['active_sessions'] += 1
            
            logger.info(f"AR session created: {session_id} for {sport_name}")
            return session_id
            
        except Exception as e:
            logger.error(f"Failed to create AR session: {str(e)}")
            raise
    
    async def update_ar_tracking(self, 
                                session_id: str,
                                tracking_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Update AR tracking data for Unity objects"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session = self.active_sessions[session_id]
            tracked_objects = []
            
            for track_data in tracking_data:
                # Convert to Unity format
                ar_object = await self._create_ar_trackable_object(track_data)
                tracked_objects.append(ar_object)
            
            # Update session tracking
            session.tracked_objects = tracked_objects
            session.tracking_state = self._determine_tracking_state(tracked_objects)
            session.timestamp = datetime.utcnow().timestamp()
            
            # Update analytics
            self.session_analytics['total_objects_tracked'] = len(tracked_objects)
            if tracked_objects:
                avg_confidence = sum(obj.confidence for obj in tracked_objects) / len(tracked_objects)
                self.session_analytics['avg_tracking_confidence'] = avg_confidence
            
            # Generate sport context for analysis
            sport_context = await self._create_sport_context_from_ar(session)
            
            # Broadcast to connected Unity clients
            await self._broadcast_tracking_update(session_id, {
                'session_id': session_id,
                'tracking_state': session.tracking_state.value,
                'tracked_objects': [self._object_to_unity_format(obj) for obj in tracked_objects],
                'sport_context': self._sport_context_to_unity_format(sport_context) if sport_context else {},
                'timestamp': session.timestamp
            })
            
            return {
                'success': True,
                'session_id': session_id,
                'tracking_state': session.tracking_state.value,
                'objects_tracked': len(tracked_objects),
                'avg_confidence': self.session_analytics['avg_tracking_confidence']
            }
            
        except Exception as e:
            logger.error(f"AR tracking update failed: {str(e)}")
            raise
    
    async def generate_ar_analysis(self, 
                                  session_id: str,
                                  include_overlays: bool = True,
                                  include_decisions: bool = True) -> Dict[str, Any]:
        """Generate comprehensive AR analysis with overlays and decisions"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session = self.active_sessions[session_id]
            sport_context = await self._create_sport_context_from_ar(session)
            
            analysis_results = {}
            
            # Generate overlays if requested
            if include_overlays and sport_context:
                overlays = await self._generate_ar_overlays(session, sport_context)
                session.analysis_overlays = overlays
                analysis_results['overlays'] = [self._overlay_to_unity_format(overlay) for overlay in overlays]
                self.session_analytics['overlays_rendered'] += len(overlays)
            
            # Generate decisions if requested
            if include_decisions and sport_context:
                decision_analysis = await decision_logic_engine.generate_sport_decision(sport_context, {})
                
                # Convert to Unity-friendly format
                unity_decisions = await self._convert_decision_to_unity_format(decision_analysis)
                session.decision_recommendations = [unity_decisions]
                analysis_results['decisions'] = unity_decisions
                self.session_analytics['decisions_generated'] += 1
            
            # Generate performance metrics
            performance_metrics = await self._calculate_ar_performance_metrics(session)
            session.performance_metrics = performance_metrics
            analysis_results['performance'] = performance_metrics
            
            # Broadcast to Unity clients
            await self._broadcast_analysis_update(session_id, analysis_results)
            
            return {
                'success': True,
                'session_id': session_id,
                'analysis': analysis_results,
                'timestamp': datetime.utcnow().timestamp()
            }
            
        except Exception as e:
            logger.error(f"AR analysis generation failed: {str(e)}")
            raise
    
    async def calibrate_ar_court(self, 
                                session_id: str,
                                court_corner_points: List[List[float]],
                                reference_measurements: Dict[str, float]) -> Dict[str, Any]:
        """Calibrate AR court space with real-world measurements"""
        try:
            if session_id not in self.active_sessions:
                raise ValueError(f"Session {session_id} not found")
            
            session = self.active_sessions[session_id]
            
            # Convert corner points to Unity Vector3
            unity_corners = [
                UnityVector3(x=point[0], y=point[1], z=point[2]) 
                for point in court_corner_points
            ]
            
            # Calculate court center and dimensions
            court_center = self._calculate_court_center(unity_corners)
            court_rotation = self._calculate_court_rotation(unity_corners)
            court_scale = self._calculate_court_scale(unity_corners, reference_measurements)
            
            # Calculate calibration confidence
            calibration_confidence = self._calculate_calibration_confidence(
                unity_corners, reference_measurements
            )
            
            # Create court calibration
            calibration = ARCourtCalibration(
                sport_name=session.sport_name,
                court_center=court_center,
                court_rotation=court_rotation,
                court_scale=court_scale,
                corner_points=unity_corners,
                calibration_confidence=calibration_confidence,
                calibration_timestamp=datetime.utcnow().timestamp(),
                real_world_dimensions=reference_measurements,
                ar_space_dimensions=self._calculate_ar_dimensions(unity_corners)
            )
            
            session.court_calibration = calibration
            
            # Broadcast calibration to Unity
            await self._broadcast_calibration_update(session_id, {
                'session_id': session_id,
                'calibration': {
                    'center': court_center.to_dict(),
                    'rotation': court_rotation.to_dict(),
                    'scale': court_scale.to_dict(),
                    'confidence': calibration_confidence,
                    'corners': [corner.to_dict() for corner in unity_corners]
                }
            })
            
            return {
                'success': True,
                'session_id': session_id,
                'calibration_confidence': calibration_confidence,
                'court_center': court_center.to_dict(),
                'court_dimensions': self._calculate_ar_dimensions(unity_corners)
            }
            
        except Exception as e:
            logger.error(f"AR court calibration failed: {str(e)}")
            raise
    
    async def get_unity_sport_configuration(self, sport_name: str) -> Dict[str, Any]:
        """Get Unity-specific sport configuration"""
        try:
            # Load sport pack
            sport_pack = sport_pack_loader.load_sport_pack(sport_name)
            
            # Convert to Unity format
            unity_config = {
                'sport_name': sport_name,
                'unity_settings': {
                    'coordinate_system': self.unity_configs['coordinate_system'],
                    'up_vector': self.unity_configs['up_vector'],
                    'forward_vector': self.unity_configs['forward_vector'],
                    'units': self.unity_configs['units']
                },
                'court_geometry': self._convert_sport_pack_to_unity_geometry(sport_pack),
                'game_objects': self._convert_sport_pack_to_unity_objects(sport_pack),
                'ar_markers': self._generate_ar_markers_from_config(sport_pack),
                'detection_targets': self._generate_detection_targets_from_config(sport_pack),
                'overlay_configurations': self._generate_overlay_configs_from_config(sport_pack),
                'physics_settings': self._generate_physics_settings_from_config(sport_pack)
            }
            
            return {
                'success': True,
                'unity_configuration': unity_config,
                'supported_features': self._get_unity_supported_features(sport_name)
            }
            
        except Exception as e:
            logger.error(f"Unity configuration generation failed: {str(e)}")
            raise
    
    # Helper methods for Unity conversion and AR processing
    
    async def _initialize_court_calibration(self, sport_name: str, court_dimensions: Dict[str, float]) -> ARCourtCalibration:
        """Initialize court calibration with default values"""
        return ARCourtCalibration(
            sport_name=sport_name,
            court_center=UnityVector3(0, 0, 0),
            court_rotation=UnityQuaternion(0, 0, 0, 1),
            court_scale=UnityVector3(1, 1, 1),
            corner_points=[],
            calibration_confidence=0.0,
            calibration_timestamp=datetime.utcnow().timestamp(),
            real_world_dimensions=court_dimensions,
            ar_space_dimensions={}
        )
    
    async def _create_ar_trackable_object(self, track_data: Dict[str, Any]) -> ARTrackableObject:
        """Create AR trackable object from tracking data"""
        position = track_data.get('position', [0, 0, 0])
        rotation = track_data.get('rotation', [0, 0, 0, 1])
        velocity = track_data.get('velocity', [0, 0, 0])
        angular_velocity = track_data.get('angular_velocity', [0, 0, 0])
        
        return ARTrackableObject(
            object_id=track_data.get('id', str(uuid.uuid4())),
            object_type=track_data.get('type', 'unknown'),
            transform=UnityTransform(
                position=UnityVector3(position[0], position[1], position[2]),
                rotation=UnityQuaternion(rotation[0], rotation[1], rotation[2], rotation[3]),
                scale=UnityVector3(1, 1, 1)
            ),
            confidence=track_data.get('confidence', 0.5),
            tracking_state=ARTrackingState(track_data.get('tracking_state', 'tracking')),
            is_tracked=track_data.get('is_tracked', True),
            velocity=UnityVector3(velocity[0], velocity[1], velocity[2]),
            angular_velocity=UnityVector3(angular_velocity[0], angular_velocity[1], angular_velocity[2]),
            timestamp=track_data.get('timestamp', datetime.utcnow().timestamp()),
            metadata=track_data.get('metadata', {})
        )
    
    def _determine_tracking_state(self, tracked_objects: List[ARTrackableObject]) -> ARTrackingState:
        """Determine overall AR tracking state"""
        if not tracked_objects:
            return ARTrackingState.NOT_TRACKING
        
        tracking_objects = [obj for obj in tracked_objects if obj.is_tracked]
        
        if len(tracking_objects) == 0:
            return ARTrackingState.NOT_TRACKING
        elif len(tracking_objects) < len(tracked_objects) * 0.5:
            return ARTrackingState.LIMITED
        else:
            avg_confidence = sum(obj.confidence for obj in tracking_objects) / len(tracking_objects)
            if avg_confidence > 0.8:
                return ARTrackingState.TRACKING
            else:
                return ARTrackingState.LIMITED
    
    async def _create_sport_context_from_ar(self, session: ARSessionData) -> Optional[SportContext]:
        """Create sport context from AR session data"""
        try:
            if not session.tracked_objects:
                return None
            
            # Extract player positions
            players = [obj for obj in session.tracked_objects if obj.object_type == 'player']
            player_positions = [
                {'x': player.transform.position.x, 'y': player.transform.position.z}
                for player in players
            ]
            
            # Extract ball position
            balls = [obj for obj in session.tracked_objects if obj.object_type == 'ball']
            ball_position = None
            if balls:
                ball = balls[0]  # Use first ball
                ball_position = {'x': ball.transform.position.x, 'y': ball.transform.position.z}
            
            # Create sport context
            return SportContext(
                sport_name=session.sport_name,
                timestamp=session.timestamp,
                player_positions=player_positions,
                ball_position=ball_position,
                objects_detected=[
                    {'name': obj.object_type, 'confidence': obj.confidence}
                    for obj in session.tracked_objects
                ],
                court_landmarks=[],
                game_phase='active',
                score_state={},
                time_remaining=300.0
            )
            
        except Exception as e:
            logger.error(f"Failed to create sport context from AR: {str(e)}")
            return None
    
    async def _generate_ar_overlays(self, session: ARSessionData, sport_context: SportContext) -> List[ARAnalysisOverlay]:
        """Generate AR overlays for Unity visualization"""
        try:
            overlays = []
            
            # Generate dynamic overlays using the renderer
            sport_overlay = await dynamic_overlay_renderer.render_sport_overlay(
                sport_context.sport_name,
                OverlayType.HEATMAP,
                {
                    'player_positions': sport_context.player_positions,
                    'ball_position': sport_context.ball_position or {},
                    'sport': sport_context.sport_name
                },
                VisualizationStyle.THREE_DIMENSIONAL
            )
            
            if sport_overlay:
                # Convert overlay elements to dict format
                overlay_elements = []
                overlay_transforms = []
                overlay_colors = []
                
                for elem in sport_overlay.elements:
                    # Convert overlay element to dict
                    elem_dict = {
                        'x': getattr(elem, 'x', 0),
                        'y': getattr(elem, 'y', 0),
                        'z': getattr(elem, 'z', 0),
                        'type': getattr(elem, 'element_type', 'marker'),
                        'intensity': getattr(elem, 'intensity', 1.0)
                    }
                    overlay_elements.append(elem_dict)
                    
                    # Create Unity transform
                    overlay_transforms.append(
                        UnityTransform(
                            position=UnityVector3(elem_dict['x'], 0.1, elem_dict['y']),
                            rotation=UnityQuaternion(0, 0, 0, 1),
                            scale=UnityVector3(1, 1, 1)
                        )
                    )
                    
                    # Create color based on element properties
                    color_data = getattr(elem, 'color', None)
                    if color_data and hasattr(color_data, 'r'):
                        overlay_colors.append({
                            'r': color_data.r, 'g': color_data.g, 
                            'b': color_data.b, 'a': getattr(color_data, 'a', 255)
                        })
                    else:
                        overlay_colors.append({'r': 255, 'g': 255, 'b': 255, 'a': 255})
                
                # Convert to AR overlay
                ar_overlay = ARAnalysisOverlay(
                    overlay_id=str(uuid.uuid4()),
                    overlay_type='analysis_heatmap',
                    sport_name=session.sport_name,
                    elements=overlay_elements,
                    transforms=overlay_transforms,
                    colors=overlay_colors,
                    visibility=True,
                    duration=5.0,
                    fade_type='smooth',
                    priority=1,
                    metadata={'render_time': getattr(sport_overlay, 'render_time', datetime.utcnow().timestamp())}
                )
                overlays.append(ar_overlay)
            
            return overlays
            
        except Exception as e:
            logger.error(f"AR overlay generation failed: {str(e)}")
            return []
    
    async def _convert_decision_to_unity_format(self, decision_analysis) -> Dict[str, Any]:
        """Convert decision analysis to Unity-friendly format"""
        return {
            'decision_id': decision_analysis.primary_decision.decision_id,
            'sport': decision_analysis.sport_name,
            'title': decision_analysis.primary_decision.title,
            'description': decision_analysis.primary_decision.description,
            'recommendation': decision_analysis.primary_decision.recommendation,
            'confidence': {
                'level': decision_analysis.primary_decision.confidence.value,
                'score': decision_analysis.overall_confidence
            },
            'urgency': decision_analysis.primary_decision.urgency.value,
            'impact': decision_analysis.primary_decision.expected_impact,
            'success_probability': decision_analysis.primary_decision.success_probability,
            'risk_score': decision_analysis.primary_decision.risk_assessment,
            'implementation_steps': decision_analysis.primary_decision.implementation_steps,
            'alternatives': [
                {
                    'title': alt.title,
                    'description': alt.description,
                    'confidence': alt.confidence.value,
                    'impact': alt.expected_impact
                }
                for alt in decision_analysis.alternative_decisions
            ],
            'visualization': decision_analysis.recommended_visualization,
            'timestamp': decision_analysis.timestamp
        }
    
    async def _calculate_ar_performance_metrics(self, session: ARSessionData) -> Dict[str, float]:
        """Calculate AR session performance metrics"""
        metrics = {
            'tracking_quality': 0.0,
            'analysis_confidence': 0.0,
            'overlay_coverage': 0.0,
            'decision_reliability': 0.0,
            'session_duration': 0.0
        }
        
        if session.tracked_objects:
            metrics['tracking_quality'] = sum(obj.confidence for obj in session.tracked_objects) / len(session.tracked_objects)
        
        if session.decision_recommendations:
            metrics['decision_reliability'] = session.decision_recommendations[0].get('confidence', {}).get('score', 0.0)
        
        if session.analysis_overlays:
            metrics['overlay_coverage'] = len(session.analysis_overlays) / 10.0  # Normalize to 0-1
        
        current_time = datetime.utcnow().timestamp()
        metrics['session_duration'] = current_time - session.timestamp
        
        return metrics
    
    def _calculate_court_center(self, corners: List[UnityVector3]) -> UnityVector3:
        """Calculate court center from corner points"""
        if not corners:
            return UnityVector3(0, 0, 0)
        
        x = sum(corner.x for corner in corners) / len(corners)
        y = sum(corner.y for corner in corners) / len(corners)
        z = sum(corner.z for corner in corners) / len(corners)
        
        return UnityVector3(x, y, z)
    
    def _calculate_court_rotation(self, corners: List[UnityVector3]) -> UnityQuaternion:
        """Calculate court rotation from corner points"""
        # Simplified rotation calculation - in real implementation would use proper alignment
        return UnityQuaternion(0, 0, 0, 1)
    
    def _calculate_court_scale(self, corners: List[UnityVector3], reference: Dict[str, float]) -> UnityVector3:
        """Calculate court scale from corner points and reference measurements"""
        if len(corners) < 2:
            return UnityVector3(1, 1, 1)
        
        # Calculate actual distance
        actual_distance = math.sqrt(
            (corners[1].x - corners[0].x) ** 2 +
            (corners[1].z - corners[0].z) ** 2
        )
        
        # Get reference distance
        reference_distance = reference.get('length', 1.0)
        
        # Calculate scale
        scale_factor = reference_distance / actual_distance if actual_distance > 0 else 1.0
        
        return UnityVector3(scale_factor, 1.0, scale_factor)
    
    def _calculate_calibration_confidence(self, corners: List[UnityVector3], reference: Dict[str, float]) -> float:
        """Calculate calibration confidence score"""
        if len(corners) < 4:
            return 0.3
        
        # Simplified confidence calculation
        return 0.85  # Would implement proper geometric validation
    
    def _calculate_ar_dimensions(self, corners: List[UnityVector3]) -> Dict[str, float]:
        """Calculate AR space dimensions from corner points"""
        if len(corners) < 2:
            return {'length': 0.0, 'width': 0.0}
        
        length = abs(corners[1].x - corners[0].x)
        width = abs(corners[1].z - corners[0].z)
        
        return {'length': length, 'width': width}
    
    # Unity format conversion methods
    
    def _object_to_unity_format(self, obj: ARTrackableObject) -> Dict[str, Any]:
        """Convert AR object to Unity format"""
        return {
            'id': obj.object_id,
            'type': obj.object_type,
            'transform': obj.transform.to_dict(),
            'confidence': obj.confidence,
            'tracking_state': obj.tracking_state.value,
            'is_tracked': obj.is_tracked,
            'velocity': obj.velocity.to_dict(),
            'angular_velocity': obj.angular_velocity.to_dict(),
            'timestamp': obj.timestamp
        }
    
    def _sport_context_to_unity_format(self, context: SportContext) -> Dict[str, Any]:
        """Convert sport context to Unity format"""
        return {
            'sport': context.sport_name,
            'players': [
                {'position': {'x': pos['x'], 'y': 0, 'z': pos['y']}}
                for pos in context.player_positions
            ],
            'ball': {
                'position': {'x': context.ball_position['x'], 'y': 0, 'z': context.ball_position['y']}
            } if context.ball_position else None,
            'game_phase': context.game_phase,
            'timestamp': context.timestamp
        }
    
    def _overlay_to_unity_format(self, overlay: ARAnalysisOverlay) -> Dict[str, Any]:
        """Convert AR overlay to Unity format"""
        return {
            'id': overlay.overlay_id,
            'type': overlay.overlay_type,
            'sport': overlay.sport_name,
            'elements': overlay.elements,
            'transforms': [transform.to_dict() for transform in overlay.transforms],
            'colors': overlay.colors,
            'visible': overlay.visibility,
            'duration': overlay.duration,
            'fade_type': overlay.fade_type,
            'priority': overlay.priority
        }
    
    def _convert_sport_pack_to_unity_geometry(self, sport_pack) -> Dict[str, Any]:
        """Convert SportPackConfig to Unity coordinate system"""
        # Use default dimensions based on sport
        sport_dimensions = {
            'basketball': {'length': 28.0, 'width': 15.0, 'height': 3.05},
            'tennis': {'length': 23.77, 'width': 10.97, 'height': 2.5},
            'football': {'length': 105.0, 'width': 68.0, 'height': 3.0},
            'volleyball': {'length': 18.0, 'width': 9.0, 'height': 2.43},
            'swimming': {'length': 50.0, 'width': 25.0, 'height': 2.0},
            'boxing': {'length': 6.1, 'width': 6.1, 'height': 2.0}
        }
        
        dimensions = sport_dimensions.get(sport_pack.sport, {'length': 20.0, 'width': 10.0, 'height': 3.0})
        
        unity_geometry = {
            'court_dimensions': dimensions,
            'key_areas': {
                'center_area': {
                    'center': {'x': dimensions['length']/2, 'y': 0, 'z': dimensions['width']/2},
                    'size': {'x': 3, 'y': 0.1, 'z': 3},
                    'type': 'circular'
                },
                'scoring_zones': {
                    'center': {'x': 0, 'y': 0, 'z': 0},
                    'size': {'x': 2, 'y': 0.1, 'z': 2},
                    'type': 'rectangular'
                }
            }
        }
        
        return unity_geometry
    
    def _convert_sport_pack_to_unity_objects(self, sport_pack) -> Dict[str, Any]:
        """Convert SportPackConfig objects to Unity prefab configurations"""
        unity_objects = {
            'primary_ball': {
                'prefab_name': f"{sport_pack.sport}_Ball_Prefab",
                'material': 'DefaultBallMaterial',
                'physics': {
                    'bounce': 0.8,
                    'friction': 0.2,
                    'mass': 0.6
                },
                'scale': {'x': 1, 'y': 1, 'z': 1},
                'tracking_enabled': True
            },
            'goal_posts': {
                'prefab_name': f"{sport_pack.sport}_Goal_Prefab",
                'material': 'DefaultGoalMaterial',
                'physics': {
                    'static': True,
                    'collision': True
                },
                'scale': {'x': 1, 'y': 1, 'z': 1},
                'tracking_enabled': False
            }
        }
        
        return unity_objects
    
    def _generate_ar_markers_from_config(self, sport_pack) -> List[Dict[str, Any]]:
        """Generate AR marker configurations from SportPackConfig"""
        return [
            {
                'marker_id': f"{sport_pack.sport}_corner_{i}",
                'marker_type': 'court_corner',
                'size': 0.1,
                'position': {'x': 0, 'y': 0, 'z': 0},
                'required': True
            }
            for i in range(4)
        ]
    
    def _generate_detection_targets_from_config(self, sport_pack) -> List[Dict[str, Any]]:
        """Generate detection target configurations from SportPackConfig"""
        targets = [
            {
                'target_name': 'primary_ball',
                'target_type': 'ball',
                'detection_model': f"{sport_pack.sport}_ball_detector",
                'confidence_threshold': 0.7,
                'tracking_enabled': True
            },
            {
                'target_name': 'player',
                'target_type': 'person',
                'detection_model': f"{sport_pack.sport}_player_detector",
                'confidence_threshold': 0.8,
                'tracking_enabled': True
            }
        ]
        
        return targets
    
    def _generate_overlay_configs_from_config(self, sport_pack) -> Dict[str, Any]:
        """Generate overlay configurations for Unity from SportPackConfig"""
        return {
            'heatmap': {
                'material': 'HeatmapMaterial',
                'resolution': 256,
                'height_offset': 0.01,
                'blend_mode': 'alpha'
            },
            'zone_highlight': {
                'material': 'ZoneHighlightMaterial',
                'line_width': 0.05,
                'height_offset': 0.02,
                'blend_mode': 'additive'
            },
            'tactical_arrows': {
                'material': 'ArrowMaterial',
                'arrow_scale': 1.0,
                'height_offset': 0.5,
                'animation_speed': 2.0
            }
        }
    
    def _generate_physics_settings_from_config(self, sport_pack) -> Dict[str, Any]:
        """Generate Unity physics settings from SportPackConfig"""
        return {
            'gravity': {'x': 0, 'y': -9.81, 'z': 0},
            'bounce_physics': True,
            'collision_detection': 'continuous',
            'physics_materials': {
                'ball': {
                    'bounce': 0.8,
                    'friction': 0.2,
                    'density': 1.0
                },
                'court': {
                    'bounce': 0.1,
                    'friction': 0.8,
                    'density': 2.0
                }
            }
        }
    
    def _get_unity_supported_features(self, sport_name: str) -> List[str]:
        """Get Unity-supported features for sport"""
        return [
            'ar_tracking',
            'object_detection',
            'overlay_rendering',
            'decision_analysis',
            'performance_metrics',
            'real_time_analysis',
            'physics_simulation',
            'haptic_feedback'
        ]
    
    # WebSocket communication methods
    
    async def _broadcast_tracking_update(self, session_id: str, data: Dict[str, Any]):
        """Broadcast tracking update to connected Unity clients"""
        if self.connected_clients:
            message = json.dumps({
                'type': 'tracking_update',
                'session_id': session_id,
                'data': data,
                'timestamp': datetime.utcnow().timestamp()
            })
            
            disconnected_clients = set()
            for client in self.connected_clients:
                try:
                    await client.send(message)
                except websockets.exceptions.ConnectionClosed:
                    disconnected_clients.add(client)
            
            # Remove disconnected clients
            self.connected_clients -= disconnected_clients
    
    async def _broadcast_analysis_update(self, session_id: str, data: Dict[str, Any]):
        """Broadcast analysis update to connected Unity clients"""
        if self.connected_clients:
            message = json.dumps({
                'type': 'analysis_update',
                'session_id': session_id,
                'data': data,
                'timestamp': datetime.utcnow().timestamp()
            })
            
            disconnected_clients = set()
            for client in self.connected_clients:
                try:
                    await client.send(message)
                except websockets.exceptions.ConnectionClosed:
                    disconnected_clients.add(client)
            
            self.connected_clients -= disconnected_clients
    
    async def _broadcast_calibration_update(self, session_id: str, data: Dict[str, Any]):
        """Broadcast calibration update to connected Unity clients"""
        if self.connected_clients:
            message = json.dumps({
                'type': 'calibration_update',
                'session_id': session_id,
                'data': data,
                'timestamp': datetime.utcnow().timestamp()
            })
            
            disconnected_clients = set()
            for client in self.connected_clients:
                try:
                    await client.send(message)
                except websockets.exceptions.ConnectionClosed:
                    disconnected_clients.add(client)
            
            self.connected_clients -= disconnected_clients
    
    async def handle_websocket_connection(self, websocket, path):
        """Handle WebSocket connection from Unity client"""
        self.connected_clients.add(websocket)
        logger.info(f"Unity client connected: {websocket.remote_address}")
        
        try:
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self._handle_unity_message(websocket, data)
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({
                        'error': 'Invalid JSON format',
                        'timestamp': datetime.utcnow().timestamp()
                    }))
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connected_clients.discard(websocket)
            logger.info(f"Unity client disconnected: {websocket.remote_address}")
    
    async def _handle_unity_message(self, websocket, data: Dict[str, Any]):
        """Handle incoming message from Unity client"""
        try:
            message_type = data.get('type')
            
            if message_type == 'session_request':
                sport_name = data.get('sport_name', 'basketball')
                session_id = await self.create_ar_session(sport_name)
                
                response = {
                    'type': 'session_created',
                    'session_id': session_id,
                    'status': 'success',
                    'timestamp': datetime.utcnow().timestamp()
                }
                await websocket.send(json.dumps(response))
            
            elif message_type == 'tracking_data':
                session_id = data.get('session_id')
                if not session_id:
                    await websocket.send(json.dumps({
                        'error': 'Missing session_id for tracking_data',
                        'timestamp': datetime.utcnow().timestamp()
                    }))
                    return
                    
                tracking_data = data.get('tracking_data', [])
                result = await self.update_ar_tracking(session_id, tracking_data)
                response = {
                    'type': 'tracking_confirmed',
                    'result': result,
                    'timestamp': datetime.utcnow().timestamp()
                }
                await websocket.send(json.dumps(response))
            
            elif message_type == 'analysis_request':
                session_id = data.get('session_id')
                if not session_id:
                    await websocket.send(json.dumps({
                        'error': 'Missing session_id for analysis_request',
                        'timestamp': datetime.utcnow().timestamp()
                    }))
                    return
                    
                include_overlays = data.get('include_overlays', True)
                include_decisions = data.get('include_decisions', True)
                result = await self.generate_ar_analysis(session_id, include_overlays, include_decisions)
                response = {
                    'type': 'analysis_result',
                    'result': result,
                    'timestamp': datetime.utcnow().timestamp()
                }
                await websocket.send(json.dumps(response))
            
            else:
                await websocket.send(json.dumps({
                    'error': f'Unknown message type: {message_type}',
                    'timestamp': datetime.utcnow().timestamp()
                }))
                
        except Exception as e:
            logger.error(f"Error handling Unity message: {str(e)}")
            await websocket.send(json.dumps({
                'error': f'Message processing failed: {str(e)}',
                'timestamp': datetime.utcnow().timestamp()
            }))
    
    def get_bridge_analytics(self) -> Dict[str, Any]:
        """Get Unity AR Bridge analytics"""
        return {
            'session_analytics': self.session_analytics.copy(),
            'active_sessions': len(self.active_sessions),
            'connected_clients': len(self.connected_clients),
            'unity_configurations': self.unity_configs.copy(),
            'ar_configurations': self.ar_configs.copy(),
            'supported_features': [
                'real_time_tracking',
                'ar_overlays',
                'decision_integration',
                'websocket_communication',
                'multi_session_support',
                'performance_analytics'
            ]
        }

# Global Unity AR Bridge instance
unity_ar_bridge = UnityARBridge()

# Export key classes and functions
__all__ = [
    'UnityARBridge', 'ARSessionData', 'ARTrackableObject', 'ARCourtCalibration',
    'ARAnalysisOverlay', 'UnityVector3', 'UnityQuaternion', 'UnityTransform',
    'ARTrackingState', 'ARSessionType', 'unity_ar_bridge'
]