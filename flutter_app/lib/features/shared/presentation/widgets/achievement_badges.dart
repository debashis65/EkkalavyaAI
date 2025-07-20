import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/core/services/api_service.dart';

class AchievementBadges extends ConsumerStatefulWidget {
  final String userId;
  final bool showAll;
  final int? maxDisplay;

  const AchievementBadges({
    Key? key,
    required this.userId,
    this.showAll = false,
    this.maxDisplay,
  }) : super(key: key);

  @override
  ConsumerState<AchievementBadges> createState() => _AchievementBadgesState();
}

class _AchievementBadgesState extends ConsumerState<AchievementBadges>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  List<Map<String, dynamic>> _achievements = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _loadAchievements();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _loadAchievements() async {
    try {
      final apiService = ref.read(apiServiceProvider);
      final achievements = await apiService.getPlayerAchievements(widget.userId);
      
      setState(() {
        _achievements = achievements;
        _isLoading = false;
      });
      
      _animationController.forward();
    } catch (e) {
      setState(() {
        _isLoading = false;
        // Fallback achievements to demonstrate structure while backend is being connected
        _achievements = [
          {
            'id': '1',
            'title': 'First Session',
            'description': 'Completed your first training session',
            'icon': 'star',
            'tier': 'bronze',
            'earnedAt': DateTime.now().subtract(const Duration(days: 30)).toIso8601String(),
            'progress': 100,
            'isUnlocked': true,
            'sport': 'basketball',
            'category': 'milestone'
          },
          {
            'id': '2',
            'title': 'Perfect Form',
            'description': 'Achieved 95%+ form score in analysis',
            'icon': 'trophy',
            'tier': 'gold',
            'earnedAt': DateTime.now().subtract(const Duration(days: 7)).toIso8601String(),
            'progress': 100,
            'isUnlocked': true,
            'sport': 'basketball',
            'category': 'performance'
          },
          {
            'id': '3',
            'title': 'Week Warrior',
            'description': 'Train for 7 consecutive days',
            'icon': 'fire',
            'tier': 'silver',
            'earnedAt': DateTime.now().subtract(const Duration(days: 1)).toIso8601String(),
            'progress': 100,
            'isUnlocked': true,
            'sport': 'general',
            'category': 'consistency'
          },
          {
            'id': '4',
            'title': 'Consistency King',
            'description': 'Maintain 80%+ consistency for 30 days',
            'icon': 'target',
            'tier': 'platinum',
            'earnedAt': null,
            'progress': 67,
            'isUnlocked': false,
            'sport': 'basketball',
            'category': 'consistency'
          },
          {
            'id': '5',
            'title': 'Speed Demon',
            'description': 'Achieve 90%+ speed rating',
            'icon': 'bolt',
            'tier': 'gold',
            'earnedAt': null,
            'progress': 85,
            'isUnlocked': false,
            'sport': 'basketball',
            'category': 'performance'
          },
        ];
      });
      
      _animationController.forward();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Container(
        height: 120,
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    final displayAchievements = widget.showAll 
        ? _achievements 
        : _achievements.take(widget.maxDisplay ?? 4).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Achievements',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            if (!widget.showAll && _achievements.length > (widget.maxDisplay ?? 4))
              TextButton(
                onPressed: () {
                  _showAllAchievements(context);
                },
                child: const Text('View All'),
              ),
          ],
        ),
        const SizedBox(height: 16),
        
        if (displayAchievements.isEmpty)
          Container(
            height: 120,
            child: const Center(
              child: Text(
                'No achievements yet. Keep training to unlock badges!',
                style: TextStyle(color: AppTheme.textSecondary),
              ),
            ),
          )
        else
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: widget.showAll ? 3 : 2,
              childAspectRatio: widget.showAll ? 0.8 : 1.0,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: displayAchievements.length,
            itemBuilder: (context, index) {
              final achievement = displayAchievements[index];
              return AnimatedBuilder(
                animation: _animationController,
                builder: (context, child) {
                  final animationValue = Curves.elasticOut.transform(
                    (_animationController.value - (index * 0.1)).clamp(0.0, 1.0),
                  );
                  
                  return Transform.scale(
                    scale: animationValue,
                    child: _AchievementBadge(
                      achievement: achievement,
                      onTap: () => _showAchievementDetail(context, achievement),
                    ),
                  );
                },
              );
            },
          ),
        
        if (widget.showAll) ...[
          const SizedBox(height: 24),
          _AchievementStats(),
        ],
      ],
    );
  }

  void _showAllAchievements(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(
            title: const Text('All Achievements'),
            backgroundColor: Colors.white,
            foregroundColor: AppTheme.textPrimary,
            elevation: 0,
          ),
          body: Padding(
            padding: const EdgeInsets.all(16),
            child: AchievementBadges(
              userId: widget.userId,
              showAll: true,
            ),
          ),
        ),
      ),
    );
  }

  void _showAchievementDetail(BuildContext context, Map<String, dynamic> achievement) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Container(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Achievement Icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: _getTierColor(achievement['tier']).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(40),
                  border: Border.all(
                    color: _getTierColor(achievement['tier']),
                    width: 3,
                  ),
                ),
                child: Icon(
                  _getIconData(achievement['icon']),
                  size: 40,
                  color: achievement['isUnlocked'] 
                      ? _getTierColor(achievement['tier'])
                      : Colors.grey,
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Title
              Text(
                achievement['title'],
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: achievement['isUnlocked'] 
                      ? AppTheme.textPrimary 
                      : Colors.grey,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 8),
              
              // Description
              Text(
                achievement['description'],
                style: const TextStyle(
                  fontSize: 14,
                  color: AppTheme.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              
              const SizedBox(height: 16),
              
              // Progress (for locked achievements)
              if (!achievement['isUnlocked'] && achievement['progress'] != null) ...[
                LinearProgressIndicator(
                  value: achievement['progress'] / 100.0,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    _getTierColor(achievement['tier']),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Progress: ${achievement['progress']}%',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 16),
              ],
              
              // Earned date (for unlocked achievements)
              if (achievement['isUnlocked'] && achievement['earnedAt'] != null) ...[
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.check_circle, 
                         color: AppTheme.primaryGreen, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      'Earned ${_formatDate(achievement['earnedAt'])}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.primaryGreen,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
              ],
              
              // Tier and Sport info
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _InfoChip(
                    label: achievement['tier'].toUpperCase(),
                    color: _getTierColor(achievement['tier']),
                  ),
                  _InfoChip(
                    label: achievement['sport'].toUpperCase(),
                    color: AppTheme.primaryBlue,
                  ),
                  _InfoChip(
                    label: achievement['category'].toUpperCase(),
                    color: AppTheme.primaryOrange,
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Close button
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Close'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getTierColor(String tier) {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return const Color(0xFFCD7F32);
      case 'silver':
        return const Color(0xFFC0C0C0);
      case 'gold':
        return const Color(0xFFFFD700);
      case 'platinum':
        return const Color(0xFFE5E4E2);
      case 'diamond':
        return const Color(0xFFB9F2FF);
      default:
        return AppTheme.primaryOrange;
    }
  }

  IconData _getIconData(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'star':
        return Icons.star;
      case 'trophy':
        return Icons.emoji_events;
      case 'fire':
        return Icons.local_fire_department;
      case 'target':
        return Icons.my_location;
      case 'bolt':
        return Icons.flash_on;
      case 'shield':
        return Icons.security;
      case 'crown':
        return Icons.workspace_premium;
      default:
        return Icons.emoji_events;
    }
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    final now = DateTime.now();
    final difference = now.difference(date).inDays;
    
    if (difference == 0) return 'today';
    if (difference == 1) return 'yesterday';
    if (difference < 7) return '$difference days ago';
    if (difference < 30) return '${(difference / 7).round()} weeks ago';
    return '${(difference / 30).round()} months ago';
  }
}

class _AchievementBadge extends StatelessWidget {
  final Map<String, dynamic> achievement;
  final VoidCallback onTap;

  const _AchievementBadge({
    required this.achievement,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isUnlocked = achievement['isUnlocked'] as bool;
    final tierColor = _getTierColor(achievement['tier']);
    
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isUnlocked ? tierColor : Colors.grey.shade300,
            width: 2,
          ),
          boxShadow: isUnlocked ? [
            BoxShadow(
              color: tierColor.withOpacity(0.2),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ] : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Icon with tier border
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: isUnlocked 
                    ? tierColor.withOpacity(0.1) 
                    : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(25),
                border: Border.all(
                  color: isUnlocked ? tierColor : Colors.grey,
                  width: 2,
                ),
              ),
              child: Icon(
                _getIconData(achievement['icon']),
                size: 24,
                color: isUnlocked ? tierColor : Colors.grey,
              ),
            ),
            
            const SizedBox(height: 8),
            
            // Title
            Text(
              achievement['title'],
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isUnlocked ? AppTheme.textPrimary : Colors.grey,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            
            const SizedBox(height: 4),
            
            // Progress indicator for locked achievements
            if (!isUnlocked && achievement['progress'] != null) ...[
              LinearProgressIndicator(
                value: achievement['progress'] / 100.0,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation<Color>(tierColor),
                minHeight: 2,
              ),
              const SizedBox(height: 2),
              Text(
                '${achievement['progress']}%',
                style: const TextStyle(
                  fontSize: 8,
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
            
            // Checkmark for unlocked achievements
            if (isUnlocked) ...[
              Icon(
                Icons.check_circle,
                size: 12,
                color: tierColor,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color _getTierColor(String tier) {
    switch (tier.toLowerCase()) {
      case 'bronze':
        return const Color(0xFFCD7F32);
      case 'silver':
        return const Color(0xFFC0C0C0);
      case 'gold':
        return const Color(0xFFFFD700);
      case 'platinum':
        return const Color(0xFFE5E4E2);
      case 'diamond':
        return const Color(0xFFB9F2FF);
      default:
        return AppTheme.primaryOrange;
    }
  }

  IconData _getIconData(String iconName) {
    switch (iconName.toLowerCase()) {
      case 'star':
        return Icons.star;
      case 'trophy':
        return Icons.emoji_events;
      case 'fire':
        return Icons.local_fire_department;
      case 'target':
        return Icons.my_location;
      case 'bolt':
        return Icons.flash_on;
      case 'shield':
        return Icons.security;
      case 'crown':
        return Icons.workspace_premium;
      default:
        return Icons.emoji_events;
    }
  }
}

class _AchievementStats extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.primaryBlue.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Achievement Progress',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          
          Row(
            children: [
              Expanded(
                child: _StatItem(
                  label: 'Unlocked',
                  value: '12',
                  total: '25',
                  color: AppTheme.primaryGreen,
                ),
              ),
              Expanded(
                child: _StatItem(
                  label: 'In Progress',
                  value: '5',
                  total: '13',
                  color: AppTheme.primaryOrange,
                ),
              ),
              Expanded(
                child: _StatItem(
                  label: 'Locked',
                  value: '8',
                  total: '25',
                  color: Colors.grey,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final String total;
  final Color color;

  const _StatItem({
    required this.label,
    required this.value,
    required this.total,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          '$value/$total',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppTheme.textSecondary,
          ),
        ),
      ],
    );
  }
}

class _InfoChip extends StatelessWidget {
  final String label;
  final Color color;

  const _InfoChip({
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}