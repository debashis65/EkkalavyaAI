#!/usr/bin/env python3
"""
Sport Pack Configuration System - Modular Sport Definitions
Production-grade implementation with complete validation and error handling
"""

import json
import os
import logging
from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field, validator
from fastapi import HTTPException
from datetime import datetime

logger = logging.getLogger(__name__)

# Core Sport Pack Data Models
class SurfaceConfig(BaseModel):
    """Surface geometry configuration"""
    width_m: float = Field(..., gt=0, description="Width in meters")
    height_m: float = Field(..., gt=0, description="Height in meters") 
    landmarks: List[str] = Field(default_factory=list, description="Key court landmarks")
    center_line: bool = Field(default=False, description="Has center line")
    zones: Dict[str, Dict[str, float]] = Field(default_factory=dict, description="Named zones with coordinates")

class ObjectConfig(BaseModel):
    """Sport objects configuration"""
    name: str = Field(..., description="Object name")
    type: str = Field(..., description="Object type (ball, goal, net, etc)")
    size_m: Optional[Dict[str, float]] = Field(None, description="Object dimensions")
    position: Optional[Dict[str, float]] = Field(None, description="Default position")
    detection_config: Dict[str, Any] = Field(default_factory=dict, description="CV detection parameters")

class RulesConfig(BaseModel):
    """Sport rules and constraints"""
    offside: bool = Field(default=False, description="Has offside rule")
    time_violations: Dict[str, float] = Field(default_factory=dict, description="Time-based violations")
    area_violations: List[str] = Field(default_factory=list, description="Area-based violations")
    contact_rules: Dict[str, Any] = Field(default_factory=dict, description="Contact/collision rules")
    scoring_rules: Dict[str, Any] = Field(default_factory=dict, description="Scoring system rules")

class ActionConfig(BaseModel):
    """Sport action definitions"""
    name: str = Field(..., description="Action name")
    category: str = Field(..., description="Action category")
    biomechanics: Dict[str, Any] = Field(default_factory=dict, description="Biomechanical requirements")
    success_criteria: Dict[str, float] = Field(default_factory=dict, description="Success thresholds")
    common_errors: List[str] = Field(default_factory=list, description="Common execution errors")

class ValueModelConfig(BaseModel):
    """Value model configuration"""
    model_config = {"protected_namespaces": ()}
    
    model_type: str = Field(..., description="Model type (xT, xG, shot_quality, etc)")
    parameters: Dict[str, float] = Field(default_factory=dict, description="Model parameters")
    weight_factors: Dict[str, float] = Field(default_factory=dict, description="Weighting factors")
    normalization: Dict[str, Any] = Field(default_factory=dict, description="Normalization parameters")

class OverlayConfig(BaseModel):
    """Overlay rendering configuration"""
    name: str = Field(..., description="Overlay name")
    type: str = Field(..., description="Overlay type (lane, heat, arrow, etc)")
    style: Dict[str, Any] = Field(default_factory=dict, description="Visual style parameters")
    triggers: List[str] = Field(default_factory=list, description="Trigger conditions")
    data_requirements: List[str] = Field(default_factory=list, description="Required data inputs")

class TeamConfig(BaseModel):
    """Team configuration"""
    count: int = Field(..., ge=1, le=4, description="Number of teams")
    players_per_team: int = Field(..., ge=1, le=15, description="Players per team")
    positions: List[Dict[str, Any]] = Field(default_factory=list, description="Player positions")
    formations: Dict[str, List[Dict[str, float]]] = Field(default_factory=dict, description="Team formations")

class SportPackConfig(BaseModel):
    """Complete Sport Pack Configuration"""
    # Metadata
    sport: str = Field(..., description="Sport name")
    version: str = Field(default="1.0.0", description="Pack version")
    category: str = Field(..., description="Sport category")
    description: str = Field(default="", description="Sport description")
    created_date: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Creation date")
    
    # Core Configuration
    surface: SurfaceConfig = Field(..., description="Playing surface configuration")
    objects: List[ObjectConfig] = Field(default_factory=list, description="Sport objects")
    teams: TeamConfig = Field(..., description="Team configuration")
    actions: List[ActionConfig] = Field(default_factory=list, description="Available actions")
    rules: RulesConfig = Field(..., description="Sport rules")
    value_model: ValueModelConfig = Field(..., description="Value assessment model")
    overlays: List[OverlayConfig] = Field(default_factory=list, description="Available overlays")
    
    # Advanced Configuration
    detection_models: Dict[str, str] = Field(default_factory=dict, description="ML model mappings")
    difficulty_levels: Dict[str, Dict[str, Any]] = Field(default_factory=dict, description="Difficulty configurations")
    
    @validator('sport')
    def sport_must_be_valid(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Sport name cannot be empty')
        return v.lower().strip()
    
    @validator('category')
    def category_must_be_valid(cls, v):
        valid_categories = [
            'invasion', 'racquet', 'individual', 'combat', 'aquatic', 
            'athletics', 'target', 'aesthetic', 'para_sport'
        ]
        if v.lower() not in valid_categories:
            raise ValueError(f'Category must be one of: {valid_categories}')
        return v.lower()

class SportPackValidationError(Exception):
    """Custom exception for sport pack validation errors"""
    def __init__(self, message: str, errors: Optional[List[str]] = None):
        self.message = message
        self.errors = errors if errors is not None else []
        super().__init__(self.message)

class SportPackLoader:
    """Production-grade Sport Pack loader with validation and caching"""
    
    def __init__(self, config_directory: str = "sport_packs"):
        self.config_directory = config_directory
        self.loaded_packs: Dict[str, SportPackConfig] = {}
        self.validation_schemas: Dict[str, Dict] = {}
        self.error_log: List[Dict[str, Any]] = []
        
        # Ensure config directory exists
        os.makedirs(config_directory, exist_ok=True)
        
        # Initialize validation schemas
        self._initialize_validation_schemas()
        
        logger.info(f"SportPackLoader initialized with directory: {config_directory}")
    
    def _initialize_validation_schemas(self):
        """Initialize validation rules"""
        self.validation_schemas = {
            'required_fields': [
                'sport', 'category', 'surface', 'teams', 'rules', 'value_model'
            ],
            'valid_categories': [
                'invasion', 'racquet', 'individual', 'combat', 'aquatic', 
                'athletics', 'target', 'aesthetic', 'para_sport', 'net', 'bat',
                'strength', 'endurance', 'winter', 'multi', 'adventure', 'equestrian'
            ]
        }
    
    def validate_sport_pack(self, pack_data: Dict[str, Any]) -> List[str]:
        """Validate sport pack data"""
        errors = []
        
        # Check required fields
        required_fields = self.validation_schemas['required_fields']
        for field in required_fields:
            if field not in pack_data:
                errors.append(f"Missing required field: {field}")
        
        # Validate sport name
        if 'sport' in pack_data:
            sport = pack_data['sport']
            if not isinstance(sport, str) or len(sport.strip()) == 0:
                errors.append("Sport name must be a non-empty string")
        
        # Validate category
        if 'category' in pack_data:
            category = pack_data['category']
            valid_categories = self.validation_schemas['valid_categories']
            if category not in valid_categories:
                errors.append(f"Category must be one of: {valid_categories}")
        
        # Validate surface
        if 'surface' in pack_data:
            surface = pack_data['surface']
            if not isinstance(surface, dict):
                errors.append("Surface must be an object")
            else:
                if 'width_m' not in surface or not isinstance(surface['width_m'], (int, float)) or surface['width_m'] <= 0:
                    errors.append("Surface width_m must be a positive number")
                if 'height_m' not in surface or not isinstance(surface['height_m'], (int, float)) or surface['height_m'] <= 0:
                    errors.append("Surface height_m must be a positive number")
                if surface.get('width_m', 0) > 200:
                    errors.append("Surface width exceeds maximum allowed (200m)")
                if surface.get('height_m', 0) > 200:
                    errors.append("Surface height exceeds maximum allowed (200m)")
        
        # Validate teams
        if 'teams' in pack_data:
            teams = pack_data['teams']
            if not isinstance(teams, dict):
                errors.append("Teams must be an object")
            else:
                if 'count' not in teams or not isinstance(teams['count'], int) or teams['count'] < 1 or teams['count'] > 4:
                    errors.append("Teams count must be an integer between 1 and 4")
                if 'players_per_team' not in teams or not isinstance(teams['players_per_team'], int) or teams['players_per_team'] < 1 or teams['players_per_team'] > 15:
                    errors.append("Players per team must be an integer between 1 and 15")
        
        # Validate object uniqueness
        if 'objects' in pack_data and isinstance(pack_data['objects'], list):
            object_names = [obj.get('name', '') for obj in pack_data['objects'] if isinstance(obj, dict)]
            if len(object_names) != len(set(object_names)):
                errors.append("Duplicate object names found")
        
        # Validate action uniqueness
        if 'actions' in pack_data and isinstance(pack_data['actions'], list):
            action_names = [action.get('name', '') for action in pack_data['actions'] if isinstance(action, dict)]
            if len(action_names) != len(set(action_names)):
                errors.append("Duplicate action names found")
        
        return errors
    
    def load_sport_pack(self, sport_name: str, reload: bool = False) -> SportPackConfig:
        """Load sport pack with full validation"""
        sport_key = sport_name.lower().strip()
        
        # Return cached version if available and not reloading
        if sport_key in self.loaded_packs and not reload:
            return self.loaded_packs[sport_key]
        
        try:
            # Try JSON format
            pack_data = None
            json_path = os.path.join(self.config_directory, f"{sport_key}.json")
            
            if os.path.exists(json_path):
                with open(json_path, 'r', encoding='utf-8') as f:
                    pack_data = json.load(f)
                    logger.info(f"Loaded sport pack from JSON: {json_path}")
            else:
                # Generate default pack if file doesn't exist
                pack_data = self._generate_default_pack(sport_name)
                logger.info(f"Generated default sport pack for: {sport_name}")
            
            # Validate the loaded data
            validation_errors = self.validate_sport_pack(pack_data)
            if validation_errors:
                error_msg = f"Validation failed for sport pack '{sport_name}'"
                self.error_log.append({
                    "sport": sport_name,
                    "timestamp": datetime.utcnow().isoformat(),
                    "errors": validation_errors
                })
                raise SportPackValidationError(error_msg, validation_errors)
            
            # Create and validate Pydantic model
            sport_pack = SportPackConfig(**pack_data)
            
            # Cache the loaded pack
            self.loaded_packs[sport_key] = sport_pack
            
            logger.info(f"Successfully loaded and validated sport pack: {sport_name}")
            return sport_pack
            
        except Exception as e:
            error_msg = f"Failed to load sport pack '{sport_name}': {str(e)}"
            logger.error(error_msg)
            self.error_log.append({
                "sport": sport_name,
                "timestamp": datetime.utcnow().isoformat(),
                "error": error_msg
            })
            raise SportPackValidationError(error_msg)
    
    def save_sport_pack(self, sport_pack: SportPackConfig, format: str = "json") -> bool:
        """Save sport pack to file with validation"""
        try:
            # Validate before saving
            pack_dict = sport_pack.dict()
            validation_errors = self.validate_sport_pack(pack_dict)
            if validation_errors:
                raise SportPackValidationError("Cannot save invalid sport pack", validation_errors)
            
            # Determine file path
            filename = f"{sport_pack.sport}.json"
            file_path = os.path.join(self.config_directory, filename)
            
            # Save to file (JSON only for now)
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(pack_dict, f, indent=2, ensure_ascii=False)
            
            # Update cache
            self.loaded_packs[sport_pack.sport] = sport_pack
            
            logger.info(f"Successfully saved sport pack: {sport_pack.sport} to {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to save sport pack {sport_pack.sport}: {str(e)}")
            return False
    
    def _generate_default_pack(self, sport_name: str) -> Dict[str, Any]:
        """Generate default sport pack configuration"""
        # Comprehensive sport configurations for all 54+ Olympic and major sports
        sport_mappings = {
            # Ball Sports - Invasion Games
            'basketball': {'category': 'invasion', 'width': 28.65, 'height': 15.24, 'teams': 2, 'players': 5},
            'football': {'category': 'invasion', 'width': 100, 'height': 64, 'teams': 2, 'players': 11},
            'soccer': {'category': 'invasion', 'width': 100, 'height': 64, 'teams': 2, 'players': 11},
            'rugby': {'category': 'invasion', 'width': 100, 'height': 70, 'teams': 2, 'players': 15},
            'hockey': {'category': 'invasion', 'width': 91.4, 'height': 55, 'teams': 2, 'players': 11},
            'handball': {'category': 'invasion', 'width': 40, 'height': 20, 'teams': 2, 'players': 7},
            'water_polo': {'category': 'aquatic', 'width': 30, 'height': 20, 'teams': 2, 'players': 7},
            'lacrosse': {'category': 'invasion', 'width': 100, 'height': 55, 'teams': 2, 'players': 10},
            
            # Ball Sports - Net/Racquet Games  
            'volleyball': {'category': 'net', 'width': 18, 'height': 9, 'teams': 2, 'players': 6},
            'tennis': {'category': 'racquet', 'width': 23.77, 'height': 10.97, 'teams': 2, 'players': 1},
            'badminton': {'category': 'racquet', 'width': 13.4, 'height': 6.1, 'teams': 2, 'players': 1},
            'table_tennis': {'category': 'racquet', 'width': 2.74, 'height': 1.525, 'teams': 2, 'players': 1},
            'squash': {'category': 'racquet', 'width': 9.75, 'height': 6.4, 'teams': 2, 'players': 1},
            
            # Ball Sports - Bat/Base Games
            'baseball': {'category': 'bat', 'width': 90, 'height': 90, 'teams': 2, 'players': 9},
            'softball': {'category': 'bat', 'width': 84, 'height': 84, 'teams': 2, 'players': 10},
            'cricket': {'category': 'bat', 'width': 22, 'height': 20, 'teams': 2, 'players': 11},
            
            # Combat Sports
            'boxing': {'category': 'combat', 'width': 6.1, 'height': 6.1, 'teams': 2, 'players': 1},
            'wrestling': {'category': 'combat', 'width': 12, 'height': 9, 'teams': 2, 'players': 1},
            'judo': {'category': 'combat', 'width': 10, 'height': 10, 'teams': 2, 'players': 1},
            'karate': {'category': 'combat', 'width': 8, 'height': 8, 'teams': 2, 'players': 1},
            'taekwondo': {'category': 'combat', 'width': 8, 'height': 8, 'teams': 2, 'players': 1},
            'fencing': {'category': 'combat', 'width': 14, 'height': 1.5, 'teams': 2, 'players': 1},
            
            # Aquatic Sports
            'swimming': {'category': 'aquatic', 'width': 50, 'height': 25, 'teams': 1, 'players': 1},
            'diving': {'category': 'aquatic', 'width': 25, 'height': 25, 'teams': 1, 'players': 1},
            'synchronized_swimming': {'category': 'aquatic', 'width': 30, 'height': 20, 'teams': 1, 'players': 8},
            'sailing': {'category': 'aquatic', 'width': 1000, 'height': 1000, 'teams': 1, 'players': 2},
            'rowing': {'category': 'aquatic', 'width': 2000, 'height': 120, 'teams': 1, 'players': 8},
            'canoeing': {'category': 'aquatic', 'width': 1000, 'height': 120, 'teams': 1, 'players': 2},
            'kayaking': {'category': 'aquatic', 'width': 1000, 'height': 120, 'teams': 1, 'players': 1},
            'surfing': {'category': 'aquatic', 'width': 100, 'height': 100, 'teams': 1, 'players': 1},
            
            # Athletics/Track & Field
            'athletics': {'category': 'athletics', 'width': 400, 'height': 200, 'teams': 1, 'players': 1},
            'sprinting': {'category': 'athletics', 'width': 100, 'height': 9, 'teams': 1, 'players': 1},
            'marathon': {'category': 'athletics', 'width': 42195, 'height': 10, 'teams': 1, 'players': 1},
            'long_jump': {'category': 'athletics', 'width': 45, 'height': 10, 'teams': 1, 'players': 1},
            'high_jump': {'category': 'athletics', 'width': 20, 'height': 15, 'teams': 1, 'players': 1},
            'pole_vault': {'category': 'athletics', 'width': 45, 'height': 15, 'teams': 1, 'players': 1},
            'shot_put': {'category': 'athletics', 'width': 2.135, 'height': 2.135, 'teams': 1, 'players': 1},
            'discus_throw': {'category': 'athletics', 'width': 2.5, 'height': 2.5, 'teams': 1, 'players': 1},
            'javelin_throw': {'category': 'athletics', 'width': 100, 'height': 36.5, 'teams': 1, 'players': 1},
            'hammer_throw': {'category': 'athletics', 'width': 2.135, 'height': 2.135, 'teams': 1, 'players': 1},
            'hurdle': {'category': 'athletics', 'width': 110, 'height': 9, 'teams': 1, 'players': 1},
            
            # Target Sports
            'archery': {'category': 'target', 'width': 70, 'height': 10, 'teams': 1, 'players': 1},
            'shooting': {'category': 'target', 'width': 50, 'height': 10, 'teams': 1, 'players': 1},
            'golf': {'category': 'target', 'width': 6000, 'height': 200, 'teams': 1, 'players': 1},
            
            # Strength Sports
            'weightlifting': {'category': 'strength', 'width': 4, 'height': 4, 'teams': 1, 'players': 1},
            'powerlifting': {'category': 'strength', 'width': 4, 'height': 4, 'teams': 1, 'players': 1},
            
            # Endurance Sports
            'cycling': {'category': 'endurance', 'width': 333, 'height': 7, 'teams': 1, 'players': 1},
            'triathlon': {'category': 'endurance', 'width': 1500, 'height': 40000, 'teams': 1, 'players': 1},
            
            # Aesthetic Sports
            'gymnastics': {'category': 'aesthetic', 'width': 12, 'height': 12, 'teams': 1, 'players': 1},
            'rhythmic_gymnastics': {'category': 'aesthetic', 'width': 13, 'height': 13, 'teams': 1, 'players': 1},
            'dance_sport': {'category': 'aesthetic', 'width': 12, 'height': 12, 'teams': 2, 'players': 1},
            
            # Winter Sports
            'skiing': {'category': 'winter', 'width': 1000, 'height': 50, 'teams': 1, 'players': 1},
            'snowboarding': {'category': 'winter', 'width': 1000, 'height': 50, 'teams': 1, 'players': 1},
            'skating': {'category': 'winter', 'width': 60, 'height': 30, 'teams': 1, 'players': 1},
            'ice_skating': {'category': 'winter', 'width': 60, 'height': 30, 'teams': 1, 'players': 1},
            'ice_hockey': {'category': 'winter', 'width': 61, 'height': 26, 'teams': 2, 'players': 6},
            'curling': {'category': 'winter', 'width': 45.72, 'height': 5, 'teams': 2, 'players': 4},
            'bobsled': {'category': 'winter', 'width': 1365, 'height': 15, 'teams': 1, 'players': 4},
            'luge': {'category': 'winter', 'width': 1365, 'height': 15, 'teams': 1, 'players': 1},
            
            # Multi-Sport Events
            'pentathlon': {'category': 'multi', 'width': 200, 'height': 100, 'teams': 1, 'players': 1},
            'heptathlon': {'category': 'multi', 'width': 200, 'height': 100, 'teams': 1, 'players': 1},
            'decathlon': {'category': 'multi', 'width': 200, 'height': 100, 'teams': 1, 'players': 1},
            
            # Adventure Sports
            'climbing': {'category': 'adventure', 'width': 15, 'height': 15, 'teams': 1, 'players': 1},
            'skateboarding': {'category': 'adventure', 'width': 20, 'height': 20, 'teams': 1, 'players': 1},
            'bmx': {'category': 'adventure', 'width': 400, 'height': 8, 'teams': 1, 'players': 1},
            
            # Equestrian
            'equestrian': {'category': 'equestrian', 'width': 60, 'height': 20, 'teams': 1, 'players': 1}
        }
        
        sport_key = sport_name.lower()
        mapping = sport_mappings.get(sport_key, {
            'category': 'individual', 'width': 20, 'height': 20, 'teams': 1, 'players': 1
        })
        
        return {
            "sport": sport_name.lower(),
            "version": "1.0.0",
            "category": mapping['category'],
            "description": f"Default configuration for {sport_name}",
            "surface": {
                "width_m": mapping['width'],
                "height_m": mapping['height'],
                "landmarks": ["boundary", "center"],
                "zones": {}
            },
            "objects": [
                {
                    "name": "ball" if mapping['category'] in ['invasion', 'racquet', 'net', 'bat'] else "equipment",
                    "type": "ball" if mapping['category'] in ['invasion', 'racquet', 'net', 'bat'] else "tool",
                    "detection_config": {"confidence_threshold": 0.7}
                }
            ],
            "teams": {
                "count": mapping['teams'],
                "players_per_team": mapping['players'],
                "positions": [],
                "formations": {}
            },
            "actions": [
                {
                    "name": "basic_movement",
                    "category": "movement",
                    "biomechanics": {},
                    "success_criteria": {"form_score": 70.0},
                    "common_errors": ["poor_balance", "incorrect_timing"]
                }
            ],
            "rules": {
                "offside": mapping['category'] == 'invasion',
                "time_violations": {},
                "area_violations": [],
                "contact_rules": {},
                "scoring_rules": {}
            },
            "value_model": {
                "model_type": "basic_scoring",
                "parameters": {"base_score": 100},
                "weight_factors": {"accuracy": 0.4, "technique": 0.6},
                "normalization": {"min_score": 0, "max_score": 100}
            },
            "overlays": [
                {
                    "name": "basic_feedback",
                    "type": "text",
                    "style": {"color": "green", "size": "medium"},
                    "triggers": ["action_complete"],
                    "data_requirements": ["action_result"]
                }
            ],
            "detection_models": {
                "pose": "mediapipe_pose",
                "object": "yolo_v8"
            },
            "difficulty_levels": {
                "easy": {"tolerance": 0.3, "feedback_frequency": "high"},
                "medium": {"tolerance": 0.2, "feedback_frequency": "medium"},
                "hard": {"tolerance": 0.1, "feedback_frequency": "low"}
            }
        }
    
    def get_loaded_sports(self) -> List[str]:
        """Get list of currently loaded sports"""
        return list(self.loaded_packs.keys())
    
    def get_available_sports(self) -> List[str]:
        """Get list of available sport pack files"""
        available = []
        if os.path.exists(self.config_directory):
            for filename in os.listdir(self.config_directory):
                if filename.endswith('.json'):
                    sport_name = os.path.splitext(filename)[0]
                    available.append(sport_name)
        return sorted(available)
    
    def reload_all_packs(self) -> Dict[str, bool]:
        """Reload all sport packs"""
        results = {}
        for sport in self.get_available_sports():
            try:
                self.load_sport_pack(sport, reload=True)
                results[sport] = True
            except Exception as e:
                logger.error(f"Failed to reload sport pack {sport}: {str(e)}")
                results[sport] = False
        return results
    
    def get_validation_report(self) -> Dict[str, Any]:
        """Get detailed validation report"""
        return {
            "loaded_packs": len(self.loaded_packs),
            "available_packs": len(self.get_available_sports()),
            "error_count": len(self.error_log),
            "recent_errors": self.error_log[-10:] if self.error_log else [],
            "pack_status": {
                sport: "loaded" for sport in self.loaded_packs.keys()
            }
        }
    
    def clear_cache(self):
        """Clear all cached sport packs"""
        self.loaded_packs.clear()
        logger.info("Sport pack cache cleared")

# Singleton instance for global access
sport_pack_loader = SportPackLoader()

# Export key classes and functions
__all__ = [
    'SportPackConfig', 'SportPackLoader', 'SportPackValidationError',
    'SurfaceConfig', 'ObjectConfig', 'RulesConfig', 'ActionConfig',
    'ValueModelConfig', 'OverlayConfig', 'TeamConfig', 'sport_pack_loader'
]