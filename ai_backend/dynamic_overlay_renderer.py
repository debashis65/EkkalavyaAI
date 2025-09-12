#!/usr/bin/env python3
"""
Dynamic Overlay Renderer - Real-Time Sport Analysis Visualization
Renders sport-specific overlays based on Sport Pack configurations and AI decisions
Supports basketball shot quality, xT heatmaps, passing lanes, and tactical analysis
"""

import json
import logging
import numpy as np
import cv2
import math
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
import asyncio
from concurrent.futures import ThreadPoolExecutor
import base64
from io import BytesIO

from sport_pack_system import sport_pack_loader
from basketball_value_model import basketball_value_model, ShotType, DefensivePressure
from context_understanding_engine import context_understanding_engine, SportContext, ContextType

logger = logging.getLogger(__name__)

class OverlayType(Enum):
    """Types of overlay visualizations"""
    HEATMAP = "heatmap"
    ZONE_HIGHLIGHT = "zone_highlight"
    PASSING_LANES = "passing_lanes"
    SHOT_QUALITY = "shot_quality"
    PLAYER_TRACKING = "player_tracking"
    TACTICAL_ARROWS = "tactical_arrows"
    COURT_LINES = "court_lines"
    VALUE_INDICATORS = "value_indicators"

class VisualizationStyle(Enum):
    """Visual styles for overlays"""
    PROFESSIONAL = "professional"
    BROADCAST = "broadcast"
    COACHING = "coaching"
    TRAINING = "training"

@dataclass
class OverlayElement:
    """Individual overlay element"""
    element_type: OverlayType
    position: Tuple[float, float]
    size: Tuple[float, float]
    color: Tuple[int, int, int, int]  # RGBA
    value: float
    label: str
    confidence: float
    metadata: Dict[str, Any]

@dataclass
class SportOverlay:
    """Complete sport overlay visualization"""
    sport_name: str
    overlay_type: OverlayType
    elements: List[OverlayElement]
    court_dimensions: Tuple[float, float]
    style: VisualizationStyle
    timestamp: float
    frame_data: Optional[bytes]
    analysis_metadata: Dict[str, Any]

class DynamicOverlayRenderer:
    """Advanced overlay renderer for sport-specific visualizations"""
    
    def __init__(self):
        self.overlay_cache = {}
        self.style_configs = {}
        self.court_templates = {}
        
        # Performance tracking
        self.render_metrics = {
            'total_overlays_rendered': 0,
            'avg_render_time_ms': 0.0,
            'cache_hit_rate': 0.0,
            'successful_renders': 0
        }
        
        # Initialize rendering configurations
        self._initialize_style_configs()
        self._initialize_court_templates()
        
        logger.info("Dynamic Overlay Renderer initialized with comprehensive visualization support")
    
    def _initialize_style_configs(self):
        """Initialize visualization style configurations"""
        self.style_configs = {
            VisualizationStyle.PROFESSIONAL: {
                'colors': {
                    'high_value': (46, 204, 113, 180),     # Green
                    'medium_value': (241, 196, 15, 180),   # Yellow
                    'low_value': (231, 76, 60, 180),       # Red
                    'neutral': (149, 165, 166, 120),       # Gray
                    'court_lines': (255, 255, 255, 255),   # White
                    'text': (255, 255, 255, 255)           # White
                },
                'fonts': {
                    'size': 0.8,
                    'thickness': 2,
                    'type': cv2.FONT_HERSHEY_SIMPLEX
                },
                'line_thickness': 3,
                'transparency': 0.7
            },
            VisualizationStyle.BROADCAST: {
                'colors': {
                    'high_value': (0, 255, 0, 200),        # Bright Green
                    'medium_value': (255, 255, 0, 200),    # Bright Yellow
                    'low_value': (255, 0, 0, 200),         # Bright Red
                    'neutral': (128, 128, 128, 150),       # Gray
                    'court_lines': (255, 255, 255, 255),   # White
                    'text': (255, 255, 255, 255)           # White
                },
                'fonts': {
                    'size': 1.0,
                    'thickness': 3,
                    'type': cv2.FONT_HERSHEY_DUPLEX
                },
                'line_thickness': 4,
                'transparency': 0.8
            },
            VisualizationStyle.COACHING: {
                'colors': {
                    'high_value': (76, 175, 80, 160),      # Muted Green
                    'medium_value': (255, 193, 7, 160),    # Muted Yellow
                    'low_value': (244, 67, 54, 160),       # Muted Red
                    'neutral': (158, 158, 158, 100),       # Light Gray
                    'court_lines': (200, 200, 200, 255),   # Light Gray
                    'text': (33, 33, 33, 255)              # Dark Gray
                },
                'fonts': {
                    'size': 0.6,
                    'thickness': 2,
                    'type': cv2.FONT_HERSHEY_SIMPLEX
                },
                'line_thickness': 2,
                'transparency': 0.6
            },
            VisualizationStyle.TRAINING: {
                'colors': {
                    'high_value': (102, 187, 106, 140),    # Soft Green
                    'medium_value': (255, 202, 40, 140),   # Soft Yellow
                    'low_value': (239, 83, 80, 140),       # Soft Red
                    'neutral': (176, 190, 197, 80),        # Very Light Gray
                    'court_lines': (144, 164, 174, 200),   # Muted Gray
                    'text': (55, 71, 79, 255)              # Dark Blue Gray
                },
                'fonts': {
                    'size': 0.5,
                    'thickness': 1,
                    'type': cv2.FONT_HERSHEY_SIMPLEX
                },
                'line_thickness': 1,
                'transparency': 0.5
            }
        }
    
    def _initialize_court_templates(self):
        """Initialize court templates for all supported sports"""
        self.court_templates = {
            'basketball': {
                'width_m': 15.24, 'height_m': 28.65,
                'key_features': {
                    'center_circle': {'center': (14.325, 7.62), 'radius': 1.8},
                    'three_point_arc': {'center': (0, 7.62), 'radius': 6.75},
                    'free_throw_circle': {'center': (5.8, 7.62), 'radius': 1.8},
                    'paint': {'x1': 0, 'y1': 3.66, 'x2': 5.8, 'y2': 11.58},
                    'restricted_area': {'center': (0, 7.62), 'radius': 1.22}
                },
                'render_scale': 20, 'sport_type': 'court'
            },
            'tennis': {
                'width_m': 10.97, 'height_m': 23.77,
                'key_features': {
                    'service_boxes': [
                        {'x1': 0, 'y1': 4.115, 'x2': 6.4, 'y2': 6.86},
                        {'x1': 0, 'y1': 6.86, 'x2': 6.4, 'y2': 9.605}
                    ],
                    'net': {'x': 11.885, 'y1': 0, 'y2': 10.97},
                    'baseline': {'y1': 0, 'y2': 23.77},
                    'doubles_sideline': {'x1': 0, 'x2': 10.97}
                },
                'render_scale': 25, 'sport_type': 'court'
            },
            'football': {
                'width_m': 68.0, 'height_m': 105.0,
                'key_features': {
                    'penalty_area': {'x1': 0, 'y1': 20.15, 'x2': 16.5, 'y2': 47.85},
                    'goal_area': {'x1': 0, 'y1': 26.65, 'x2': 5.5, 'y2': 41.35},
                    'center_circle': {'center': (52.5, 34), 'radius': 9.15},
                    'penalty_spot': {'center': (11.0, 34), 'radius': 0.3}
                },
                'render_scale': 8, 'sport_type': 'field'
            },
            'volleyball': {
                'width_m': 9.0, 'height_m': 18.0,
                'key_features': {
                    'net': {'x': 9.0, 'y1': 0, 'y2': 9.0},
                    'attack_line': {'x1': 6.0, 'x2': 12.0, 'y1': 0, 'y2': 9.0},
                    'service_area': {'x1': 0, 'x2': 3.0, 'y1': 0, 'y2': 9.0}
                },
                'render_scale': 30, 'sport_type': 'court'
            },
            'badminton': {
                'width_m': 6.1, 'height_m': 13.4,
                'key_features': {
                    'net': {'x': 6.7, 'y1': 0, 'y2': 6.1},
                    'service_courts': [
                        {'x1': 0, 'y1': 0, 'x2': 6.7, 'y2': 3.05},
                        {'x1': 6.7, 'y1': 0, 'x2': 13.4, 'y2': 3.05}
                    ],
                    'doubles_sideline': {'x1': 0, 'x2': 13.4}
                },
                'render_scale': 35, 'sport_type': 'court'
            },
            'table_tennis': {
                'width_m': 1.525, 'height_m': 2.74,
                'key_features': {
                    'net': {'x': 1.37, 'y1': 0, 'y2': 1.525},
                    'center_line': {'x1': 0, 'x2': 2.74, 'y': 0.7625}
                },
                'render_scale': 200, 'sport_type': 'table'
            },
            'squash': {
                'width_m': 6.4, 'height_m': 9.75,
                'key_features': {
                    'service_boxes': [
                        {'x1': 0, 'y1': 0, 'x2': 4.87, 'y2': 3.2},
                        {'x1': 4.87, 'y1': 0, 'x2': 9.75, 'y2': 3.2}
                    ],
                    'front_wall': {'x': 0, 'y1': 0, 'y2': 6.4},
                    'back_wall': {'x': 9.75, 'y1': 0, 'y2': 6.4}
                },
                'render_scale': 40, 'sport_type': 'court'
            },
            'cricket': {
                'width_m': 137.16, 'height_m': 137.16,  # Circular field
                'key_features': {
                    'pitch': {'x1': 61.5, 'y1': 66.58, 'x2': 83.5, 'y2': 70.58},
                    'boundary': {'center': (68.58, 68.58), 'radius': 68.58},
                    'wickets': [
                        {'center': (63.5, 68.58), 'width': 0.22},
                        {'center': (73.5, 68.58), 'width': 0.22}
                    ]
                },
                'render_scale': 4, 'sport_type': 'field'
            },
            'hockey': {
                'width_m': 55.0, 'height_m': 91.4,
                'key_features': {
                    'shooting_circle': [
                        {'center': (0, 27.5), 'radius': 14.63},
                        {'center': (91.4, 27.5), 'radius': 14.63}
                    ],
                    'center_line': {'x': 45.7, 'y1': 0, 'y2': 55.0},
                    '25_yard_line': [
                        {'x': 22.85, 'y1': 0, 'y2': 55.0},
                        {'x': 68.55, 'y1': 0, 'y2': 55.0}
                    ]
                },
                'render_scale': 10, 'sport_type': 'field'
            },
            'golf': {
                'width_m': 50.0, 'height_m': 400.0,  # Par 4 hole
                'key_features': {
                    'tee_box': {'x1': 0, 'y1': 20, 'x2': 10, 'y2': 30},
                    'fairway': {'x1': 10, 'y1': 10, 'x2': 350, 'y2': 40},
                    'green': {'center': (380, 25), 'radius': 15},
                    'pin': {'center': (385, 25), 'radius': 0.1}
                },
                'render_scale': 2, 'sport_type': 'course'
            },
            'rugby': {
                'width_m': 70.0, 'height_m': 100.0,
                'key_features': {
                    'try_line': [
                        {'x': 0, 'y1': 0, 'y2': 70.0},
                        {'x': 100.0, 'y1': 0, 'y2': 70.0}
                    ],
                    'halfway_line': {'x': 50.0, 'y1': 0, 'y2': 70.0},
                    '22_meter_line': [
                        {'x': 22.0, 'y1': 0, 'y2': 70.0},
                        {'x': 78.0, 'y1': 0, 'y2': 70.0}
                    ]
                },
                'render_scale': 8, 'sport_type': 'field'
            },
            'american_football': {
                'width_m': 48.8, 'height_m': 109.7,
                'key_features': {
                    'end_zones': [
                        {'x1': 0, 'y1': 0, 'x2': 9.14, 'y2': 48.8},
                        {'x1': 100.56, 'y1': 0, 'x2': 109.7, 'y2': 48.8}
                    ],
                    'goal_lines': [
                        {'x': 9.14, 'y1': 0, 'y2': 48.8},
                        {'x': 100.56, 'y1': 0, 'y2': 48.8}
                    ],
                    'yard_lines': [{'x': 9.14 + i*9.14, 'y1': 0, 'y2': 48.8} for i in range(1, 11)]
                },
                'render_scale': 7, 'sport_type': 'field'
            },
            'baseball': {
                'width_m': 90.0, 'height_m': 90.0,  # Infield diamond
                'key_features': {
                    'diamond': [
                        {'corner': (0, 0)},      # Home plate
                        {'corner': (27.43, 27.43)},  # First base
                        {'corner': (0, 54.86)},      # Second base
                        {'corner': (-27.43, 27.43)}  # Third base
                    ],
                    'pitchers_mound': {'center': (0, 18.44), 'radius': 2.74},
                    'home_plate': {'center': (0, 0), 'size': (0.43, 0.43)}
                },
                'render_scale': 10, 'sport_type': 'field'
            },
            'swimming': {
                'width_m': 25.0, 'height_m': 50.0,
                'key_features': {
                    'lanes': [{'x1': 0, 'x2': 50.0, 'y1': i*2.5, 'y2': (i+1)*2.5} for i in range(8)],
                    'starting_blocks': [{'center': (0, i*2.5 + 1.25), 'size': (1.0, 1.0)} for i in range(8)],
                    'turn_walls': [
                        {'x': 0, 'y1': 0, 'y2': 25.0},
                        {'x': 50.0, 'y1': 0, 'y2': 25.0}
                    ]
                },
                'render_scale': 15, 'sport_type': 'pool'
            },
            'track_field': {
                'width_m': 84.39, 'height_m': 176.91,
                'key_features': {
                    'track': {'inner_radius': 36.5, 'outer_radius': 45.72},
                    'lanes': 8,
                    'field_events': {
                        'long_jump': {'x1': 40, 'y1': 30, 'x2': 50, 'y2': 35},
                        'shot_put': {'center': (42.195, 20), 'radius': 15},
                        'javelin': {'x1': 30, 'y1': 50, 'x2': 35, 'y2': 70}
                    }
                },
                'render_scale': 5, 'sport_type': 'track'
            },
            'boxing': {
                'width_m': 6.1, 'height_m': 6.1,
                'key_features': {
                    'ring': {'x1': 0.5, 'y1': 0.5, 'x2': 5.6, 'y2': 5.6},
                    'center': {'center': (3.05, 3.05), 'radius': 0.3},
                    'corners': [
                        {'position': (0.5, 0.5)}, {'position': (5.6, 0.5)},
                        {'position': (5.6, 5.6)}, {'position': (0.5, 5.6)}
                    ]
                },
                'render_scale': 50, 'sport_type': 'ring'
            },
            'wrestling': {
                'width_m': 9.0, 'height_m': 9.0,
                'key_features': {
                    'circle': {'center': (4.5, 4.5), 'radius': 4.5},
                    'center_circle': {'center': (4.5, 4.5), 'radius': 1.0},
                    'passivity_zone': {'center': (4.5, 4.5), 'radius': 3.5}
                },
                'render_scale': 35, 'sport_type': 'mat'
            },
            'judo': {
                'width_m': 10.0, 'height_m': 10.0,
                'key_features': {
                    'contest_area': {'center': (5.0, 5.0), 'radius': 4.0},
                    'safety_area': {'center': (5.0, 5.0), 'radius': 5.0},
                    'center': {'center': (5.0, 5.0), 'radius': 0.1}
                },
                'render_scale': 30, 'sport_type': 'mat'
            },
            'archery': {
                'width_m': 15.0, 'height_m': 70.0,
                'key_features': {
                    'shooting_line': {'x': 0, 'y1': 0, 'y2': 15.0},
                    'target': {'center': (70.0, 7.5), 'radius': 0.61},
                    'safety_zones': [
                        {'x1': 0, 'y1': 0, 'x2': 10, 'y2': 15.0},
                        {'x1': 60, 'y1': 0, 'x2': 70, 'y2': 15.0}
                    ]
                },
                'render_scale': 10, 'sport_type': 'range'
            },
            'sailing': {
                'width_m': 1000.0, 'height_m': 1000.0,  # Race course
                'key_features': {
                    'start_line': {'x1': 100, 'y1': 100, 'x2': 200, 'y2': 100},
                    'marks': [
                        {'center': (500, 200), 'radius': 5},
                        {'center': (800, 500), 'radius': 5},
                        {'center': (500, 800), 'radius': 5}
                    ],
                    'finish_line': {'x1': 100, 'y1': 900, 'x2': 200, 'y2': 900}
                },
                'render_scale': 0.5, 'sport_type': 'water'
            },
            'rowing': {
                'width_m': 13.5, 'height_m': 2000.0,
                'key_features': {
                    'lanes': [{'x1': 0, 'x2': 2000.0, 'y1': i*2.25, 'y2': (i+1)*2.25} for i in range(6)],
                    'start_line': {'x': 0, 'y1': 0, 'y2': 13.5},
                    'finish_line': {'x': 2000.0, 'y1': 0, 'y2': 13.5},
                    'markers': [{'x': i*500, 'y1': 0, 'y2': 13.5} for i in range(1, 4)]
                },
                'render_scale': 0.3, 'sport_type': 'water'
            },
            'gymnastics': {
                'width_m': 12.0, 'height_m': 12.0,
                'key_features': {
                    'floor_area': {'x1': 0, 'y1': 0, 'x2': 12.0, 'y2': 12.0},
                    'diagonal': [
                        {'x1': 0, 'y1': 0, 'x2': 12.0, 'y2': 12.0},
                        {'x1': 0, 'y1': 12.0, 'x2': 12.0, 'y2': 0}
                    ],
                    'center': {'center': (6.0, 6.0), 'radius': 0.5}
                },
                'render_scale': 25, 'sport_type': 'floor'
            },
            'weightlifting': {
                'width_m': 4.0, 'height_m': 4.0,
                'key_features': {
                    'platform': {'x1': 0, 'y1': 0, 'x2': 4.0, 'y2': 4.0},
                    'center': {'center': (2.0, 2.0), 'radius': 0.2},
                    'safety_zones': [
                        {'x1': -1.0, 'y1': -1.0, 'x2': 0, 'y2': 5.0},
                        {'x1': 4.0, 'y1': -1.0, 'x2': 5.0, 'y2': 5.0}
                    ]
                },
                'render_scale': 60, 'sport_type': 'platform'
            },
            'cycling': {
                'width_m': 7.0, 'height_m': 250.0,  # Track
                'key_features': {
                    'track': {'inner_radius': 84.39, 'width': 7.0},
                    'start_finish': {'x': 0, 'y1': 0, 'y2': 7.0},
                    'banking': {'degrees': 42},
                    'lanes': 2
                },
                'render_scale': 3, 'sport_type': 'track'
            }
        }
    
    async def render_basketball_shot_quality_overlay(self, 
                                                    ball_position: Tuple[float, float],
                                                    shot_context: Dict[str, Any],
                                                    style: VisualizationStyle = VisualizationStyle.PROFESSIONAL) -> SportOverlay:
        """Render basketball shot quality overlay with zones and indicators"""
        try:
            start_time = datetime.utcnow().timestamp()
            
            # Get court template
            court_template = self.court_templates['basketball']
            court_width = court_template['width_m']
            court_length = court_template['height_m']
            scale = court_template['render_scale']
            
            # Create visualization canvas
            canvas_width = int(court_width * scale)
            canvas_height = int(court_length * scale)
            canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
            
            # Draw court outline
            await self._draw_basketball_court(canvas, court_template, style)
            
            # Generate shot quality zones
            shot_quality_zones = await self._generate_shot_quality_zones(
                ball_position, shot_context, court_template
            )
            
            # Create overlay elements
            overlay_elements = []
            
            # Render shot quality heatmap
            for zone in shot_quality_zones:
                x, y = zone['position']
                quality = zone['quality']
                
                # Convert to canvas coordinates
                canvas_x = int(y * scale)
                canvas_y = int(x * scale)
                
                # Choose color based on quality
                color = self._get_quality_color(quality, style)
                
                # Draw quality zone
                cv2.circle(canvas, (canvas_x, canvas_y), int(zone['radius'] * scale), color, -1)
                
                # Add overlay element
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.SHOT_QUALITY,
                    position=(x, y),
                    size=(zone['radius'] * 2, zone['radius'] * 2),
                    color=color,
                    value=quality,
                    label=f"Quality: {quality:.1%}",
                    confidence=0.9,
                    metadata=zone
                ))
            
            # Highlight current ball position
            ball_canvas_x = int(ball_position[1] * scale)
            ball_canvas_y = int(ball_position[0] * scale)
            
            # Draw ball indicator
            cv2.circle(canvas, (ball_canvas_x, ball_canvas_y), 8, (255, 165, 0, 255), -1)
            cv2.circle(canvas, (ball_canvas_x, ball_canvas_y), 12, (255, 255, 255, 255), 2)
            
            # Add shot quality text
            shot_quality = shot_context.get('shot_quality', 0.5)
            quality_text = f"Shot Quality: {shot_quality:.1%}"
            text_position = (ball_canvas_x - 50, ball_canvas_y - 20)
            
            cv2.putText(canvas, quality_text, text_position,
                       self.style_configs[style]['fonts']['type'],
                       self.style_configs[style]['fonts']['size'],
                       self.style_configs[style]['colors']['text'],
                       self.style_configs[style]['fonts']['thickness'])
            
            # Convert canvas to bytes
            frame_data = await self._canvas_to_bytes(canvas)
            
            # Update metrics
            render_time = (datetime.utcnow().timestamp() - start_time) * 1000
            self._update_render_metrics(render_time, True)
            
            return SportOverlay(
                sport_name='basketball',
                overlay_type=OverlayType.SHOT_QUALITY,
                elements=overlay_elements,
                court_dimensions=(court_length, court_width),
                style=style,
                timestamp=start_time,
                frame_data=frame_data,
                analysis_metadata={
                    'ball_position': ball_position,
                    'shot_context': shot_context,
                    'total_zones': len(shot_quality_zones),
                    'render_time_ms': render_time
                }
            )
            
        except Exception as e:
            logger.error(f"Shot quality overlay rendering failed: {str(e)}")
            self._update_render_metrics(0, False)
            raise
    
    async def render_basketball_xt_heatmap(self,
                                          player_positions: List[Tuple[float, float]],
                                          style: VisualizationStyle = VisualizationStyle.PROFESSIONAL) -> SportOverlay:
        """Render basketball Expected Threat (xT) heatmap"""
        try:
            start_time = datetime.utcnow().timestamp()
            
            court_template = self.court_templates['basketball']
            court_width = court_template['width_m']
            court_length = court_template['height_m']
            scale = court_template['render_scale']
            
            # Create visualization canvas
            canvas_width = int(court_width * scale)
            canvas_height = int(court_length * scale)
            canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
            
            # Draw court outline
            await self._draw_basketball_court(canvas, court_template, style)
            
            # Generate xT grid
            grid_resolution = 1.0  # 1m resolution
            xt_grid = await self._generate_xt_grid(court_length, court_width, grid_resolution)
            
            # Create overlay elements
            overlay_elements = []
            
            # Render xT heatmap
            for i in range(len(xt_grid)):
                for j in range(len(xt_grid[0])):
                    x = i * grid_resolution
                    y = j * grid_resolution
                    xt_value = xt_grid[i][j]
                    
                    if xt_value > 0.1:  # Only render significant values
                        canvas_x = int(y * scale)
                        canvas_y = int(x * scale)
                        
                        # Color based on xT value
                        alpha = int(xt_value * 200)
                        if xt_value > 0.7:
                            color = (*self.style_configs[style]['colors']['high_value'][:3], alpha)
                        elif xt_value > 0.4:
                            color = (*self.style_configs[style]['colors']['medium_value'][:3], alpha)
                        else:
                            color = (*self.style_configs[style]['colors']['low_value'][:3], alpha)
                        
                        # Draw xT cell
                        cell_size = int(grid_resolution * scale)
                        cv2.rectangle(canvas, 
                                    (canvas_x, canvas_y), 
                                    (canvas_x + cell_size, canvas_y + cell_size),
                                    color, -1)
                        
                        # Add overlay element
                        overlay_elements.append(OverlayElement(
                            element_type=OverlayType.HEATMAP,
                            position=(x, y),
                            size=(grid_resolution, grid_resolution),
                            color=color,
                            value=xt_value,
                            label=f"xT: {xt_value:.2f}",
                            confidence=0.8,
                            metadata={'grid_position': (i, j)}
                        ))
            
            # Highlight player positions
            for i, pos in enumerate(player_positions):
                player_x, player_y = pos
                canvas_x = int(player_y * scale)
                canvas_y = int(player_x * scale)
                
                # Draw player indicator
                cv2.circle(canvas, (canvas_x, canvas_y), 6, (255, 255, 255, 255), -1)
                cv2.circle(canvas, (canvas_x, canvas_y), 8, (0, 0, 0, 255), 2)
                
                # Add player number
                cv2.putText(canvas, str(i + 1), (canvas_x - 4, canvas_y + 4),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0, 255), 1)
            
            # Convert canvas to bytes
            frame_data = await self._canvas_to_bytes(canvas)
            
            # Update metrics
            render_time = (datetime.utcnow().timestamp() - start_time) * 1000
            self._update_render_metrics(render_time, True)
            
            return SportOverlay(
                sport_name='basketball',
                overlay_type=OverlayType.HEATMAP,
                elements=overlay_elements,
                court_dimensions=(court_length, court_width),
                style=style,
                timestamp=start_time,
                frame_data=frame_data,
                analysis_metadata={
                    'player_positions': player_positions,
                    'grid_resolution': grid_resolution,
                    'total_cells': len(overlay_elements),
                    'render_time_ms': render_time
                }
            )
            
        except Exception as e:
            logger.error(f"xT heatmap rendering failed: {str(e)}")
            self._update_render_metrics(0, False)
            raise
    
    async def render_basketball_passing_lanes(self,
                                             passer_position: Tuple[float, float],
                                             receiver_positions: List[Tuple[float, float]],
                                             passing_analysis: List[Dict[str, Any]],
                                             style: VisualizationStyle = VisualizationStyle.PROFESSIONAL) -> SportOverlay:
        """Render basketball passing lanes with success probabilities"""
        try:
            start_time = datetime.utcnow().timestamp()
            
            court_template = self.court_templates['basketball']
            court_width = court_template['width_m']
            court_length = court_template['height_m']
            scale = court_template['render_scale']
            
            # Create visualization canvas
            canvas_width = int(court_width * scale)
            canvas_height = int(court_length * scale)
            canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
            
            # Draw court outline
            await self._draw_basketball_court(canvas, court_template, style)
            
            # Create overlay elements
            overlay_elements = []
            
            # Render passing lanes
            for i, (receiver_pos, pass_analysis) in enumerate(zip(receiver_positions, passing_analysis)):
                success_prob = pass_analysis.get('success_probability', 0.5)
                value_added = pass_analysis.get('value_added', 0.0)
                
                # Convert positions to canvas coordinates
                passer_canvas = (int(passer_position[1] * scale), int(passer_position[0] * scale))
                receiver_canvas = (int(receiver_pos[1] * scale), int(receiver_pos[0] * scale))
                
                # Choose line color based on success probability
                if success_prob > 0.8:
                    line_color = self.style_configs[style]['colors']['high_value']
                elif success_prob > 0.6:
                    line_color = self.style_configs[style]['colors']['medium_value']
                else:
                    line_color = self.style_configs[style]['colors']['low_value']
                
                # Draw passing lane
                line_thickness = max(2, int(success_prob * 6))
                cv2.line(canvas, passer_canvas, receiver_canvas, line_color, line_thickness)
                
                # Draw arrow head
                await self._draw_arrow_head(canvas, passer_canvas, receiver_canvas, line_color, line_thickness)
                
                # Add success probability text
                mid_point = ((passer_canvas[0] + receiver_canvas[0]) // 2,
                           (passer_canvas[1] + receiver_canvas[1]) // 2)
                
                prob_text = f"{success_prob:.0%}"
                cv2.putText(canvas, prob_text, (mid_point[0] - 15, mid_point[1] - 10),
                           self.style_configs[style]['fonts']['type'],
                           self.style_configs[style]['fonts']['size'] * 0.8,
                           self.style_configs[style]['colors']['text'],
                           self.style_configs[style]['fonts']['thickness'])
                
                # Add overlay element
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.PASSING_LANES,
                    position=((passer_position[0] + receiver_pos[0]) / 2, 
                             (passer_position[1] + receiver_pos[1]) / 2),
                    size=(abs(receiver_pos[0] - passer_position[0]), 
                         abs(receiver_pos[1] - passer_position[1])),
                    color=line_color,
                    value=success_prob,
                    label=f"Pass Success: {success_prob:.0%}",
                    confidence=0.85,
                    metadata=pass_analysis
                ))
            
            # Draw passer position
            passer_canvas = (int(passer_position[1] * scale), int(passer_position[0] * scale))
            cv2.circle(canvas, passer_canvas, 10, (255, 165, 0, 255), -1)
            cv2.circle(canvas, passer_canvas, 12, (255, 255, 255, 255), 2)
            cv2.putText(canvas, "P", (passer_canvas[0] - 4, passer_canvas[1] + 4),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0, 255), 2)
            
            # Draw receiver positions
            for i, receiver_pos in enumerate(receiver_positions):
                receiver_canvas = (int(receiver_pos[1] * scale), int(receiver_pos[0] * scale))
                cv2.circle(canvas, receiver_canvas, 8, (100, 149, 237, 255), -1)
                cv2.circle(canvas, receiver_canvas, 10, (255, 255, 255, 255), 2)
                cv2.putText(canvas, str(i + 1), (receiver_canvas[0] - 4, receiver_canvas[1] + 4),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255, 255), 1)
            
            # Convert canvas to bytes
            frame_data = await self._canvas_to_bytes(canvas)
            
            # Update metrics
            render_time = (datetime.utcnow().timestamp() - start_time) * 1000
            self._update_render_metrics(render_time, True)
            
            return SportOverlay(
                sport_name='basketball',
                overlay_type=OverlayType.PASSING_LANES,
                elements=overlay_elements,
                court_dimensions=(court_length, court_width),
                style=style,
                timestamp=start_time,
                frame_data=frame_data,
                analysis_metadata={
                    'passer_position': passer_position,
                    'receiver_positions': receiver_positions,
                    'total_lanes': len(passing_analysis),
                    'avg_success_rate': sum(p.get('success_probability', 0) for p in passing_analysis) / len(passing_analysis) if passing_analysis else 0,
                    'render_time_ms': render_time
                }
            )
            
        except Exception as e:
            logger.error(f"Passing lanes overlay rendering failed: {str(e)}")
            self._update_render_metrics(0, False)
            raise
    
    async def _draw_basketball_court(self, canvas: np.ndarray, court_template: Dict[str, Any], style: VisualizationStyle):
        """Draw basketball court lines and features"""
        await self._draw_generic_court(canvas, court_template, style)
    
    async def _draw_generic_court(self, canvas: np.ndarray, court_template: Dict[str, Any], style: VisualizationStyle):
        """Draw generic court/field lines for any sport"""
        scale = court_template['render_scale']
        line_color = self.style_configs[style]['colors']['court_lines']
        thickness = self.style_configs[style]['line_thickness']
        
        # Court outline
        court_width = int(court_template['width_m'] * scale)
        court_length = int(court_template['height_m'] * scale)
        cv2.rectangle(canvas, (0, 0), (court_width, court_length), line_color, thickness)
        
        # Draw sport-specific features
        key_features = court_template.get('key_features', {})
        
        for feature_name, feature_data in key_features.items():
            if isinstance(feature_data, dict):
                if 'center' in feature_data and 'radius' in feature_data:
                    # Draw circle
                    center = feature_data['center']
                    center_canvas = (int(center[1] * scale), int(center[0] * scale))
                    radius = int(feature_data['radius'] * scale)
                    cv2.circle(canvas, center_canvas, radius, line_color, thickness)
                
                elif 'x1' in feature_data and 'y1' in feature_data:
                    # Draw rectangle
                    x1, y1 = feature_data.get('x1', 0), feature_data.get('y1', 0)
                    x2, y2 = feature_data.get('x2', court_length), feature_data.get('y2', court_width)
                    rect_start = (int(y1 * scale), int(x1 * scale))
                    rect_end = (int(y2 * scale), int(x2 * scale))
                    cv2.rectangle(canvas, rect_start, rect_end, line_color, thickness)
                
                elif 'x' in feature_data:
                    # Draw line
                    x = feature_data['x']
                    y1, y2 = feature_data.get('y1', 0), feature_data.get('y2', court_width)
                    line_start = (int(y1 * scale), int(x * scale))
                    line_end = (int(y2 * scale), int(x * scale))
                    cv2.line(canvas, line_start, line_end, line_color, thickness)
            
            elif isinstance(feature_data, list):
                # Draw multiple features
                for item in feature_data:
                    if 'center' in item and 'radius' in item:
                        center = item['center']
                        center_canvas = (int(center[1] * scale), int(center[0] * scale))
                        radius = int(item['radius'] * scale)
                        cv2.circle(canvas, center_canvas, radius, line_color, thickness)
                    elif 'x1' in item:
                        x1, y1 = item.get('x1', 0), item.get('y1', 0)
                        x2, y2 = item.get('x2', court_length), item.get('y2', court_width)
                        rect_start = (int(y1 * scale), int(x1 * scale))
                        rect_end = (int(y2 * scale), int(x2 * scale))
                        cv2.rectangle(canvas, rect_start, rect_end, line_color, thickness)
    
    async def _generate_shot_quality_zones(self, 
                                          ball_position: Tuple[float, float],
                                          shot_context: Dict[str, Any],
                                          court_template: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate shot quality zones around the court"""
        zones = []
        court_length = court_template['height_m']
        court_width = court_template['width_m']
        
        # Create grid of shot quality zones
        zone_size = 2.0  # 2m radius zones
        step_size = 1.5  # 1.5m between zone centers
        
        for x in np.arange(0, court_length, step_size):
            for y in np.arange(0, court_width, step_size):
                # Calculate distance to basket
                distance_to_basket = min(
                    math.sqrt(x**2 + (y - court_width/2)**2),
                    math.sqrt((court_length - x)**2 + (y - court_width/2)**2)
                )
                
                # Calculate shot quality based on distance
                if distance_to_basket <= 2.0:
                    quality = 0.85  # High quality close shots
                elif distance_to_basket <= 6.75:
                    quality = 0.6   # Medium quality mid-range
                elif distance_to_basket <= 8.0:
                    quality = 0.7   # Three-point shots
                else:
                    quality = 0.3   # Low quality long shots
                
                # Adjust for court position
                if 3.66 <= y <= 11.58 and x <= 5.8:  # Paint area
                    quality += 0.1
                
                zones.append({
                    'position': (x, y),
                    'quality': min(quality, 0.95),
                    'radius': zone_size / 2,
                    'distance_to_basket': distance_to_basket
                })
        
        return zones
    
    async def _generate_tennis_shot_zones(self, ball_position: Tuple[float, float], court_template: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate tennis shot quality zones"""
        zones = []
        court_length = court_template['height_m']
        court_width = court_template['width_m']
        
        zone_size = 1.5
        step_size = 1.0
        
        for x in np.arange(0, court_length, step_size):
            for y in np.arange(0, court_width, step_size):
                # Tennis shot quality based on court position
                net_distance = abs(x - court_length/2)
                sideline_distance = min(y, court_width - y)
                
                # Higher quality near baseline and away from net
                if net_distance > 3.0:  # Away from net
                    quality = 0.8
                elif net_distance > 1.5:  # Mid court
                    quality = 0.6
                else:  # Near net
                    quality = 0.4
                
                # Adjust for sideline proximity
                quality *= min(1.0, sideline_distance / 2.0)
                
                zones.append({
                    'position': (x, y),
                    'quality': min(quality, 0.95),
                    'radius': zone_size / 2,
                    'net_distance': net_distance
                })
        
        return zones
    
    def _calculate_football_heat_value(self, x: float, y: float, court_length: float, court_width: float) -> float:
        """Calculate heat value for football field position"""
        # Higher heat near goals
        goal_distance = min(x, court_length - x)
        center_distance = abs(y - court_width/2)
        
        heat = 1.0 - (goal_distance / (court_length/2))
        heat *= 1.0 - (center_distance / (court_width/2)) * 0.3
        
        return max(0.1, min(heat, 0.9))
    
    def _calculate_volleyball_zone_value(self, x: float, y: float, court_length: float, court_width: float) -> float:
        """Calculate zone value for volleyball position"""
        # Front court vs back court
        net_position = court_length / 2
        
        if abs(x - net_position) < 3.0:  # Near net
            return 0.8
        elif x < net_position:  # Back court
            return 0.6
        else:  # Front court
            return 0.7
    
    def _calculate_field_position_value(self, x: float, y: float, sport_name: str, court_length: float, court_width: float) -> float:
        """Calculate field position value for various field sports"""
        if sport_name == 'cricket':
            # Batting position value
            center_distance = math.sqrt((x - court_length/2)**2 + (y - court_width/2)**2)
            return max(0.3, 1.0 - center_distance / (court_length/2))
        
        elif sport_name in ['rugby', 'american_football']:
            # Attacking zone value
            goal_distance = min(x, court_length - x)
            return max(0.2, 1.0 - goal_distance / (court_length/2))
        
        else:
            return 0.5
    
    def _calculate_lane_position_value(self, x: float, y: float, sport_name: str, court_length: float, court_width: float) -> float:
        """Calculate lane position value for water sports"""
        # Progress along the course
        progress = x / court_length
        
        # Lane preference (center lanes are premium)
        lane_num = int(y / (court_width / 8))  # 8 lanes
        center_bonus = 1.0 - abs(lane_num - 3.5) / 4.0 * 0.2
        
        return progress * center_bonus
    
    def _calculate_combat_zone_advantage(self, x: float, y: float, sport_name: str, court_length: float, court_width: float) -> float:
        """Calculate zone advantage for combat sports"""
        center_x, center_y = court_length/2, court_width/2
        distance_from_center = math.sqrt((x - center_x)**2 + (y - center_y)**2)
        max_distance = math.sqrt(center_x**2 + center_y**2)
        
        # Center control is advantageous
        return max(0.3, 1.0 - distance_from_center / max_distance)
    
    async def _generate_xt_grid(self, court_length: float, court_width: float, resolution: float) -> List[List[float]]:
        """Generate Expected Threat grid for basketball court"""
        grid = []
        
        for x in np.arange(0, court_length, resolution):
            row = []
            for y in np.arange(0, court_width, resolution):
                # Calculate xT value for position
                xt_result = await basketball_value_model.calculate_expected_threat((float(x), float(y)), 80.0)
                row.append(xt_result.xt_value)
            grid.append(row)
        
        return grid
    
    def _get_quality_color(self, quality: float, style: VisualizationStyle) -> Tuple[int, int, int, int]:
        """Get color based on quality value"""
        if quality > 0.7:
            return self.style_configs[style]['colors']['high_value']
        elif quality > 0.4:
            return self.style_configs[style]['colors']['medium_value']
        else:
            return self.style_configs[style]['colors']['low_value']
    
    async def _draw_arrow_head(self, canvas: np.ndarray, start: Tuple[int, int], end: Tuple[int, int], 
                              color: Tuple[int, int, int, int], thickness: int):
        """Draw arrow head at the end of a line"""
        # Calculate arrow head points
        angle = math.atan2(end[1] - start[1], end[0] - start[0])
        arrow_length = 15
        arrow_angle = math.pi / 6  # 30 degrees
        
        # Arrow head points
        x1 = int(end[0] - arrow_length * math.cos(angle - arrow_angle))
        y1 = int(end[1] - arrow_length * math.sin(angle - arrow_angle))
        x2 = int(end[0] - arrow_length * math.cos(angle + arrow_angle))
        y2 = int(end[1] - arrow_length * math.sin(angle + arrow_angle))
        
        # Draw arrow head
        cv2.line(canvas, end, (x1, y1), color, thickness)
        cv2.line(canvas, end, (x2, y2), color, thickness)
    
    async def _canvas_to_bytes(self, canvas: np.ndarray) -> bytes:
        """Convert canvas to bytes for transmission"""
        # Convert RGBA to RGB for JPEG encoding
        rgb_canvas = cv2.cvtColor(canvas, cv2.COLOR_RGBA2RGB)
        
        # Encode as JPEG
        _, buffer = cv2.imencode('.jpg', rgb_canvas, [cv2.IMWRITE_JPEG_QUALITY, 90])
        
        return buffer.tobytes()
    
    def _update_render_metrics(self, render_time_ms: float, success: bool):
        """Update rendering performance metrics"""
        self.render_metrics['total_overlays_rendered'] += 1
        
        if success:
            self.render_metrics['successful_renders'] += 1
            
            # Update average render time
            current_avg = self.render_metrics['avg_render_time_ms']
            total_renders = self.render_metrics['total_overlays_rendered']
            self.render_metrics['avg_render_time_ms'] = ((current_avg * (total_renders - 1)) + render_time_ms) / total_renders
    
    async def render_sport_overlay(self,
                                  sport_name: str,
                                  overlay_type: OverlayType,
                                  analysis_data: Dict[str, Any],
                                  style: VisualizationStyle = VisualizationStyle.PROFESSIONAL) -> Optional[SportOverlay]:
        """Render overlay for any supported sport"""
        try:
            # Get sport template
            if sport_name not in self.court_templates:
                logger.warning(f"Sport {sport_name} not supported for overlay rendering")
                return None
            
            court_template = self.court_templates[sport_name]
            
            # Dispatch to sport-specific renderer
            if sport_name == 'basketball':
                return await self._render_basketball_overlay(overlay_type, analysis_data, style, court_template)
            elif sport_name == 'tennis':
                return await self._render_tennis_overlay(overlay_type, analysis_data, style, court_template)
            elif sport_name == 'football':
                return await self._render_football_overlay(overlay_type, analysis_data, style, court_template)
            elif sport_name == 'volleyball':
                return await self._render_volleyball_overlay(overlay_type, analysis_data, style, court_template)
            elif sport_name in ['cricket', 'hockey', 'rugby', 'american_football', 'baseball']:
                return await self._render_field_sport_overlay(sport_name, overlay_type, analysis_data, style, court_template)
            elif sport_name in ['swimming', 'rowing']:
                return await self._render_water_sport_overlay(sport_name, overlay_type, analysis_data, style, court_template)
            elif sport_name in ['boxing', 'wrestling', 'judo']:
                return await self._render_combat_sport_overlay(sport_name, overlay_type, analysis_data, style, court_template)
            elif sport_name in ['track_field', 'cycling']:
                return await self._render_track_sport_overlay(sport_name, overlay_type, analysis_data, style, court_template)
            else:
                return await self._render_generic_sport_overlay(sport_name, overlay_type, analysis_data, style, court_template)
                
        except Exception as e:
            logger.error(f"Sport overlay rendering failed for {sport_name}: {str(e)}")
            return None
    
    async def _render_basketball_overlay(self, overlay_type: OverlayType, analysis_data: Dict[str, Any], 
                                        style: VisualizationStyle, court_template: Dict[str, Any]) -> Optional[SportOverlay]:
        """Render basketball-specific overlays"""
        if overlay_type == OverlayType.SHOT_QUALITY and 'ball_position' in analysis_data:
            return await self.render_basketball_shot_quality_overlay(
                analysis_data['ball_position'], analysis_data.get('shot_context', {}), style
            )
        elif overlay_type == OverlayType.HEATMAP and 'player_positions' in analysis_data:
            return await self.render_basketball_xt_heatmap(analysis_data['player_positions'], style)
        elif overlay_type == OverlayType.PASSING_LANES and 'passing_analysis' in analysis_data:
            return await self.render_basketball_passing_lanes(
                analysis_data['passer_position'], analysis_data['receiver_positions'], 
                analysis_data['passing_analysis'], style
            )
        return None
    
    async def _render_tennis_overlay(self, overlay_type: OverlayType, analysis_data: Dict[str, Any],
                                    style: VisualizationStyle, court_template: Dict[str, Any]) -> Optional[SportOverlay]:
        """Render tennis-specific overlays"""
        start_time = datetime.utcnow().timestamp()
        
        court_width = court_template['width_m']
        court_length = court_template['height_m']
        scale = court_template['render_scale']
        
        canvas_width = int(court_width * scale)
        canvas_height = int(court_length * scale)
        canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
        
        # Draw tennis court
        await self._draw_generic_court(canvas, court_template, style)
        
        overlay_elements = []
        
        if overlay_type == OverlayType.SHOT_QUALITY and 'ball_position' in analysis_data:
            # Tennis shot quality zones
            ball_pos = analysis_data['ball_position']
            shot_zones = await self._generate_tennis_shot_zones(ball_pos, court_template)
            
            for zone in shot_zones:
                x, y = zone['position']
                quality = zone['quality']
                
                canvas_x = int(y * scale)
                canvas_y = int(x * scale)
                color = self._get_quality_color(quality, style)
                
                cv2.circle(canvas, (canvas_x, canvas_y), int(zone['radius'] * scale), color, -1)
                
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.SHOT_QUALITY,
                    position=(x, y), size=(zone['radius'] * 2, zone['radius'] * 2),
                    color=color, value=quality, label=f"Shot Quality: {quality:.1%}",
                    confidence=0.8, metadata=zone
                ))
        
        frame_data = await self._canvas_to_bytes(canvas)
        render_time = (datetime.utcnow().timestamp() - start_time) * 1000
        self._update_render_metrics(render_time, True)
        
        return SportOverlay(
            sport_name='tennis', overlay_type=overlay_type, elements=overlay_elements,
            court_dimensions=(court_length, court_width), style=style, timestamp=start_time,
            frame_data=frame_data, analysis_metadata={'render_time_ms': render_time}
        )
    
    async def _render_football_overlay(self, overlay_type: OverlayType, analysis_data: Dict[str, Any],
                                      style: VisualizationStyle, court_template: Dict[str, Any]) -> Optional[SportOverlay]:
        """Render football/soccer-specific overlays"""
        start_time = datetime.utcnow().timestamp()
        
        court_width = court_template['width_m']
        court_length = court_template['height_m']
        scale = court_template['render_scale']
        
        canvas_width = int(court_width * scale)
        canvas_height = int(court_length * scale)
        canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
        
        await self._draw_generic_court(canvas, court_template, style)
        
        overlay_elements = []
        
        if overlay_type == OverlayType.HEATMAP and 'player_positions' in analysis_data:
            # Football player heat zones
            for i, pos in enumerate(analysis_data['player_positions']):
                x, y = pos
                canvas_x = int(y * scale)
                canvas_y = int(x * scale)
                
                # Heat intensity based on field position
                heat_value = self._calculate_football_heat_value(x, y, court_length, court_width)
                color = self._get_quality_color(heat_value, style)
                
                cv2.circle(canvas, (canvas_x, canvas_y), 15, color, -1)
                cv2.circle(canvas, (canvas_x, canvas_y), 18, (255, 255, 255, 255), 2)
                
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.HEATMAP,
                    position=(x, y), size=(2.0, 2.0), color=color, value=heat_value,
                    label=f"Player {i+1}", confidence=0.9, metadata={'player_id': i}
                ))
        
        frame_data = await self._canvas_to_bytes(canvas)
        render_time = (datetime.utcnow().timestamp() - start_time) * 1000
        self._update_render_metrics(render_time, True)
        
        return SportOverlay(
            sport_name='football', overlay_type=overlay_type, elements=overlay_elements,
            court_dimensions=(court_length, court_width), style=style, timestamp=start_time,
            frame_data=frame_data, analysis_metadata={'render_time_ms': render_time}
        )
    
    async def _render_volleyball_overlay(self, overlay_type: OverlayType, analysis_data: Dict[str, Any],
                                        style: VisualizationStyle, court_template: Dict[str, Any]) -> Optional[SportOverlay]:
        """Render volleyball-specific overlays"""
        start_time = datetime.utcnow().timestamp()
        
        court_width = court_template['width_m']
        court_length = court_template['height_m']
        scale = court_template['render_scale']
        
        canvas_width = int(court_width * scale)
        canvas_height = int(court_length * scale)
        canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
        
        await self._draw_generic_court(canvas, court_template, style)
        
        overlay_elements = []
        
        if overlay_type == OverlayType.ZONE_HIGHLIGHT and 'player_positions' in analysis_data:
            # Volleyball rotation zones
            for i, pos in enumerate(analysis_data['player_positions']):
                x, y = pos
                canvas_x = int(y * scale)
                canvas_y = int(x * scale)
                
                # Zone value based on volleyball position
                zone_value = self._calculate_volleyball_zone_value(x, y, court_length, court_width)
                color = self._get_quality_color(zone_value, style)
                
                cv2.circle(canvas, (canvas_x, canvas_y), 12, color, -1)
                cv2.putText(canvas, str(i+1), (canvas_x-5, canvas_y+5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255, 255), 2)
                
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.ZONE_HIGHLIGHT,
                    position=(x, y), size=(1.5, 1.5), color=color, value=zone_value,
                    label=f"Position {i+1}", confidence=0.85, metadata={'rotation_position': i}
                ))
        
        frame_data = await self._canvas_to_bytes(canvas)
        render_time = (datetime.utcnow().timestamp() - start_time) * 1000
        self._update_render_metrics(render_time, True)
        
        return SportOverlay(
            sport_name='volleyball', overlay_type=overlay_type, elements=overlay_elements,
            court_dimensions=(court_length, court_width), style=style, timestamp=start_time,
            frame_data=frame_data, analysis_metadata={'render_time_ms': render_time}
        )
    
    async def _render_field_sport_overlay(self, sport_name: str, overlay_type: OverlayType, analysis_data: Dict[str, Any],
                                         style: VisualizationStyle, court_template: Dict[str, Any]) -> Optional[SportOverlay]:
        """Render field sports (cricket, rugby, etc.) overlays"""
        start_time = datetime.utcnow().timestamp()
        
        court_width = court_template['width_m']
        court_length = court_template['height_m']
        scale = court_template['render_scale']
        
        canvas_width = int(court_width * scale)
        canvas_height = int(court_length * scale)
        canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
        
        await self._draw_generic_court(canvas, court_template, style)
        
        overlay_elements = []
        
        if overlay_type == OverlayType.PLAYER_TRACKING and 'player_positions' in analysis_data:
            for i, pos in enumerate(analysis_data['player_positions']):
                x, y = pos
                canvas_x = int(y * scale)
                canvas_y = int(x * scale)
                
                # Field position value
                field_value = self._calculate_field_position_value(x, y, sport_name, court_length, court_width)
                color = self._get_quality_color(field_value, style)
                
                cv2.circle(canvas, (canvas_x, canvas_y), 8, color, -1)
                cv2.circle(canvas, (canvas_x, canvas_y), 10, (255, 255, 255, 255), 2)
                
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.PLAYER_TRACKING,
                    position=(x, y), size=(2.0, 2.0), color=color, value=field_value,
                    label=f"{sport_name.title()} Player {i+1}", confidence=0.8, 
                    metadata={'sport': sport_name, 'player_id': i}
                ))
        
        frame_data = await self._canvas_to_bytes(canvas)
        render_time = (datetime.utcnow().timestamp() - start_time) * 1000
        self._update_render_metrics(render_time, True)
        
        return SportOverlay(
            sport_name=sport_name, overlay_type=overlay_type, elements=overlay_elements,
            court_dimensions=(court_length, court_width), style=style, timestamp=start_time,
            frame_data=frame_data, analysis_metadata={'render_time_ms': render_time}
        )
    
    async def _render_water_sport_overlay(self, sport_name: str, overlay_type: OverlayType, analysis_data: Dict[str, Any],
                                         style: VisualizationStyle, court_template: Dict[str, Any]) -> Optional[SportOverlay]:
        """Render water sports (swimming, rowing) overlays"""
        start_time = datetime.utcnow().timestamp()
        
        court_width = court_template['width_m']
        court_length = court_template['height_m']
        scale = court_template['render_scale']
        
        canvas_width = int(court_width * scale)
        canvas_height = int(court_length * scale)
        canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
        
        await self._draw_generic_court(canvas, court_template, style)
        
        overlay_elements = []
        
        if overlay_type == OverlayType.PLAYER_TRACKING and 'player_positions' in analysis_data:
            for i, pos in enumerate(analysis_data['player_positions']):
                x, y = pos
                canvas_x = int(y * scale)
                canvas_y = int(x * scale)
                
                # Lane position tracking
                lane_value = self._calculate_lane_position_value(x, y, sport_name, court_length, court_width)
                color = (100, 149, 237, 200)  # Water blue
                
                cv2.circle(canvas, (canvas_x, canvas_y), 6, color, -1)
                cv2.putText(canvas, f"L{i+1}", (canvas_x-8, canvas_y+3), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255, 255), 1)
                
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.PLAYER_TRACKING,
                    position=(x, y), size=(1.0, 1.0), color=color, value=lane_value,
                    label=f"Lane {i+1}", confidence=0.9, metadata={'lane': i+1}
                ))
        
        frame_data = await self._canvas_to_bytes(canvas)
        render_time = (datetime.utcnow().timestamp() - start_time) * 1000
        self._update_render_metrics(render_time, True)
        
        return SportOverlay(
            sport_name=sport_name, overlay_type=overlay_type, elements=overlay_elements,
            court_dimensions=(court_length, court_width), style=style, timestamp=start_time,
            frame_data=frame_data, analysis_metadata={'render_time_ms': render_time}
        )
    
    async def _render_combat_sport_overlay(self, sport_name: str, overlay_type: OverlayType, analysis_data: Dict[str, Any],
                                          style: VisualizationStyle, court_template: Dict[str, Any]) -> Optional[SportOverlay]:
        """Render combat sports (boxing, wrestling, judo) overlays"""
        start_time = datetime.utcnow().timestamp()
        
        court_width = court_template['width_m']
        court_length = court_template['height_m']
        scale = court_template['render_scale']
        
        canvas_width = int(court_width * scale)
        canvas_height = int(court_length * scale)
        canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
        
        await self._draw_generic_court(canvas, court_template, style)
        
        overlay_elements = []
        
        if overlay_type == OverlayType.ZONE_HIGHLIGHT and 'player_positions' in analysis_data:
            for i, pos in enumerate(analysis_data['player_positions']):
                x, y = pos
                canvas_x = int(y * scale)
                canvas_y = int(x * scale)
                
                # Combat zone advantage
                zone_advantage = self._calculate_combat_zone_advantage(x, y, sport_name, court_length, court_width)
                color = self._get_quality_color(zone_advantage, style)
                
                cv2.circle(canvas, (canvas_x, canvas_y), 15, color, -1)
                cv2.circle(canvas, (canvas_x, canvas_y), 18, (255, 255, 255, 255), 2)
                
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.ZONE_HIGHLIGHT,
                    position=(x, y), size=(1.5, 1.5), color=color, value=zone_advantage,
                    label=f"Fighter {i+1}", confidence=0.85, metadata={'fighter_id': i}
                ))
        
        frame_data = await self._canvas_to_bytes(canvas)
        render_time = (datetime.utcnow().timestamp() - start_time) * 1000
        self._update_render_metrics(render_time, True)
        
        return SportOverlay(
            sport_name=sport_name, overlay_type=overlay_type, elements=overlay_elements,
            court_dimensions=(court_length, court_width), style=style, timestamp=start_time,
            frame_data=frame_data, analysis_metadata={'render_time_ms': render_time}
        )
    
    async def _render_track_sport_overlay(self, sport_name: str, overlay_type: OverlayType, analysis_data: Dict[str, Any],
                                         style: VisualizationStyle, court_template: Dict[str, Any]) -> Optional[SportOverlay]:
        """Render track sports overlays"""
        start_time = datetime.utcnow().timestamp()
        
        court_width = court_template['width_m']
        court_length = court_template['height_m']
        scale = court_template['render_scale']
        
        canvas_width = int(court_width * scale)
        canvas_height = int(court_length * scale)
        canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
        
        await self._draw_generic_court(canvas, court_template, style)
        
        overlay_elements = []
        
        if overlay_type == OverlayType.PLAYER_TRACKING and 'player_positions' in analysis_data:
            for i, pos in enumerate(analysis_data['player_positions']):
                x, y = pos
                canvas_x = int(y * scale)
                canvas_y = int(x * scale)
                
                # Track position value
                track_value = 0.7  # Standard track value
                color = (255, 140, 0, 200)  # Orange for track
                
                cv2.circle(canvas, (canvas_x, canvas_y), 8, color, -1)
                cv2.putText(canvas, str(i+1), (canvas_x-4, canvas_y+4), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255, 255), 1)
                
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.PLAYER_TRACKING,
                    position=(x, y), size=(1.5, 1.5), color=color, value=track_value,
                    label=f"Runner {i+1}", confidence=0.9, metadata={'runner_id': i}
                ))
        
        frame_data = await self._canvas_to_bytes(canvas)
        render_time = (datetime.utcnow().timestamp() - start_time) * 1000
        self._update_render_metrics(render_time, True)
        
        return SportOverlay(
            sport_name=sport_name, overlay_type=overlay_type, elements=overlay_elements,
            court_dimensions=(court_length, court_width), style=style, timestamp=start_time,
            frame_data=frame_data, analysis_metadata={'render_time_ms': render_time}
        )
    
    async def _render_generic_sport_overlay(self, sport_name: str, overlay_type: OverlayType, analysis_data: Dict[str, Any],
                                           style: VisualizationStyle, court_template: Dict[str, Any]) -> Optional[SportOverlay]:
        """Render generic sport overlay for unsupported sports"""
        start_time = datetime.utcnow().timestamp()
        
        court_width = court_template['width_m']
        court_length = court_template['height_m']
        scale = court_template['render_scale']
        
        canvas_width = int(court_width * scale)
        canvas_height = int(court_length * scale)
        canvas = np.zeros((canvas_height, canvas_width, 4), dtype=np.uint8)
        
        await self._draw_generic_court(canvas, court_template, style)
        
        overlay_elements = []
        
        if 'player_positions' in analysis_data:
            for i, pos in enumerate(analysis_data['player_positions']):
                x, y = pos
                canvas_x = int(y * scale)
                canvas_y = int(x * scale)
                
                color = self.style_configs[style]['colors']['neutral']
                cv2.circle(canvas, (canvas_x, canvas_y), 8, color, -1)
                
                overlay_elements.append(OverlayElement(
                    element_type=OverlayType.PLAYER_TRACKING,
                    position=(x, y), size=(1.0, 1.0), color=color, value=0.5,
                    label=f"Player {i+1}", confidence=0.7, metadata={'player_id': i}
                ))
        
        frame_data = await self._canvas_to_bytes(canvas)
        render_time = (datetime.utcnow().timestamp() - start_time) * 1000
        self._update_render_metrics(render_time, True)
        
        return SportOverlay(
            sport_name=sport_name, overlay_type=overlay_type, elements=overlay_elements,
            court_dimensions=(court_length, court_width), style=style, timestamp=start_time,
            frame_data=frame_data, analysis_metadata={'render_time_ms': render_time}
        )
    
    async def generate_comprehensive_overlay(self,
                                           sport_name: str,
                                           analysis_data: Dict[str, Any],
                                           overlay_types: List[OverlayType],
                                           style: VisualizationStyle = VisualizationStyle.PROFESSIONAL) -> List[SportOverlay]:
        """Generate comprehensive multi-overlay visualization for any sport"""
        try:
            overlays = []
            
            # Process each requested overlay type
            for overlay_type in overlay_types:
                overlay = await self.render_sport_overlay(sport_name, overlay_type, analysis_data, style)
                if overlay:
                    overlays.append(overlay)
            
            logger.info(f"Generated {len(overlays)} overlays for {sport_name}")
            return overlays
            
        except Exception as e:
            logger.error(f"Comprehensive overlay generation failed: {str(e)}")
            return []
    
    def get_render_analytics(self) -> Dict[str, Any]:
        """Get rendering performance analytics"""
        total_renders = self.render_metrics['total_overlays_rendered']
        successful_renders = self.render_metrics['successful_renders']
        
        return {
            'performance_metrics': self.render_metrics.copy(),
            'success_rate': successful_renders / total_renders if total_renders > 0 else 0.0,
            'supported_sports': list(self.court_templates.keys()),
            'supported_overlay_types': [ot.value for ot in OverlayType],
            'supported_styles': [vs.value for vs in VisualizationStyle],
            'cache_status': {
                'cached_overlays': len(self.overlay_cache),
                'cache_hit_rate': self.render_metrics['cache_hit_rate']
            }
        }

# Global overlay renderer instance
dynamic_overlay_renderer = DynamicOverlayRenderer()

# Export key classes and functions
__all__ = [
    'DynamicOverlayRenderer', 'SportOverlay', 'OverlayElement', 'OverlayType',
    'VisualizationStyle', 'dynamic_overlay_renderer'
]