#!/usr/bin/env python3
"""
Multi-Object Tracking Pipeline with ByteTrack Integration
Provides professional-grade tracking with identity consistency for sports analysis
across multiple sports including players, balls, and sport-specific equipment
"""

import numpy as np
import logging
import math
import time
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import uuid
from collections import defaultdict, deque

from sport_pack_system import sport_pack_loader
from unified_cv_pipeline import unified_cv_pipeline

logger = logging.getLogger(__name__)

class TrackState(Enum):
    """Track state enumeration"""
    NEW = "new"
    TRACKED = "tracked"
    LOST = "lost"
    REMOVED = "removed"

class ObjectCategory(Enum):
    """Object category for sports tracking"""
    PLAYER = "player"
    BALL = "ball"
    REFEREE = "referee"
    EQUIPMENT = "equipment"
    GOAL = "goal"
    NET = "net"
    LINE = "line"
    UNKNOWN = "unknown"

@dataclass
class BoundingBox:
    """Bounding box representation"""
    x1: float
    y1: float
    x2: float
    y2: float
    
    @property
    def center_x(self) -> float:
        return (self.x1 + self.x2) / 2.0
    
    @property
    def center_y(self) -> float:
        return (self.y1 + self.y2) / 2.0
    
    @property
    def width(self) -> float:
        return self.x2 - self.x1
    
    @property
    def height(self) -> float:
        return self.y2 - self.y1
    
    @property
    def area(self) -> float:
        return self.width * self.height
    
    def to_dict(self) -> Dict[str, float]:
        return {
            'x1': self.x1, 'y1': self.y1, 
            'x2': self.x2, 'y2': self.y2,
            'center_x': self.center_x, 'center_y': self.center_y,
            'width': self.width, 'height': self.height, 'area': self.area
        }

@dataclass
class Detection:
    """Detection result for tracking"""
    bbox: BoundingBox
    confidence: float
    class_id: int
    class_name: str
    category: ObjectCategory
    features: Optional[np.ndarray] = None
    timestamp: float = 0.0
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'bbox': self.bbox.to_dict(),
            'confidence': self.confidence,
            'class_id': self.class_id,
            'class_name': self.class_name,
            'category': self.category.value,
            'timestamp': self.timestamp
        }

@dataclass
class TrackHistory:
    """Track history point"""
    bbox: BoundingBox
    confidence: float
    timestamp: float
    velocity: Tuple[float, float]
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            'bbox': self.bbox.to_dict(),
            'confidence': self.confidence,
            'timestamp': self.timestamp,
            'velocity': {'x': self.velocity[0], 'y': self.velocity[1]}
        }

@dataclass
class SportTrack:
    """Sport-specific track with identity consistency"""
    track_id: int
    category: ObjectCategory
    current_bbox: BoundingBox
    confidence: float
    state: TrackState
    frames_tracked: int
    frames_lost: int
    first_frame: int
    last_frame: int
    history: deque
    velocity: Tuple[float, float]
    acceleration: Tuple[float, float]
    predicted_bbox: Optional[BoundingBox]
    sport_specific_data: Dict[str, Any]
    
    def __post_init__(self):
        if not hasattr(self, 'history') or self.history is None:
            self.history = deque(maxlen=30)  # Keep last 30 frames
    
    def update(self, detection: Detection, frame_id: int):
        """Update track with new detection"""
        # Calculate velocity
        if self.history:
            last_history = self.history[-1]
            dt = detection.timestamp - last_history.timestamp
            if dt > 0:
                dx = detection.bbox.center_x - last_history.bbox.center_x
                dy = detection.bbox.center_y - last_history.bbox.center_y
                new_velocity = (dx / dt, dy / dt)
                
                # Calculate acceleration
                if self.velocity != (0, 0):
                    dvx = new_velocity[0] - self.velocity[0]
                    dvy = new_velocity[1] - self.velocity[1]
                    self.acceleration = (dvx / dt, dvy / dt)
                
                self.velocity = new_velocity
        
        # Update track properties
        self.current_bbox = detection.bbox
        self.confidence = detection.confidence
        self.state = TrackState.TRACKED
        self.frames_tracked += 1
        self.frames_lost = 0
        self.last_frame = frame_id
        
        # Add to history
        history_point = TrackHistory(
            bbox=detection.bbox,
            confidence=detection.confidence,
            timestamp=detection.timestamp,
            velocity=self.velocity
        )
        self.history.append(history_point)
        
        # Update sport-specific data
        self._update_sport_specific_data(detection)
    
    def predict_next_position(self, dt: float = 1.0/30.0) -> BoundingBox:
        """Predict next position based on velocity and acceleration"""
        if self.velocity == (0, 0):
            return self.current_bbox
        
        # Use kinematic equation: s = ut + 0.5*a*t^2
        dx = self.velocity[0] * dt + 0.5 * self.acceleration[0] * dt * dt
        dy = self.velocity[1] * dt + 0.5 * self.acceleration[1] * dt * dt
        
        predicted_bbox = BoundingBox(
            x1=self.current_bbox.x1 + dx,
            y1=self.current_bbox.y1 + dy,
            x2=self.current_bbox.x2 + dx,
            y2=self.current_bbox.y2 + dy
        )
        
        self.predicted_bbox = predicted_bbox
        return predicted_bbox
    
    def mark_lost(self):
        """Mark track as lost"""
        self.state = TrackState.LOST
        self.frames_lost += 1
    
    def should_remove(self, max_lost_frames: int = 30) -> bool:
        """Check if track should be removed"""
        return self.frames_lost > max_lost_frames
    
    def _update_sport_specific_data(self, detection: Detection):
        """Update sport-specific tracking data"""
        if self.category == ObjectCategory.PLAYER:
            self.sport_specific_data.update({
                'position_zone': self._get_position_zone(detection.bbox),
                'movement_pattern': self._analyze_movement_pattern(),
                'interaction_distance': self._calculate_interaction_distances()
            })
        elif self.category == ObjectCategory.BALL:
            self.sport_specific_data.update({
                'trajectory': self._calculate_ball_trajectory(),
                'possession_candidate': self._get_possession_candidate(),
                'flight_phase': self._determine_flight_phase()
            })
    
    def _get_position_zone(self, bbox: BoundingBox) -> str:
        """Get position zone for player"""
        # Simplified zone detection
        center_x, center_y = bbox.center_x, bbox.center_y
        if center_x < 0.33:
            return "left_zone"
        elif center_x > 0.67:
            return "right_zone"
        else:
            return "center_zone"
    
    def _analyze_movement_pattern(self) -> str:
        """Analyze player movement pattern"""
        if len(self.history) < 5:
            return "static"
        
        velocities = [h.velocity for h in list(self.history)[-5:]]
        avg_speed = np.mean([math.sqrt(vx*vx + vy*vy) for vx, vy in velocities])
        
        if avg_speed < 5:
            return "static"
        elif avg_speed < 20:
            return "walking"
        elif avg_speed < 50:
            return "jogging"
        else:
            return "running"
    
    def _calculate_interaction_distances(self) -> Dict[str, float]:
        """Calculate distances to other tracked objects"""
        return {}  # Implemented by tracker when all tracks are available
    
    def _calculate_ball_trajectory(self) -> Dict[str, Any]:
        """Calculate ball trajectory and physics"""
        if len(self.history) < 3:
            return {'type': 'unknown', 'arc_height': 0, 'speed': 0}
        
        recent_positions = [(h.bbox.center_x, h.bbox.center_y) for h in list(self.history)[-3:]]
        
        # Simple trajectory analysis
        y_positions = [pos[1] for pos in recent_positions]
        if len(set(y_positions)) > 1:
            if y_positions[0] > y_positions[-1]:
                trajectory_type = "descending"
            elif y_positions[0] < y_positions[-1]:
                trajectory_type = "ascending"
            else:
                trajectory_type = "horizontal"
        else:
            trajectory_type = "horizontal"
        
        speed = math.sqrt(self.velocity[0]**2 + self.velocity[1]**2)
        
        return {
            'type': trajectory_type,
            'arc_height': max(y_positions) - min(y_positions),
            'speed': speed,
            'direction': math.atan2(self.velocity[1], self.velocity[0])
        }
    
    def _get_possession_candidate(self) -> Optional[int]:
        """Get player track ID that likely has ball possession"""
        # Return the possession candidate that was calculated by the tracker
        return self.sport_specific_data.get('possession_candidate')
    
    def _determine_flight_phase(self) -> str:
        """Determine ball flight phase"""
        trajectory = self.sport_specific_data.get('trajectory', {})
        if trajectory.get('speed', 0) < 10:
            return "stationary"
        elif trajectory.get('type') == "ascending":
            return "ascending"
        elif trajectory.get('type') == "descending":
            return "descending"
        else:
            return "linear"
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert track to dictionary"""
        return {
            'track_id': self.track_id,
            'category': self.category.value,
            'current_bbox': self.current_bbox.to_dict(),
            'confidence': self.confidence,
            'state': self.state.value,
            'frames_tracked': self.frames_tracked,
            'frames_lost': self.frames_lost,
            'velocity': {'x': self.velocity[0], 'y': self.velocity[1]},
            'acceleration': {'x': self.acceleration[0], 'y': self.acceleration[1]},
            'predicted_bbox': self.predicted_bbox.to_dict() if self.predicted_bbox else None,
            'sport_specific_data': self.sport_specific_data,
            'history_length': len(self.history)
        }

class ByteTracker:
    """ByteTrack implementation for multi-object tracking"""
    
    def __init__(self, 
                 frame_rate: float = 30.0,
                 track_thresh: float = 0.6,
                 track_buffer: int = 30,
                 match_thresh: float = 0.8,
                 min_box_area: float = 100):
        
        self.frame_rate = frame_rate
        self.track_thresh = track_thresh
        self.track_buffer = track_buffer
        self.match_thresh = match_thresh
        self.min_box_area = min_box_area
        
        self.tracked_tracks: List[SportTrack] = []
        self.lost_tracks: List[SportTrack] = []
        self.removed_tracks: List[SportTrack] = []
        
        self.frame_id = 0
        self.track_id_count = 0
        
        logger.info(f"ByteTracker initialized with thresh={track_thresh}, buffer={track_buffer}")
    
    def update(self, detections: List[Detection], frame_timestamp: float) -> List[SportTrack]:
        """Update tracks with new detections"""
        self.frame_id += 1
        
        # Separate detections by confidence
        high_conf_detections = [d for d in detections if d.confidence >= self.track_thresh]
        low_conf_detections = [d for d in detections if d.confidence < self.track_thresh]
        
        # Predict current positions for all tracks
        for track in self.tracked_tracks:
            track.predict_next_position()
        
        # First association: high confidence detections with tracked tracks
        matched_tracks, unmatched_dets, unmatched_tracks = self._associate_tracks_to_detections(
            self.tracked_tracks, high_conf_detections
        )
        
        # Update matched tracks
        for track_idx, det_idx in matched_tracks:
            self.tracked_tracks[track_idx].update(high_conf_detections[det_idx], self.frame_id)
        
        # Handle unmatched tracks from high confidence association
        for track_idx in unmatched_tracks:
            self.tracked_tracks[track_idx].mark_lost()
        
        # Second association: unmatched tracks with low confidence detections
        unmatched_tracked_tracks = [self.tracked_tracks[i] for i in unmatched_tracks]
        matched_tracks_low, unmatched_dets_low, unmatched_tracks_low = self._associate_tracks_to_detections(
            unmatched_tracked_tracks, low_conf_detections
        )
        
        # Update matched tracks from low confidence association
        for track_idx, det_idx in matched_tracks_low:
            unmatched_tracked_tracks[track_idx].update(low_conf_detections[det_idx], self.frame_id)
        
        # Create new tracks from unmatched high confidence detections
        for det_idx in unmatched_dets:
            if high_conf_detections[det_idx].bbox.area > self.min_box_area:
                new_track = self._create_new_track(high_conf_detections[det_idx], self.frame_id)
                self.tracked_tracks.append(new_track)
        
        # Move lost tracks to lost_tracks list
        self.tracked_tracks = [t for t in self.tracked_tracks if t.state != TrackState.LOST]
        self.lost_tracks.extend([t for t in self.tracked_tracks if t.state == TrackState.LOST])
        
        # Remove old lost tracks
        self.lost_tracks = [t for t in self.lost_tracks if not t.should_remove(self.track_buffer)]
        
        # Update sport-specific relationships
        self._update_sport_relationships()
        
        return self.tracked_tracks.copy()
    
    def _associate_tracks_to_detections(self, tracks: List[SportTrack], detections: List[Detection]) -> Tuple[List[Tuple[int, int]], List[int], List[int]]:
        """Associate tracks to detections using IoU matching"""
        if not tracks or not detections:
            return [], list(range(len(detections))), list(range(len(tracks)))
        
        # Compute IoU matrix
        iou_matrix = np.zeros((len(tracks), len(detections)))
        for t, track in enumerate(tracks):
            for d, detection in enumerate(detections):
                iou_matrix[t, d] = self._calculate_iou(track.current_bbox, detection.bbox)
        
        # Apply Hungarian algorithm (simplified greedy matching for now)
        matched_tracks, unmatched_dets, unmatched_tracks = self._greedy_assignment(
            iou_matrix, self.match_thresh
        )
        
        return matched_tracks, unmatched_dets, unmatched_tracks
    
    def _calculate_iou(self, bbox1: BoundingBox, bbox2: BoundingBox) -> float:
        """Calculate Intersection over Union of two bounding boxes"""
        # Calculate intersection
        x1 = max(bbox1.x1, bbox2.x1)
        y1 = max(bbox1.y1, bbox2.y1)
        x2 = min(bbox1.x2, bbox2.x2)
        y2 = min(bbox1.y2, bbox2.y2)
        
        if x2 <= x1 or y2 <= y1:
            return 0.0
        
        intersection = (x2 - x1) * (y2 - y1)
        union = bbox1.area + bbox2.area - intersection
        
        return intersection / union if union > 0 else 0.0
    
    def _greedy_assignment(self, cost_matrix: np.ndarray, thresh: float) -> Tuple[List[Tuple[int, int]], List[int], List[int]]:
        """Greedy assignment for track-detection matching"""
        matched_tracks = []
        unmatched_tracks = list(range(cost_matrix.shape[0]))
        unmatched_detections = list(range(cost_matrix.shape[1]))
        
        # Sort by highest IoU
        indices = np.unravel_index(np.argsort(cost_matrix.ravel())[::-1], cost_matrix.shape)
        
        for t, d in zip(indices[0], indices[1]):
            if cost_matrix[t, d] >= thresh and t in unmatched_tracks and d in unmatched_detections:
                matched_tracks.append((t, d))
                unmatched_tracks.remove(t)
                unmatched_detections.remove(d)
        
        return matched_tracks, unmatched_detections, unmatched_tracks
    
    def _create_new_track(self, detection: Detection, frame_id: int) -> SportTrack:
        """Create new track from detection"""
        self.track_id_count += 1
        
        new_track = SportTrack(
            track_id=self.track_id_count,
            category=detection.category,
            current_bbox=detection.bbox,
            confidence=detection.confidence,
            state=TrackState.NEW,
            frames_tracked=1,
            frames_lost=0,
            first_frame=frame_id,
            last_frame=frame_id,
            history=deque(maxlen=30),
            velocity=(0.0, 0.0),
            acceleration=(0.0, 0.0),
            predicted_bbox=None,
            sport_specific_data={}
        )
        
        # Initialize history
        history_point = TrackHistory(
            bbox=detection.bbox,
            confidence=detection.confidence,
            timestamp=detection.timestamp,
            velocity=(0.0, 0.0)
        )
        new_track.history.append(history_point)
        
        return new_track
    
    def _update_sport_relationships(self):
        """Update sport-specific relationships between tracked objects"""
        # Update ball possession analysis
        ball_tracks = [t for t in self.tracked_tracks if t.category == ObjectCategory.BALL]
        player_tracks = [t for t in self.tracked_tracks if t.category == ObjectCategory.PLAYER]
        
        for ball_track in ball_tracks:
            closest_player_id = None
            min_distance = float('inf')
            
            for player_track in player_tracks:
                distance = self._calculate_distance(ball_track.current_bbox, player_track.current_bbox)
                if distance < min_distance:
                    min_distance = distance
                    closest_player_id = player_track.track_id
            
            # Update ball possession candidate
            if closest_player_id and min_distance < 50:  # Within 50 pixels
                ball_track.sport_specific_data['possession_candidate'] = closest_player_id
            else:
                ball_track.sport_specific_data['possession_candidate'] = None
        
        # Update player interaction distances
        for i, player_track in enumerate(player_tracks):
            interaction_distances = {}
            for j, other_player in enumerate(player_tracks):
                if i != j:
                    distance = self._calculate_distance(player_track.current_bbox, other_player.current_bbox)
                    interaction_distances[f"player_{other_player.track_id}"] = distance
            
            player_track.sport_specific_data['interaction_distances'] = interaction_distances
    
    def _calculate_distance(self, bbox1: BoundingBox, bbox2: BoundingBox) -> float:
        """Calculate Euclidean distance between bounding box centers"""
        dx = bbox1.center_x - bbox2.center_x
        dy = bbox1.center_y - bbox2.center_y
        return math.sqrt(dx*dx + dy*dy)
    
    def get_active_tracks(self) -> List[SportTrack]:
        """Get all active tracks"""
        return [t for t in self.tracked_tracks if t.state in [TrackState.NEW, TrackState.TRACKED]]
    
    def get_track_by_id(self, track_id: int) -> Optional[SportTrack]:
        """Get track by ID"""
        for track in self.tracked_tracks:
            if track.track_id == track_id:
                return track
        return None
    
    def get_tracking_statistics(self) -> Dict[str, Any]:
        """Get tracking statistics"""
        return {
            'active_tracks': len(self.tracked_tracks),
            'lost_tracks': len(self.lost_tracks),
            'removed_tracks': len(self.removed_tracks),
            'total_tracks_created': self.track_id_count,
            'frame_id': self.frame_id,
            'tracks_by_category': {
                category.value: len([t for t in self.tracked_tracks if t.category == category])
                for category in ObjectCategory
            }
        }

class MultiObjectTracker:
    """Multi-Object Tracking Pipeline with Sport-Specific Intelligence"""
    
    def __init__(self, sport_name: str = "basketball"):
        self.sport_name = sport_name
        self.byte_tracker = ByteTracker(
            frame_rate=30.0,
            track_thresh=0.6,
            track_buffer=30,
            match_thresh=0.8,
            min_box_area=100
        )
        
        self.tracking_history: List[Dict[str, Any]] = []
        self.sport_config = self._load_sport_config()
        
        self.performance_metrics = {
            'total_frames_processed': 0,
            'total_detections_processed': 0,
            'total_tracks_created': 0,
            'average_tracking_confidence': 0.0,
            'processing_time_ms': 0.0
        }
        
        logger.info(f"MultiObjectTracker initialized for {sport_name}")
    
    def _load_sport_config(self) -> Dict[str, Any]:
        """Load sport-specific tracking configuration"""
        try:
            sport_pack = sport_pack_loader.load_sport_pack(self.sport_name)
            return {
                'sport': self.sport_name,
                'expected_objects': self._get_expected_objects(sport_pack),
                'tracking_priorities': self._get_tracking_priorities(sport_pack),
                'interaction_rules': self._get_interaction_rules(sport_pack)
            }
        except Exception as e:
            logger.warning(f"Could not load sport config for {self.sport_name}: {e}")
            return self._get_default_sport_config()
    
    def _get_expected_objects(self, sport_pack) -> List[str]:
        """Get expected objects for sport"""
        objects = ['player', 'ball']
        
        if self.sport_name in ['basketball', 'football', 'volleyball']:
            objects.extend(['goal', 'referee'])
        elif self.sport_name == 'tennis':
            objects.extend(['net', 'referee'])
        elif self.sport_name == 'boxing':
            objects.extend(['referee', 'ring'])
        
        return objects
    
    def _get_tracking_priorities(self, sport_pack) -> Dict[str, int]:
        """Get tracking priorities for different object types"""
        return {
            'player': 10,
            'ball': 9,
            'referee': 5,
            'goal': 3,
            'net': 3,
            'equipment': 2
        }
    
    def _get_interaction_rules(self, sport_pack) -> Dict[str, Dict[str, Any]]:
        """Get sport-specific interaction rules"""
        if self.sport_name == 'basketball':
            return {
                'ball_possession_distance': {'value': 50, 'unit': 'pixels'},
                'player_collision_distance': {'value': 30, 'unit': 'pixels'},
                'shooting_distance_threshold': {'value': 200, 'unit': 'pixels'},
                'pass_velocity_threshold': {'value': 100, 'unit': 'pixels/sec'}
            }
        elif self.sport_name == 'tennis':
            return {
                'ball_possession_distance': {'value': 40, 'unit': 'pixels'},
                'net_interaction_distance': {'value': 20, 'unit': 'pixels'},
                'court_boundary_margin': {'value': 10, 'unit': 'pixels'}
            }
        else:
            return {
                'ball_possession_distance': {'value': 50, 'unit': 'pixels'},
                'player_collision_distance': {'value': 30, 'unit': 'pixels'}
            }
    
    def _get_default_sport_config(self) -> Dict[str, Any]:
        """Get default sport configuration"""
        return {
            'sport': self.sport_name,
            'expected_objects': ['player', 'ball'],
            'tracking_priorities': {'player': 10, 'ball': 9},
            'interaction_rules': {'ball_possession_distance': 50}
        }
    
    def process_frame(self, 
                     detections: List[Dict[str, Any]], 
                     frame_timestamp: Optional[float] = None) -> Dict[str, Any]:
        """Process frame with detections and return tracking results"""
        start_time = time.time()
        
        if frame_timestamp is None:
            frame_timestamp = time.time()
        
        # Convert detections to Detection objects
        detection_objects = []
        for det in detections:
            try:
                bbox = BoundingBox(
                    x1=det['bbox']['x1'],
                    y1=det['bbox']['y1'],
                    x2=det['bbox']['x2'],
                    y2=det['bbox']['y2']
                )
                
                category = self._map_class_to_category(det.get('class_name', 'unknown'))
                
                detection_obj = Detection(
                    bbox=bbox,
                    confidence=det['confidence'],
                    class_id=det.get('class_id', 0),
                    class_name=det.get('class_name', 'unknown'),
                    category=category,
                    timestamp=frame_timestamp
                )
                
                detection_objects.append(detection_obj)
                
            except Exception as e:
                logger.warning(f"Failed to process detection: {e}")
                continue
        
        # Update tracker
        active_tracks = self.byte_tracker.update(detection_objects, frame_timestamp)
        
        # Generate tracking results
        tracking_results = self._generate_tracking_results(active_tracks, frame_timestamp)
        
        # Update performance metrics
        processing_time = (time.time() - start_time) * 1000
        self._update_performance_metrics(detections, active_tracks, processing_time)
        
        # Store in history
        self.tracking_history.append({
            'timestamp': frame_timestamp,
            'frame_id': self.byte_tracker.frame_id,
            'active_tracks': len(active_tracks),
            'detections': len(detection_objects)
        })
        
        # Keep only recent history
        if len(self.tracking_history) > 1000:
            self.tracking_history = self.tracking_history[-1000:]
        
        return tracking_results
    
    def _map_class_to_category(self, class_name: str) -> ObjectCategory:
        """Map class name to object category"""
        class_name_lower = class_name.lower()
        
        if 'person' in class_name_lower or 'player' in class_name_lower:
            return ObjectCategory.PLAYER
        elif 'ball' in class_name_lower:
            return ObjectCategory.BALL
        elif 'referee' in class_name_lower or 'umpire' in class_name_lower:
            return ObjectCategory.REFEREE
        elif 'goal' in class_name_lower:
            return ObjectCategory.GOAL
        elif 'net' in class_name_lower:
            return ObjectCategory.NET
        elif 'line' in class_name_lower:
            return ObjectCategory.LINE
        else:
            return ObjectCategory.UNKNOWN
    
    def _generate_tracking_results(self, tracks: List[SportTrack], timestamp: float) -> Dict[str, Any]:
        """Generate comprehensive tracking results"""
        results = {
            'timestamp': timestamp,
            'frame_id': self.byte_tracker.frame_id,
            'sport': self.sport_name,
            'tracks': [track.to_dict() for track in tracks],
            'statistics': self.byte_tracker.get_tracking_statistics(),
            'sport_analysis': self._generate_sport_analysis(tracks),
            'performance_metrics': self.performance_metrics.copy()
        }
        
        return results
    
    def _generate_sport_analysis(self, tracks: List[SportTrack]) -> Dict[str, Any]:
        """Generate sport-specific analysis from tracks"""
        analysis = {
            'player_count': len([t for t in tracks if t.category == ObjectCategory.PLAYER]),
            'ball_count': len([t for t in tracks if t.category == ObjectCategory.BALL]),
            'ball_possession': self._analyze_ball_possession(tracks),
            'player_interactions': self._analyze_player_interactions(tracks),
            'movement_patterns': self._analyze_movement_patterns(tracks),
            'game_events': self._detect_game_events(tracks)
        }
        
        return analysis
    
    def _analyze_ball_possession(self, tracks: List[SportTrack]) -> Dict[str, Any]:
        """Analyze ball possession"""
        ball_tracks = [t for t in tracks if t.category == ObjectCategory.BALL]
        
        if not ball_tracks:
            return {'status': 'no_ball_detected'}
        
        ball_track = ball_tracks[0]  # Use first ball
        possession_candidate = ball_track.sport_specific_data.get('possession_candidate')
        
        return {
            'status': 'in_possession' if possession_candidate else 'loose_ball',
            'player_id': possession_candidate,
            'ball_trajectory': ball_track.sport_specific_data.get('trajectory', {}),
            'flight_phase': ball_track.sport_specific_data.get('flight_phase', 'unknown')
        }
    
    def _analyze_player_interactions(self, tracks: List[SportTrack]) -> List[Dict[str, Any]]:
        """Analyze player interactions"""
        player_tracks = [t for t in tracks if t.category == ObjectCategory.PLAYER]
        interactions = []
        
        for i, player in enumerate(player_tracks):
            for j, other_player in enumerate(player_tracks[i+1:], i+1):
                distance = self.byte_tracker._calculate_distance(
                    player.current_bbox, other_player.current_bbox
                )
                
                if distance < self.sport_config['interaction_rules']['player_collision_distance']:
                    interactions.append({
                        'type': 'close_contact',
                        'player_1': player.track_id,
                        'player_2': other_player.track_id,
                        'distance': distance,
                        'severity': 'high' if distance < 20 else 'medium'
                    })
        
        return interactions
    
    def _analyze_movement_patterns(self, tracks: List[SportTrack]) -> Dict[str, Any]:
        """Analyze movement patterns"""
        player_tracks = [t for t in tracks if t.category == ObjectCategory.PLAYER]
        
        patterns = {
            'static_players': 0,
            'walking_players': 0,
            'running_players': 0,
            'average_speed': 0.0,
            'formation_analysis': {}
        }
        
        total_speed = 0.0
        for player in player_tracks:
            movement = player.sport_specific_data.get('movement_pattern', 'static')
            if movement == 'static':
                patterns['static_players'] += 1
            elif movement in ['walking', 'jogging']:
                patterns['walking_players'] += 1
            elif movement == 'running':
                patterns['running_players'] += 1
            
            speed = math.sqrt(player.velocity[0]**2 + player.velocity[1]**2)
            total_speed += speed
        
        if player_tracks:
            patterns['average_speed'] = total_speed / len(player_tracks)
        
        return patterns
    
    def _detect_game_events(self, tracks: List[SportTrack]) -> List[Dict[str, Any]]:
        """Detect game events from tracking data"""
        events = []
        
        ball_tracks = [t for t in tracks if t.category == ObjectCategory.BALL]
        if ball_tracks:
            ball_track = ball_tracks[0]
            trajectory = ball_track.sport_specific_data.get('trajectory', {})
            
            # Detect potential shots/passes
            if trajectory.get('speed', 0) > 100:  # High speed threshold
                events.append({
                    'type': 'high_speed_ball_movement',
                    'timestamp': time.time(),
                    'ball_track_id': ball_track.track_id,
                    'speed': trajectory['speed'],
                    'direction': trajectory.get('direction', 0)
                })
        
        return events
    
    def _update_performance_metrics(self, detections: List[Dict], tracks: List[SportTrack], processing_time: float):
        """Update performance metrics"""
        self.performance_metrics['total_frames_processed'] += 1
        self.performance_metrics['total_detections_processed'] += len(detections)
        self.performance_metrics['total_tracks_created'] = self.byte_tracker.track_id_count
        
        if tracks:
            avg_conf = sum(track.confidence for track in tracks) / len(tracks)
            # Exponential moving average
            alpha = 0.1
            self.performance_metrics['average_tracking_confidence'] = (
                alpha * avg_conf + 
                (1 - alpha) * self.performance_metrics['average_tracking_confidence']
            )
        
        # Exponential moving average for processing time
        alpha = 0.1
        self.performance_metrics['processing_time_ms'] = (
            alpha * processing_time + 
            (1 - alpha) * self.performance_metrics['processing_time_ms']
        )
    
    def get_track_by_id(self, track_id: int) -> Optional[Dict[str, Any]]:
        """Get track information by ID"""
        track = self.byte_tracker.get_track_by_id(track_id)
        return track.to_dict() if track else None
    
    def get_tracking_summary(self) -> Dict[str, Any]:
        """Get comprehensive tracking summary"""
        return {
            'sport': self.sport_name,
            'configuration': self.sport_config,
            'statistics': self.byte_tracker.get_tracking_statistics(),
            'performance_metrics': self.performance_metrics,
            'history_length': len(self.tracking_history),
            'capabilities': [
                'multi_object_tracking',
                'identity_consistency',
                'trajectory_prediction',
                'sport_specific_analysis',
                'real_time_processing',
                'ball_possession_detection',
                'player_interaction_analysis',
                'movement_pattern_recognition',
                'game_event_detection'
            ]
        }
    
    def reset_tracking(self):
        """Reset tracking state"""
        self.byte_tracker = ByteTracker(
            frame_rate=30.0,
            track_thresh=0.6,
            track_buffer=30,
            match_thresh=0.8,
            min_box_area=100
        )
        self.tracking_history = []
        logger.info(f"Tracking reset for {self.sport_name}")

# Global multi-object tracker instances
multi_object_trackers: Dict[str, MultiObjectTracker] = {}

def get_tracker(sport_name: str) -> MultiObjectTracker:
    """Get or create tracker for sport"""
    if sport_name not in multi_object_trackers:
        multi_object_trackers[sport_name] = MultiObjectTracker(sport_name)
    return multi_object_trackers[sport_name]

# Export key classes and functions
__all__ = [
    'MultiObjectTracker', 'ByteTracker', 'SportTrack', 'Detection', 
    'BoundingBox', 'TrackState', 'ObjectCategory', 'get_tracker'
]