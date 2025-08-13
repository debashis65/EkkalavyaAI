import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:ekkalavya_sports_ai/core/models/user_model.dart';

class ApiService {
  final Dio _dio;
  final FlutterSecureStorage _storage;
  
  static const String baseUrl = 'https://ekkalavya-sports-ai.onrender.com';
  static const String aiBackendUrl = 'https://ekkalavya-ai-backend.onrender.com';

  ApiService(this._dio, this._storage) {
    _dio.options.baseUrl = baseUrl;
    _dio.options.connectTimeout = const Duration(seconds: 30);
    _dio.options.receiveTimeout = const Duration(seconds: 30);
    
    // Add auth interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read(key: 'auth_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            await _storage.delete(key: 'auth_token');
          }
          handler.next(error);
        },
      ),
    );
  }

  // Authentication
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await _dio.post('/api/auth/login', data: {
        'email': email,
        'password': password,
      });
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<UserModel?> getCurrentUser() async {
    try {
      final response = await _dio.get('/api/auth/user');
      return UserModel.fromJson(response.data);
    } catch (e) {
      return null;
    }
  }

  Future<Map<String, dynamic>> updateUserRole(String role) async {
    try {
      final response = await _dio.patch('/api/auth/user/role', data: {
        'role': role,
      });
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Sports Analysis
  Future<Map<String, dynamic>> analyzeSportsVideo({
    required String sport,
    required String videoPath,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      final formData = FormData.fromMap({
        'sport': sport,
        'video': await MultipartFile.fromFile(videoPath),
        if (metadata != null) 'metadata': metadata,
      });

      final response = await Dio().post(
        '$aiBackendUrl/analyze_video',
        data: formData,
        options: Options(
          headers: {'Content-Type': 'multipart/form-data'},
          receiveTimeout: const Duration(minutes: 5),
        ),
      );
      
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getRealtimeAnalysis({
    required String sport,
    required String imageBase64,
  }) async {
    try {
      final response = await Dio().post(
        '$aiBackendUrl/analyze_realtime',
        data: {
          'sport': sport,
          'image': imageBase64,
        },
        options: Options(
          receiveTimeout: const Duration(seconds: 10),
        ),
      );
      
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getSupportedSports() async {
    try {
      final response = await Dio().get('$aiBackendUrl/sports');
      return List<Map<String, dynamic>>.from(response.data['sports']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getPersonalizedDrills({
    required String sport,
    required String skillLevel,
    List<String>? weakAreas,
  }) async {
    try {
      final response = await Dio().post(
        '$aiBackendUrl/recommend_drills',
        data: {
          'sport': sport,
          'skill_level': skillLevel,
          'weak_areas': weakAreas,
        },
      );
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Performance Data
  Future<List<Map<String, dynamic>>> getPerformanceHistory({
    required String userId,
    String? sport,
    int? limit,
  }) async {
    try {
      final response = await _dio.get('/api/performance/history', queryParameters: {
        'userId': userId,
        if (sport != null) 'sport': sport,
        if (limit != null) 'limit': limit,
      });
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> saveAnalysisResult(Map<String, dynamic> analysis) async {
    try {
      final response = await _dio.post('/api/performance/save', data: analysis);
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<List<Map<String, dynamic>>> getPlayerAchievements(String userId) async {
    try {
      final response = await _dio.get('/api/achievements/$userId');
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getPlayerDashboard(String userId) async {
    try {
      final response = await _dio.get('/api/player/dashboard/$userId');
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> getSkillProgression(String userId, String sport) async {
    try {
      final response = await _dio.get('/api/player/skills/$userId/$sport');
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Coach Features
  Future<List<Map<String, dynamic>>> getCoachStudents() async {
    try {
      final response = await _dio.get('/api/coach/students');
      return List<Map<String, dynamic>>.from(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }

  Future<Map<String, dynamic>> scheduleConsultation({
    required String studentId,
    required DateTime scheduledTime,
    String? notes,
  }) async {
    try {
      final response = await _dio.post('/api/coach/consultation/schedule', data: {
        'studentId': studentId,
        'scheduledTime': scheduledTime.toIso8601String(),
        'notes': notes,
      });
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(dynamic error) {
    if (error is DioException) {
      if (error.response != null) {
        return error.response!.data['message'] ?? 'Server error occurred';
      } else {
        return 'Network connection failed';
      }
    }
    return error.toString();
  }
}

final apiServiceProvider = Provider<ApiService>((ref) {
  const storage = FlutterSecureStorage();
  final dio = Dio();
  return ApiService(dio, storage);
});