import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:ekkalavya_sports_ai/core/models/user_model.dart';
import 'package:ekkalavya_sports_ai/core/services/api_service.dart';

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final UserModel? user;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.isLoading = false,
    this.user,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    UserModel? user,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: error ?? this.error,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiService _apiService;
  final FlutterSecureStorage _storage;

  AuthNotifier(this._apiService, this._storage) : super(AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    state = state.copyWith(isLoading: true);
    
    try {
      final token = await _storage.read(key: 'auth_token');
      if (token != null) {
        final user = await _apiService.getCurrentUser();
        if (user != null) {
          state = state.copyWith(
            isAuthenticated: true,
            user: user,
            isLoading: false,
          );
          return;
        }
      }
    } catch (e) {
      await _storage.delete(key: 'auth_token');
    }
    
    state = state.copyWith(
      isAuthenticated: false,
      isLoading: false,
      user: null,
    );
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final result = await _apiService.login(email, password);
      if (result['success'] == true) {
        await _storage.write(key: 'auth_token', value: result['token']);
        final user = UserModel.fromJson(result['user']);
        
        state = state.copyWith(
          isAuthenticated: true,
          user: user,
          isLoading: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: result['message'] ?? 'Login failed',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Network error. Please try again.',
      );
      return false;
    }
  }

  Future<bool> register(String name, String email, String password, String role) async {
    state = state.copyWith(isLoading: true, error: null);
    
    try {
      final result = await _apiService.register(name, email, password, role);
      if (result['success'] == true) {
        // Auto-login after successful registration
        return await login(email, password);
      } else {
        state = state.copyWith(
          isLoading: false,
          error: result['message'] ?? 'Registration failed',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Network error. Please try again.',
      );
      return false;
    }
  }

  Future<bool> selectRole(String role) async {
    if (state.user == null) return false;
    
    state = state.copyWith(isLoading: true);
    
    try {
      final result = await _apiService.updateUserRole(role);
      if (result['success'] == true) {
        final updatedUser = state.user!.copyWith(role: role);
        state = state.copyWith(
          user: updatedUser,
          isLoading: false,
        );
        return true;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
    
    return false;
  }

  Future<void> logout() async {
    await _storage.delete(key: 'auth_token');
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  const storage = FlutterSecureStorage();
  return AuthNotifier(apiService, storage);
});