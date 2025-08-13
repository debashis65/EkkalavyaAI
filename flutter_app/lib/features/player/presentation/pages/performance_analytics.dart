import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/custom_app_bar.dart';
import 'package:fl_chart/fl_chart.dart';

class PerformanceAnalytics extends ConsumerStatefulWidget {
  const PerformanceAnalytics({Key? key}) : super(key: key);

  @override
  ConsumerState<PerformanceAnalytics> createState() => _PerformanceAnalyticsState();
}

class _PerformanceAnalyticsState extends ConsumerState<PerformanceAnalytics>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _selectedPeriod = '7 days';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Performance Analytics'),
      body: Column(
        children: [
          // Period Selector
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                const Text(
                  'Period: ',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Expanded(
                  child: DropdownButtonFormField<String>(
                    value: _selectedPeriod,
                    decoration: const InputDecoration(
                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    ),
                    items: ['7 days', '30 days', '3 months', '6 months', '1 year']
                        .map((period) => DropdownMenuItem(
                              value: period,
                              child: Text(period),
                            ))
                        .toList(),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() => _selectedPeriod = value);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),

          // Tab Bar
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: TabBar(
              controller: _tabController,
              indicator: BoxDecoration(
                color: AppTheme.primaryOrange,
                borderRadius: BorderRadius.circular(12),
              ),
              labelColor: Colors.white,
              unselectedLabelColor: AppTheme.textSecondary,
              tabs: const [
                Tab(text: 'Overview'),
                Tab(text: 'Metrics'),
                Tab(text: 'Progress'),
              ],
            ),
          ),

          // Tab Content
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _OverviewTab(),
                _MetricsTab(),
                _ProgressTab(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _OverviewTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Performance Summary Cards
          Row(
            children: [
              Expanded(
                child: _SummaryCard(
                  title: 'Total Sessions',
                  value: '24',
                  change: '+3 this week',
                  color: AppTheme.primaryOrange,
                  icon: Icons.sports_basketball,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _SummaryCard(
                  title: 'Avg. Score',
                  value: '78%',
                  change: '+5% improvement',
                  color: AppTheme.primaryBlue,
                  icon: Icons.trending_up,
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _SummaryCard(
                  title: 'Training Time',
                  value: '18h',
                  change: '+2h this week',
                  color: AppTheme.primaryGreen,
                  icon: Icons.schedule,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _SummaryCard(
                  title: 'Streak',
                  value: '7 days',
                  change: 'Best: 12 days',
                  color: Colors.purple,
                  icon: Icons.local_fire_department,
                ),
              ),
            ],
          ),

          const SizedBox(height: 24),

          // Performance Trend Chart
          const Text(
            'Performance Trend',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          Container(
            height: 200,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: LineChart(_buildPerformanceChart()),
          ),

          const SizedBox(height: 24),

          // Recent Activity
          const Text(
            'Recent Activity',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          ..._buildRecentActivities(),
        ],
      ),
    );
  }

  List<Widget> _buildRecentActivities() {
    final activities = [
      {
        'sport': 'Basketball',
        'duration': '45 min',
        'score': '82%',
        'date': '2 hours ago',
        'icon': Icons.sports_basketball,
      },
      {
        'sport': 'Tennis',
        'duration': '30 min',
        'score': '76%',
        'date': '1 day ago',
        'icon': Icons.sports_tennis,
      },
      {
        'sport': 'Basketball',
        'duration': '60 min',
        'score': '85%',
        'date': '2 days ago',
        'icon': Icons.sports_basketball,
      },
    ];

    return activities
        .map((activity) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryOrange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      activity['icon'] as IconData,
                      color: AppTheme.primaryOrange,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          activity['sport'] as String,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        Text(
                          '${activity['duration']} • Score: ${activity['score']}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    activity['date'] as String,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ))
        .toList();
  }

  LineChartData _buildPerformanceChart() {
    return LineChartData(
      gridData: FlGridData(
        show: true,
        drawVerticalLine: false,
        horizontalInterval: 20,
        getDrawingHorizontalLine: (value) => FlLine(
          color: Colors.grey.shade300,
          strokeWidth: 1,
        ),
      ),
      titlesData: const FlTitlesData(show: false),
      borderData: FlBorderData(show: false),
      lineBarsData: [
        LineChartBarData(
          spots: const [
            FlSpot(0, 65),
            FlSpot(1, 68),
            FlSpot(2, 72),
            FlSpot(3, 75),
            FlSpot(4, 78),
            FlSpot(5, 76),
            FlSpot(6, 82),
          ],
          isCurved: true,
          color: AppTheme.primaryOrange,
          barWidth: 3,
          dotData: const FlDotData(show: false),
          belowBarData: BarAreaData(
            show: true,
            color: AppTheme.primaryOrange.withOpacity(0.1),
          ),
        ),
      ],
    );
  }
}

class _MetricsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Performance Metrics Breakdown',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          // Radar Chart
          Container(
            height: 300,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: RadarChart(_buildRadarChart()),
          ),

          const SizedBox(height: 24),

          // Detailed Metrics
          const Text(
            'Detailed Breakdown',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          ..._buildDetailedMetrics(),
        ],
      ),
    );
  }

  List<Widget> _buildDetailedMetrics() {
    final metrics = [
      {'name': 'Form Score', 'value': 85, 'color': AppTheme.primaryOrange},
      {'name': 'Balance', 'value': 78, 'color': AppTheme.primaryBlue},
      {'name': 'Power', 'value': 82, 'color': AppTheme.primaryGreen},
      {'name': 'Consistency', 'value': 76, 'color': Colors.purple},
      {'name': 'Speed', 'value': 88, 'color': Colors.indigo},
      {'name': 'Accuracy', 'value': 79, 'color': Colors.teal},
      {'name': 'Timing', 'value': 83, 'color': Colors.orange},
      {'name': 'Technique', 'value': 81, 'color': Colors.red},
    ];

    return metrics
        .map((metric) => Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        metric['name'] as String,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      Text(
                        '${metric['value']}%',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: metric['color'] as Color,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  LinearProgressIndicator(
                    value: (metric['value'] as int) / 100,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation<Color>(metric['color'] as Color),
                  ),
                ],
              ),
            ))
        .toList();
  }

  RadarChartData _buildRadarChart() {
    return RadarChartData(
      dataSets: [
        RadarDataSet(
          fillColor: AppTheme.primaryOrange.withOpacity(0.2),
          borderColor: AppTheme.primaryOrange,
          dataEntries: const [
            RadarEntry(value: 85), // Form
            RadarEntry(value: 78), // Balance
            RadarEntry(value: 82), // Power
            RadarEntry(value: 76), // Consistency
            RadarEntry(value: 88), // Speed
            RadarEntry(value: 79), // Accuracy
            RadarEntry(value: 83), // Timing
            RadarEntry(value: 81), // Technique
          ],
        ),
      ],
      radarShape: RadarShape.polygon,
      tickCount: 4,
      titleTextStyle: const TextStyle(fontSize: 12),
      getTitle: (index, angle) {
        const titles = [
          'Form',
          'Balance',
          'Power',
          'Consistency',
          'Speed',
          'Accuracy',
          'Timing',
          'Technique'
        ];
        return RadarChartTitle(text: titles[index]);
      },
    );
  }
}

class _ProgressTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Goals Section
          const Text(
            'Training Goals',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          ..._buildGoalCards(),

          const SizedBox(height: 24),

          // Achievements
          const Text(
            'Recent Achievements',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          ..._buildAchievements(),

          const SizedBox(height: 24),

          // Weekly Progress Chart
          const Text(
            'Weekly Progress',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),

          Container(
            height: 200,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: BarChart(_buildWeeklyChart()),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildGoalCards() {
    final goals = [
      {
        'title': 'Improve Shooting Accuracy',
        'current': 78,
        'target': 85,
        'deadline': 'End of month',
      },
      {
        'title': 'Increase Training Sessions',
        'current': 4,
        'target': 6,
        'deadline': 'This week',
      },
    ];

    return goals
        .map((goal) => Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    goal['title'] as String,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: LinearProgressIndicator(
                          value: (goal['current'] as int) / (goal['target'] as int),
                          backgroundColor: Colors.grey.shade200,
                          valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primaryOrange),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        '${goal['current']}/${goal['target']}',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Deadline: ${goal['deadline']}',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ))
        .toList();
  }

  List<Widget> _buildAchievements() {
    final achievements = [
      {
        'title': '7-Day Streak',
        'description': 'Trained for 7 consecutive days',
        'date': '2 days ago',
        'icon': Icons.local_fire_department,
        'color': Colors.orange,
      },
      {
        'title': 'Personal Best',
        'description': 'Achieved 85% accuracy in basketball',
        'date': '1 week ago',
        'icon': Icons.star,
        'color': Colors.amber,
      },
      {
        'title': 'Form Master',
        'description': 'Maintained perfect form for entire session',
        'date': '2 weeks ago',
        'icon': Icons.emoji_events,
        'color': AppTheme.primaryGreen,
      },
    ];

    return achievements
        .map((achievement) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: (achievement['color'] as Color).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      achievement['icon'] as IconData,
                      color: achievement['color'] as Color,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          achievement['title'] as String,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: AppTheme.textPrimary,
                          ),
                        ),
                        Text(
                          achievement['description'] as String,
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Text(
                    achievement['date'] as String,
                    style: const TextStyle(
                      fontSize: 10,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            ))
        .toList();
  }

  BarChartData _buildWeeklyChart() {
    return BarChartData(
      alignment: BarChartAlignment.spaceAround,
      maxY: 100,
      barTouchData: BarTouchData(enabled: false),
      titlesData: FlTitlesData(
        show: true,
        bottomTitles: AxisTitles(
          sideTitles: SideTitles(
            showTitles: true,
            getTitlesWidget: (value, meta) {
              const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
              return Text(
                days[value.toInt()],
                style: const TextStyle(fontSize: 12),
              );
            },
          ),
        ),
        leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
      ),
      borderData: FlBorderData(show: false),
      barGroups: [
        BarChartGroupData(x: 0, barRods: [BarChartRodData(toY: 75, color: AppTheme.primaryOrange)]),
        BarChartGroupData(x: 1, barRods: [BarChartRodData(toY: 82, color: AppTheme.primaryOrange)]),
        BarChartGroupData(x: 2, barRods: [BarChartRodData(toY: 78, color: AppTheme.primaryOrange)]),
        BarChartGroupData(x: 3, barRods: [BarChartRodData(toY: 85, color: AppTheme.primaryOrange)]),
        BarChartGroupData(x: 4, barRods: [BarChartRodData(toY: 79, color: AppTheme.primaryOrange)]),
        BarChartGroupData(x: 5, barRods: [BarChartRodData(toY: 88, color: AppTheme.primaryOrange)]),
        BarChartGroupData(x: 6, barRods: [BarChartRodData(toY: 76, color: AppTheme.primaryOrange)]),
      ],
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final String change;
  final Color color;
  final IconData icon;

  const _SummaryCard({
    required this.title,
    required this.value,
    required this.change,
    required this.color,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            change,
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}