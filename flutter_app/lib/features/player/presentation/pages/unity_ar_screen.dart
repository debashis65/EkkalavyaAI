import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_unity_widget/flutter_unity_widget.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/core/services/enhanced_api_service.dart';
import 'package:ekkalavya_sports_ai/core/providers/api_provider.dart';
import 'package:ekkalavya_sports_ai/core/providers/auth_provider.dart';
import 'dart:convert';

class UnityARScreen extends ConsumerStatefulWidget {
  final String sport;
  final String difficulty;
  
  const UnityARScreen({
    Key? key,
    required this.sport,
    required this.difficulty,
  }) : super(key: key);

  @override
  ConsumerState<UnityARScreen> createState() => _UnityARScreenState();
}

class _UnityARScreenState extends ConsumerState<UnityARScreen>
    with TickerProviderStateMixin {
  UnityWidgetController? _unityController;
  bool _isUnityReady = false;
  bool _isSessionActive = false;
  String? _errorMessage;
  Map<String, dynamic>? _sessionData;
  int _currentScore = 0;
  int _targetsHit = 0;
  int _totalTargets = 8; // Default target count
  double _accuracy = 0.0;
  int _currentStreak = 0;
  int _maxStreak = 0;
  bool _showResults = false;
  bool _isPaused = false;
  
  // Session tracking
  DateTime? _sessionStartTime;
  List<Map<String, dynamic>> _bounceEvents = [];
  late AnimationController _scoreAnimationController;
  late Animation<double> _scoreAnimation;

  @override
  void initState() {
    super.initState();
    _scoreAnimationController = AnimationController(
      duration: const Duration(milliseconds: 500),
      vsync: this,
    );
    _scoreAnimation = Tween<double>(begin: 0.8, end: 1.2).animate(
      CurvedAnimation(parent: _scoreAnimationController, curve: Curves.elasticOut)
    );
    _checkPermissions();
  }

  @override
  void dispose() {
    _scoreAnimationController.dispose();
    _unityController?.dispose();
    super.dispose();
  }

  Future<void> _checkPermissions() async {
    final cameraStatus = await Permission.camera.request();
    final microphoneStatus = await Permission.microphone.request();
    
    if (cameraStatus.isDenied || microphoneStatus.isDenied) {
      setState(() {
        _errorMessage = 'Camera and microphone permissions are required for Unity AR tracking';
      });
    }
  }
  
  void _handleRoomModeDetection(Map<String, dynamic> data) {
    setState(() {
      _isRoomMode = data['is_room_mode'] ?? false;
      _roomConstraints = data['constraints'];
      _showRoomModeOptions = _isRoomMode;
    });
    
    if (_isRoomMode) {
      final width = _roomConstraints?['width'] ?? 0.0;
      final height = _roomConstraints?['height'] ?? 0.0;
      final isFlat = _roomConstraints?['is_flat'] ?? false;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Room Mode Detected: ${width.toStringAsFixed(1)}m × ${height.toStringAsFixed(1)}m'
          ),
          backgroundColor: AppTheme.primaryOrange,
          duration: const Duration(seconds: 3),
        ),
      );
      
      // Request drill pattern recommendation from Unity
      _unityController?.postMessage(
        'DrillController', 
        'RequestPatternRecommendation', 
        jsonEncode({
          'sport': widget.sport,
          'room_width': width,
          'room_height': height,
          'is_flat': isFlat,
        })
      );
    }
  }
  
  void _handleSafetyWarning(Map<String, dynamic> data) {
    final warning = data['warning'] as String;
    final severity = data['severity'] as String? ?? 'medium';
    
    setState(() {
      if (!_safetyWarnings.contains(warning)) {
        _safetyWarnings.add(warning);
      }
    });
    
    // Show critical safety warnings immediately
    if (severity == 'critical') {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.warning, color: Colors.red),
              SizedBox(width: 8),
              Text('Safety Warning'),
            ],
          ),
          content: Text(warning),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context);
                _pauseSession();
              },
              child: const Text('Pause Session'),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Acknowledge'),
            ),
          ],
        ),
      );
    }
  }
  
  void _handleDrillPatternRecommendation(Map<String, dynamic> data) {
    setState(() {
      _recommendedDrillPattern = data['pattern'] as String?;
    });
  }
  
  void _selectDrillPattern(String pattern) {
    _unityController?.postMessage(
      'DrillController',
      'SetDrillPattern',
      jsonEncode({
        'pattern': pattern,
        'sport': widget.sport,
        'difficulty': widget.difficulty,
        'room_constraints': _roomConstraints,
      })
    );
    
    setState(() {
      _showRoomModeOptions = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _showResults ? null : AppBar(
        title: Text('${widget.sport.toUpperCase()} Unity AR'),
        backgroundColor: AppTheme.primaryBlue,
        foregroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close),
          onPressed: _handleExit,
        ),
        actions: [
          if (_isSessionActive && !_isPaused)
            IconButton(
              icon: const Icon(Icons.pause),
              onPressed: _pauseSession,
            ),
          if (_isPaused)
            IconButton(
              icon: const Icon(Icons.play_arrow),
              onPressed: _resumeSession,
            ),
        ],
      ),
      body: _errorMessage != null
          ? _buildErrorScreen()
          : _showResults
              ? _buildResultsScreen()
              : _buildUnityARView(),
    );
  }

  Widget _buildErrorScreen() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [AppTheme.primaryBlue, Colors.red],
        ),
      ),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Unity AR Error',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.white70,
                ),
              ),
              const SizedBox(height: 32),
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () {
                        setState(() => _errorMessage = null);
                        _checkPermissions();
                      },
                      icon: const Icon(Icons.refresh),
                      label: const Text('Retry'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppTheme.primaryBlue,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.arrow_back),
                      label: const Text('Go Back'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUnityARView() {
    return Stack(
      children: [
        // Unity AR View
        UnityWidget(
          onUnityCreated: _onUnityCreated,
          onUnityMessage: _onUnityMessage,
          onUnitySceneLoaded: _onUnitySceneLoaded,
          fullscreen: true,
          hideStatus: true,
          runImmediately: true,
        ),
        
        // Loading overlay
        if (!_isUnityReady)
          Container(
            color: Colors.black87,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryBlue.withOpacity(0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      strokeWidth: 3,
                    ),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    'Initializing Unity AR...',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Preparing ${widget.sport} environment',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            ),
          ),
        
        // Pause overlay
        if (_isPaused && _isUnityReady)
          Container(
            color: Colors.black54,
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.pause_circle_outline,
                    size: 80,
                    color: Colors.white,
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Session Paused',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: _resumeSession,
                    icon: const Icon(Icons.play_arrow),
                    label: const Text('Resume'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryOrange,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 32, vertical: 16),
                    ),
                  ),
                ],
              ),
            ),
          ),
        
        // Room Mode selection overlay
        if (_showRoomModeOptions && _isUnityReady)
          Positioned.fill(
            child: Container(
              color: Colors.black87,
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryOrange.withOpacity(0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.home,
                          size: 64,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Room Mode Detected',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      if (_roomConstraints != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          'Space: ${_roomConstraints!['width']?.toStringAsFixed(1)}m × ${_roomConstraints!['height']?.toStringAsFixed(1)}m',
                          style: const TextStyle(
                            fontSize: 16,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                      const SizedBox(height: 32),
                      const Text(
                        'Select Training Pattern',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildDrillPatternOptions(),
                    ],
                  ),
                ),
              ),
            ),
          ),

        // Safety warnings overlay
        if (_safetyWarnings.isNotEmpty && _isSessionActive)
          Positioned(
            bottom: 100,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.9),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.warning, color: Colors.white),
                      SizedBox(width: 8),
                      Text(
                        'Safety Warnings',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ...(_safetyWarnings.take(3).map((warning) => 
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        '• $warning',
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                      ),
                    )
                  )),
                  if (_safetyWarnings.length > 3)
                    Text(
                      '... and ${_safetyWarnings.length - 3} more',
                      style: const TextStyle(color: Colors.white70, fontSize: 10),
                    ),
                ],
              ),
            ),
          ),

        // Real-time stats overlay
        if (_isUnityReady && _isSessionActive && !_isPaused)
          Positioned(
            top: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (_isRoomMode)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryOrange,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Text(
                        'ROOM MODE',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  if (_isRoomMode) const SizedBox(height: 8),
                  AnimatedBuilder(
                    animation: _scoreAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _scoreAnimation.value,
                        child: Text(
                          'Score: $_currentScore',
                          style: const TextStyle(
                            color: AppTheme.primaryOrange,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Targets: $_targetsHit/$_totalTargets',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    'Accuracy: ${(_accuracy * 100).toStringAsFixed(1)}%',
                    style: TextStyle(
                      color: _accuracy > 0.8 ? AppTheme.primaryGreen : 
                             _accuracy > 0.6 ? Colors.orange : Colors.red,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  if (_currentStreak > 0)
                    Text(
                      'Streak: $_currentStreak 🔥',
                      style: const TextStyle(
                        color: AppTheme.primaryOrange,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                ],
              ),
            ),
          ),
        
        // Progress indicator
        if (_isUnityReady && _isSessionActive && !_isPaused && _totalTargets > 0)
          Positioned(
            top: 16,
            left: 16,
            child: Container(
              width: 200,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black87,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.5)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Progress',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  LinearProgressIndicator(
                    value: _targetsHit / _totalTargets,
                    backgroundColor: Colors.grey.shade700,
                    valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryBlue),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${((_targetsHit / _totalTargets) * 100).toInt()}% Complete',
                    style: const TextStyle(
                      color: AppTheme.primaryBlue,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildResultsScreen() {
    final sessionData = _sessionData ?? {};
    final summary = sessionData['summary'] as Map<String, dynamic>? ?? {};
    
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [AppTheme.primaryBlue, AppTheme.primaryOrange],
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.emoji_events,
                  size: 64,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Session Complete!',
                style: TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                widget.sport.toUpperCase(),
                style: const TextStyle(
                  fontSize: 18,
                  color: Colors.white70,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 32),
              
              // Results cards
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    children: [
                      _ResultCard(
                        title: 'Final Score',
                        value: '${summary['score'] ?? _currentScore}',
                        subtitle: 'points',
                        color: AppTheme.primaryOrange,
                        icon: Icons.star,
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: _ResultCard(
                              title: 'Accuracy',
                              value: '${((summary['hit_pct'] ?? _accuracy * 100)).toStringAsFixed(1)}%',
                              subtitle: 'precision',
                              color: AppTheme.primaryGreen,
                              icon: Icons.my_location,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _ResultCard(
                              title: 'Max Streak',
                              value: '${summary['streak_max'] ?? _maxStreak}',
                              subtitle: 'consecutive hits',
                              color: Colors.purple,
                              icon: Icons.trending_up,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(
                            child: _ResultCard(
                              title: 'Avg Error',
                              value: '${(summary['avg_error_m'] ?? 0.0).toStringAsFixed(3)}m',
                              subtitle: 'precision',
                              color: Colors.indigo,
                              icon: Icons.center_focus_strong,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _ResultCard(
                              title: 'Session Time',
                              value: _formatDuration(summary['session_duration'] ?? 0.0),
                              subtitle: 'duration',
                              color: Colors.teal,
                              icon: Icons.timer,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      
                      // Performance rating
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.9),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.1),
                              blurRadius: 10,
                              offset: const Offset(0, 5),
                            ),
                          ],
                        ),
                        child: Column(
                          children: [
                            const Text(
                              'Performance Rating',
                              style: TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: AppTheme.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 16),
                            _buildStarRating(_calculateOverallRating()),
                            const SizedBox(height: 8),
                            Text(
                              _getRatingText(_calculateOverallRating()),
                              style: TextStyle(
                                fontSize: 16,
                                color: _getRatingColor(_calculateOverallRating()),
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              
              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: _playAgain,
                      icon: const Icon(Icons.replay),
                      label: const Text('Play Again'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white,
                        side: const BorderSide(color: Colors.white, width: 2),
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => Navigator.pop(context, _sessionData),
                      icon: const Icon(Icons.home),
                      label: const Text('Finish'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppTheme.primaryBlue,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _onUnityCreated(UnityWidgetController controller) {
    _unityController = controller;
    _initializeUnitySession();
  }

  // Room Mode state
  bool _isRoomMode = false;
  Map<String, dynamic>? _roomConstraints;
  List<String> _safetyWarnings = [];
  String? _recommendedDrillPattern;
  bool _showRoomModeOptions = false;

  void _onUnityMessage(message) {
    print('Unity Message: ${message.name} - ${message.data}');
    
    try {
      switch (message.name) {
        case 'SessionReady':
          setState(() {
            _isUnityReady = true;
            _sessionStartTime = DateTime.now();
          });
          break;
          
        case 'RoomModeDetected':
          final data = jsonDecode(message.data as String);
          _handleRoomModeDetection(data);
          break;
          
        case 'SafetyWarning':
          final data = jsonDecode(message.data as String);
          _handleSafetyWarning(data);
          break;
          
        case 'DrillPatternRecommendation':
          final data = jsonDecode(message.data as String);
          _handleDrillPatternRecommendation(data);
          break;
          
        case 'SessionStarted':
          final data = jsonDecode(message.data as String);
          setState(() {
            _isSessionActive = true;
            _totalTargets = data['total_targets'] ?? 8;
          });
          break;
          
        case 'ScoreUpdate':
          final data = jsonDecode(message.data as String);
          setState(() {
            int newScore = data['score'] ?? 0;
            if (newScore > _currentScore) {
              _scoreAnimationController.forward().then((_) {
                _scoreAnimationController.reverse();
              });
            }
            _currentScore = newScore;
            _targetsHit = data['targets_hit'] ?? 0;
            _totalTargets = data['total_targets'] ?? _totalTargets;
            _accuracy = (data['accuracy'] ?? 0.0).toDouble();
            _currentStreak = data['current_streak'] ?? 0;
            _maxStreak = data['max_streak'] ?? _maxStreak;
          });
          break;
          
        case 'BounceDetected':
          final data = jsonDecode(message.data as String);
          _bounceEvents.add({
            'timestamp': DateTime.now().millisecondsSinceEpoch,
            'position': data['position'],
            'hit': data['hit'] ?? false,
            'error': data['error'] ?? 0.0,
          });
          break;
          
        case 'SessionComplete':
          _handleSessionComplete(message.data);
          break;
          
        case 'Error':
          setState(() {
            _errorMessage = message.data.toString();
          });
          break;
      }
    } catch (e) {
      print('Error processing Unity message: $e');
    }
  }

  void _onUnitySceneLoaded(SceneLoaded scene) {
    print('Unity Scene Loaded: ${scene.name}');
  }

  void _initializeUnitySession() async {
    final user = ref.read(authProvider);
    final apiService = ref.read(apiServiceProvider);
    
    final config = {
      'sport': widget.sport,
      'difficulty': widget.difficulty,
      'userId': user?.id ?? 'guest_${DateTime.now().millisecondsSinceEpoch}',
      'apiEndpoint': apiService.baseUrl,
      'userToken': user?.token ?? '',
      'sessionId': 'session_${DateTime.now().millisecondsSinceEpoch}',
    };
    
    _unityController?.postMessage(
      'ARSessionManager',
      'InitializeSession',
      jsonEncode(config),
    );
  }

  void _handleSessionComplete(dynamic data) async {
    try {
      final sessionData = jsonDecode(data.toString());
      
      // Add bounce events to session data
      sessionData['bounceEvents'] = _bounceEvents;
      sessionData['sessionDuration'] = _sessionStartTime != null 
          ? DateTime.now().difference(_sessionStartTime!).inSeconds.toDouble()
          : 0.0;
      
      // Sync session data to backend
      await _syncSessionData(sessionData);
      
      setState(() {
        _sessionData = sessionData;
        _showResults = true;
        _isSessionActive = false;
        _isPaused = false;
      });
    } catch (e) {
      print('Error handling session complete: $e');
      setState(() {
        _errorMessage = 'Failed to process session results: $e';
      });
    }
  }

  Future<void> _syncSessionData(Map<String, dynamic> sessionData) async {
    try {
      final user = ref.read(authProvider);
      if (user == null) return;
      
      final apiService = ref.read(apiServiceProvider);
      
      final payload = {
        'userId': user.id,
        'sessionData': sessionData,
        'sport': widget.sport,
        'difficulty': widget.difficulty,
        'platform': 'flutter',
        'timestamp': DateTime.now().toIso8601String(),
        'bounceEvents': _bounceEvents,
        'finalStats': {
          'score': _currentScore,
          'accuracy': _accuracy,
          'targetsHit': _targetsHit,
          'totalTargets': _totalTargets,
          'maxStreak': _maxStreak,
        },
      };
      
      await apiService.post('/api/unity-ar/sessions', payload);
      print('Session data synced successfully');
    } catch (e) {
      print('Error syncing session data: $e');
      // Don't show error to user - data is saved locally in sessionData
    }
  }

  void _pauseSession() {
    setState(() => _isPaused = true);
    _unityController?.postMessage('ARSessionManager', 'PauseSession', '');
  }

  void _resumeSession() {
    setState(() => _isPaused = false);
    _unityController?.postMessage('ARSessionManager', 'ResumeSession', '');
  }

  void _playAgain() {
    setState(() {
      _showResults = false;
      _sessionData = null;
      _currentScore = 0;
      _targetsHit = 0;
      _totalTargets = 8;
      _accuracy = 0.0;
      _currentStreak = 0;
      _maxStreak = 0;
      _bounceEvents.clear();
    });
    
    _initializeUnitySession();
  }

  void _handleExit() {
    if (_isSessionActive && !_isPaused) {
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('End Session?'),
          content: const Text('Your current progress will be lost. Are you sure you want to exit?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Continue Playing'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(context); // Close dialog
                Navigator.pop(context); // Exit Unity AR
              },
              style: TextButton.styleFrom(foregroundColor: Colors.red),
              child: const Text('End Session'),
            ),
          ],
        ),
      );
    } else {
      Navigator.pop(context);
    }
  }

  String _formatDuration(double seconds) {
    int minutes = (seconds / 60).floor();
    int remainingSeconds = (seconds % 60).floor();
    return '${minutes}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  double _calculateOverallRating() {
    double accuracyScore = _accuracy * 5;
    double streakScore = (_maxStreak / _totalTargets) * 5;
    double completionScore = (_targetsHit / _totalTargets) * 5;
    
    return (accuracyScore + streakScore + completionScore) / 3;
  }

  String _getRatingText(double rating) {
    if (rating >= 4.5) return 'Excellent!';
    if (rating >= 3.5) return 'Great!';
    if (rating >= 2.5) return 'Good';
    if (rating >= 1.5) return 'Fair';
    return 'Keep Practicing';
  }

  Color _getRatingColor(double rating) {
    if (rating >= 4.5) return AppTheme.primaryGreen;
    if (rating >= 3.5) return AppTheme.primaryOrange;
    if (rating >= 2.5) return Colors.orange;
    if (rating >= 1.5) return Colors.red;
    return Colors.red;
  }

  Widget _buildStarRating(double rating) {
    int fullStars = rating.floor();
    bool hasHalfStar = (rating - fullStars) >= 0.5;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(5, (index) {
        if (index < fullStars) {
          return const Icon(Icons.star, color: Colors.amber, size: 28);
        } else if (index == fullStars && hasHalfStar) {
          return const Icon(Icons.star_half, color: Colors.amber, size: 28);
        } else {
          return const Icon(Icons.star_border, color: Colors.grey, size: 28);
        }
      }),
    );
  }

  Widget _buildDrillPatternOptions() {
    final patterns = [
      {
        'id': 'dribble_box',
        'name': 'Dribble Box',
        'description': '2×2m control area with precision targets',
        'icon': Icons.grid_view,
        'recommended': _recommendedDrillPattern == 'dribble_box',
      },
      {
        'id': 'micro_ladder',
        'name': 'Micro Ladder',
        'description': '6-rung footwork pattern for agility',
        'icon': Icons.linear_scale,
        'recommended': _recommendedDrillPattern == 'micro_ladder',
      },
      {
        'id': 'figure_8',
        'name': 'Figure-8',
        'description': 'Dual anchor system for direction changes',
        'icon': Icons.all_inclusive,
        'recommended': _recommendedDrillPattern == 'figure_8',
      },
      {
        'id': 'wall_rebound',
        'name': 'Wall Rebound',
        'description': 'Floor targets with wall-assisted drills',
        'icon': Icons.sports_basketball,
        'recommended': _recommendedDrillPattern == 'wall_rebound',
      },
      {
        'id': 'seated_control',
        'name': 'Seated Control',
        'description': 'Accessibility-focused micro training',
        'icon': Icons.accessible,
        'recommended': _recommendedDrillPattern == 'seated_control',
      },
    ];

    return Column(
      children: patterns.map((pattern) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: pattern['recommended'] as bool 
                ? AppTheme.primaryOrange 
                : Colors.white30,
              width: pattern['recommended'] as bool ? 2 : 1,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: ListTile(
            leading: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: pattern['recommended'] as bool 
                  ? AppTheme.primaryOrange 
                  : Colors.white24,
                shape: BoxShape.circle,
              ),
              child: Icon(
                pattern['icon'] as IconData,
                color: Colors.white,
                size: 20,
              ),
            ),
            title: Row(
              children: [
                Text(
                  pattern['name'] as String,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (pattern['recommended'] as bool) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryOrange,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text(
                      'RECOMMENDED',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ],
            ),
            subtitle: Text(
              pattern['description'] as String,
              style: const TextStyle(color: Colors.white70, fontSize: 12),
            ),
            onTap: () => _selectDrillPattern(pattern['id'] as String),
          ),
        ),
      )).toList(),
    );
  }
}

class _ResultCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final Color color;
  final IconData icon;

  const _ResultCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.9),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              size: 32,
              color: color,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.grey,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}