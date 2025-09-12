import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ekkalavya_sports_ai/core/providers/auth_provider.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';

class BottomNavbar extends ConsumerWidget {
  final String currentRoute;

  const BottomNavbar({
    Key? key,
    required this.currentRoute,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final isCoach = user?.role == 'coach';

    return Container(
      decoration: BoxDecoration(
        color: AppTheme.primaryOrange,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Container(
          height: 62,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: isCoach ? _buildCoachNavItems(context) : _buildPlayerNavItems(context),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildPlayerNavItems(BuildContext context) {
    return [
      _NavItem(
        icon: Icons.dashboard,
        label: 'Dashboard',
        isActive: currentRoute.contains('/player/dashboard'),
        onTap: () => context.go('/player/dashboard'),
      ),
      _NavItem(
        icon: Icons.analytics,
        label: 'Analytics',
        isActive: currentRoute.contains('/player/performance'),
        onTap: () => context.go('/player/performance'),
      ),
      _NavItem(
        icon: Icons.camera_alt,
        label: 'AR Tools',
        isActive: currentRoute.contains('/player/ar-analysis'),
        onTap: () => context.go('/player/ar-analysis'),
      ),
      _NavItem(
        icon: Icons.schedule,
        label: 'Schedule',
        isActive: currentRoute.contains('/player/schedule'),
        onTap: () => context.go('/player/schedule'),
      ),
      _NavItem(
        icon: Icons.person_search,
        label: 'Coaches',
        isActive: currentRoute.contains('/player/coaches'),
        onTap: () => context.go('/player/coaches'),
      ),
    ];
  }

  List<Widget> _buildCoachNavItems(BuildContext context) {
    return [
      _NavItem(
        icon: Icons.dashboard,
        label: 'Dashboard',
        isActive: currentRoute.contains('/coach/dashboard'),
        onTap: () => context.go('/coach/dashboard'),
      ),
      _NavItem(
        icon: Icons.group,
        label: 'Students',
        isActive: currentRoute.contains('/coach/students'),
        onTap: () => context.go('/coach/students'),
      ),
      _NavItem(
        icon: Icons.video_call,
        label: 'Sessions',
        isActive: currentRoute.contains('/coach/video-consultation'),
        onTap: () => context.go('/coach/video-consultation'),
      ),
      _NavItem(
        icon: Icons.analytics,
        label: 'Analytics',
        isActive: currentRoute.contains('/coach/analytics'),
        onTap: () => context.go('/coach/analytics'),
      ),
      _NavItem(
        icon: Icons.group_outlined,
        label: 'Players',
        isActive: currentRoute.contains('/coach/students'),
        onTap: () => context.go('/coach/students'),
      ),
    ];
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 2),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: isActive ? Colors.white.withOpacity(0.2) : Colors.transparent,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Icon(
                  icon,
                  color: isActive ? AppTheme.primaryBlue : Colors.white,
                  size: 18,
                ),
              ),
              const SizedBox(height: 1),
              Text(
                label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 8,
                  fontWeight: isActive ? FontWeight.w600 : FontWeight.w400,
                  color: isActive ? AppTheme.primaryBlue : Colors.white,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}