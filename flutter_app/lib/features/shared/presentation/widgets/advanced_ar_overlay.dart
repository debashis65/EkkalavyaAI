import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'dart:math' as math;

class AdvancedAROverlay extends ConsumerStatefulWidget {
  final Map<String, dynamic>? analysisData;
  final String sport;
  final bool isRealtime;

  const AdvancedAROverlay({
    Key? key,
    this.analysisData,
    required this.sport,
    this.isRealtime = false,
  }) : super(key: key);

  @override
  ConsumerState<AdvancedAROverlay> createState() => _AdvancedAROverlayState();
}

class _AdvancedAROverlayState extends ConsumerState<AdvancedAROverlay> {
  
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.analysisData == null) {
      return const SizedBox.shrink();
    }

    return Stack(
      children: [
        // Pose Detection Overlay
        _buildPoseDetectionOverlay(),
        
        // Physics Trajectory Lines
        if (widget.sport == 'basketball' || widget.sport == 'tennis')
          _buildTrajectoryOverlay(),
        
        // Biomechanics Analysis
        _buildBiomechanicsOverlay(),
        
        // Performance Metrics HUD
        _buildPerformanceHUD(),
        
        // Real-time Recommendations
        if (widget.isRealtime)
          _buildRealtimeRecommendations(),
      ],
    );
  }

  Widget _buildPoseDetectionOverlay() {
    return CustomPaint(
      painter: PoseDetectionPainter(
        analysisData: widget.analysisData!,
        animation: const AlwaysStoppedAnimation(1.0),
        sport: widget.sport,
      ),
      child: Container(),
    );
  }

  Widget _buildTrajectoryOverlay() {
    return CustomPaint(
      painter: TrajectoryPainter(
        analysisData: widget.analysisData!,
        animation: const AlwaysStoppedAnimation(1.0),
        sport: widget.sport,
      ),
      child: Container(),
    );
  }

  Widget _buildBiomechanicsOverlay() {
    final biomechanics = widget.analysisData!['biomechanics'] as Map<String, dynamic>? ?? {};
    
    return Positioned(
      top: 16,
      right: 16,
      child: AnimatedBuilder(
        animation: const AlwaysStoppedAnimation(1.0),
        builder: (context, child) {
          return Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.7),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: AppTheme.primaryBlue.withOpacity(1.0),
                width: 2,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Biomechanics',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                _buildBiomechanicsMetric('Joint Angles', biomechanics['jointAngles']?.toString() ?? 'N/A'),
                _buildBiomechanicsMetric('Force Distribution', biomechanics['forceDistribution']?.toString() ?? 'N/A'),
                _buildBiomechanicsMetric('Balance Score', biomechanics['balanceScore']?.toString() ?? 'N/A'),
                _buildBiomechanicsMetric('Efficiency', biomechanics['efficiency']?.toString() ?? 'N/A'),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildBiomechanicsMetric(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '$label: ',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 12,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPerformanceHUD() {
    final performance = widget.analysisData!['performance'] as Map<String, dynamic>? ?? {};
    
    return Positioned(
      bottom: 100,
      left: 16,
      right: 16,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [
              Colors.black.withOpacity(0.8),
              Colors.black.withOpacity(0.6),
            ],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Text(
              'Performance Analysis',
              style: TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildPerformanceMetric('Form', performance['form']?.toString() ?? '0', Colors.green),
                _buildPerformanceMetric('Power', performance['power']?.toString() ?? '0', Colors.orange),
                _buildPerformanceMetric('Accuracy', performance['accuracy']?.toString() ?? '0', Colors.blue),
                _buildPerformanceMetric('Speed', performance['speed']?.toString() ?? '0', Colors.red),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPerformanceMetric(String label, String value, Color color) {
    return Column(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            borderRadius: BorderRadius.circular(25),
            border: Border.all(color: color, width: 2),
          ),
          child: Center(
            child: Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildRealtimeRecommendations() {
    final recommendations = widget.analysisData!['recommendations'] as List<dynamic>? ?? [];
    
    if (recommendations.isEmpty) return const SizedBox.shrink();
    
    return Positioned(
      top: 100,
      left: 16,
      right: 16,
      child: AnimatedBuilder(
        animation: const AlwaysStoppedAnimation(1.0),
        builder: (context, child) {
          return Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppTheme.primaryBlue.withOpacity(0.9),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryBlue.withOpacity(0.3),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  '🎯 AI Coaching Tips',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                ...recommendations.take(2).map((rec) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Text(
                    '• ${rec.toString()}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                    ),
                  ),
                )).toList(),
              ],
            ),
          );
        },
      ),
    );
  }
}

class PoseDetectionPainter extends CustomPainter {
  final Map<String, dynamic> analysisData;
  final Animation<double> animation;
  final String sport;

  PoseDetectionPainter({
    required this.analysisData,
    required this.animation,
    required this.sport,
  }) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.primaryBlue.withOpacity(0.8)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    // Draw pose detection skeleton based on sport
    _drawPoseSkeleton(canvas, size, paint);
    
    // Draw joint markers
    _drawJointMarkers(canvas, size, paint);
    
    // Draw movement vectors
    _drawMovementVectors(canvas, size, paint);
  }

  void _drawPoseSkeleton(Canvas canvas, Size size, Paint paint) {
    final poseData = analysisData['pose'] as Map<String, dynamic>? ?? {};
    final joints = poseData['joints'] as Map<String, dynamic>? ?? {};
    
    // Enhanced pose skeleton drawing based on detected keypoints
    if (joints.isNotEmpty) {
      // Draw body connections
      _drawConnection(canvas, size, joints, 'leftShoulder', 'rightShoulder', paint);
      _drawConnection(canvas, size, joints, 'leftShoulder', 'leftElbow', paint);
      _drawConnection(canvas, size, joints, 'leftElbow', 'leftWrist', paint);
      _drawConnection(canvas, size, joints, 'rightShoulder', 'rightElbow', paint);
      _drawConnection(canvas, size, joints, 'rightElbow', 'rightWrist', paint);
      
      // Sport-specific highlighting
      if (sport == 'basketball') {
        // Highlight shooting form
        paint.color = Colors.green.withOpacity(0.8);
        _drawConnection(canvas, size, joints, 'rightShoulder', 'rightWrist', paint);
      } else if (sport == 'tennis') {
        // Highlight racket swing
        paint.color = Colors.orange.withOpacity(0.8);
        _drawConnection(canvas, size, joints, 'rightShoulder', 'rightWrist', paint);
      }
    }
  }

  void _drawJointMarkers(Canvas canvas, Size size, Paint paint) {
    final poseData = analysisData['pose'] as Map<String, dynamic>? ?? {};
    final joints = poseData['joints'] as Map<String, dynamic>? ?? {};
    
    paint.style = PaintingStyle.fill;
    
    joints.forEach((jointName, position) {
      if (position is Map<String, dynamic>) {
        final x = (position['x'] as num?)?.toDouble() ?? 0.0;
        final y = (position['y'] as num?)?.toDouble() ?? 0.0;
        final confidence = (position['confidence'] as num?)?.toDouble() ?? 0.0;
        
        // Draw joint with confidence-based opacity
        paint.color = AppTheme.primaryBlue.withOpacity(confidence * animation.value);
        canvas.drawCircle(
          Offset(x * size.width, y * size.height),
          6 * confidence,
          paint,
        );
      }
    });
  }

  void _drawMovementVectors(Canvas canvas, Size size, Paint paint) {
    final movement = analysisData['movement'] as Map<String, dynamic>? ?? {};
    final vectors = movement['vectors'] as List<dynamic>? ?? [];
    
    paint.style = PaintingStyle.stroke;
    paint.color = Colors.yellow.withOpacity(0.7);
    paint.strokeWidth = 2;
    
    for (final vector in vectors) {
      if (vector is Map<String, dynamic>) {
        final startX = (vector['startX'] as num?)?.toDouble() ?? 0.0;
        final startY = (vector['startY'] as num?)?.toDouble() ?? 0.0;
        final endX = (vector['endX'] as num?)?.toDouble() ?? 0.0;
        final endY = (vector['endY'] as num?)?.toDouble() ?? 0.0;
        
        canvas.drawLine(
          Offset(startX * size.width, startY * size.height),
          Offset(endX * size.width, endY * size.height),
          paint,
        );
        
        // Draw arrow head
        _drawArrowHead(canvas, 
          Offset(startX * size.width, startY * size.height),
          Offset(endX * size.width, endY * size.height),
          paint,
        );
      }
    }
  }

  void _drawConnection(Canvas canvas, Size size, Map<String, dynamic> joints, 
      String joint1, String joint2, Paint paint) {
    final point1 = joints[joint1] as Map<String, dynamic>?;
    final point2 = joints[joint2] as Map<String, dynamic>?;
    
    if (point1 != null && point2 != null) {
      final x1 = (point1['x'] as num?)?.toDouble() ?? 0.0;
      final y1 = (point1['y'] as num?)?.toDouble() ?? 0.0;
      final x2 = (point2['x'] as num?)?.toDouble() ?? 0.0;
      final y2 = (point2['y'] as num?)?.toDouble() ?? 0.0;
      
      canvas.drawLine(
        Offset(x1 * size.width, y1 * size.height),
        Offset(x2 * size.width, y2 * size.height),
        paint,
      );
    }
  }

  void _drawArrowHead(Canvas canvas, Offset start, Offset end, Paint paint) {
    final arrowLength = 10.0;
    final arrowAngle = math.pi / 6;
    
    final angle = math.atan2(end.dy - start.dy, end.dx - start.dx);
    
    final arrowPoint1 = Offset(
      end.dx - arrowLength * math.cos(angle - arrowAngle),
      end.dy - arrowLength * math.sin(angle - arrowAngle),
    );
    
    final arrowPoint2 = Offset(
      end.dx - arrowLength * math.cos(angle + arrowAngle),
      end.dy - arrowLength * math.sin(angle + arrowAngle),
    );
    
    canvas.drawLine(end, arrowPoint1, paint);
    canvas.drawLine(end, arrowPoint2, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}

class TrajectoryPainter extends CustomPainter {
  final Map<String, dynamic> analysisData;
  final Animation<double> animation;
  final String sport;

  TrajectoryPainter({
    required this.analysisData,
    required this.animation,
    required this.sport,
  }) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final trajectoryData = analysisData['trajectory'] as Map<String, dynamic>? ?? {};
    final path = trajectoryData['path'] as List<dynamic>? ?? [];
    
    if (path.isEmpty) return;
    
    final paint = Paint()
      ..color = Colors.green.withOpacity(0.8)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;
    
    final trajectory = Path();
    bool isFirst = true;
    
    for (int i = 0; i < (path.length * animation.value).round(); i++) {
      final point = path[i] as Map<String, dynamic>?;
      if (point != null) {
        final x = (point['x'] as num?)?.toDouble() ?? 0.0;
        final y = (point['y'] as num?)?.toDouble() ?? 0.0;
        
        if (isFirst) {
          trajectory.moveTo(x * size.width, y * size.height);
          isFirst = false;
        } else {
          trajectory.lineTo(x * size.width, y * size.height);
        }
      }
    }
    
    canvas.drawPath(trajectory, paint);
    
    // Draw predicted trajectory
    _drawPredictedTrajectory(canvas, size, trajectoryData);
  }

  void _drawPredictedTrajectory(Canvas canvas, Size size, Map<String, dynamic> trajectoryData) {
    final predicted = trajectoryData['predicted'] as List<dynamic>? ?? [];
    
    if (predicted.isEmpty) return;
    
    final paint = Paint()
      ..color = Colors.orange.withOpacity(0.6)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke
      ; // Could add dashed effect here
    
    final predictedPath = Path();
    bool isFirst = true;
    
    for (final point in predicted) {
      if (point is Map<String, dynamic>) {
        final x = (point['x'] as num?)?.toDouble() ?? 0.0;
        final y = (point['y'] as num?)?.toDouble() ?? 0.0;
        
        if (isFirst) {
          predictedPath.moveTo(x * size.width, y * size.height);
          isFirst = false;
        } else {
          predictedPath.lineTo(x * size.width, y * size.height);
        }
      }
    }
    
    canvas.drawPath(predictedPath, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}