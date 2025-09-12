import 'package:flutter/material.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/features/player/presentation/pages/unity_ar_screen.dart';

class UnitySportSelectionScreen extends StatefulWidget {
  const UnitySportSelectionScreen({Key? key}) : super(key: key);

  @override
  State<UnitySportSelectionScreen> createState() => _UnitySportSelectionScreenState();
}

class _UnitySportSelectionScreenState extends State<UnitySportSelectionScreen>
    with TickerProviderStateMixin {
  String _selectedSport = 'basketball';
  String _selectedDifficulty = 'medium';
  late TabController _tabController;
  
  // All 54+ sports exactly matching Unity AR system
  final Map<String, List<SportInfo>> _sportCategories = {
    'Ball Sports': [
      SportInfo('basketball', 'Basketball', Icons.sports_basketball, 
          'Precision shooting with AR court overlay', AppTheme.primaryOrange),
      SportInfo('football', 'Football', Icons.sports_soccer, 
          'Penalty and free kick accuracy training', AppTheme.primaryGreen),
      SportInfo('cricket', 'Cricket', Icons.sports_cricket, 
          'Batting stance and bowling accuracy', Colors.brown),
      SportInfo('tennis', 'Tennis', Icons.sports_tennis, 
          'Service accuracy and court positioning', Colors.green),
      SportInfo('volleyball', 'Volleyball', Icons.sports_volleyball, 
          'Spike accuracy and court coverage', Colors.blue),
      SportInfo('badminton', 'Badminton', Icons.sports_tennis, 
          'Shuttlecock tracking and smash accuracy', Colors.red),
      SportInfo('squash', 'Squash', Icons.sports_tennis, 
          'Wall shot accuracy and court positioning', Colors.orange),
      SportInfo('table_tennis', 'Table Tennis', Icons.sports_tennis, 
          'Paddle positioning and ball tracking', Colors.teal),
      SportInfo('hockey', 'Hockey', Icons.sports_hockey, 
          'Stick handling and shot accuracy', Colors.indigo),
      SportInfo('golf', 'Golf', Icons.sports_golf, 
          'Swing analysis and putting accuracy', Colors.green),
    ],
    'Track & Field': [
      SportInfo('athletics', 'Athletics', Icons.directions_run, 
          'Sprint mechanics and hurdle technique', AppTheme.primaryBlue),
      SportInfo('long_jump', 'Long Jump', Icons.sports_handball, 
          'Takeoff mechanics and landing analysis', Colors.purple),
      SportInfo('high_jump', 'High Jump', Icons.sports_handball, 
          'Approach and clearance technique', Colors.indigo),
      SportInfo('pole_vault', 'Pole Vault', Icons.sports_handball, 
          'Pole mechanics and vault trajectory', Colors.teal),
      SportInfo('hurdle', 'Hurdles', Icons.sports_handball, 
          'Clearance technique and rhythm', Colors.orange),
      SportInfo('shotput_throw', 'Shot Put', Icons.sports_handball, 
          'Throwing mechanics and release angle', Colors.brown),
      SportInfo('discus_throw', 'Discus', Icons.sports_handball, 
          'Rotation technique and release timing', Colors.deepOrange),
      SportInfo('javelin_throw', 'Javelin', Icons.sports_handball, 
          'Approach run and throwing angle', Colors.green),
      SportInfo('cycling', 'Cycling', Icons.directions_bike, 
          'Posture analysis and pedal efficiency', Colors.blue),
    ],
    'Combat Sports': [
      SportInfo('boxing', 'Boxing', Icons.sports_mma, 
          'Punch accuracy and defensive stance', Colors.red),
      SportInfo('wrestling', 'Wrestling', Icons.sports_mma, 
          'Grappling technique and stance', Colors.brown),
      SportInfo('judo', 'Judo', Icons.sports_mma, 
          'Throwing technique and balance', Colors.orange),
      SportInfo('karate', 'Karate', Icons.sports_mma, 
          'Strike accuracy and stance analysis', Colors.purple),
    ],
    'Precision Sports': [
      SportInfo('archery', 'Archery', Icons.sports_handball, 
          '70m precision shooting with wind simulation', Colors.green),
      SportInfo('shooting', 'Shooting', Icons.gps_fixed, 
          'Target precision and breathing control', Colors.grey),
    ],
    'Water Sports': [
      SportInfo('swimming', 'Swimming', Icons.pool, 
          'Stroke analysis and lane positioning', AppTheme.primaryBlue),
      SportInfo('rowing', 'Rowing', Icons.rowing, 
          'Stroke technique and boat positioning', Colors.blue),
      SportInfo('sailing', 'Sailing', Icons.sailing, 
          'Wind reading and boat handling', Colors.lightBlue),
    ],
    'Fitness & Wellness': [
      SportInfo('gymnastics', 'Gymnastics', Icons.sports_gymnastics, 
          'Form analysis and balance assessment', Colors.pink),
      SportInfo('yoga', 'Yoga', Icons.self_improvement, 
          'Pose alignment and breathing analysis', Colors.purple),
      SportInfo('weightlifting', 'Weightlifting', Icons.fitness_center, 
          'Lifting form and bar path analysis', Colors.red),
    ],
    'Winter Sports': [
      SportInfo('skating', 'Skating', Icons.downhill_skiing, 
          'Balance and stride analysis', Colors.lightBlue),
      SportInfo('ice_skating', 'Ice Skating', Icons.downhill_skiing, 
          'Jump technique and spin analysis', Colors.cyan),
      SportInfo('skiing', 'Skiing', Icons.downhill_skiing, 
          'Technique and balance on slopes', Colors.blue),
    ],
    'Traditional Sports': [
      SportInfo('kabaddi', 'Kabaddi', Icons.sports_handball, 
          'Raider technique and defensive stance', Colors.orange),
      SportInfo('kho_kho', 'Kho Kho', Icons.directions_run, 
          'Chasing technique and direction changes', Colors.green),
    ],
    'Para Sports': [
      SportInfo('para_athletics', 'Para Athletics', Icons.accessible, 
          'Adaptive sprint and throwing techniques', AppTheme.primaryBlue),
      SportInfo('para_swimming', 'Para Swimming', Icons.accessible, 
          'Adaptive stroke analysis', Colors.blue),
      SportInfo('para_cycling', 'Para Cycling', Icons.accessible, 
          'Adaptive cycling posture', Colors.green),
      SportInfo('para_table_tennis', 'Para Table Tennis', Icons.accessible, 
          'Wheelchair positioning and paddle technique', Colors.teal),
      SportInfo('para_badminton', 'Para Badminton', Icons.accessible, 
          'Wheelchair court coverage', Colors.red),
      SportInfo('para_archery', 'Para Archery', Icons.accessible, 
          'Seated shooting stance and accuracy', Colors.green),
      SportInfo('para_basketball', 'Para Basketball', Icons.accessible, 
          'Wheelchair shooting mechanics', AppTheme.primaryOrange),
      SportInfo('para_football', 'Para Football', Icons.accessible, 
          'Adaptive kicking technique', Colors.green),
      SportInfo('para_volleyball', 'Para Volleyball', Icons.accessible, 
          'Sitting volleyball technique', Colors.blue),
      SportInfo('wheelchair_basketball', 'Wheelchair Basketball', Icons.accessible, 
          'Professional wheelchair basketball', AppTheme.primaryOrange),
      SportInfo('wheelchair_tennis', 'Wheelchair Tennis', Icons.accessible, 
          'Wheelchair court positioning', Colors.green),
      SportInfo('wheelchair_racing', 'Wheelchair Racing', Icons.accessible, 
          'Racing wheelchair technique', Colors.blue),
      SportInfo('blind_football', 'Blind Football', Icons.accessible, 
          'Audio-guided football skills', Colors.green),
      SportInfo('goalball', 'Goalball', Icons.accessible, 
          'Audio-based precision sport', Colors.purple),
      SportInfo('sitting_volleyball', 'Sitting Volleyball', Icons.accessible, 
          'Seated volleyball technique', Colors.blue),
    ],
  };

  final List<DifficultyInfo> _difficulties = [
    DifficultyInfo('easy', 'Easy', Colors.green, 
        'Large targets, relaxed timing\n30cm tolerance', Icons.sentiment_very_satisfied),
    DifficultyInfo('medium', 'Medium', Colors.orange, 
        'Standard precision requirements\n20cm tolerance', Icons.sentiment_satisfied),
    DifficultyInfo('hard', 'Hard', Colors.red, 
        'Small targets, faster pace\n10cm tolerance', Icons.sentiment_neutral),
    DifficultyInfo('expert', 'Expert', Colors.purple, 
        'Competition-level precision\n5cm tolerance', Icons.sentiment_very_dissatisfied),
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _sportCategories.keys.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Unity AR Training'),
        backgroundColor: AppTheme.primaryBlue,
        foregroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: _sportCategories.keys.map((category) => Tab(text: category)).toList(),
        ),
      ),
      body: Column(
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [AppTheme.primaryBlue, AppTheme.primaryOrange],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.sports_esports,
                        size: 32,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 16),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Professional AR Training',
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Sub-centimeter precision tracking with real-time feedback',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white70,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _buildFeatureChip('Real-time tracking', Icons.track_changes),
                    const SizedBox(width: 8),
                    _buildFeatureChip('54+ sports', Icons.sports),
                    const SizedBox(width: 8),
                    _buildFeatureChip('Physics simulation', Icons.science),
                  ],
                ),
              ],
            ),
          ),
          
          // Sport Selection
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: _sportCategories.entries.map((entry) {
                return _buildSportGrid(entry.key, entry.value);
              }).toList(),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, -5),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Difficulty Selection
            const Row(
              children: [
                Icon(Icons.tune, color: AppTheme.textPrimary),
                SizedBox(width: 8),
                Text(
                  'Select Difficulty',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            
            SizedBox(
              height: 80,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _difficulties.length,
                itemBuilder: (context, index) {
                  final difficulty = _difficulties[index];
                  final isSelected = difficulty.id == _selectedDifficulty;
                  
                  return GestureDetector(
                    onTap: () => setState(() => _selectedDifficulty = difficulty.id),
                    child: Container(
                      width: 80,
                      margin: const EdgeInsets.only(right: 12),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: isSelected 
                            ? difficulty.color.withOpacity(0.1)
                            : Colors.grey.shade100,
                        border: Border.all(
                          color: isSelected 
                              ? difficulty.color 
                              : Colors.grey.shade300,
                          width: isSelected ? 2 : 1,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            difficulty.icon,
                            color: isSelected ? difficulty.color : Colors.grey,
                            size: 24,
                          ),
                          const SizedBox(height: 4),
                          Text(
                            difficulty.name,
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? difficulty.color : Colors.grey,
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
            
            // Start Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: _canStartTraining() ? _startUnityAR : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryOrange,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: Colors.grey.shade300,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.play_arrow, size: 24),
                    const SizedBox(width: 8),
                    Text(
                      'Start ${_getSelectedSportName()} Training',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 8),
            
            // Info note
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.blue.shade600, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Unity AR provides professional-grade tracking with sub-centimeter precision. Ensure good lighting and 2+ meters of space.',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.blue.shade600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSportGrid(String category, List<SportInfo> sports) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: GridView.builder(
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.85,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: sports.length,
        itemBuilder: (context, index) {
          final sport = sports[index];
          final isSelected = sport.id == _selectedSport;
          
          return GestureDetector(
            onTap: () => setState(() => _selectedSport = sport.id),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isSelected 
                    ? sport.color.withOpacity(0.1)
                    : Colors.white,
                border: Border.all(
                  color: isSelected 
                      ? sport.color 
                      : Colors.grey.shade300,
                  width: isSelected ? 3 : 1,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: isSelected ? [
                  BoxShadow(
                    color: sport.color.withOpacity(0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  ),
                ] : [
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: sport.color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      sport.icon,
                      size: 32,
                      color: sport.color,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    sport.name,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? sport.color : AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Expanded(
                    child: Text(
                      sport.description,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                        height: 1.3,
                      ),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (isSelected)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: sport.color,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Text(
                        'Selected',
                        style: TextStyle(
                          fontSize: 10,
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFeatureChip(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.white,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  bool _canStartTraining() {
    return _selectedSport.isNotEmpty && _selectedDifficulty.isNotEmpty;
  }

  String _getSelectedSportName() {
    for (final category in _sportCategories.values) {
      for (final sport in category) {
        if (sport.id == _selectedSport) {
          return sport.name;
        }
      }
    }
    return 'Sport';
  }

  void _startUnityAR() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => UnityARScreen(
          sport: _selectedSport,
          difficulty: _selectedDifficulty,
        ),
      ),
    ).then((result) {
      if (result != null) {
        // Handle session results
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                const Text('Unity AR session completed successfully!'),
              ],
            ),
            backgroundColor: AppTheme.primaryGreen,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        );
      }
    });
  }
}

class SportInfo {
  final String id;
  final String name;
  final IconData icon;
  final String description;
  final Color color;

  SportInfo(this.id, this.name, this.icon, this.description, this.color);
}

class DifficultyInfo {
  final String id;
  final String name;
  final Color color;
  final String description;
  final IconData icon;

  DifficultyInfo(this.id, this.name, this.color, this.description, this.icon);
}