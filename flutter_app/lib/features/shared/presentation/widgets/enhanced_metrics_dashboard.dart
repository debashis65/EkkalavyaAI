import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'dart:math' as math;

class EnhancedMetricsDashboard extends ConsumerStatefulWidget {
  final Map<String, dynamic> metricsData;
  final String sport;
  final bool isRealtime;

  const EnhancedMetricsDashboard({
    Key? key,
    required this.metricsData,
    required this.sport,
    this.isRealtime = false,
  }) : super(key: key);

  @override
  ConsumerState<EnhancedMetricsDashboard> createState() => _EnhancedMetricsDashboardState();
}

class _EnhancedMetricsDashboardState extends ConsumerState<EnhancedMetricsDashboard> {
  int _selectedMetricIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildDashboardHeader(),
          const SizedBox(height: 24),
          _buildPerformanceOverview(),
          const SizedBox(height: 24),
          _buildDetailedMetrics(),
          const SizedBox(height: 24),
          _buildAIInsights(),
        ],
      ),
    );
  }

  Widget _buildDashboardHeader() {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                AppTheme.primaryBlue,
                AppTheme.primaryBlue.withOpacity(0.7),
              ],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            _getSportIcon(widget.sport),
            color: Colors.white,
            size: 24,
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${widget.sport.toUpperCase()} Analysis',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
              if (widget.isRealtime)
                AnimatedBuilder(
                  animation: const AlwaysStoppedAnimation(1.0),
                  builder: (context, child) {
                    return Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(1.0),
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        const Text(
                          'Live Analysis',
                          style: TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    );
                  },
                ),
            ],
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: _getOverallScoreColor().withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _getOverallScoreColor()),
          ),
          child: Text(
            'Score: ${_getOverallScore()}',
            style: TextStyle(
              color: _getOverallScoreColor(),
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPerformanceOverview() {
    final performanceData = widget.metricsData['performance'] as Map<String, dynamic>? ?? {};
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Colors.white,
            AppTheme.primaryBlue.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Performance Overview',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 20),
          SizedBox(
            height: 200,
            child: AnimatedBuilder(
              animation: const AlwaysStoppedAnimation(1.0),
              builder: (context, child) {
                return RadarChart(
                  RadarChartData(
                    radarTouchData: RadarTouchData(enabled: true),
                    dataSets: [
                      RadarDataSet(
                        fillColor: AppTheme.primaryBlue.withOpacity(0.2),
                        borderColor: AppTheme.primaryBlue,
                        borderWidth: 2,
                        dataEntries: _getRadarDataEntries(performanceData),
                      ),
                    ],
                    radarBackgroundColor: Colors.transparent,
                    titleTextStyle: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 12,
                    ),
                    getTitle: (index, angle) => RadarChartTitle(
                      text: _getMetricNames()[index],
                      angle: angle,
                    ),
                    titlePositionPercentageOffset: 0.2,
                    radarBorderData: const BorderSide(color: Colors.transparent),
                    tickCount: 5,
                    ticksTextStyle: const TextStyle(
                      color: AppTheme.textSecondary,
                      fontSize: 10,
                    ),
                    tickBorderData: const BorderSide(color: Colors.grey, width: 1),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailedMetrics() {
    final metrics = _getDetailedMetrics();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Detailed Analysis',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: metrics.length,
            itemBuilder: (context, index) {
              final metric = metrics[index];
              final isSelected = index == _selectedMetricIndex;
              
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedMetricIndex = index;
                  });
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 140,
                  margin: const EdgeInsets.only(right: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primaryBlue : Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? AppTheme.primaryBlue : Colors.grey.shade300,
                      width: 2,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppTheme.primaryBlue.withOpacity(0.3),
                              blurRadius: 10,
                              offset: const Offset(0, 4),
                            ),
                          ]
                        : [],
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        metric['icon'] as IconData,
                        color: isSelected ? Colors.white : AppTheme.primaryBlue,
                        size: 32,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        metric['name'] as String,
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppTheme.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 12,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${metric['value']}${metric['unit']}',
                        style: TextStyle(
                          color: isSelected ? Colors.white : AppTheme.primaryBlue,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 16),
        _buildSelectedMetricChart(),
      ],
    );
  }

  Widget _buildSelectedMetricChart() {
    final selectedMetric = _getDetailedMetrics()[_selectedMetricIndex];
    final chartData = selectedMetric['chartData'] as List<FlSpot>? ?? [];
    
    return Container(
      height: 200,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '${selectedMetric['name']} Trend',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: 20,
                  getDrawingHorizontalLine: (value) {
                    return const FlLine(
                      color: Colors.grey,
                      strokeWidth: 0.5,
                    );
                  },
                ),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 30,
                      interval: 1,
                      getTitlesWidget: (value, meta) {
                        return SideTitleWidget(
                          axisSide: meta.axisSide,
                          child: Text(
                            '${value.toInt()}',
                            style: const TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      interval: 20,
                      getTitlesWidget: (value, meta) {
                        return SideTitleWidget(
                          axisSide: meta.axisSide,
                          child: Text(
                            '${value.toInt()}',
                            style: const TextStyle(
                              color: AppTheme.textSecondary,
                              fontSize: 12,
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                minX: 0,
                maxX: chartData.isNotEmpty ? chartData.last.x : 10,
                minY: 0,
                maxY: 100,
                lineBarsData: [
                  LineChartBarData(
                    spots: chartData,
                    isCurved: true,
                    gradient: LinearGradient(
                      colors: [
                        AppTheme.primaryBlue.withOpacity(0.8),
                        AppTheme.primaryBlue,
                      ],
                    ),
                    barWidth: 3,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      gradient: LinearGradient(
                        colors: [
                          AppTheme.primaryBlue.withOpacity(0.1),
                          AppTheme.primaryBlue.withOpacity(0.0),
                        ],
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAIInsights() {
    final insights = widget.metricsData['aiInsights'] as List<dynamic>? ?? [];
    
    if (insights.isEmpty) {
      return const SizedBox.shrink();
    }
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'AI Insights & Recommendations',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        ...insights.take(3).map((insight) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.blue.shade50,
                Colors.indigo.shade50,
              ],
            ),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppTheme.primaryBlue.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.lightbulb_outline,
                  color: AppTheme.primaryBlue,
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      insight['title']?.toString() ?? 'AI Insight',
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      insight['description']?.toString() ?? '',
                      style: const TextStyle(
                        color: AppTheme.textSecondary,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              if (insight['confidence'] != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _getConfidenceColor(insight['confidence'] as double),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${((insight['confidence'] as double) * 100).toInt()}%',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        )).toList(),
      ],
    );
  }

  IconData _getSportIcon(String sport) {
    switch (sport.toLowerCase()) {
      case 'basketball':
        return Icons.sports_basketball;
      case 'tennis':
        return Icons.sports_tennis;
      case 'swimming':
        return Icons.pool;
      case 'gymnastics':
        return Icons.sports_gymnastics;
      case 'soccer':
        return Icons.sports_soccer;
      default:
        return Icons.sports;
    }
  }

  Color _getOverallScoreColor() {
    final score = _getOverallScore();
    if (score >= 80) return Colors.green;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }

  int _getOverallScore() {
    final performance = widget.metricsData['performance'] as Map<String, dynamic>? ?? {};
    final scores = [
      performance['form'] ?? 0,
      performance['power'] ?? 0,
      performance['accuracy'] ?? 0,
      performance['consistency'] ?? 0,
      performance['speed'] ?? 0,
    ];
    
    if (scores.isEmpty) return 0;
    return (scores.reduce((a, b) => a + b) / scores.length).round();
  }

  List<RadarEntry> _getRadarDataEntries(Map<String, dynamic> performanceData) {
    return [
      RadarEntry(value: (performanceData['form'] ?? 0).toDouble()),
      RadarEntry(value: (performanceData['power'] ?? 0).toDouble()),
      RadarEntry(value: (performanceData['accuracy'] ?? 0).toDouble()),
      RadarEntry(value: (performanceData['consistency'] ?? 0).toDouble()),
      RadarEntry(value: (performanceData['speed'] ?? 0).toDouble()),
      RadarEntry(value: (performanceData['technique'] ?? 0).toDouble()),
    ];
  }

  List<String> _getMetricNames() {
    return ['Form', 'Power', 'Accuracy', 'Consistency', 'Speed', 'Technique'];
  }

  List<Map<String, dynamic>> _getDetailedMetrics() {
    final performance = widget.metricsData['performance'] as Map<String, dynamic>? ?? {};
    
    return [
      {
        'name': 'Form',
        'value': performance['form'] ?? 0,
        'unit': '%',
        'icon': Icons.accessibility_new,
        'chartData': _generateChartData(performance['form'] ?? 0),
      },
      {
        'name': 'Power',
        'value': performance['power'] ?? 0,
        'unit': '%',
        'icon': Icons.fitness_center,
        'chartData': _generateChartData(performance['power'] ?? 0),
      },
      {
        'name': 'Accuracy',
        'value': performance['accuracy'] ?? 0,
        'unit': '%',
        'icon': Icons.gps_fixed,
        'chartData': _generateChartData(performance['accuracy'] ?? 0),
      },
      {
        'name': 'Speed',
        'value': performance['speed'] ?? 0,
        'unit': '%',
        'icon': Icons.speed,
        'chartData': _generateChartData(performance['speed'] ?? 0),
      },
    ];
  }

  List<FlSpot> _generateChartData(int currentValue) {
    final random = math.Random();
    final List<FlSpot> spots = [];
    
    for (int i = 0; i < 10; i++) {
      final value = currentValue + random.nextInt(20) - 10;
      spots.add(FlSpot(i.toDouble(), math.max(0, math.min(100, value)).toDouble()));
    }
    
    return spots;
  }

  Color _getConfidenceColor(double confidence) {
    if (confidence >= 0.8) return Colors.green;
    if (confidence >= 0.6) return Colors.orange;
    return Colors.red;
  }
}