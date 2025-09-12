import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'dart:math' as math;

class EnhancedPerformanceCards extends ConsumerWidget {
  final Map<String, dynamic>? performanceData;
  final String sport;
  final VoidCallback? onTap;

  const EnhancedPerformanceCards({
    Key? key,
    this.performanceData,
    required this.sport,
    this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Performance Overview',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            TextButton(
              onPressed: onTap,
              child: const Text('View All'),
            ),
          ],
        ),
        const SizedBox(height: 16),
        
        // Mobile-first performance grid matching web design
        GridView.count(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisCount: 2,
          childAspectRatio: 1.1,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          children: [
            _PerformanceCard(
              title: 'Practice Hours',
              value: '875 hours',
              subtitle: '20 hrs/week',
              icon: Icons.schedule,
              color: AppTheme.primaryOrange,
              trend: '+12%',
              isPositive: true,
            ),
            _PerformanceCard(
              title: 'Current Level',
              value: 'Advanced',
              subtitle: 'Senior Division',
              icon: Icons.trending_up,
              color: AppTheme.primaryBlue,
              trend: 'Level Up!',
              isPositive: true,
            ),
            _PerformanceCard(
              title: 'XP Points',
              value: '4,280 XP',
              subtitle: 'Level 8',
              icon: Icons.stars,
              color: AppTheme.primaryGold,
              trend: '+180 XP',
              isPositive: true,
            ),
            _PerformanceCard(
              title: 'Accuracy Rate',
              value: '87.5%',
              subtitle: 'Last 30 days',
              icon: Icons.gps_fixed,
              color: AppTheme.primaryGreen,
              trend: '+5.2%',
              isPositive: true,
            ),
          ],
        ),
        
        const SizedBox(height: 24),
        
        // Tournament results section - matching web mobile design
        _TournamentResultsSection(),
        
        const SizedBox(height: 24),
        
        // Recent activity section - mobile-first
        _RecentActivitySection(),
      ],
    );
  }
}

class _PerformanceCard extends StatelessWidget {
  final String title;
  final String value;
  final String subtitle;
  final IconData icon;
  final Color color;
  final String? trend;
  final bool isPositive;

  const _PerformanceCard({
    required this.title,
    required this.value,
    required this.subtitle,
    required this.icon,
    required this.color,
    this.trend,
    this.isPositive = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2), width: 1),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  color: color,
                  size: 20,
                ),
              ),
              const Spacer(),
              if (trend != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isPositive 
                        ? AppTheme.primaryGreen.withOpacity(0.1)
                        : Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isPositive ? Icons.trending_up : Icons.trending_down,
                        color: isPositive ? AppTheme.primaryGreen : Colors.red,
                        size: 12,
                      ),
                      const SizedBox(width: 2),
                      Text(
                        trend!,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: isPositive ? AppTheme.primaryGreen : Colors.red,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          
          const SizedBox(height: 4),
          
          Text(
            value,
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          
          const SizedBox(height: 2),
          
          Text(
            subtitle,
            style: const TextStyle(
              fontSize: 10,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _TournamentResultsSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Tournament Results',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        
        Column(
          children: [
            _TournamentCard(
              name: 'National Championship',
              date: 'March 25, 2024',
              position: '1st',
              score: '8.9',
              gradientColors: [
                const Color(0xFFFFF8E1),
                const Color(0xFFFFF3C4),
              ],
              positionColor: const Color(0xFFFFB300),
            ),
            const SizedBox(height: 8),
            _TournamentCard(
              name: 'Regional Finals',
              date: 'February 18, 2024',
              position: '3rd',
              score: '8.5',
              gradientColors: [
                const Color(0xFFFFF3E0),
                const Color(0xFFFFE0B2),
              ],
              positionColor: const Color(0xFFFF8A65),
            ),
            const SizedBox(height: 8),
            _TournamentCard(
              name: 'State Tournament',
              date: 'January 12, 2024',
              position: '2nd',
              score: '8.7',
              gradientColors: [
                const Color(0xFFE8F5E8),
                const Color(0xFFC8E6C9),
              ],
              positionColor: const Color(0xFF66BB6A),
            ),
          ],
        ),
      ],
    );
  }
}

class _TournamentCard extends StatelessWidget {
  final String name;
  final String date;
  final String position;
  final String score;
  final List<Color> gradientColors;
  final Color positionColor;

  const _TournamentCard({
    required this.name,
    required this.date,
    required this.position,
    required this.score,
    required this.gradientColors,
    required this.positionColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: gradientColors,
        ),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: positionColor.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  date,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: positionColor,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  position,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                score,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _RecentActivitySection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Recent Activity',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppTheme.primaryBlue.withOpacity(0.05),
                AppTheme.primaryGreen.withOpacity(0.05),
              ],
            ),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.1)),
          ),
          child: Column(
            children: [
              _ActivityItem(
                icon: Icons.camera_alt,
                title: 'AR Analysis Session',
                subtitle: 'Basketball shooting form',
                time: '2 hours ago',
                color: AppTheme.primaryOrange,
              ),
              const Divider(height: 24),
              _ActivityItem(
                icon: Icons.emoji_events,
                title: 'Achievement Unlocked',
                subtitle: 'Perfect Form badge earned',
                time: '1 day ago',
                color: AppTheme.primaryGold,
              ),
              const Divider(height: 24),
              _ActivityItem(
                icon: Icons.video_call,
                title: 'Coach Session',
                subtitle: 'Technique review with Guru Drona',
                time: '3 days ago',
                color: AppTheme.primaryBlue,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String time;
  final Color color;

  const _ActivityItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.time,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            color: color,
            size: 20,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textPrimary,
                ),
              ),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
        ),
        Text(
          time,
          style: const TextStyle(
            fontSize: 11,
            color: AppTheme.textSecondary,
          ),
        ),
      ],
    );
  }
}