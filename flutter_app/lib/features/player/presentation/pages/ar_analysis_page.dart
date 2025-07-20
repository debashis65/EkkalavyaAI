import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/core/services/api_service.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/custom_app_bar.dart';
import 'dart:convert';
import 'dart:io';

class ARAnalysisPage extends ConsumerStatefulWidget {
  const ARAnalysisPage({Key? key}) : super(key: key);

  @override
  ConsumerState<ARAnalysisPage> createState() => _ARAnalysisPageState();
}

class _ARAnalysisPageState extends ConsumerState<ARAnalysisPage> {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isRecording = false;
  bool _isAnalyzing = false;
  String _selectedSport = 'basketball';
  Map<String, dynamic>? _currentAnalysis;
  String? _errorMessage;

  final List<String> _sports = [
    'basketball',
    'tennis',
    'swimming',
    'gymnastics',
    'soccer',
    'baseball',
    'volleyball',
    'badminton',
  ];

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    // Request camera permission
    final status = await Permission.camera.request();
    if (status.isDenied) {
      setState(() {
        _errorMessage = 'Camera permission is required for analysis';
      });
      return;
    }

    try {
      _cameras = await availableCameras();
      if (_cameras!.isNotEmpty) {
        _cameraController = CameraController(
          _cameras![0],
          ResolutionPreset.high,
          enableAudio: false,
        );
        await _cameraController!.initialize();
        setState(() {});
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to initialize camera: $e';
      });
    }
  }

  Future<void> _startAnalysis() async {
    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return;
    }

    setState(() {
      _isAnalyzing = true;
      _errorMessage = null;
    });

    try {
      // Capture image for analysis
      final image = await _cameraController!.takePicture();
      final imageBytes = await File(image.path).readAsBytes();
      final imageBase64 = base64Encode(imageBytes);

      // Send to AI backend for real-time analysis
      final apiService = ref.read(apiServiceProvider);
      final result = await apiService.getRealtimeAnalysis(
        sport: _selectedSport,
        imageBase64: imageBase64,
      );

      setState(() {
        _currentAnalysis = result;
        _isAnalyzing = false;
      });

      // Save analysis result
      await apiService.saveAnalysisResult({
        'sport': _selectedSport,
        'analysis': result,
        'timestamp': DateTime.now().toIso8601String(),
      });

    } catch (e) {
      setState(() {
        _isAnalyzing = false;
        _errorMessage = 'Analysis failed: $e';
      });
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Realtime Sports Connect AI Analysis'),
      body: Column(
        children: [
          // Sports Selection
          Container(
            padding: const EdgeInsets.all(16),
            child: DropdownButtonFormField<String>(
              value: _selectedSport,
              decoration: const InputDecoration(
                labelText: 'Select Sport',
                prefixIcon: Icon(Icons.sports),
              ),
              items: _sports.map((sport) => DropdownMenuItem(
                value: sport,
                child: Text(sport.toUpperCase()),
              )).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() {
                    _selectedSport = value;
                    _currentAnalysis = null; // Clear previous analysis
                  });
                }
              },
            ),
          ),

          // Camera Preview
          Expanded(
            flex: 3,
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: _buildCameraPreview(),
              ),
            ),
          ),

          const SizedBox(height: 16),

          // Analysis Controls
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isAnalyzing ? null : _startAnalysis,
                    icon: _isAnalyzing
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Icon(Icons.analytics),
                    label: Text(_isAnalyzing ? 'Analyzing...' : 'Analyze Now'),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Analysis Results
          Expanded(
            flex: 2,
            child: Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: _buildAnalysisResults(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCameraPreview() {
    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 16,
                color: Colors.red,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _initializeCamera,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_cameraController == null || !_cameraController!.value.isInitialized) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    return Stack(
      fit: StackFit.expand,
      children: [
        CameraPreview(_cameraController!),
        
        // Overlay for pose detection indicators
        if (_currentAnalysis != null)
          CustomPaint(
            painter: PoseOverlayPainter(_currentAnalysis!),
          ),
        
        // Recording indicator
        if (_isRecording)
          Positioned(
            top: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.fiber_manual_record, color: Colors.white, size: 12),
                  SizedBox(width: 4),
                  Text('REC', style: TextStyle(color: Colors.white, fontSize: 12)),
                ],
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildAnalysisResults() {
    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red),
            ),
          ],
        ),
      );
    }

    if (_currentAnalysis == null) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.analytics_outlined, size: 48, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'Start analysis to see real-time feedback',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey,
              ),
            ),
          ],
        ),
      );
    }

    // Display the 8 essential coaching metrics
    final metrics = _currentAnalysis!['metrics'] as Map<String, dynamic>? ?? {};
    final feedback = _currentAnalysis!['feedback'] as List<dynamic>? ?? [];

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Performance Metrics',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          
          // 8 Essential Metrics Grid
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 2,
            childAspectRatio: 2.5,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            children: [
              _MetricCard(
                title: 'Form Score',
                value: '${metrics['form'] ?? 0}%',
                color: AppTheme.primaryOrange,
              ),
              _MetricCard(
                title: 'Balance',
                value: '${metrics['balance'] ?? 0}%',
                color: AppTheme.primaryBlue,
              ),
              _MetricCard(
                title: 'Power',
                value: '${metrics['power'] ?? 0}%',
                color: AppTheme.primaryGreen,
              ),
              _MetricCard(
                title: 'Consistency',
                value: '${metrics['consistency'] ?? 0}%',
                color: Colors.purple,
              ),
              _MetricCard(
                title: 'Speed',
                value: '${metrics['speed'] ?? 0}%',
                color: Colors.indigo,
              ),
              _MetricCard(
                title: 'Accuracy',
                value: '${metrics['accuracy'] ?? 0}%',
                color: Colors.teal,
              ),
              _MetricCard(
                title: 'Timing',
                value: '${metrics['timing'] ?? 0}%',
                color: Colors.orange,
              ),
              _MetricCard(
                title: 'Technique',
                value: '${metrics['technique'] ?? 0}%',
                color: Colors.red,
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // AI Feedback
          if (feedback.isNotEmpty) ...[
            const Text(
              'AI Coaching Feedback',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            ...feedback.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.lightbulb_outline,
                    size: 16,
                    color: AppTheme.primaryOrange,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      item.toString(),
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            )),
          ],
        ],
      ),
    );
  }
}

class _MetricCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;

  const _MetricCard({
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

class PoseOverlayPainter extends CustomPainter {
  final Map<String, dynamic> analysis;

  PoseOverlayPainter(this.analysis);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.primaryOrange
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    // Draw pose landmarks if available
    final landmarks = analysis['landmarks'] as List<dynamic>?;
    if (landmarks != null && landmarks.isNotEmpty) {
      for (int i = 0; i < landmarks.length; i++) {
        final landmark = landmarks[i] as Map<String, dynamic>;
        final x = (landmark['x'] as double) * size.width;
        final y = (landmark['y'] as double) * size.height;
        
        canvas.drawCircle(
          Offset(x, y),
          4,
          Paint()..color = AppTheme.primaryOrange,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}