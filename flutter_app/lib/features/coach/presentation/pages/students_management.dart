import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/custom_app_bar.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/bottom_navbar.dart';

class StudentsManagement extends ConsumerStatefulWidget {
  const StudentsManagement({Key? key}) : super(key: key);

  @override
  ConsumerState<StudentsManagement> createState() => _StudentsManagementState();
}

class _StudentsManagementState extends ConsumerState<StudentsManagement> {
  final _searchController = TextEditingController();
  String _selectedSport = 'All Sports';
  String _selectedLevel = 'All Levels';
  List<Map<String, dynamic>> _allStudents = [];


  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Students Management'),
      body: Column(
        children: [
          // Search and Filters
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Column(
              children: [
                // Search Bar
                TextField(
                  controller: _searchController,
                  decoration: const InputDecoration(
                    hintText: 'Search students...',
                    prefixIcon: Icon(Icons.search),
                  ),
                  onChanged: (value) {
                    setState(() {});
                  },
                ),
                
                const SizedBox(height: 16),
                
                // Filters
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedSport,
                        decoration: const InputDecoration(
                          labelText: 'Sport',
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        items: ['All Sports', 'Basketball', 'Tennis', 'Swimming', 'Gymnastics']
                            .map((sport) => DropdownMenuItem(
                                  value: sport,
                                  child: Text(sport),
                                ))
                            .toList(),
                        onChanged: (value) {
                          setState(() => _selectedSport = value!);
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: _selectedLevel,
                        decoration: const InputDecoration(
                          labelText: 'Level',
                          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        ),
                        items: ['All Levels', 'Beginner', 'Intermediate', 'Advanced']
                            .map((level) => DropdownMenuItem(
                                  value: level,
                                  child: Text(level),
                                ))
                            .toList(),
                        onChanged: (value) {
                          setState(() => _selectedLevel = value!);
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Students List
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _filteredStudents.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final student = _filteredStudents[index];
                return _StudentCard(
                  student: student,
                  onSendMessage: _sendMessageToStudent,
                  onScheduleSession: _scheduleSession,
                  onGenerateReport: _generateDetailedReport,
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          _showAddStudentDialog(context);
        },
        backgroundColor: AppTheme.primaryOrange,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      bottomNavigationBar: BottomNavbar(currentRoute: '/coach/students'),
    );
  }

  List<Map<String, dynamic>> get _filteredStudents {
    final allStudents = [
      {
        'id': '1',
        'name': 'Sarah Johnson',
        'email': 'sarah.j@email.com',
        'sport': 'Basketball',
        'level': 'Advanced',
        'joinDate': '2024-01-15',
        'lastSession': '2024-07-18',
        'progressScore': 85,
        'sessionsCompleted': 24,
        'avatar': 'S',
        'improvements': [
          'Shooting accuracy: +12%',
          'Ball handling: +8%',
          'Free throws: +15%'
        ],
      },
      {
        'id': '2',
        'name': 'Mike Chen',
        'email': 'mike.chen@email.com',
        'sport': 'Tennis',
        'level': 'Intermediate',
        'joinDate': '2024-02-20',
        'lastSession': '2024-07-19',
        'progressScore': 78,
        'sessionsCompleted': 18,
        'avatar': 'M',
        'improvements': [
          'Serve speed: +20%',
          'Backhand consistency: +10%',
          'Net play: +18%'
        ],
      },
      {
        'id': '3',
        'name': 'Emma Davis',
        'email': 'emma.davis@email.com',
        'sport': 'Swimming',
        'level': 'Advanced',
        'joinDate': '2024-01-10',
        'lastSession': '2024-07-20',
        'progressScore': 92,
        'sessionsCompleted': 32,
        'avatar': 'E',
        'improvements': [
          'Freestyle technique: +15%',
          'Turn efficiency: +22%',
          'Breathing rhythm: +10%'
        ],
      },
      {
        'id': '4',
        'name': 'Alex Rodriguez',
        'email': 'alex.r@email.com',
        'sport': 'Basketball',
        'level': 'Beginner',
        'joinDate': '2024-03-05',
        'lastSession': '2024-07-17',
        'progressScore': 65,
        'sessionsCompleted': 12,
        'avatar': 'A',
        'improvements': [
          'Dribbling: +25%',
          'Shooting form: +18%',
          'Defense stance: +12%'
        ],
      },
    ];

    return allStudents.where((student) {
      final matchesSport = _selectedSport == 'All Sports' || student['sport'] == _selectedSport;
      final matchesLevel = _selectedLevel == 'All Levels' || student['level'] == _selectedLevel;
      final matchesSearch = _searchController.text.isEmpty ||
          student['name']?.toString().toLowerCase().contains(_searchController.text.toLowerCase()) == true;
      
      return matchesSport && matchesLevel && matchesSearch;
    }).toList();
  }

  void _showAddStudentDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add New Student'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: 'Student Name',
                prefixIcon: Icon(Icons.person),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: 'Email',
                prefixIcon: Icon(Icons.email),
              ),
            ),
            SizedBox(height: 16),
            DropdownButtonFormField<String>(
              decoration: InputDecoration(
                labelText: 'Sport',
                prefixIcon: Icon(Icons.sports),
              ),
              items: ['Basketball', 'Tennis', 'Swimming', 'Gymnastics']
                  .map((sport) => DropdownMenuItem(
                        value: sport,
                        child: Text(sport),
                      ))
                  .toList(),
              onChanged: (value) {},
            ),
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
                  content: Text('Student invitation sent successfully'),
                  backgroundColor: AppTheme.primaryGreen,
                ),
              );
            },
            child: const Text('Add Student'),
          ),
        ],
      ),
    );
  }

  void _scheduleSession(Map<String, dynamic> student) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Schedule Session with ${student['name']}'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Select a time for your training session:'),
            SizedBox(height: 16),
            ListTile(
              leading: Icon(Icons.calendar_today),
              title: Text('Tomorrow, 10:00 AM'),
              subtitle: Text('Duration: 60 minutes'),
            ),
            ListTile(
              leading: Icon(Icons.calendar_today),
              title: Text('Tomorrow, 2:00 PM'),
              subtitle: Text('Duration: 60 minutes'),
            ),
            ListTile(
              leading: Icon(Icons.calendar_today),
              title: Text('Day after tomorrow, 9:00 AM'),
              subtitle: Text('Duration: 60 minutes'),
            ),
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
                SnackBar(
                  content: Text('Session scheduled with ${student['name']}'),
                  backgroundColor: AppTheme.primaryGreen,
                ),
              );
            },
            child: const Text('Schedule'),
          ),
        ],
      ),
    );
  }

  void _sendMessageToStudent(Map<String, dynamic> student) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Message ${student['name']}'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: 'Subject',
                hintText: 'Training feedback, schedule update...',
              ),
            ),
            SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: 'Message',
                hintText: 'Type your message here...',
              ),
              maxLines: 4,
            ),
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
                SnackBar(
                  content: Text('Message sent to ${student['name']}'),
                  backgroundColor: AppTheme.primaryBlue,
                ),
              );
            },
            child: const Text('Send'),
          ),
        ],
      ),
    );
  }

  void _generateDetailedReport(Map<String, dynamic> student) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Generating detailed performance report for ${student['name']}...'),
        backgroundColor: AppTheme.primaryOrange,
        duration: const Duration(seconds: 3),
      ),
    );
    
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Performance report ready for ${student['name']}'),
            backgroundColor: AppTheme.primaryGreen,
            action: SnackBarAction(
              label: 'Download',
              onPressed: () {
                // Download functionality would be implemented here
              },
            ),
          ),
        );
      }
    });
  }
}

class _StudentCard extends StatelessWidget {
  final Map<String, dynamic> student;
  final Function(Map<String, dynamic>) onSendMessage;
  final Function(Map<String, dynamic>) onScheduleSession;
  final Function(Map<String, dynamic>) onGenerateReport;

  const _StudentCard({
    required this.student,
    required this.onSendMessage,
    required this.onScheduleSession,
    required this.onGenerateReport,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Row
          Row(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: AppTheme.primaryOrange,
                child: Text(
                  student['avatar'],
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      student['name'],
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      student['email'],
                      style: const TextStyle(
                        fontSize: 14,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryBlue.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            student['sport'],
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppTheme.primaryBlue,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: _getLevelColor(student['level']).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            student['level'],
                            style: TextStyle(
                              fontSize: 12,
                              color: _getLevelColor(student['level']),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                onSelected: (value) {
                  switch (value) {
                    case 'view_progress':
                      _showProgressDialog(context, student);
                      break;
                    case 'schedule_session':
                      _showScheduleDialog(context, student);
                      break;
                    case 'send_message':
                      onSendMessage(student);
                      break;
                  }
                },
                itemBuilder: (context) => [
                  const PopupMenuItem(
                    value: 'view_progress',
                    child: Row(
                      children: [
                        Icon(Icons.analytics, size: 18),
                        SizedBox(width: 8),
                        Text('View Progress'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'schedule_session',
                    child: Row(
                      children: [
                        Icon(Icons.schedule, size: 18),
                        SizedBox(width: 8),
                        Text('Schedule Session'),
                      ],
                    ),
                  ),
                  const PopupMenuItem(
                    value: 'send_message',
                    child: Row(
                      children: [
                        Icon(Icons.message, size: 18),
                        SizedBox(width: 8),
                        Text('Send Message'),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Stats Row
          Row(
            children: [
              Expanded(
                child: _StatItem(
                  label: 'Progress Score',
                  value: '${student['progressScore']}%',
                  color: _getProgressColor(student['progressScore']),
                ),
              ),
              Expanded(
                child: _StatItem(
                  label: 'Sessions',
                  value: '${student['sessionsCompleted']}',
                  color: AppTheme.primaryBlue,
                ),
              ),
              Expanded(
                child: _StatItem(
                  label: 'Last Session',
                  value: _formatDate(student['lastSession']),
                  color: AppTheme.textSecondary,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Recent Improvements
          const Text(
            'Recent Improvements:',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          ...((student['improvements'] as List<String>).take(2).map((improvement) => 
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  const Icon(
                    Icons.trending_up,
                    size: 14,
                    color: AppTheme.primaryGreen,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      improvement,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          )),
          
          const SizedBox(height: 16),
          
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _showProgressDialog(context, student),
                  icon: const Icon(Icons.analytics, size: 16),
                  label: const Text('View Progress'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppTheme.primaryBlue,
                    side: const BorderSide(color: AppTheme.primaryBlue),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _showScheduleDialog(context, student),
                  icon: const Icon(Icons.video_call, size: 16),
                  label: const Text('Schedule'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getLevelColor(String level) {
    switch (level) {
      case 'Beginner':
        return Colors.orange;
      case 'Intermediate':
        return AppTheme.primaryBlue;
      case 'Advanced':
        return AppTheme.primaryGreen;
      default:
        return AppTheme.textSecondary;
    }
  }

  Color _getProgressColor(int score) {
    if (score >= 80) return AppTheme.primaryGreen;
    if (score >= 60) return AppTheme.primaryOrange;
    return Colors.red;
  }

  String _formatDate(String dateStr) {
    final date = DateTime.parse(dateStr);
    final now = DateTime.now();
    final difference = now.difference(date).inDays;
    
    if (difference == 0) return 'Today';
    if (difference == 1) return 'Yesterday';
    return '${difference}d ago';
  }

  void _showProgressDialog(BuildContext context, Map<String, dynamic> student) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('${student['name']} - Progress Details'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Progress Score
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Overall Progress:'),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getProgressColor(student['progressScore']).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      '${student['progressScore']}%',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: _getProgressColor(student['progressScore']),
                      ),
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 16),
              
              // All Improvements
              const Text(
                'All Improvements:',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              ...(student['improvements'] as List<String>).map((improvement) => 
                Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle, size: 16, color: AppTheme.primaryGreen),
                      const SizedBox(width: 8),
                      Expanded(child: Text(improvement)),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Session Info
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Sessions Completed:'),
                  Text('${student['sessionsCompleted']}'),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Joined:'),
                  Text(student['joinDate']),
                ],
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              onGenerateReport(student);
            },
            child: const Text('Generate Report'),
          ),
        ],
      ),
    );
  }

  void _showScheduleDialog(BuildContext context, Map<String, dynamic> student) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Schedule Session with ${student['name']}'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              decoration: InputDecoration(
                labelText: 'Session Type',
                prefixIcon: Icon(Icons.category),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: 'Date & Time',
                prefixIcon: Icon(Icons.schedule),
                suffixIcon: Icon(Icons.calendar_today),
              ),
            ),
            SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: 'Duration (minutes)',
                prefixIcon: Icon(Icons.timer),
              ),
              keyboardType: TextInputType.number,
            ),
            SizedBox(height: 16),
            TextField(
              decoration: InputDecoration(
                labelText: 'Notes (optional)',
                prefixIcon: Icon(Icons.note),
              ),
              maxLines: 3,
            ),
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
              onScheduleSession(student);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Session scheduled with ${student['name']}'),
                  backgroundColor: AppTheme.primaryGreen,
                ),
              );
            },
            child: const Text('Schedule'),
          ),
        ],
      ),
    );
  }
}

class _StatItem extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatItem({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          label,
          style: const TextStyle(
            fontSize: 10,
            color: AppTheme.textSecondary,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}