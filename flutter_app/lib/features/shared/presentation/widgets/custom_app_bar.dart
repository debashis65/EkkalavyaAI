import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final Widget? leading;
  final bool centerTitle;
  final Color? backgroundColor;
  final bool showBackButton;
  final VoidCallback? onBackPressed;

  const CustomAppBar({
    Key? key,
    required this.title,
    this.actions,
    this.leading,
    this.centerTitle = true,
    this.backgroundColor,
    this.showBackButton = false,
    this.onBackPressed,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final currentLocation = GoRouterState.of(context).matchedLocation;
    final isCoach = currentLocation.contains('/coach/');
    
    return AppBar(
      title: Row(
        children: [
          // Actual logo instead of letter E
          Image.asset(
            'assets/images/logo.png',
            width: 32,
            height: 32,
            fit: BoxFit.contain,
          ),
          const SizedBox(width: 8),
          Text(
            'Ekalavya',
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
        ],
      ),
      centerTitle: false,
      backgroundColor: backgroundColor ?? Colors.white,
      elevation: 0,
      leading: leading ?? (showBackButton ? 
        IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: AppTheme.textPrimary),
          onPressed: onBackPressed ?? () {
            // Use GoRouter navigation methods
            if (context.canPop()) {
              context.pop();
            } else {
              // Navigate to appropriate dashboard based on current location
              if (currentLocation.contains('/coach/')) {
                context.go('/coach/dashboard');
              } else {
                context.go('/player/dashboard');
              }
            }
          },
        ) : null),
      actions: [
        // Indian Flag
        Container(
          width: 24,
          height: 16,
          margin: const EdgeInsets.only(right: 8),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(2),
            border: Border.all(color: Colors.grey.withOpacity(0.3), width: 0.5),
          ),
          child: Column(
            children: [
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryOrange, // Saffron
                    borderRadius: BorderRadius.only(
                      topLeft: Radius.circular(2),
                      topRight: Radius.circular(2),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Container(
                  color: Colors.white,
                  child: Center(
                    child: Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: AppTheme.primaryBlue,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                ),
              ),
              Expanded(
                child: Container(
                  decoration: const BoxDecoration(
                    color: AppTheme.primaryGreen,
                    borderRadius: BorderRadius.only(
                      bottomLeft: Radius.circular(2),
                      bottomRight: Radius.circular(2),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        // Notifications
        IconButton(
          icon: const Icon(Icons.notifications_outlined, color: AppTheme.textPrimary),
          onPressed: () {
            // Handle notifications
          },
        ),
        // Profile
        IconButton(
          icon: const Icon(Icons.person_outline, color: AppTheme.textPrimary),
          onPressed: () {
            if (isCoach) {
              context.go('/coach/profile');
            } else {
              context.go('/player/profile');
            }
          },
        ),
        const SizedBox(width: 8),
        ...?actions,
      ],
      iconTheme: const IconThemeData(color: AppTheme.textPrimary),
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}