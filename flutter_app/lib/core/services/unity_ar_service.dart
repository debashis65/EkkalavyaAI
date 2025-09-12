import 'package:ekkalavya_sports_ai/core/services/enhanced_api_service.dart';
import 'dart:convert';

class UnityARService {
  final EnhancedApiService _apiService;
  
  UnityARService(this._apiService);

  /// Sync Unity AR session data to the backend
  Future<void> syncSessionData({
    required String userId,
    required String sport,
    required String difficulty,
    required Map<String, dynamic> sessionData,
    List<Map<String, dynamic>> bounceEvents = const [],
  }) async {
    try {
      final payload = {
        'userId': userId,
        'sport': sport,
        'difficulty': difficulty,
        'platform': 'flutter_unity',
        'sessionData': sessionData,
        'bounceEvents': bounceEvents,
        'timestamp': DateTime.now().toIso8601String(),
        'version': '1.0.0',
      };
      
      await _apiService.post('/api/unity-ar/sessions', payload);
    } catch (e) {
      // Log error but don't throw - session data is preserved locally
      print('Unity AR Service: Failed to sync session data: $e');
    }
  }

  /// Get user's Unity AR session history
  Future<List<Map<String, dynamic>>> getUserSessions(String userId) async {
    try {
      final response = await _apiService.get('/api/unity-ar/sessions/$userId');
      return List<Map<String, dynamic>>.from(response['sessions'] ?? []);
    } catch (e) {
      print('Unity AR Service: Failed to get user sessions: $e');
      return [];
    }
  }

  /// Get sport-specific leaderboards
  Future<Map<String, dynamic>> getSportLeaderboard(String sport) async {
    try {
      final response = await _apiService.get('/api/unity-ar/leaderboard/$sport');
      return response['leaderboard'] ?? {};
    } catch (e) {
      print('Unity AR Service: Failed to get leaderboard: $e');
      return {};
    }
  }

  /// Submit session feedback
  Future<void> submitSessionFeedback({
    required String sessionId,
    required int rating,
    String? feedback,
  }) async {
    try {
      await _apiService.post('/api/unity-ar/feedback', {
        'sessionId': sessionId,
        'rating': rating,
        'feedback': feedback,
        'timestamp': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      print('Unity AR Service: Failed to submit feedback: $e');
    }
  }

  /// Get sport configuration for Unity
  Map<String, dynamic> getSportConfiguration(String sport) {
    // Comprehensive sport configurations matching Unity AR system
    final sportConfigs = {
      'basketball': {
        'targetRadius': 0.225, // Official basketball hoop radius
        'courtDimensions': {'length': 28.0, 'width': 15.0}, // FIBA court in meters
        'targetHeight': 3.05, // Official hoop height
        'ballRadius': 0.12,
        'difficultyMultipliers': {
          'easy': {'tolerance': 0.3, 'speed': 0.7},
          'medium': {'tolerance': 0.2, 'speed': 1.0},
          'hard': {'tolerance': 0.1, 'speed': 1.3},
          'expert': {'tolerance': 0.05, 'speed': 1.5},
        }
      },
      'football': {
        'goalDimensions': {'width': 7.32, 'height': 2.44},
        'ballRadius': 0.11,
        'pitchDimensions': {'length': 105.0, 'width': 68.0},
        'difficultyMultipliers': {
          'easy': {'tolerance': 0.5, 'speed': 0.6},
          'medium': {'tolerance': 0.3, 'speed': 1.0},
          'hard': {'tolerance': 0.15, 'speed': 1.4},
          'expert': {'tolerance': 0.08, 'speed': 1.6},
        }
      },
      'tennis': {
        'courtDimensions': {'length': 23.77, 'width': 8.23}, // Singles court
        'netHeight': 0.914,
        'ballRadius': 0.033,
        'serviceBoxes': true,
        'difficultyMultipliers': {
          'easy': {'tolerance': 0.4, 'speed': 0.8},
          'medium': {'tolerance': 0.25, 'speed': 1.0},
          'hard': {'tolerance': 0.12, 'speed': 1.3},
          'expert': {'tolerance': 0.06, 'speed': 1.5},
        }
      },
      'archery': {
        'targetDiameter': 1.22, // Standard 122cm target
        'distance': 70.0, // Olympic distance
        'ringScores': [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
        'windSimulation': true,
        'difficultyMultipliers': {
          'easy': {'windStrength': 0.2, 'tolerance': 0.15},
          'medium': {'windStrength': 0.5, 'tolerance': 0.1},
          'hard': {'windStrength': 0.8, 'tolerance': 0.06},
          'expert': {'windStrength': 1.2, 'tolerance': 0.03},
        }
      },
      // Para Sports configurations
      'para_basketball': {
        'targetRadius': 0.225,
        'courtDimensions': {'length': 28.0, 'width': 15.0},
        'targetHeight': 3.05,
        'wheelchairConstraints': true,
        'adaptiveControls': true,
        'difficultyMultipliers': {
          'easy': {'tolerance': 0.35, 'speed': 0.6},
          'medium': {'tolerance': 0.25, 'speed': 0.9},
          'hard': {'tolerance': 0.15, 'speed': 1.2},
          'expert': {'tolerance': 0.08, 'speed': 1.4},
        }
      },
      'para_archery': {
        'targetDiameter': 1.22,
        'distance': 70.0,
        'seatedPosition': true,
        'adaptiveEquipment': true,
        'difficultyMultipliers': {
          'easy': {'windStrength': 0.1, 'tolerance': 0.2},
          'medium': {'windStrength': 0.3, 'tolerance': 0.15},
          'hard': {'windStrength': 0.6, 'tolerance': 0.08},
          'expert': {'windStrength': 1.0, 'tolerance': 0.04},
        }
      },
    };

    // Default configuration for sports not explicitly defined
    return sportConfigs[sport] ?? {
      'generic': true,
      'difficultyMultipliers': {
        'easy': {'tolerance': 0.3, 'speed': 0.8},
        'medium': {'tolerance': 0.2, 'speed': 1.0},
        'hard': {'tolerance': 0.1, 'speed': 1.3},
        'expert': {'tolerance': 0.05, 'speed': 1.5},
      }
    };
  }

  /// Validate Unity AR session data
  bool validateSessionData(Map<String, dynamic> sessionData) {
    final requiredFields = ['sport', 'difficulty', 'score', 'accuracy', 'duration'];
    
    for (final field in requiredFields) {
      if (!sessionData.containsKey(field)) {
        print('Unity AR Service: Missing required field: $field');
        return false;
      }
    }
    
    // Validate data types and ranges
    if (sessionData['score'] is! num || sessionData['score'] < 0) {
      return false;
    }
    
    if (sessionData['accuracy'] is! num || 
        sessionData['accuracy'] < 0 || 
        sessionData['accuracy'] > 1) {
      return false;
    }
    
    if (sessionData['duration'] is! num || sessionData['duration'] <= 0) {
      return false;
    }
    
    return true;
  }

  /// Calculate performance metrics
  Map<String, dynamic> calculatePerformanceMetrics({
    required int score,
    required double accuracy,
    required int targetsHit,
    required int totalTargets,
    required int maxStreak,
    required double sessionDuration,
    required String difficulty,
  }) {
    // Difficulty multipliers
    final difficultyMultipliers = {
      'easy': 1.0,
      'medium': 1.2,
      'hard': 1.5,
      'expert': 2.0,
    };
    
    final multiplier = difficultyMultipliers[difficulty] ?? 1.0;
    
    // Calculate weighted score
    final weightedScore = (score * multiplier).round();
    
    // Calculate efficiency (targets hit per minute)
    final efficiency = sessionDuration > 0 
        ? (targetsHit / (sessionDuration / 60.0))
        : 0.0;
    
    // Calculate consistency score based on streak performance
    final consistencyScore = maxStreak > 0 
        ? (maxStreak / totalTargets) * 100
        : 0.0;
    
    // Overall performance rating (0-5 stars)
    double overallRating = 0.0;
    overallRating += (accuracy * 2.0); // Accuracy weight: 40%
    overallRating += (score / 1000.0); // Score weight: 20%
    overallRating += ((targetsHit / totalTargets) * 1.5); // Completion weight: 30%
    overallRating += (consistencyScore / 100.0 * 0.5); // Consistency weight: 10%
    overallRating = overallRating.clamp(0.0, 5.0);
    
    return {
      'weightedScore': weightedScore,
      'efficiency': efficiency.toStringAsFixed(2),
      'consistencyScore': consistencyScore.toStringAsFixed(1),
      'overallRating': overallRating,
      'difficultyMultiplier': multiplier,
      'performanceGrade': _getPerformanceGrade(overallRating),
      'improvementAreas': _getImprovementAreas(accuracy, consistencyScore, efficiency),
    };
  }

  String _getPerformanceGrade(double rating) {
    if (rating >= 4.5) return 'A+';
    if (rating >= 4.0) return 'A';
    if (rating >= 3.5) return 'B+';
    if (rating >= 3.0) return 'B';
    if (rating >= 2.5) return 'C+';
    if (rating >= 2.0) return 'C';
    if (rating >= 1.5) return 'D';
    return 'F';
  }

  List<String> _getImprovementAreas(double accuracy, double consistency, double efficiency) {
    final areas = <String>[];
    
    if (accuracy < 0.6) {
      areas.add('Focus on accuracy - try slowing down your shots');
    }
    if (consistency < 30) {
      areas.add('Work on consistency - practice maintaining rhythm');
    }
    if (efficiency < 5) {
      areas.add('Increase efficiency - work on quicker target acquisition');
    }
    if (areas.isEmpty) {
      areas.add('Excellent performance! Try increasing difficulty level');
    }
    
    return areas;
  }
}