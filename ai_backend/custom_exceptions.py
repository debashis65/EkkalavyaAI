"""
Custom exception classes for enhanced error handling in Ekkalavya Sports AI Backend.
Provides specific, meaningful error types for different failure scenarios.
"""

from typing import Optional, Dict, Any

class EkkalavyaBaseError(Exception):
    """Base exception for all Ekkalavya-specific errors"""
    def __init__(self, message: str, error_code: Optional[str] = None, context: Optional[Dict[str, Any]] = None):
        self.message = message
        self.error_code = error_code if error_code is not None else self.__class__.__name__
        self.context = context if context is not None else {}
        super().__init__(self.message)
    
    def to_dict(self):
        """Convert exception to structured dictionary for API responses"""
        return {
            "error": self.error_code,
            "message": self.message,
            "context": self.context,
            "error_type": self.__class__.__name__
        }

class AnalysisError(EkkalavyaBaseError):
    """Raised when sports analysis fails"""
    pass

class InvalidSportError(EkkalavyaBaseError):
    """Raised when unsupported sport is requested"""
    pass

class InvalidImageError(EkkalavyaBaseError):
    """Raised when image processing fails"""
    pass

class PoseDetectionError(EkkalavyaBaseError):
    """Raised when pose detection fails"""
    pass

class BiomechanicalAnalysisError(EkkalavyaBaseError):
    """Raised when biomechanical analysis fails"""
    pass

class ObjectDetectionError(EkkalavyaBaseError):
    """Raised when object detection fails"""
    pass

class TrackingError(EkkalavyaBaseError):
    """Raised when object tracking fails"""
    pass

class ConfigurationError(EkkalavyaBaseError):
    """Raised when system configuration is invalid"""
    pass

class ValidationError(EkkalavyaBaseError):
    """Raised when input validation fails"""
    pass

class CalculationError(EkkalavyaBaseError):
    """Raised when mathematical calculations fail"""
    pass

class ModelLoadError(EkkalavyaBaseError):
    """Raised when AI model loading fails"""
    pass

class PerformanceError(EkkalavyaBaseError):
    """Raised when performance metrics cannot be calculated"""
    pass

class DataQualityError(EkkalavyaBaseError):
    """Raised when input data quality is insufficient"""
    pass

class SportSpecificError(EkkalavyaBaseError):
    """Raised when sport-specific analysis fails"""
    pass

class RealTimeAnalysisError(EkkalavyaBaseError):
    """Raised when real-time analysis fails"""
    pass

class WebSocketError(EkkalavyaBaseError):
    """Raised when WebSocket communication fails"""
    pass

class ARError(EkkalavyaBaseError):
    """Raised when AR processing fails"""
    pass

class VideoProcessingError(EkkalavyaBaseError):
    """Raised when video processing fails"""
    pass