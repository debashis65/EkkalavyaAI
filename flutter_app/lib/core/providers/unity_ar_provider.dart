import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ekkalavya_sports_ai/core/services/unity_ar_service.dart';
import 'package:ekkalavya_sports_ai/core/providers/api_provider.dart';

// Unity AR Service Provider
final unityARServiceProvider = Provider<UnityARService>((ref) {
  final apiService = ref.read(apiServiceProvider);
  return UnityARService(apiService);
});

// Unity AR Session State
class UnityARSessionState {
  final String? sessionId;
  final String sport;
  final String difficulty;
  final bool isActive;
  final Map<String, dynamic>? currentData;
  final String? errorMessage;

  const UnityARSessionState({
    this.sessionId,
    required this.sport,
    required this.difficulty,
    this.isActive = false,
    this.currentData,
    this.errorMessage,
  });

  UnityARSessionState copyWith({
    String? sessionId,
    String? sport,
    String? difficulty,
    bool? isActive,
    Map<String, dynamic>? currentData,
    String? errorMessage,
  }) {
    return UnityARSessionState(
      sessionId: sessionId ?? this.sessionId,
      sport: sport ?? this.sport,
      difficulty: difficulty ?? this.difficulty,
      isActive: isActive ?? this.isActive,
      currentData: currentData ?? this.currentData,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }
}

// Unity AR Session State Notifier
class UnityARSessionNotifier extends StateNotifier<UnityARSessionState> {
  final UnityARService _unityARService;

  UnityARSessionNotifier(this._unityARService)
      : super(const UnityARSessionState(sport: '', difficulty: ''));

  void startSession(String sport, String difficulty) {
    final sessionId = 'session_${DateTime.now().millisecondsSinceEpoch}';
    state = state.copyWith(
      sessionId: sessionId,
      sport: sport,
      difficulty: difficulty,
      isActive: true,
      errorMessage: null,
    );
  }

  void updateSessionData(Map<String, dynamic> data) {
    if (state.isActive) {
      state = state.copyWith(currentData: data);
    }
  }

  void endSession() {
    state = state.copyWith(isActive: false);
  }

  void setError(String error) {
    state = state.copyWith(errorMessage: error, isActive: false);
  }

  void clearError() {
    state = state.copyWith(errorMessage: null);
  }

  Future<void> syncSessionData(String userId, Map<String, dynamic> sessionData) async {
    if (!state.isActive) return;
    
    try {
      await _unityARService.syncSessionData(
        userId: userId,
        sport: state.sport,
        difficulty: state.difficulty,
        sessionData: sessionData,
      );
    } catch (e) {
      // Don't set error - sync failures shouldn't stop the session
      print('Failed to sync Unity AR session data: $e');
    }
  }
}

// Unity AR Session Provider
final unityARSessionProvider = StateNotifierProvider<UnityARSessionNotifier, UnityARSessionState>((ref) {
  final unityARService = ref.read(unityARServiceProvider);
  return UnityARSessionNotifier(unityARService);
});

// Unity AR User Sessions Provider
final unityARUserSessionsProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, userId) async {
  final unityARService = ref.read(unityARServiceProvider);
  return await unityARService.getUserSessions(userId);
});

// Unity AR Leaderboard Provider
final unityARLeaderboardProvider = FutureProvider.family<Map<String, dynamic>, String>((ref, sport) async {
  final unityARService = ref.read(unityARServiceProvider);
  return await unityARService.getSportLeaderboard(sport);
});

// Unity AR Sport Configuration Provider
final unityARSportConfigProvider = Provider.family<Map<String, dynamic>, String>((ref, sport) {
  final unityARService = ref.read(unityARServiceProvider);
  return unityARService.getSportConfiguration(sport);
});