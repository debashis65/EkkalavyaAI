import 'package:flutter/material.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/custom_app_bar.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/bottom_navbar.dart';

class AboutPage extends StatelessWidget {
  const AboutPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: const CustomAppBar(
        title: 'About Ekalavya',
        showBackButton: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Main Description
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    spreadRadius: 1,
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Text(
                'Ekalavya is a comprehensive sports training platform that connects athletes with coaches. The platform provides features for scheduling sessions, analyzing performance, tracking progress, and AR (augmented reality) tools for improving techniques in various sports.',
                style: TextStyle(
                  fontSize: 16,
                  height: 1.6,
                  color: AppTheme.textPrimary,
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            
            // Features Section
            const Text(
              'Features',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: AppTheme.textPrimary,
              ),
            ),
            
            const SizedBox(height: 16),
            
            // Feature Grid
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.1,
              children: [
                _FeatureCard(
                  icon: Icons.dashboard,
                  title: 'Dashboard',
                  description: 'Performance metrics and upcoming sessions',
                  color: AppTheme.primaryOrange,
                ),
                _FeatureCard(
                  icon: Icons.person_search,
                  title: 'Coach Discovery',
                  description: 'Coach profiles and discovery',
                  color: AppTheme.primaryBlue,
                ),
                _FeatureCard(
                  icon: Icons.schedule,
                  title: 'Session Management',
                  description: 'Session scheduling and management',
                  color: AppTheme.primaryGreen,
                ),
                _FeatureCard(
                  icon: Icons.analytics,
                  title: 'Analytics',
                  description: 'Tracking athlete performance',
                  color: Colors.purple,
                ),
                _FeatureCard(
                  icon: Icons.fitness_center,
                  title: 'Training',
                  description: 'Training session planning and recording',
                  color: Colors.teal,
                ),
                _FeatureCard(
                  icon: Icons.camera_alt,
                  title: 'AR Tools',
                  description: 'Augmented reality for technique improvement',
                  color: AppTheme.primaryOrange,
                ),
              ],
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavbar(currentRoute: '/about'),
    );
  }
}

class _FeatureCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;
  final Color color;

  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: color,
              size: 24,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 4),
          Text(
            description,
            style: TextStyle(
              fontSize: 11,
              color: AppTheme.textSecondary,
            ),
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}