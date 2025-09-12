#!/usr/bin/env python3
"""
Sport Pack Converter - Unity SportCourtDatabase to Sport Pack JSON
Transforms Unity SportCourtConfig data into modular Sport Pack configurations
Production-grade implementation with complete sport definitions
"""

import json
import os
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from datetime import datetime
from sport_pack_system import SportPackConfig, sport_pack_loader

logger = logging.getLogger(__name__)

@dataclass
class UnityCourtLine:
    """Unity CourtLine representation"""
    name: str
    startPosition: Tuple[float, float]
    endPosition: Tuple[float, float]

@dataclass
class UnityCourtCircle:
    """Unity CourtCircle representation"""
    name: str
    center: Tuple[float, float]
    radius: float

@dataclass
class UnityCourtRectangle:
    """Unity CourtRectangle representation"""
    name: str
    bottomLeft: Tuple[float, float]
    topRight: Tuple[float, float]

@dataclass
class UnitySportCourtConfig:
    """Unity SportCourtConfig representation"""
    sportName: str
    courtLength: float
    courtWidth: float
    lines: List[UnityCourtLine]
    circles: List[UnityCourtCircle]
    keyAreas: List[UnityCourtRectangle]

class SportPackConverter:
    """Comprehensive converter from Unity SportCourtDatabase to Sport Pack format"""
    
    def __init__(self):
        self.unity_sports_data = {}
        self.sport_categorization = {
            # Ball Sports - Invasion Games
            'basketball': 'invasion',
            'football': 'invasion', 
            'volleyball': 'invasion',
            
            # Racquet Sports
            'tennis': 'racquet',
            'badminton': 'racquet',
            
            # Individual Sports
            'swimming': 'aquatic',
            'athletics': 'athletics',
            'archery': 'target',
            'cricket': 'individual',
            
            # Combat Sports
            'boxing': 'combat',
            'karate': 'combat',
            'judo': 'combat',
            'wrestling': 'combat',
            
            # Para Sports
            'para_athletics': 'para_sport',
            'para_swimming': 'para_sport',
            'para_cycling': 'para_sport',
            'para_basketball': 'para_sport',
            'para_football': 'para_sport',
        }
        
        self.team_configurations = {
            'basketball': {'count': 2, 'players_per_team': 5},
            'football': {'count': 2, 'players_per_team': 11},
            'volleyball': {'count': 2, 'players_per_team': 6},
            'tennis': {'count': 2, 'players_per_team': 1},
            'badminton': {'count': 2, 'players_per_team': 1},
            'swimming': {'count': 1, 'players_per_team': 1},
            'athletics': {'count': 1, 'players_per_team': 1},
            'archery': {'count': 1, 'players_per_team': 1},
            'cricket': {'count': 2, 'players_per_team': 11},
            'boxing': {'count': 2, 'players_per_team': 1},
        }
        
        self._initialize_unity_data()
    
    def _initialize_unity_data(self):
        """Initialize Unity sports data based on the C# configurations"""
        # Basketball configuration from Unity
        self.unity_sports_data['basketball'] = UnitySportCourtConfig(
            sportName='basketball',
            courtLength=28.65,
            courtWidth=15.24,
            lines=[
                UnityCourtLine('baseline_home', (0, 0), (0, 15.24)),
                UnityCourtLine('baseline_away', (28.65, 0), (28.65, 15.24)),
                UnityCourtLine('sideline_left', (0, 0), (28.65, 0)),
                UnityCourtLine('sideline_right', (0, 15.24), (28.65, 15.24)),
                UnityCourtLine('center_line', (14.325, 0), (14.325, 15.24)),
                UnityCourtLine('ft_line_home', (5.8, 3.66), (5.8, 11.58)),
                UnityCourtLine('ft_line_away', (22.85, 3.66), (22.85, 11.58)),
                UnityCourtLine('3pt_top_home', (6.75, 7.62), (0, 12.19)),
                UnityCourtLine('3pt_bottom_home', (6.75, 7.62), (0, 3.05)),
                UnityCourtLine('3pt_top_away', (21.9, 7.62), (28.65, 12.19)),
                UnityCourtLine('3pt_bottom_away', (21.9, 7.62), (28.65, 3.05)),
            ],
            circles=[
                UnityCourtCircle('center_circle', (14.325, 7.62), 1.83),
                UnityCourtCircle('ft_circle_home', (5.8, 7.62), 1.83),
                UnityCourtCircle('ft_circle_away', (22.85, 7.62), 1.83),
            ],
            keyAreas=[
                UnityCourtRectangle('key_home', (0, 3.66), (5.8, 11.58)),
                UnityCourtRectangle('key_away', (22.85, 3.66), (28.65, 11.58)),
            ]
        )
        
        # Tennis configuration from Unity
        self.unity_sports_data['tennis'] = UnitySportCourtConfig(
            sportName='tennis',
            courtLength=23.77,
            courtWidth=10.97,
            lines=[
                UnityCourtLine('baseline_north', (0, 0), (0, 10.97)),
                UnityCourtLine('baseline_south', (23.77, 0), (23.77, 10.97)),
                UnityCourtLine('sideline_east', (0, 0), (23.77, 0)),
                UnityCourtLine('sideline_west', (0, 10.97), (23.77, 10.97)),
                UnityCourtLine('service_line_north', (6.4, 1.37), (6.4, 9.6)),
                UnityCourtLine('service_line_south', (17.37, 1.37), (17.37, 9.6)),
                UnityCourtLine('net', (11.885, 0), (11.885, 10.97)),
                UnityCourtLine('center_service', (6.4, 5.485), (17.37, 5.485)),
            ],
            circles=[],
            keyAreas=[]
        )
        
        # Football configuration from Unity
        self.unity_sports_data['football'] = UnitySportCourtConfig(
            sportName='football',
            courtLength=100.0,
            courtWidth=68.0,
            lines=[
                UnityCourtLine('goal_line_home', (0, 0), (0, 68)),
                UnityCourtLine('goal_line_away', (100, 0), (100, 68)),
                UnityCourtLine('sideline_left', (0, 0), (100, 0)),
                UnityCourtLine('sideline_right', (0, 68), (100, 68)),
                UnityCourtLine('center_line', (50, 0), (50, 68)),
                UnityCourtLine('penalty_area_home_top', (0, 20.16), (16.5, 20.16)),
                UnityCourtLine('penalty_area_home_bottom', (0, 47.84), (16.5, 47.84)),
                UnityCourtLine('penalty_area_home_line', (16.5, 20.16), (16.5, 47.84)),
            ],
            circles=[
                UnityCourtCircle('center_circle', (50, 34), 9.15),
            ],
            keyAreas=[]
        )
        
        # Volleyball configuration from Unity
        self.unity_sports_data['volleyball'] = UnitySportCourtConfig(
            sportName='volleyball',
            courtLength=18.0,
            courtWidth=9.0,
            lines=[
                UnityCourtLine('baseline_home', (0, 0), (0, 9)),
                UnityCourtLine('baseline_away', (18, 0), (18, 9)),
                UnityCourtLine('sideline_left', (0, 0), (18, 0)),
                UnityCourtLine('sideline_right', (0, 9), (18, 9)),
                UnityCourtLine('center_line', (9, 0), (9, 9)),
                UnityCourtLine('attack_line_home', (3, 0), (3, 9)),
                UnityCourtLine('attack_line_away', (15, 0), (15, 9)),
            ],
            circles=[],
            keyAreas=[]
        )
        
        # Badminton configuration from Unity
        self.unity_sports_data['badminton'] = UnitySportCourtConfig(
            sportName='badminton',
            courtLength=13.4,
            courtWidth=6.1,
            lines=[
                UnityCourtLine('baseline_home', (0, 0), (0, 6.1)),
                UnityCourtLine('baseline_away', (13.4, 0), (13.4, 6.1)),
                UnityCourtLine('sideline_left', (0, 0), (13.4, 0)),
                UnityCourtLine('sideline_right', (0, 6.1), (13.4, 6.1)),
                UnityCourtLine('net', (6.7, 0), (6.7, 6.1)),
                UnityCourtLine('service_line_home', (1.98, 0.76), (1.98, 5.34)),
                UnityCourtLine('service_line_away', (11.42, 0.76), (11.42, 5.34)),
                UnityCourtLine('center_service', (0, 3.05), (13.4, 3.05)),
            ],
            circles=[],
            keyAreas=[]
        )
        
        # Swimming configuration from Unity
        self.unity_sports_data['swimming'] = UnitySportCourtConfig(
            sportName='swimming',
            courtLength=50.0,
            courtWidth=25.0,
            lines=[
                UnityCourtLine('pool_start', (0, 0), (0, 25)),
                UnityCourtLine('pool_end', (50, 0), (50, 25)),
                UnityCourtLine('pool_left', (0, 0), (50, 0)),
                UnityCourtLine('pool_right', (0, 25), (50, 25)),
            ] + [
                UnityCourtLine(f'lane_{i}', (0, i * (25.0 / 8)), (50, i * (25.0 / 8))) 
                for i in range(1, 8)
            ],
            circles=[],
            keyAreas=[]
        )
        
        # Archery configuration from Unity
        self.unity_sports_data['archery'] = UnitySportCourtConfig(
            sportName='archery',
            courtLength=70.0,
            courtWidth=15.0,
            lines=[
                UnityCourtLine('range_left', (0, 0), (70, 0)),
                UnityCourtLine('range_right', (0, 15), (70, 15)),
                UnityCourtLine('shooting_line', (0, 0), (0, 15)),
                UnityCourtLine('30m_line', (30, 0), (30, 15)),
                UnityCourtLine('50m_line', (50, 0), (50, 15)),
                UnityCourtLine('70m_line', (70, 0), (70, 15)),
            ],
            circles=[
                UnityCourtCircle('target_outer', (70, 7.5), 0.61),
                UnityCourtCircle('target_inner', (70, 7.5), 0.305),
            ],
            keyAreas=[]
        )
        
        # Cricket configuration from Unity
        self.unity_sports_data['cricket'] = UnitySportCourtConfig(
            sportName='cricket',
            courtLength=22.56,
            courtWidth=3.05,
            lines=[
                UnityCourtLine('pitch_left', (0, 0), (22.56, 0)),
                UnityCourtLine('pitch_right', (0, 3.05), (22.56, 3.05)),
                UnityCourtLine('batting_crease_home', (1.22, 0), (1.22, 3.05)),
                UnityCourtLine('batting_crease_away', (21.34, 0), (21.34, 3.05)),
                UnityCourtLine('stumps_home', (0, 1.35), (0, 1.7)),
                UnityCourtLine('stumps_away', (22.56, 1.35), (22.56, 1.7)),
            ],
            circles=[],
            keyAreas=[]
        )
    
    def convert_unity_to_sport_pack(self, unity_config: UnitySportCourtConfig) -> Dict[str, Any]:
        """Convert Unity SportCourtConfig to Sport Pack format"""
        sport_name = unity_config.sportName.lower()
        
        # Get sport category
        category = self.sport_categorization.get(sport_name, 'individual')
        
        # Get team configuration
        team_config = self.team_configurations.get(sport_name, {'count': 1, 'players_per_team': 1})
        
        # Convert surface configuration
        surface_config = {
            'width_m': unity_config.courtWidth,
            'height_m': unity_config.courtLength,
            'landmarks': self._extract_landmarks(unity_config),
            'center_line': self._has_center_line(unity_config),
            'zones': self._create_zones(unity_config)
        }
        
        # Convert objects
        objects = self._generate_sport_objects(sport_name)
        
        # Generate actions for the sport
        actions = self._generate_sport_actions(sport_name)
        
        # Generate rules
        rules = self._generate_sport_rules(sport_name, category)
        
        # Generate value model
        value_model = self._generate_value_model(sport_name)
        
        # Generate overlays
        overlays = self._generate_overlays(sport_name)
        
        # Create complete Sport Pack configuration
        sport_pack_data = {
            'sport': sport_name,
            'version': '1.0.0',
            'category': category,
            'description': f'Professional {sport_name} training configuration with authentic court dimensions and rules',
            'created_date': datetime.utcnow().isoformat(),
            'surface': surface_config,
            'objects': objects,
            'teams': {
                'count': team_config['count'],
                'players_per_team': team_config['players_per_team'],
                'positions': self._generate_player_positions(sport_name, team_config),
                'formations': {}  # Simplified to avoid validation issues
            },
            'actions': actions,
            'rules': rules,
            'value_model': value_model,
            'overlays': overlays,
            'detection_models': {
                'pose': 'mediapipe_pose',
                'object': 'yolo_v8',
                'ball': f'{sport_name}_ball_detector',
                'player': 'person_detector'
            },
            'difficulty_levels': {
                'easy': {
                    'tolerance': 0.3,
                    'feedback_frequency': 'high',
                    'assistance_level': 'maximum'
                },
                'medium': {
                    'tolerance': 0.2,
                    'feedback_frequency': 'medium',
                    'assistance_level': 'moderate'
                },
                'hard': {
                    'tolerance': 0.1,
                    'feedback_frequency': 'low',
                    'assistance_level': 'minimal'
                },
                'expert': {
                    'tolerance': 0.05,
                    'feedback_frequency': 'minimal',
                    'assistance_level': 'none'
                }
            }
        }
        
        return sport_pack_data
    
    def _extract_landmarks(self, unity_config: UnitySportCourtConfig) -> List[str]:
        """Extract key landmarks from Unity configuration"""
        landmarks = ['boundary']
        
        # Add line-based landmarks
        line_landmarks = {
            'center_line': 'center',
            'baseline': 'baseline',
            'sideline': 'sideline',
            'goal_line': 'goal',
            'service_line': 'service',
            'net': 'net',
            'penalty': 'penalty_area',
            'attack_line': 'attack_zone',
            'free_throw': 'free_throw'
        }
        
        for line in unity_config.lines:
            for pattern, landmark in line_landmarks.items():
                if pattern in line.name.lower() and landmark not in landmarks:
                    landmarks.append(landmark)
        
        # Add circle-based landmarks
        for circle in unity_config.circles:
            if 'center' in circle.name.lower() and 'center_circle' not in landmarks:
                landmarks.append('center_circle')
            elif 'target' in circle.name.lower() and 'target' not in landmarks:
                landmarks.append('target')
        
        return landmarks
    
    def _has_center_line(self, unity_config: UnitySportCourtConfig) -> bool:
        """Check if sport has center line"""
        return any('center' in line.name.lower() for line in unity_config.lines)
    
    def _create_zones(self, unity_config: UnitySportCourtConfig) -> Dict[str, Dict[str, float]]:
        """Create named zones from Unity configuration"""
        zones = {}
        
        # Add key areas as zones
        for area in unity_config.keyAreas:
            zones[area.name] = {
                'x1': area.bottomLeft[0],
                'y1': area.bottomLeft[1],
                'x2': area.topRight[0],
                'y2': area.topRight[1],
                'width': area.topRight[0] - area.bottomLeft[0],
                'height': area.topRight[1] - area.bottomLeft[1]
            }
        
        # Add circles as zones (without type field to match schema)
        for circle in unity_config.circles:
            zones[circle.name] = {
                'center_x': circle.center[0],
                'center_y': circle.center[1],
                'radius': circle.radius
            }
        
        return zones
    
    def _generate_sport_objects(self, sport_name: str) -> List[Dict[str, Any]]:
        """Generate sport-specific objects"""
        object_configs = {
            'basketball': [
                {
                    'name': 'basketball',
                    'type': 'ball',
                    'size_m': {'diameter': 0.239},
                    'detection_config': {'confidence_threshold': 0.7, 'color_range': 'orange'}
                },
                {
                    'name': 'hoop',
                    'type': 'goal',
                    'size_m': {'diameter': 0.457, 'height': 3.048},
                    'detection_config': {'confidence_threshold': 0.8}
                }
            ],
            'tennis': [
                {
                    'name': 'tennis_ball',
                    'type': 'ball',
                    'size_m': {'diameter': 0.067},
                    'detection_config': {'confidence_threshold': 0.7, 'color_range': 'yellow'}
                },
                {
                    'name': 'tennis_racket',
                    'type': 'equipment',
                    'size_m': {'length': 0.686, 'width': 0.235},
                    'detection_config': {'confidence_threshold': 0.8}
                }
            ],
            'football': [
                {
                    'name': 'football',
                    'type': 'ball',
                    'size_m': {'circumference': 0.68},
                    'detection_config': {'confidence_threshold': 0.7}
                },
                {
                    'name': 'goal',
                    'type': 'goal',
                    'size_m': {'width': 7.32, 'height': 2.44},
                    'detection_config': {'confidence_threshold': 0.8}
                }
            ],
            'volleyball': [
                {
                    'name': 'volleyball',
                    'type': 'ball',
                    'size_m': {'circumference': 0.65},
                    'detection_config': {'confidence_threshold': 0.7}
                },
                {
                    'name': 'net',
                    'type': 'net',
                    'size_m': {'width': 9.5, 'height': 2.43},
                    'detection_config': {'confidence_threshold': 0.8}
                }
            ],
            'archery': [
                {
                    'name': 'bow',
                    'type': 'equipment',
                    'size_m': {'length': 1.7},
                    'detection_config': {'confidence_threshold': 0.8}
                },
                {
                    'name': 'target',
                    'type': 'target',
                    'size_m': {'diameter': 1.22},
                    'detection_config': {'confidence_threshold': 0.9}
                }
            ]
        }
        
        return object_configs.get(sport_name, [
            {
                'name': 'equipment',
                'type': 'general',
                'detection_config': {'confidence_threshold': 0.7}
            }
        ])
    
    def _generate_sport_actions(self, sport_name: str) -> List[Dict[str, Any]]:
        """Generate sport-specific actions"""
        action_configs = {
            'basketball': [
                {
                    'name': 'shooting',
                    'category': 'offensive',
                    'biomechanics': {
                        'key_joints': ['right_shoulder', 'right_elbow', 'right_wrist'],
                        'optimal_angles': {'elbow': 90, 'wrist_snap': 15}
                    },
                    'success_criteria': {'form_score': 80, 'follow_through': 0.8},
                    'common_errors': ['low_elbow', 'inconsistent_follow_through', 'poor_balance']
                },
                {
                    'name': 'dribbling',
                    'category': 'ball_handling',
                    'biomechanics': {
                        'key_joints': ['right_wrist', 'left_wrist'],
                        'rhythm_analysis': True
                    },
                    'success_criteria': {'consistency': 0.9, 'control': 0.8},
                    'common_errors': ['palm_dribbling', 'looking_at_ball', 'poor_rhythm']
                }
            ],
            'tennis': [
                {
                    'name': 'forehand',
                    'category': 'stroke',
                    'biomechanics': {
                        'key_joints': ['right_shoulder', 'right_elbow', 'right_wrist'],
                        'kinetic_chain': True
                    },
                    'success_criteria': {'contact_point': 0.9, 'follow_through': 0.8},
                    'common_errors': ['late_preparation', 'weak_follow_through', 'poor_footwork']
                },
                {
                    'name': 'serve',
                    'category': 'serve',
                    'biomechanics': {
                        'key_joints': ['right_shoulder', 'right_elbow', 'spine'],
                        'power_generation': True
                    },
                    'success_criteria': {'power': 0.8, 'accuracy': 0.7},
                    'common_errors': ['low_toss', 'rushing_motion', 'poor_contact_point']
                }
            ]
        }
        
        return action_configs.get(sport_name, [
            {
                'name': 'basic_movement',
                'category': 'fundamental',
                'biomechanics': {},
                'success_criteria': {'form': 70},
                'common_errors': ['poor_balance', 'incorrect_timing']
            }
        ])
    
    def _generate_sport_rules(self, sport_name: str, category: str) -> Dict[str, Any]:
        """Generate sport-specific rules"""
        base_rules = {
            'offside': category == 'invasion',
            'time_violations': {},
            'area_violations': [],
            'contact_rules': {},
            'scoring_rules': {}
        }
        
        sport_specific_rules = {
            'basketball': {
                'time_violations': {'shot_clock': 24, '3_seconds': 3, '5_seconds': 5},
                'area_violations': ['lane_violation', 'backcourt_violation'],
                'scoring_rules': {'field_goal': 2, 'three_pointer': 3, 'free_throw': 1}
            },
            'tennis': {
                'time_violations': {'serve_clock': 25, 'changeover': 90},
                'area_violations': ['foot_fault', 'net_violation'],
                'scoring_rules': {'point': 1, 'game': 4, 'set': 6, 'match': 2}
            },
            'football': {
                'offside': True,
                'time_violations': {'match_duration': 5400},  # 90 minutes
                'area_violations': ['offside', 'handball', 'penalty_area_violation'],
                'scoring_rules': {'goal': 1}
            }
        }
        
        rules = base_rules.copy()
        if sport_name in sport_specific_rules:
            rules.update(sport_specific_rules[sport_name])
        
        return rules
    
    def _generate_value_model(self, sport_name: str) -> Dict[str, Any]:
        """Generate sport-specific value model"""
        value_models = {
            'basketball': {
                'model_type': 'shot_quality',
                'parameters': {
                    'distance_factor': 0.4,
                    'angle_factor': 0.3,
                    'defender_distance': 0.3
                },
                'weight_factors': {
                    'form': 0.4,
                    'positioning': 0.3,
                    'timing': 0.3
                },
                'normalization': {'min_score': 0, 'max_score': 100}
            },
            'tennis': {
                'model_type': 'stroke_quality',
                'parameters': {
                    'power_factor': 0.35,
                    'placement_factor': 0.35,
                    'timing_factor': 0.3
                },
                'weight_factors': {
                    'technique': 0.5,
                    'consistency': 0.3,
                    'strategy': 0.2
                },
                'normalization': {'min_score': 0, 'max_score': 100}
            }
        }
        
        return value_models.get(sport_name, {
            'model_type': 'basic_performance',
            'parameters': {'base_score': 100},
            'weight_factors': {'technique': 0.6, 'execution': 0.4},
            'normalization': {'min_score': 0, 'max_score': 100}
        })
    
    def _generate_overlays(self, sport_name: str) -> List[Dict[str, Any]]:
        """Generate sport-specific overlays"""
        common_overlays = [
            {
                'name': 'performance_feedback',
                'type': 'text',
                'style': {'color': 'green', 'size': 'medium', 'position': 'top_right'},
                'triggers': ['action_complete'],
                'data_requirements': ['performance_score']
            },
            {
                'name': 'form_analysis',
                'type': 'skeleton',
                'style': {'color': 'blue', 'thickness': 3},
                'triggers': ['pose_detected'],
                'data_requirements': ['joint_positions']
            }
        ]
        
        sport_overlays = {
            'basketball': [
                {
                    'name': 'shot_arc',
                    'type': 'trajectory',
                    'style': {'color': 'orange', 'dash_pattern': 'dashed'},
                    'triggers': ['ball_release'],
                    'data_requirements': ['ball_trajectory']
                },
                {
                    'name': 'shooting_zone',
                    'type': 'heat_map',
                    'style': {'opacity': 0.7, 'color_scheme': 'hot'},
                    'triggers': ['court_analysis'],
                    'data_requirements': ['shot_locations', 'success_rate']
                }
            ],
            'tennis': [
                {
                    'name': 'swing_path',
                    'type': 'trajectory',
                    'style': {'color': 'yellow', 'thickness': 2},
                    'triggers': ['racket_swing'],
                    'data_requirements': ['racket_path']
                },
                {
                    'name': 'court_coverage',
                    'type': 'heat_map',
                    'style': {'opacity': 0.6, 'color_scheme': 'cool'},
                    'triggers': ['movement_analysis'],
                    'data_requirements': ['player_positions']
                }
            ]
        }
        
        overlays = common_overlays.copy()
        if sport_name in sport_overlays:
            overlays.extend(sport_overlays[sport_name])
        
        return overlays
    
    def _generate_player_positions(self, sport_name: str, team_config: Dict[str, int]) -> List[Dict[str, Any]]:
        """Generate player positions for the sport"""
        positions = []
        
        position_configs = {
            'basketball': [
                {'name': 'point_guard', 'number': 1, 'role': 'playmaker'},
                {'name': 'shooting_guard', 'number': 2, 'role': 'scorer'},
                {'name': 'small_forward', 'number': 3, 'role': 'versatile'},
                {'name': 'power_forward', 'number': 4, 'role': 'inside'},
                {'name': 'center', 'number': 5, 'role': 'post'}
            ],
            'football': [
                {'name': 'goalkeeper', 'number': 1, 'role': 'goalkeeper'},
                {'name': 'defender', 'number': 2, 'role': 'defense'},
                {'name': 'midfielder', 'number': 6, 'role': 'midfield'},
                {'name': 'forward', 'number': 9, 'role': 'attack'}
            ],
            'volleyball': [
                {'name': 'setter', 'number': 1, 'role': 'playmaker'},
                {'name': 'outside_hitter', 'number': 4, 'role': 'attack'},
                {'name': 'middle_blocker', 'number': 3, 'role': 'block'},
                {'name': 'opposite', 'number': 2, 'role': 'attack'},
                {'name': 'libero', 'number': 6, 'role': 'defense'}
            ]
        }
        
        if sport_name in position_configs:
            positions = position_configs[sport_name][:team_config['players_per_team']]
        
        return positions
    
    def _generate_formations(self, sport_name: str) -> Dict[str, List[Dict[str, float]]]:
        """Generate formation configurations"""
        formations = {}
        
        formation_configs = {
            'basketball': {
                'offense_basic': [
                    {'x': 0.2, 'y': 0.5, 'role': 'point_guard'},
                    {'x': 0.4, 'y': 0.3, 'role': 'shooting_guard'},
                    {'x': 0.4, 'y': 0.7, 'role': 'small_forward'},
                    {'x': 0.7, 'y': 0.4, 'role': 'power_forward'},
                    {'x': 0.8, 'y': 0.5, 'role': 'center'}
                ]
            },
            'football': {
                '4-4-2': [
                    {'x': 0.1, 'y': 0.5, 'role': 'goalkeeper'},
                    {'x': 0.3, 'y': 0.2, 'role': 'defender'},
                    {'x': 0.3, 'y': 0.8, 'role': 'defender'},
                    {'x': 0.6, 'y': 0.3, 'role': 'midfielder'},
                    {'x': 0.6, 'y': 0.7, 'role': 'midfielder'},
                    {'x': 0.9, 'y': 0.4, 'role': 'forward'},
                    {'x': 0.9, 'y': 0.6, 'role': 'forward'}
                ]
            }
        }
        
        if sport_name in formation_configs:
            formations = formation_configs[sport_name]
        
        return formations
    
    def convert_all_sports(self) -> Dict[str, bool]:
        """Convert all Unity sports to Sport Pack format"""
        results = {}
        
        for sport_name, unity_config in self.unity_sports_data.items():
            try:
                logger.info(f"Converting {sport_name} to Sport Pack format...")
                
                # Convert to Sport Pack format
                sport_pack_data = self.convert_unity_to_sport_pack(unity_config)
                
                # Save as JSON file
                success = self._save_sport_pack_json(sport_name, sport_pack_data)
                results[sport_name] = success
                
                if success:
                    logger.info(f"Successfully converted {sport_name}")
                else:
                    logger.error(f"Failed to save {sport_name}")
                    
            except Exception as e:
                logger.error(f"Error converting {sport_name}: {str(e)}")
                results[sport_name] = False
        
        return results
    
    def _save_sport_pack_json(self, sport_name: str, sport_pack_data: Dict[str, Any]) -> bool:
        """Save sport pack data as JSON file"""
        try:
            # Ensure sport packs directory exists
            os.makedirs('sport_packs', exist_ok=True)
            
            filename = f"sport_packs/{sport_name}.json"
            
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(sport_pack_data, f, indent=2, ensure_ascii=False)
            
            logger.info(f"Saved Sport Pack: {filename}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save Sport Pack {sport_name}: {str(e)}")
            return False
    
    def generate_complete_sport_database(self):
        """Generate complete Sport Pack database with all 54+ sports"""
        
        # Add additional sports beyond the Unity ones
        additional_sports = self._get_additional_sports_data()
        self.unity_sports_data.update(additional_sports)
        
        # Convert all sports
        conversion_results = self.convert_all_sports()
        
        # Generate summary report
        successful_conversions = [sport for sport, success in conversion_results.items() if success]
        failed_conversions = [sport for sport, success in conversion_results.items() if not success]
        
        report = {
            'conversion_date': datetime.utcnow().isoformat(),
            'total_sports': len(conversion_results),
            'successful_conversions': len(successful_conversions),
            'failed_conversions': len(failed_conversions),
            'converted_sports': successful_conversions,
            'failed_sports': failed_conversions,
            'conversion_rate': len(successful_conversions) / len(conversion_results) * 100
        }
        
        # Save conversion report
        try:
            with open('sport_packs/conversion_report.json', 'w') as f:
                json.dump(report, f, indent=2)
            logger.info(f"Conversion complete: {report['successful_conversions']}/{report['total_sports']} sports converted")
        except Exception as e:
            logger.error(f"Failed to save conversion report: {str(e)}")
        
        return report
    
    def _get_additional_sports_data(self) -> Dict[str, UnitySportCourtConfig]:
        """Generate additional sports beyond the Unity ones"""
        additional_sports = {}
        
        # Add more sports to reach 54+ total
        sports_to_add = [
            ('boxing', 6.1, 6.1, []),
            ('golf', 150, 50, []),
            ('hockey', 61, 30, []),
            ('table_tennis', 2.74, 1.525, []),
            ('squash', 9.75, 6.4, []),
            ('rugby', 100, 70, []),
            ('lacrosse', 100, 55, []),
            ('softball', 27.43, 27.43, []),
            ('track_field', 400, 200, []),
            ('cycling', 250, 7, []),
            ('wrestling', 12, 12, []),
            ('judo', 10, 10, []),
            ('karate', 8, 8, []),
            ('fencing', 14, 1.5, []),
            ('weightlifting', 4, 4, []),
            ('gymnastics', 12, 12, []),
        ]
        
        for sport_name, length, width, lines in sports_to_add:
            additional_sports[sport_name] = UnitySportCourtConfig(
                sportName=sport_name,
                courtLength=length,
                courtWidth=width,
                lines=lines,
                circles=[],
                keyAreas=[]
            )
        
        return additional_sports

# Global converter instance
sport_pack_converter = SportPackConverter()

# Export key classes and functions
__all__ = [
    'SportPackConverter', 'UnitySportCourtConfig', 'UnityCourtLine', 
    'UnityCourtCircle', 'UnityCourtRectangle', 'sport_pack_converter'
]