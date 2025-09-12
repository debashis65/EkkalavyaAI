import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ekkalavya_sports_ai/core/providers/auth_provider.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/custom_app_bar.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/bottom_navbar.dart';

class CoachProfile extends ConsumerStatefulWidget {
  const CoachProfile({Key? key}) : super(key: key);

  @override
  ConsumerState<CoachProfile> createState() => _CoachProfileState();
}

class _CoachProfileState extends ConsumerState<CoachProfile> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _specialtyController = TextEditingController();
  final _experienceController = TextEditingController();
  final _certificationController = TextEditingController();
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    final user = ref.read(authProvider).user;
    if (user != null) {
      _firstNameController.text = user.firstName ?? '';
      _lastNameController.text = user.lastName ?? '';
      // Mock data for coach-specific fields
      _specialtyController.text = 'Basketball, Tennis';
      _experienceController.text = '8 years';
      _certificationController.text = 'NASM-CPT, USOC Level 2';
    }
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _specialtyController.dispose();
    _experienceController.dispose();
    _certificationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authProvider).user;

    return Scaffold(
      appBar: CustomAppBar(
        title: 'Coach Profile',
        actions: [
          IconButton(
            icon: Icon(_isEditing ? Icons.check : Icons.edit),
            onPressed: () {
              if (_isEditing) {
                if (_formKey.currentState!.validate()) {
                  _updateCoachProfile();
                }
              }
              setState(() {
                _isEditing = !_isEditing;
              });
            },
          ),
        ],
      ),
      bottomNavigationBar: BottomNavbar(currentRoute: '/coach/profile'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Profile Header
            _ProfileHeader(user: user),
            
            const SizedBox(height: 32),
            
            // Profile Form
            _ProfileForm(
              formKey: _formKey,
              firstNameController: _firstNameController,
              lastNameController: _lastNameController,
              specialtyController: _specialtyController,
              experienceController: _experienceController,
              certificationController: _certificationController,
              isEditing: _isEditing,
            ),
            
            const SizedBox(height: 32),
            
            // Coaching Statistics
            _CoachingStatistics(),
            
            const SizedBox(height: 32),
            
            // Professional Details
            _ProfessionalDetails(),
            
            const SizedBox(height: 32),
            
            // Settings Section
            _SettingsSection(),
            
            const SizedBox(height: 32),
            
            // Logout Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () async {
                  await ref.read(authProvider.notifier).logout();
                  if (mounted) {
                    context.go('/login');
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: const Text(
                  'Logout',
                  style: TextStyle(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _updateCoachProfile() async {
    try {
      final authNotifier = ref.read(authProvider.notifier);
      
      // Update user information
      // In development mode, simulate profile update
      // In production, this would call the actual API
      await Future.delayed(const Duration(milliseconds: 500));
      
      // Update coach-specific information (in development, these are stored locally)
      // In production, these would be sent to the backend API
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Profile updated successfully!'),
            backgroundColor: AppTheme.primaryGreen,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to update profile: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  void _editAvailability(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit Availability'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Current: Mon-Fri, 9AM-6PM'),
            SizedBox(height: 16),
            Text('This feature allows coaches to set their available hours for scheduling sessions with students.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Availability updated successfully'),
                  backgroundColor: AppTheme.primaryGreen,
                ),
              );
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  void _navigateToPrivacySettings(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Privacy Settings'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Privacy settings allow you to control:'),
            SizedBox(height: 8),
            Text('• Profile visibility'),
            Text('• Data sharing preferences'),
            Text('• Communication settings'),
            Text('• Session recording permissions'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }

  void _navigateToHelp(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Help & Support'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Need help? Contact our support team:'),
            SizedBox(height: 8),
            Text('📧 support@ekkalavya.com'),
            Text('📱 +1-800-EKKALAVYA'),
            SizedBox(height: 16),
            Text('Or visit our help center for tutorials and guides.'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

class _ProfileHeader extends StatelessWidget {
  final dynamic user;

  const _ProfileHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Profile Picture
        Stack(
          children: [
            CircleAvatar(
              radius: 60,
              backgroundColor: AppTheme.primaryBlue.withOpacity(0.1),
              backgroundImage: user?.profileImageUrl != null
                  ? NetworkImage(user!.profileImageUrl!)
                  : null,
              child: user?.profileImageUrl == null
                  ? const Icon(
                      Icons.person,
                      size: 60,
                      color: AppTheme.primaryBlue,
                    )
                  : null,
            ),
            Positioned(
              bottom: 0,
              right: 0,
              child: Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: AppTheme.primaryBlue,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: const Icon(
                  Icons.camera_alt,
                  color: Colors.white,
                  size: 20,
                ),
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 16),
        
        // User Name
        Text(
          user?.fullName ?? 'Coach',
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        
        const SizedBox(height: 4),
        
        // Email
        Text(
          user?.email ?? '',
          style: const TextStyle(
            fontSize: 16,
            color: AppTheme.textSecondary,
          ),
        ),
        
        const SizedBox(height: 8),
        
        // Role Badge and Verification
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.primaryBlue.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Text(
                user?.role?.toUpperCase() ?? 'COACH',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.primaryBlue,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.verified, size: 12, color: AppTheme.primaryGreen),
                  SizedBox(width: 4),
                  Text(
                    'VERIFIED',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryGreen,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _ProfileForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController firstNameController;
  final TextEditingController lastNameController;
  final TextEditingController specialtyController;
  final TextEditingController experienceController;
  final TextEditingController certificationController;
  final bool isEditing;

  const _ProfileForm({
    required this.formKey,
    required this.firstNameController,
    required this.lastNameController,
    required this.specialtyController,
    required this.experienceController,
    required this.certificationController,
    required this.isEditing,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Personal Information',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(
                child: TextFormField(
                  controller: firstNameController,
                  enabled: isEditing,
                  decoration: const InputDecoration(
                    labelText: 'First Name',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your first name';
                    }
                    return null;
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: TextFormField(
                  controller: lastNameController,
                  enabled: isEditing,
                  decoration: const InputDecoration(
                    labelText: 'Last Name',
                    prefixIcon: Icon(Icons.person_outline),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Please enter your last name';
                    }
                    return null;
                  },
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          const Text(
            'Professional Information',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 16),
          
          TextFormField(
            controller: specialtyController,
            enabled: isEditing,
            decoration: const InputDecoration(
              labelText: 'Specializations',
              prefixIcon: Icon(Icons.sports),
              hintText: 'e.g., Basketball, Tennis, Swimming',
            ),
          ),
          
          const SizedBox(height: 16),
          
          TextFormField(
            controller: experienceController,
            enabled: isEditing,
            decoration: const InputDecoration(
              labelText: 'Years of Experience',
              prefixIcon: Icon(Icons.work_outline),
            ),
          ),
          
          const SizedBox(height: 16),
          
          TextFormField(
            controller: certificationController,
            enabled: isEditing,
            maxLines: 2,
            decoration: const InputDecoration(
              labelText: 'Certifications',
              prefixIcon: Icon(Icons.card_membership),
              hintText: 'e.g., NASM-CPT, USOC Level 2',
            ),
          ),
        ],
      ),
    );
  }
}

class _CoachingStatistics extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Coaching Statistics',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        
        Row(
          children: [
            Expanded(
              child: _StatCard(
                title: 'Total Students',
                value: '28',
                icon: Icons.group,
                color: AppTheme.primaryBlue,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                title: 'Sessions Conducted',
                value: '342',
                icon: Icons.event,
                color: AppTheme.primaryGreen,
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 12),
        
        Row(
          children: [
            Expanded(
              child: _StatCard(
                title: 'Avg. Improvement',
                value: '15.2%',
                icon: Icons.trending_up,
                color: AppTheme.primaryOrange,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _StatCard(
                title: 'Success Rate',
                value: '94%',
                icon: Icons.star,
                color: Colors.amber,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
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
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _ProfessionalDetails extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Professional Details',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              _DetailTile(
                title: 'Member Since',
                value: 'January 2024',
                icon: Icons.calendar_today,
              ),
              
              const Divider(height: 1),
              
              _DetailTile(
                title: 'Rating',
                value: '4.9/5.0 (127 reviews)',
                icon: Icons.star,
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(5, (index) => Icon(
                    index < 4 ? Icons.star : Icons.star_half,
                    color: Colors.amber,
                    size: 16,
                  )),
                ),
              ),
              
              const Divider(height: 1),
              
              _DetailTile(
                title: 'Verification Status',
                value: 'Verified Coach',
                icon: Icons.verified,
                trailing: const Icon(Icons.check_circle, color: AppTheme.primaryGreen),
              ),
              
              const Divider(height: 1),
              
              _DetailTile(
                title: 'Languages',
                value: 'English, Spanish',
                icon: Icons.language,
              ),
              
              const Divider(height: 1),
              
              _DetailTile(
                title: 'Availability',
                value: 'Mon-Fri, 9AM-6PM',
                icon: Icons.schedule,
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Edit Availability'),
                      content: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Current: Mon-Fri, 9AM-6PM'),
                          SizedBox(height: 16),
                          Text('This feature allows coaches to set their available hours for scheduling sessions with students.'),
                        ],
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Cancel'),
                        ),
                        ElevatedButton(
                          onPressed: () {
                            Navigator.of(context).pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('Availability updated successfully'),
                                backgroundColor: AppTheme.primaryGreen,
                              ),
                            );
                          },
                          child: const Text('Update'),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _DetailTile extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Widget? trailing;
  final VoidCallback? onTap;

  const _DetailTile({
    required this.title,
    required this.value,
    required this.icon,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryBlue),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppTheme.textPrimary,
        ),
      ),
      subtitle: Text(
        value,
        style: const TextStyle(
          fontSize: 12,
          color: AppTheme.textSecondary,
        ),
      ),
      trailing: trailing ?? (onTap != null ? const Icon(Icons.chevron_right) : null),
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    );
  }
}

class _SettingsSection extends StatefulWidget {
  @override
  State<_SettingsSection> createState() => _SettingsSectionState();
}

class _SettingsSectionState extends State<_SettingsSection> {
  bool _notificationsEnabled = true;
  bool _darkModeEnabled = false;
  bool _sessionReminders = true;
  bool _studentUpdates = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Settings',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 16),
        
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Column(
            children: [
              _SettingsTile(
                title: 'Push Notifications',
                subtitle: 'Receive session and student updates',
                trailing: Switch(
                  value: _notificationsEnabled,
                  onChanged: (value) {
                    setState(() {
                      _notificationsEnabled = value;
                    });
                  },
                  activeColor: AppTheme.primaryBlue,
                ),
              ),
              
              const Divider(height: 1),
              
              _SettingsTile(
                title: 'Session Reminders',
                subtitle: 'Get notified before scheduled sessions',
                trailing: Switch(
                  value: _sessionReminders,
                  onChanged: (value) {
                    setState(() {
                      _sessionReminders = value;
                    });
                  },
                  activeColor: AppTheme.primaryBlue,
                ),
              ),
              
              const Divider(height: 1),
              
              _SettingsTile(
                title: 'Student Progress Updates',
                subtitle: 'Receive notifications about student achievements',
                trailing: Switch(
                  value: _studentUpdates,
                  onChanged: (value) {
                    setState(() {
                      _studentUpdates = value;
                    });
                  },
                  activeColor: AppTheme.primaryBlue,
                ),
              ),
              
              const Divider(height: 1),
              
              _SettingsTile(
                title: 'Dark Mode',
                subtitle: 'Use dark theme for the app',
                trailing: Switch(
                  value: _darkModeEnabled,
                  onChanged: (value) {
                    setState(() {
                      _darkModeEnabled = value;
                    });
                  },
                  activeColor: AppTheme.primaryBlue,
                ),
              ),
              
              const Divider(height: 1),
              
              _SettingsTile(
                title: 'Privacy Settings',
                subtitle: 'Manage your privacy preferences',
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Privacy Settings'),
                      content: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Privacy settings allow you to control:'),
                          SizedBox(height: 8),
                          Text('• Profile visibility'),
                          Text('• Data sharing preferences'),
                          Text('• Communication settings'),
                          Text('• Session recording permissions'),
                        ],
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Close'),
                        ),
                      ],
                    ),
                  );
                },
              ),
              
              const Divider(height: 1),
              
              _SettingsTile(
                title: 'Help & Support',
                subtitle: 'Get help and contact support',
                trailing: const Icon(Icons.chevron_right),
                onTap: () {
                  showDialog(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: const Text('Help & Support'),
                      content: const Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('Need help? Contact our support team:'),
                          SizedBox(height: 8),
                          Text('📧 support@ekkalavya.com'),
                          Text('📱 +1-800-EKKALAVYA'),
                          SizedBox(height: 16),
                          Text('Or visit our help center for tutorials and guides.'),
                        ],
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(),
                          child: const Text('Close'),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget trailing;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.title,
    required this.subtitle,
    required this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppTheme.textPrimary,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          fontSize: 12,
          color: AppTheme.textSecondary,
        ),
      ),
      trailing: trailing,
      onTap: onTap,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    );
  }
}