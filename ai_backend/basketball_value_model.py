#!/usr/bin/env python3
"""
Basketball Value Model System - Advanced Shot Quality and Position Analysis
Implements xT-style expected threat models, shot quality analysis, and passing lane detection
Production-grade implementation with comprehensive basketball intelligence
"""

import json
import logging
import numpy as np
import math
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import asyncio
from custom_exceptions import CalculationError
from concurrent.futures import ThreadPoolExecutor

from sport_pack_system import sport_pack_loader

logger = logging.getLogger(__name__)

class ShotType(Enum):
    """Types of basketball shots"""
    LAYUP = "layup"
    CLOSE_RANGE = "close_range"
    MID_RANGE = "mid_range"
    THREE_POINTER = "three_pointer"
    FREE_THROW = "free_throw"

class DefensivePressure(Enum):
    """Levels of defensive pressure"""
    NONE = "none"
    LIGHT = "light"
    MODERATE = "moderate"
    HEAVY = "heavy"
    CONTESTED = "contested"

@dataclass
class ShotContext:
    """Context for shot analysis"""
    position: Tuple[float, float]
    shot_type: ShotType
    distance_to_basket: float
    angle_to_basket: float
    defensive_pressure: DefensivePressure
    open_passing_lanes: int
    time_on_shot_clock: float
    fatigue_level: float
    shooter_skill_rating: float

@dataclass
class ShotQualityMetrics:
    """Comprehensive shot quality metrics"""
    overall_quality: float
    distance_factor: float
    angle_factor: float
    defensive_factor: float
    situational_factor: float
    expected_points: float
    make_probability: float
    shot_value: float

@dataclass
class ExpectedThreat:
    """Expected Threat (xT) model for basketball positions"""
    position: Tuple[float, float]
    xt_value: float
    shot_threat: float
    pass_threat: float
    drive_threat: float
    zone_multiplier: float

@dataclass
class PassingLane:
    """Passing lane analysis"""
    start_position: Tuple[float, float]
    end_position: Tuple[float, float]
    success_probability: float
    intercept_risk: float
    value_added: float
    passing_difficulty: float

class BasketballValueModel:
    """Advanced basketball value model with shot quality and xT analysis"""
    
    def __init__(self):
        self.court_zones = {}
        self.shot_charts = {}
        self.xt_grid = None
        self.defensive_impact_model = {}
        
        # Performance tracking
        self.analysis_metrics = {
            'total_shots_analyzed': 0,
            'total_positions_evaluated': 0,
            'avg_shot_quality': 0.0,
            'avg_xt_value': 0.0
        }
        
        # Initialize basketball-specific models
        self._initialize_court_zones()
        self._initialize_shot_quality_model()
        self._initialize_xt_model()
        self._initialize_defensive_model()
        
        logger.info("Basketball Value Model initialized with comprehensive analytics")
    
    def _initialize_court_zones(self):
        """Initialize basketball court zones with value mappings"""
        # NBA regulation court dimensions (28.65m x 15.24m)
        self.court_zones = {
            'restricted_area': {
                'boundaries': {'center': (0, 7.62), 'radius': 1.22},
                'shot_multiplier': 1.2,
                'base_quality': 0.9,
                'expected_fg': 0.65
            },
            'paint': {
                'boundaries': {'x1': 0, 'y1': 3.66, 'x2': 5.8, 'y2': 11.58},
                'shot_multiplier': 1.1,
                'base_quality': 0.8,
                'expected_fg': 0.55
            },
            'free_throw_line': {
                'boundaries': {'x1': 5.8, 'y1': 3.66, 'x2': 5.8, 'y2': 11.58},
                'shot_multiplier': 1.0,
                'base_quality': 0.7,
                'expected_fg': 0.45
            },
            'mid_range': {
                'boundaries': {'x1': 5.8, 'y1': 0, 'x2': 6.75, 'y2': 15.24},
                'shot_multiplier': 0.9,
                'base_quality': 0.6,
                'expected_fg': 0.42
            },
            'three_point_zone': {
                'boundaries': {'distance_threshold': 6.75},
                'shot_multiplier': 1.5,  # 3-point shots worth more
                'base_quality': 0.5,
                'expected_fg': 0.35
            },
            'corner_three': {
                'boundaries': {'x1': 0, 'y1': 0, 'x2': 6.75, 'y2': 3.05},
                'shot_multiplier': 1.6,  # Corner 3s are most valuable
                'base_quality': 0.7,
                'expected_fg': 0.42
            }
        }
    
    def _initialize_shot_quality_model(self):
        """Initialize advanced shot quality model"""
        self.shot_charts = {
            'distance_decay': {
                'optimal_distance': 1.5,  # meters from basket
                'decay_rate': 0.15,
                'min_quality': 0.2
            },
            'angle_preferences': {
                'front_basket': {'angle': 0, 'multiplier': 1.0},
                'slight_angle': {'angle': 15, 'multiplier': 0.95},
                'side_angle': {'angle': 45, 'multiplier': 0.85},
                'extreme_angle': {'angle': 75, 'multiplier': 0.7}
            },
            'defensive_impact': {
                DefensivePressure.NONE: 1.0,
                DefensivePressure.LIGHT: 0.9,
                DefensivePressure.MODERATE: 0.75,
                DefensivePressure.HEAVY: 0.6,
                DefensivePressure.CONTESTED: 0.4
            },
            'shot_type_modifiers': {
                ShotType.LAYUP: {'base_quality': 0.9, 'variance': 0.1},
                ShotType.CLOSE_RANGE: {'base_quality': 0.8, 'variance': 0.15},
                ShotType.MID_RANGE: {'base_quality': 0.6, 'variance': 0.2},
                ShotType.THREE_POINTER: {'base_quality': 0.5, 'variance': 0.25},
                ShotType.FREE_THROW: {'base_quality': 0.85, 'variance': 0.05}
            }
        }
    
    def _initialize_xt_model(self):
        """Initialize Expected Threat (xT) model for basketball"""
        # Create xT grid for basketball court (similar to football xG)
        court_width = 15.24
        court_length = 28.65
        grid_size = 1.0  # 1m x 1m grid
        
        width_bins = int(court_width / grid_size)
        length_bins = int(court_length / grid_size)
        
        self.xt_grid = np.zeros((length_bins, width_bins))
        
        # Populate xT values based on court position
        for i in range(length_bins):
            for j in range(width_bins):
                x_pos = i * grid_size
                y_pos = j * grid_size
                
                # Calculate xT based on distance to basket and court zone
                xt_value = self._calculate_base_xt(x_pos, y_pos, court_length, court_width)
                self.xt_grid[i, j] = xt_value
        
        logger.info(f"Initialized xT grid: {length_bins}x{width_bins} with max xT: {np.max(self.xt_grid):.3f}")
    
    def _calculate_base_xt(self, x: float, y: float, court_length: float, court_width: float) -> float:
        """Calculate base Expected Threat value for position"""
        # Distance to nearest basket
        basket1_dist = math.sqrt(x**2 + (y - court_width/2)**2)
        basket2_dist = math.sqrt((court_length - x)**2 + (y - court_width/2)**2)
        distance_to_basket = min(basket1_dist, basket2_dist)
        
        # Base xT decreases with distance
        if distance_to_basket <= 1.5:  # Under basket
            return 0.95
        elif distance_to_basket <= 3.0:  # Close range
            return 0.8
        elif distance_to_basket <= 6.75:  # Mid range
            return 0.4
        elif distance_to_basket <= 8.0:  # Three point range
            return 0.6  # 3-pointers have higher value despite lower %
        else:  # Deep three
            return 0.3
    
    def _initialize_defensive_model(self):
        """Initialize defensive impact model"""
        self.defensive_impact_model = {
            'distance_thresholds': {
                'tight_defense': 1.0,  # meters
                'close_defense': 2.0,
                'moderate_defense': 3.0,
                'loose_defense': 4.0
            },
            'pressure_multipliers': {
                'tight_defense': 0.4,
                'close_defense': 0.6,
                'moderate_defense': 0.8,
                'loose_defense': 0.95
            },
            'help_defense_factor': 0.85,
            'transition_defense_factor': 0.7
        }
    
    async def analyze_shot_quality(self, shot_context: ShotContext) -> ShotQualityMetrics:
        """Comprehensive shot quality analysis"""
        try:
            # Calculate individual factors
            distance_factor = self._calculate_distance_factor(
                shot_context.distance_to_basket, 
                shot_context.shot_type
            )
            
            angle_factor = self._calculate_angle_factor(shot_context.angle_to_basket)
            
            defensive_factor = self._calculate_defensive_factor(
                shot_context.defensive_pressure,
                shot_context.distance_to_basket
            )
            
            situational_factor = self._calculate_situational_factor(
                shot_context.time_on_shot_clock,
                shot_context.fatigue_level,
                shot_context.open_passing_lanes
            )
            
            # Combine factors for overall quality
            base_quality = self.shot_charts['shot_type_modifiers'][shot_context.shot_type]['base_quality']
            
            overall_quality = (
                base_quality * 
                distance_factor * 
                angle_factor * 
                defensive_factor * 
                situational_factor *
                (shot_context.shooter_skill_rating / 100)  # Normalize skill rating
            )
            
            # Calculate expected points and make probability
            points_per_shot = 3.0 if shot_context.shot_type == ShotType.THREE_POINTER else 2.0
            if shot_context.shot_type == ShotType.FREE_THROW:
                points_per_shot = 1.0
            
            make_probability = min(overall_quality, 0.95)  # Cap at 95%
            expected_points = make_probability * points_per_shot
            shot_value = expected_points / points_per_shot  # Normalized value
            
            # Update metrics
            self.analysis_metrics['total_shots_analyzed'] += 1
            current_avg = self.analysis_metrics['avg_shot_quality']
            total_shots = self.analysis_metrics['total_shots_analyzed']
            self.analysis_metrics['avg_shot_quality'] = ((current_avg * (total_shots - 1)) + overall_quality) / total_shots
            
            return ShotQualityMetrics(
                overall_quality=overall_quality,
                distance_factor=distance_factor,
                angle_factor=angle_factor,
                defensive_factor=defensive_factor,
                situational_factor=situational_factor,
                expected_points=expected_points,
                make_probability=make_probability,
                shot_value=shot_value
            )
            
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid shot context data: {str(e)}")
            raise CalculationError(
                f"Invalid shot context parameters: {str(e)}",
                "INVALID_SHOT_CONTEXT",
                {"shot_context": str(shot_context), "error": str(e)}
            )
        except Exception as e:
            logger.error(f"Shot quality analysis failed: {str(e)}")
            raise CalculationError(
                f"Basketball shot quality calculation failed: {str(e)}",
                "SHOT_QUALITY_CALCULATION_ERROR",
                {"shot_context": str(shot_context), "error": str(e)}
            )
    
    def _calculate_distance_factor(self, distance: float, shot_type: ShotType) -> float:
        """Calculate distance impact on shot quality"""
        decay_config = self.shot_charts['distance_decay']
        optimal_distance = decay_config['optimal_distance']
        decay_rate = decay_config['decay_rate']
        min_quality = decay_config['min_quality']
        
        if shot_type == ShotType.FREE_THROW:
            return 1.0  # Free throws are always from same distance
        
        if distance <= optimal_distance:
            return 1.0
        
        # Exponential decay beyond optimal distance
        distance_penalty = math.exp(-decay_rate * (distance - optimal_distance))
        return max(distance_penalty, min_quality)
    
    def _calculate_angle_factor(self, angle_degrees: float) -> float:
        """Calculate angle impact on shot quality"""
        angle_prefs = self.shot_charts['angle_preferences']
        
        # Find closest angle preference
        min_diff = float('inf')
        best_multiplier = 0.7
        
        for pref_name, pref_data in angle_prefs.items():
            angle_diff = abs(angle_degrees - pref_data['angle'])
            if angle_diff < min_diff:
                min_diff = angle_diff
                best_multiplier = pref_data['multiplier']
        
        return best_multiplier
    
    def _calculate_defensive_factor(self, defensive_pressure: DefensivePressure, distance: float) -> float:
        """Calculate defensive impact on shot quality"""
        base_factor = self.shot_charts['defensive_impact'][defensive_pressure]
        
        # Defense is less effective on longer shots
        if distance > 6.0:  # Three-point range
            base_factor = min(base_factor * 1.2, 1.0)
        
        return base_factor
    
    def _calculate_situational_factor(self, shot_clock_time: float, fatigue: float, passing_lanes: int) -> float:
        """Calculate situational factors impact"""
        # Shot clock pressure
        if shot_clock_time < 5.0:
            clock_factor = 0.8
        elif shot_clock_time < 10.0:
            clock_factor = 0.9
        else:
            clock_factor = 1.0
        
        # Fatigue impact
        fatigue_factor = max(1.0 - fatigue, 0.6)
        
        # Passing options (more options = less pressure to shoot)
        if passing_lanes >= 3:
            options_factor = 1.1
        elif passing_lanes >= 2:
            options_factor = 1.0
        else:
            options_factor = 0.9
        
        return clock_factor * fatigue_factor * options_factor
    
    async def calculate_expected_threat(self, position: Tuple[float, float], 
                                       player_skill: float = 80.0) -> ExpectedThreat:
        """Calculate Expected Threat (xT) for given position"""
        try:
            x, y = position
            
            # Get base xT from grid
            grid_x = int(x / 1.0)  # 1m grid
            grid_y = int(y / 1.0)
            
            # Ensure grid is initialized and within bounds
            if self.xt_grid is None:
                raise CalculationError(
                    "Expected threat grid not initialized", 
                    "XT_GRID_NOT_INITIALIZED",
                    {"position": position}
                )
            
            grid_x = max(0, min(grid_x, self.xt_grid.shape[0] - 1))
            grid_y = max(0, min(grid_y, self.xt_grid.shape[1] - 1))
            
            base_xt = self.xt_grid[grid_x, grid_y]
            
            # Calculate specific threat components
            shot_threat = self._calculate_shot_threat(position)
            pass_threat = self._calculate_pass_threat(position)
            drive_threat = self._calculate_drive_threat(position)
            
            # Zone multiplier based on court area
            zone_multiplier = self._get_zone_multiplier(position)
            
            # Adjust for player skill
            skill_multiplier = player_skill / 100.0
            
            final_xt = base_xt * zone_multiplier * skill_multiplier
            
            # Update metrics
            self.analysis_metrics['total_positions_evaluated'] += 1
            current_avg = self.analysis_metrics['avg_xt_value']
            total_positions = self.analysis_metrics['total_positions_evaluated']
            self.analysis_metrics['avg_xt_value'] = ((current_avg * (total_positions - 1)) + final_xt) / total_positions
            
            return ExpectedThreat(
                position=position,
                xt_value=final_xt,
                shot_threat=shot_threat,
                pass_threat=pass_threat,
                drive_threat=drive_threat,
                zone_multiplier=zone_multiplier
            )
            
        except (ValueError, TypeError) as e:
            logger.error(f"Invalid position or skill data: {str(e)}")
            raise CalculationError(
                f"Invalid expected threat parameters: {str(e)}",
                "INVALID_XT_PARAMETERS",
                {"position": str(position), "player_skill": player_skill, "error": str(e)}
            )
        except Exception as e:
            logger.error(f"xT calculation failed: {str(e)}")
            raise CalculationError(
                f"Expected threat calculation failed: {str(e)}",
                "XT_CALCULATION_ERROR",
                {"position": str(position), "player_skill": player_skill, "error": str(e)}
            )
    
    def _calculate_shot_threat(self, position: Tuple[float, float]) -> float:
        """Calculate shooting threat from position"""
        x, y = position
        court_width = 15.24
        
        # Distance to nearest basket
        basket1_dist = math.sqrt(x**2 + (y - court_width/2)**2)
        basket2_dist = math.sqrt((28.65 - x)**2 + (y - court_width/2)**2)
        distance = min(basket1_dist, basket2_dist)
        
        # Shot threat decreases with distance but has 3-point bonus
        if distance <= 2.0:
            return 0.9
        elif distance <= 6.75:
            return 0.6
        elif distance <= 8.0:
            return 0.7  # Three-point bonus
        else:
            return 0.3
    
    def _calculate_pass_threat(self, position: Tuple[float, float]) -> float:
        """Calculate passing threat from position"""
        x, y = position
        court_width = 15.24
        
        # Center court has highest passing threat
        distance_from_center = abs(y - court_width/2)
        center_factor = 1.0 - (distance_from_center / (court_width/2)) * 0.3
        
        # Frontcourt vs backcourt
        if x < 14.325:  # Backcourt
            court_factor = 0.8
        else:  # Frontcourt
            court_factor = 1.0
        
        return center_factor * court_factor
    
    def _calculate_drive_threat(self, position: Tuple[float, float]) -> float:
        """Calculate driving threat from position"""
        x, y = position
        
        # Driving threat highest in frontcourt
        if x > 20.0:  # Close to basket
            return 0.9
        elif x > 14.325:  # Frontcourt
            return 0.7
        else:  # Backcourt
            return 0.3
    
    def _get_zone_multiplier(self, position: Tuple[float, float]) -> float:
        """Get zone-based multiplier for position value"""
        x, y = position
        
        # Check if in high-value zones
        for zone_name, zone_data in self.court_zones.items():
            if self._is_in_zone(position, zone_data['boundaries']):
                return zone_data.get('shot_multiplier', 1.0)
        
        return 1.0  # Default multiplier
    
    def _is_in_zone(self, position: Tuple[float, float], boundaries: Dict[str, Any]) -> bool:
        """Check if position is within zone boundaries"""
        x, y = position
        
        if 'radius' in boundaries:
            # Circular zone
            center_x, center_y = boundaries['center']
            radius = boundaries['radius']
            distance = math.sqrt((x - center_x)**2 + (y - center_y)**2)
            return distance <= radius
        elif 'distance_threshold' in boundaries:
            # Distance-based zone (e.g., three-point line)
            court_width = 15.24
            basket_dist = min(
                math.sqrt(x**2 + (y - court_width/2)**2),
                math.sqrt((28.65 - x)**2 + (y - court_width/2)**2)
            )
            return basket_dist >= boundaries['distance_threshold']
        else:
            # Rectangular zone
            x1, y1 = boundaries.get('x1', 0), boundaries.get('y1', 0)
            x2, y2 = boundaries.get('x2', 100), boundaries.get('y2', 100)
            return x1 <= x <= x2 and y1 <= y <= y2
    
    async def analyze_passing_lanes(self, 
                                   passer_position: Tuple[float, float],
                                   receiver_positions: List[Tuple[float, float]],
                                   defender_positions: List[Tuple[float, float]] = []) -> List[PassingLane]:
        """Analyze passing lanes and their success probabilities"""
        passing_lanes = []
        
        for receiver_pos in receiver_positions:
            try:
                # Calculate basic passing metrics
                pass_distance = math.sqrt(
                    (receiver_pos[0] - passer_position[0])**2 + 
                    (receiver_pos[1] - passer_position[1])**2
                )
                
                # Base success probability decreases with distance
                base_success = max(0.95 - (pass_distance * 0.05), 0.3)
                
                # Calculate intercept risk from defenders
                intercept_risk = self._calculate_intercept_risk(
                    passer_position, receiver_pos, defender_positions
                )
                
                # Adjust success probability for intercept risk
                success_probability = base_success * (1.0 - intercept_risk)
                
                # Calculate value added by the pass
                passer_xt = await self.calculate_expected_threat(passer_position)
                receiver_xt = await self.calculate_expected_threat(receiver_pos)
                value_added = receiver_xt.xt_value - passer_xt.xt_value
                
                # Calculate passing difficulty
                passing_difficulty = self._calculate_passing_difficulty(
                    pass_distance, intercept_risk, len(defender_positions)
                )
                
                passing_lanes.append(PassingLane(
                    start_position=passer_position,
                    end_position=receiver_pos,
                    success_probability=success_probability,
                    intercept_risk=intercept_risk,
                    value_added=value_added,
                    passing_difficulty=passing_difficulty
                ))
                
            except Exception as e:
                logger.error(f"Passing lane analysis failed: {str(e)}")
                continue
        
        # Sort by value added (best passes first)
        passing_lanes.sort(key=lambda x: x.value_added, reverse=True)
        
        return passing_lanes
    
    def _calculate_intercept_risk(self, 
                                  passer_pos: Tuple[float, float],
                                  receiver_pos: Tuple[float, float],
                                  defender_positions: List[Tuple[float, float]]) -> float:
        """Calculate risk of pass interception"""
        if not defender_positions:
            return 0.0
        
        max_risk = 0.0
        
        for defender_pos in defender_positions:
            # Calculate if defender is in passing lane
            distance_to_line = self._point_to_line_distance(
                defender_pos, passer_pos, receiver_pos
            )
            
            # Risk increases as defender gets closer to passing lane
            if distance_to_line <= 1.0:  # Within 1m of passing lane
                risk = 0.8 * (1.0 - distance_to_line)
            elif distance_to_line <= 2.0:  # Within 2m
                risk = 0.4 * (2.0 - distance_to_line) / 2.0
            else:
                risk = 0.0
            
            max_risk = max(max_risk, risk)
        
        return min(max_risk, 0.9)  # Cap at 90% risk
    
    def _point_to_line_distance(self, 
                               point: Tuple[float, float],
                               line_start: Tuple[float, float],
                               line_end: Tuple[float, float]) -> float:
        """Calculate perpendicular distance from point to line"""
        x0, y0 = point
        x1, y1 = line_start
        x2, y2 = line_end
        
        # Vector from line_start to line_end
        line_vec = (x2 - x1, y2 - y1)
        line_length = math.sqrt(line_vec[0]**2 + line_vec[1]**2)
        
        if line_length == 0:
            return math.sqrt((x0 - x1)**2 + (y0 - y1)**2)
        
        # Normalize line vector
        line_unit = (line_vec[0] / line_length, line_vec[1] / line_length)
        
        # Vector from line_start to point
        point_vec = (x0 - x1, y0 - y1)
        
        # Project point onto line
        projection_length = point_vec[0] * line_unit[0] + point_vec[1] * line_unit[1]
        projection_length = max(0, min(projection_length, line_length))
        
        # Find closest point on line
        closest_point = (
            x1 + projection_length * line_unit[0],
            y1 + projection_length * line_unit[1]
        )
        
        # Return distance to closest point
        return math.sqrt((x0 - closest_point[0])**2 + (y0 - closest_point[1])**2)
    
    def _calculate_passing_difficulty(self, distance: float, intercept_risk: float, defender_count: int) -> float:
        """Calculate overall passing difficulty"""
        # Distance difficulty
        distance_difficulty = min(distance / 20.0, 0.8)  # Max 80% difficulty from distance
        
        # Intercept difficulty
        intercept_difficulty = intercept_risk
        
        # Defender pressure
        defender_difficulty = min(defender_count * 0.1, 0.3)  # Max 30% from defender count
        
        return min(distance_difficulty + intercept_difficulty + defender_difficulty, 1.0)
    
    def get_analytics_summary(self) -> Dict[str, Any]:
        """Get comprehensive analytics summary"""
        return {
            'performance_metrics': self.analysis_metrics.copy(),
            'model_configuration': {
                'court_zones': len(self.court_zones),
                'xt_grid_size': self.xt_grid.shape if self.xt_grid is not None else None,
                'max_xt_value': float(np.max(self.xt_grid)) if self.xt_grid is not None else 0.0,
                'shot_types_supported': len(ShotType),
                'defensive_levels': len(DefensivePressure)
            },
            'value_model_stats': {
                'avg_shot_quality': self.analysis_metrics['avg_shot_quality'],
                'avg_xt_value': self.analysis_metrics['avg_xt_value'],
                'total_analyses': self.analysis_metrics['total_shots_analyzed'] + self.analysis_metrics['total_positions_evaluated']
            }
        }

# Global basketball value model instance
basketball_value_model = BasketballValueModel()

# Export key classes and functions
__all__ = [
    'BasketballValueModel', 'ShotContext', 'ShotQualityMetrics', 'ExpectedThreat',
    'PassingLane', 'ShotType', 'DefensivePressure', 'basketball_value_model'
]