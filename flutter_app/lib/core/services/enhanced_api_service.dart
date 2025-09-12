import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:ekkalavya_sports_ai/core/services/api_service.dart';

class EnhancedApiService extends ApiService {
  EnhancedApiService(Dio dio, FlutterSecureStorage storage) : super(dio, storage);

  // Access parent class properties - use inherited getters
  @override
  String get baseUrl => ApiService.baseUrl;

  // Advanced Real-time Analysis with Multiple AI Models
  Future<Map<String, dynamic>> getAdvancedRealtimeAnalysis({
    required String sport,
    required String imageBase64,
    String analysisLevel = 'comprehensive',
    bool includePhysics = true,
    bool includeBiomechanics = true,
    bool includePerformancePrediction = true,
  }) async {
    // Development mode for testing purposes ONLY
    if (ApiService.isDevelopmentMode && imageBase64.isEmpty) {
      // Return structure for testing, but with zero scores to indicate no real analysis
      await Future.delayed(const Duration(milliseconds: 800));
      return {
        'analysis': {
          'sport': sport,
          'overallScore': 0,
          'formScore': 0,
          'powerScore': 0,
          'precisionScore': 0,
          'balanceScore': 0,
          'biomechanics': {
            'posture': 0,
            'balance': 0,
            'coordination': 0,
          },
          'physics': {
            'velocity': 0,
            'acceleration': 0,
            'trajectory': 0,
          },
          'coaching_tips': [
            'Position yourself in camera view to begin real analysis',
            'Ensure good lighting for accurate pose detection',
          ],
          'pose_detected': false,
        },
        'success': false,
        'error': 'No image data provided - testing mode',
      };
    }
    
    try {
      final response = await dio.post(
        '$baseUrl/api/analysis/advanced-realtime',
        data: {
          'sport': sport,
          'image': imageBase64,
          'analysisLevel': analysisLevel,
          'includePhysics': includePhysics,
          'includeBiomechanics': includeBiomechanics,
          'includePerformancePrediction': includePerformancePrediction,
          'modelVersion': '2.0', // Enhanced AI model
          'enhancedFeatures': [
            'pose_detection_v3',
            'biomechanics_analysis',
            'physics_simulation',
            'performance_prediction',
            'real_time_coaching',
          ],
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('Advanced analysis failed: $e');
    }
  }

  // Multi-Sport Performance Comparison
  Future<Map<String, dynamic>> getMultiSportPerformanceComparison({
    required String userId,
    required List<String> sports,
    String timeframe = '30days',
  }) async {
    if (ApiService.isDevelopmentMode) {
      // Development mode - return mock multi-sport comparison data
      await Future.delayed(const Duration(milliseconds: 1200));
      return {
        'userId': userId,
        'sports': sports,
        'timeframe': timeframe,
        'comparison': {
          for (String sport in sports) sport: {
            'averageScore': 70 + (sport.hashCode % 25),
            'improvement': '${(sport.hashCode % 20) - 10}%',
            'strongAreas': ['Technique', 'Consistency'],
            'weakAreas': ['Power', 'Speed'],
            'recommendation': 'Focus on power training for $sport',
          }
        },
        'overallRanking': sports.asMap().map((index, sport) => MapEntry(sport, index + 1)),
        'suggestions': [
          'Cross-training between sports can improve overall performance',
          'Focus on common weak areas across multiple sports',
        ],
        'success': true,
      };
    }
    
    try {
      final response = await dio.post(
        '$baseUrl/api/analysis/multi-sport-comparison',
        data: {
          'userId': userId,
          'sports': sports,
          'timeframe': timeframe,
          'includeProjections': true,
          'includeRecommendations': true,
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('Multi-sport comparison failed: $e');
    }
  }

  // Advanced Video Analysis with AI Coaching
  Future<Map<String, dynamic>> analyzeVideoWithAICoaching({
    required String videoBase64,
    required String sport,
    String analysisType = 'comprehensive',
  }) async {
    try {
      final response = await dio.post(
        '$baseUrl/api/analysis/video-ai-coaching',
        data: {
          'video': videoBase64,
          'sport': sport,
          'analysisType': analysisType,
          'features': [
            'frame_by_frame_analysis',
            'motion_tracking',
            'technique_assessment',
            'improvement_suggestions',
            'skill_progression_mapping',
          ],
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('Video analysis failed: $e');
    }
  }

  // Predictive Performance Analytics
  Future<Map<String, dynamic>> getPredictivePerformanceAnalytics({
    required String userId,
    required String sport,
    int predictionDays = 30,
  }) async {
    try {
      final response = await dio.get(
        '$baseUrl/api/analytics/predictive-performance',
        queryParameters: {
          'userId': userId,
          'sport': sport,
          'predictionDays': predictionDays,
          'includeInjuryRisk': true,
          'includePerformanceOptimization': true,
          'includeTrainingRecommendations': true,
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('Predictive analytics failed: $e');
    }
  }

  // Advanced Coach-Student Interaction Analytics
  Future<Map<String, dynamic>> getCoachStudentInteractionAnalytics({
    required String coachId,
    required String studentId,
    String timeframe = '30days',
  }) async {
    try {
      final response = await dio.get(
        '$baseUrl/api/analytics/coach-student-interaction',
        queryParameters: {
          'coachId': coachId,
          'studentId': studentId,
          'timeframe': timeframe,
          'includeSessionEffectiveness': true,
          'includeProgressCorrelation': true,
          'includeRecommendations': true,
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('Interaction analytics failed: $e');
    }
  }

  // Real-time Skill Assessment during Training
  Future<Map<String, dynamic>> assessSkillRealtimeDuringTraining({
    required String userId,
    required String sport,
    required List<Map<String, dynamic>> motionData,
  }) async {
    try {
      final response = await dio.post(
        '$baseUrl/api/analysis/realtime-skill-assessment',
        data: {
          'userId': userId,
          'sport': sport,
          'motionData': motionData,
          'assessmentLevel': 'advanced',
          'provideFeedback': true,
          'includeCorrections': true,
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('Real-time skill assessment failed: $e');
    }
  }

  // Advanced Session Planning with AI Optimization
  Future<Map<String, dynamic>> createAIOptimizedSessionPlan({
    required String coachId,
    required String studentId,
    required String sport,
    required Map<String, dynamic> studentProfile,
  }) async {
    try {
      final response = await dio.post(
        '$baseUrl/api/coaching/ai-optimized-session-plan',
        data: {
          'coachId': coachId,
          'studentId': studentId,
          'sport': sport,
          'studentProfile': studentProfile,
          'optimizationLevel': 'advanced',
          'includePersonalization': true,
          'includeProgressiveOverload': true,
          'includeInjuryPrevention': true,
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('AI session planning failed: $e');
    }
  }

  // Enhanced Performance Metrics with Machine Learning
  Future<Map<String, dynamic>> getEnhancedPerformanceMetrics({
    required String userId,
    required String sport,
    String period = '30days',
  }) async {
    try {
      final response = await dio.get(
        '$baseUrl/api/metrics/enhanced-performance',
        queryParameters: {
          'userId': userId,
          'sport': sport,
          'period': period,
          'includeMLPredictions': true,
          'includeCompetitorAnalysis': true,
          'includeOptimizationSuggestions': true,
          'enhancedMetrics': [
            'technique_consistency',
            'power_efficiency',
            'endurance_progression',
            'skill_mastery_level',
            'injury_risk_assessment',
          ].join(','),
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('Enhanced metrics failed: $e');
    }
  }

  // Advanced Team/Group Analytics for Coaches
  Future<Map<String, dynamic>> getAdvancedTeamAnalytics({
    required String coachId,
    required List<String> studentIds,
    String sport = 'all',
  }) async {
    try {
      final response = await dio.post(
        '$baseUrl/api/analytics/advanced-team',
        data: {
          'coachId': coachId,
          'studentIds': studentIds,
          'sport': sport,
          'analysisDepth': 'comprehensive',
          'includeComparativeAnalysis': true,
          'includeTeamDynamics': true,
          'includeOptimizationStrategies': true,
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('Team analytics failed: $e');
    }
  }

  // Competition Preparation Analysis
  Future<Map<String, dynamic>> getCompetitionPreparationAnalysis({
    required String userId,
    required String sport,
    required String competitionType,
    required DateTime competitionDate,
  }) async {
    try {
      final response = await dio.post(
        '$baseUrl/api/analysis/competition-preparation',
        data: {
          'userId': userId,
          'sport': sport,
          'competitionType': competitionType,
          'competitionDate': competitionDate.toIso8601String(),
          'preparationLevel': 'professional',
          'includeTrainingPlan': true,
          'includePerformanceTargets': true,
          'includeRiskAssessment': true,
        },
        options: await _getAuthenticatedOptions(),
      );
      return response.data;
    } catch (e) {
      throw Exception('Competition preparation analysis failed: $e');
    }
  }

  Future<Options> _getAuthenticatedOptions() async {
    final token = await secureStorage.read(key: 'auth_token');
    return Options(
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      sendTimeout: const Duration(minutes: 5), // Extended timeout for advanced analysis
      receiveTimeout: const Duration(minutes: 5),
    );
  }
}