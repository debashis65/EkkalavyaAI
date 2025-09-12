import 'package:flutter/material.dart';
import 'package:flutter_app/core/theme/app_theme.dart';

class RoomConstraintDisplay extends StatelessWidget {
  final double width;
  final double height;
  final bool isFlat;
  final double? ceilingHeight;
  final int safetyScore;
  final bool isCompact;

  const RoomConstraintDisplay({
    super.key,
    required this.width,
    required this.height,
    required this.isFlat,
    this.ceilingHeight,
    required this.safetyScore,
    this.isCompact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(isCompact ? 12 : 16),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.7),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.home,
                color: Colors.white,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Room Constraints',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w600,
                  fontSize: isCompact ? 12 : 14,
                ),
              ),
            ],
          ),
          SizedBox(height: isCompact ? 8 : 12),
          
          // Dimensions grid
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildMetric(
                'Width',
                '${width.toStringAsFixed(1)}m',
                Icons.straighten,
                isCompact,
              ),
              _buildMetric(
                'Height',
                '${height.toStringAsFixed(1)}m',
                Icons.height,
                isCompact,
              ),
              _buildMetric(
                'Area',
                '${(width * height).toStringAsFixed(1)}m²',
                Icons.crop_square,
                isCompact,
              ),
            ],
          ),
          
          if (!isCompact) ...[
            const SizedBox(height: 12),
            
            // Additional metrics
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                if (ceilingHeight != null)
                  _buildMetric(
                    'Ceiling',
                    '${ceilingHeight!.toStringAsFixed(1)}m',
                    Icons.keyboard_arrow_up,
                    isCompact,
                  ),
                _buildMetric(
                  'Surface',
                  isFlat ? 'Flat' : 'Uneven',
                  isFlat ? Icons.check_circle : Icons.warning,
                  isCompact,
                  color: isFlat ? Colors.green : Colors.orange,
                ),
              ],
            ),
          ],
          
          SizedBox(height: isCompact ? 8 : 12),
          
          // Safety score bar
          Row(
            children: [
              Icon(
                _getSafetyIcon(),
                color: _getSafetyColor(),
                size: isCompact ? 16 : 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Safety Score',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: isCompact ? 10 : 12,
                          ),
                        ),
                        Text(
                          '$safetyScore%',
                          style: TextStyle(
                            color: _getSafetyColor(),
                            fontWeight: FontWeight.bold,
                            fontSize: isCompact ? 10 : 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    LinearProgressIndicator(
                      value: safetyScore / 100,
                      backgroundColor: Colors.white.withOpacity(0.2),
                      valueColor: AlwaysStoppedAnimation<Color>(_getSafetyColor()),
                      minHeight: isCompact ? 3 : 4,
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          // Safety status text
          if (!isCompact) ...[
            const SizedBox(height: 8),
            Text(
              _getSafetyText(),
              style: TextStyle(
                color: _getSafetyColor(),
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMetric(
    String label,
    String value,
    IconData icon,
    bool compact, {
    Color? color,
  }) {
    return Column(
      children: [
        Icon(
          icon,
          color: color ?? Colors.white70,
          size: compact ? 16 : 20,
        ),
        SizedBox(height: compact ? 2 : 4),
        Text(
          label,
          style: TextStyle(
            color: Colors.white70,
            fontSize: compact ? 9 : 10,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            color: color ?? Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: compact ? 11 : 12,
          ),
        ),
      ],
    );
  }

  Color _getSafetyColor() {
    if (safetyScore >= 85) return Colors.green;
    if (safetyScore >= 70) return Colors.orange;
    return Colors.red;
  }

  IconData _getSafetyIcon() {
    if (safetyScore >= 85) return Icons.check_circle;
    if (safetyScore >= 70) return Icons.warning;
    return Icons.error;
  }

  String _getSafetyText() {
    if (safetyScore >= 85) return 'Safe Environment';
    if (safetyScore >= 70) return 'Caution Required';
    return 'Safety Concerns';
  }
}