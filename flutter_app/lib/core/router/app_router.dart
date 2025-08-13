import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ekkalavya_sports_ai/core/providers/auth_provider.dart';
import 'package:ekkalavya_sports_ai/features/auth/presentation/pages/login_page.dart';
import 'package:ekkalavya_sports_ai/features/auth/presentation/pages/role_selection_page.dart';
import 'package:ekkalavya_sports_ai/features/player/presentation/pages/player_dashboard.dart';
import 'package:ekkalavya_sports_ai/features/player/presentation/pages/player_profile.dart';
import 'package:ekkalavya_sports_ai/features/player/presentation/pages/ar_analysis_page.dart';
import 'package:ekkalavya_sports_ai/features/player/presentation/pages/performance_analytics.dart';
import 'package:ekkalavya_sports_ai/features/coach/presentation/pages/coach_dashboard.dart';
import 'package:ekkalavya_sports_ai/features/coach/presentation/pages/coach_profile.dart';
import 'package:ekkalavya_sports_ai/features/coach/presentation/pages/students_management.dart';
import 'package:ekkalavya_sports_ai/features/coach/presentation/pages/video_consultation.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/pages/splash_page.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final userRole = authState.user?.role;
      
      // Handle splash screen
      if (state.location == '/splash') {
        return null; // Allow splash screen
      }
      
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        return '/login';
      }
      
      // If authenticated but no role selected, redirect to role selection
      if (userRole == null) {
        return '/role-selection';
      }
      
      // If trying to access root, redirect to appropriate dashboard
      if (state.location == '/') {
        return userRole == 'coach' ? '/coach/dashboard' : '/player/dashboard';
      }
      
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/role-selection',
        builder: (context, state) => const RoleSelectionPage(),
      ),
      
      // Player Routes
      GoRoute(
        path: '/player/dashboard',
        builder: (context, state) => const PlayerDashboard(),
      ),
      GoRoute(
        path: '/player/profile',
        builder: (context, state) => const PlayerProfile(),
      ),
      GoRoute(
        path: '/player/ar-analysis',
        builder: (context, state) => const ARAnalysisPage(),
      ),
      GoRoute(
        path: '/player/analytics',
        builder: (context, state) => const PerformanceAnalytics(),
      ),
      
      // Coach Routes
      GoRoute(
        path: '/coach/dashboard',
        builder: (context, state) => const CoachDashboard(),
      ),
      GoRoute(
        path: '/coach/profile',
        builder: (context, state) => const CoachProfile(),
      ),
      GoRoute(
        path: '/coach/students',
        builder: (context, state) => const StudentsManagement(),
      ),
      GoRoute(
        path: '/coach/consultation',
        builder: (context, state) => const VideoConsultation(),
      ),
    ],
  );
});