import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ekkalavya_sports_ai/core/providers/auth_provider.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';

class RoleSelectionPage extends ConsumerStatefulWidget {
  const RoleSelectionPage({Key? key}) : super(key: key);

  @override
  ConsumerState<RoleSelectionPage> createState() => _RoleSelectionPageState();
}

class _RoleSelectionPageState extends ConsumerState<RoleSelectionPage> {
  String? _selectedRole;

  Future<void> _handleRoleSelection() async {
    if (_selectedRole == null) return;

    final success = await ref.read(authProvider.notifier).selectRole(_selectedRole!);
    
    if (success && mounted) {
      context.go(_selectedRole == 'coach' ? '/coach/dashboard' : '/player/dashboard');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 40),
              
              // Header
              const Center(
                child: Column(
                  children: [
                    Text(
                      'Choose Your Role',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Select how you want to use Ekkalavya Sports AI',
                      style: TextStyle(
                        fontSize: 16,
                        color: AppTheme.textSecondary,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 60),
              
              // Role Cards
              Expanded(
                child: Column(
                  children: [
                    // Player Role
                    _RoleCard(
                      title: 'Player',
                      description: 'Train with AI-powered analysis, get real-time feedback, and track your progress',
                      icon: Icons.sports_tennis,
                      features: [
                        'Real-time AI analysis',
                        'Performance tracking',
                        'Personalized drills',
                        'Progress analytics',
                      ],
                      isSelected: _selectedRole == 'player',
                      onTap: () => setState(() => _selectedRole = 'player'),
                    ),
                    
                    const SizedBox(height: 24),
                    
                    // Coach Role
                    _RoleCard(
                      title: 'Coach',
                      description: 'Manage students, provide video consultations, and access advanced analytics',
                      icon: Icons.sports_gymnastics,
                      features: [
                        'Student management',
                        'Video consultations',
                        'Advanced analytics',
                        'Performance reports',
                      ],
                      isSelected: _selectedRole == 'coach',
                      onTap: () => setState(() => _selectedRole = 'coach'),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 40),
              
              // Continue Button
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: (_selectedRole != null && !authState.isLoading) 
                      ? _handleRoleSelection 
                      : null,
                  child: authState.isLoading
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : const Text('Continue'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RoleCard extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final List<String> features;
  final bool isSelected;
  final VoidCallback onTap;

  const _RoleCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.features,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppTheme.primaryOrange : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          color: isSelected ? AppTheme.primaryOrange.withOpacity(0.05) : Colors.white,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primaryOrange : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    size: 30,
                    color: isSelected ? Colors.white : Colors.grey.shade600,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? AppTheme.primaryOrange : AppTheme.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        description,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                if (isSelected)
                  const Icon(
                    Icons.check_circle,
                    color: AppTheme.primaryOrange,
                    size: 28,
                  ),
              ],
            ),
            
            const SizedBox(height: 16),
            
            // Features
            ...features.map((feature) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                children: [
                  Icon(
                    Icons.check,
                    size: 16,
                    color: isSelected ? AppTheme.primaryOrange : Colors.grey.shade600,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    feature,
                    style: TextStyle(
                      fontSize: 14,
                      color: isSelected ? AppTheme.textPrimary : AppTheme.textSecondary,
                    ),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}