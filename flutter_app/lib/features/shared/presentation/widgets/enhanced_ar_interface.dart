import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:camera/camera.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/bottom_navbar.dart';
import 'dart:math' as math;

class EnhancedARInterface extends ConsumerStatefulWidget {
  final CameraController? cameraController;
  final String selectedSport;
  final Map<String, dynamic>? analysisData;
  final bool isAnalyzing;
  final VoidCallback? onStartAnalysis;
  final VoidCallback? onStopAnalysis;
  final Function(String)? onSportChanged;
  final Map<String, dynamic>? selectedVenue;
  final Function(Map<String, dynamic>?)? onVenueChanged;

  const EnhancedARInterface({
    Key? key,
    this.cameraController,
    required this.selectedSport,
    this.analysisData,
    this.isAnalyzing = false,
    this.onStartAnalysis,
    this.onStopAnalysis,
    this.onSportChanged,
    this.selectedVenue,
    this.onVenueChanged,
  }) : super(key: key);

  @override
  ConsumerState<EnhancedARInterface> createState() => _EnhancedARInterfaceState();
}

class _EnhancedARInterfaceState extends ConsumerState<EnhancedARInterface>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _scanController;
  bool _showAnalysisTypes = false;
  bool _showVenueSelector = false;
  List<Map<String, dynamic>> _availableVenues = [
    // Odisha Venues (Always Available)
    {'id': 'biju_patnaik_hockey', 'venueName': 'Biju Patnaik Hockey Stadium', 'location': 'Bhubaneswar, Odisha', 'capacity': 15000, 'surface': 'Artificial Turf', 'lighting': 'LED Floodlights', 'category': 'odisha'},
    {'id': 'east_coast_railway', 'venueName': 'East Coast Railway Stadium', 'location': 'Bhubaneswar, Odisha', 'capacity': 50000, 'surface': 'Natural Grass', 'lighting': 'LED Floodlights', 'category': 'odisha'},
    {'id': 'barabati_stadium', 'venueName': 'Barabati Stadium', 'location': 'Cuttack, Odisha', 'capacity': 45000, 'surface': 'Natural Grass', 'lighting': 'LED Floodlights', 'category': 'odisha'},
    {'id': 'birsa_munda_hockey', 'venueName': 'Birsa Munda International Hockey Stadium', 'location': 'Rourkela, Odisha', 'capacity': 20000, 'surface': 'Artificial Turf', 'lighting': 'LED Floodlights', 'category': 'odisha'},
    {'id': 'jnm_indoor', 'venueName': 'Jawaharlal Nehru Indoor Stadium', 'location': 'Cuttack, Odisha', 'capacity': 4000, 'surface': 'Wooden Court', 'lighting': 'LED Indoor', 'category': 'odisha'},
    // Indian Venues (75% Performance Score)
    {'id': 'salt_lake', 'venueName': 'Salt Lake Stadium', 'location': 'Kolkata, India', 'capacity': 85000, 'surface': 'Natural Grass', 'lighting': 'LED Floodlights', 'category': 'indian', 'unlockScore': 75},
    {'id': 'indira_gandhi_arena', 'venueName': 'Indira Gandhi Arena', 'location': 'New Delhi, India', 'capacity': 25000, 'surface': 'Multi-Purpose Court', 'lighting': 'LED Indoor', 'category': 'indian', 'unlockScore': 75},
    // International Venues (90% Performance Score)
    {'id': 'madison_square', 'venueName': 'Madison Square Garden', 'location': 'New York, USA', 'capacity': 20000, 'surface': 'Hardwood Court', 'lighting': 'LED Indoor', 'category': 'international', 'unlockScore': 90},
    {'id': 'wembley', 'venueName': 'Wembley Stadium', 'location': 'London, England', 'capacity': 90000, 'surface': 'Natural Grass', 'lighting': 'LED Floodlights', 'category': 'international', 'unlockScore': 90},
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat();
    
    _scanController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    
    _loadVenuesForSport(widget.selectedSport);
  }

  @override
  void didUpdateWidget(EnhancedARInterface oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedSport != widget.selectedSport) {
      _loadVenuesForSport(widget.selectedSport);
    }
  }

  void _loadVenuesForSport(String sport) {
    // Load realistic venues for the selected sport
    final venues = _getVenuesForSport(sport);
    
    // Apply unlock logic based on user scores (mock 70% user score for demo)
    final userBestScore = 70.0; // This would come from actual user data
    
    final unlockedVenues = venues.map((venue) {
      var venueClone = Map<String, dynamic>.from(venue);
      
      // Primary venues (Odisha) are always unlocked
      if (venue['isPrimary'] == true) {
        venueClone['unlocked'] = true;
      } else {
        // Check unlock requirements
        final unlockReq = venue['unlockRequirement'];
        if (unlockReq != null && unlockReq['minScore'] != null) {
          venueClone['unlocked'] = userBestScore >= unlockReq['minScore'];
        } else {
          venueClone['unlocked'] = true;
        }
      }
      
      return venueClone;
    }).toList();
    
    setState(() {
      _availableVenues = unlockedVenues;
    });
  }

  List<Map<String, dynamic>> _getVenuesForSport(String sport) {
    final venueConfigs = {
      'basketball': [
        // PRIMARY VENUES - Odisha (Always Available)
        {
          'id': 'odisha_1',
          'name': 'Jawaharlal Nehru Indoor Stadium',
          'location': 'Cuttack, Odisha, India',
          'type': 'indoor_stadium',
          'surface': 'hardwood',
          'difficulty': 'intermediate',
          'capacity': 4000,
          'lighting': 'professional',
          'crowdNoise': 70,
          'isRealVenue': true,
          'isPrimary': true,
          'zones': [
            {'name': 'Free Throw Line', 'difficulty': 'medium', 'multiplier': 1.0, 'x': 0.5, 'y': 0.8},
            {'name': 'Three Point Arc', 'difficulty': 'hard', 'multiplier': 1.5, 'x': 0.3, 'y': 0.6},
            {'name': 'Paint Zone', 'difficulty': 'easy', 'multiplier': 1.2, 'x': 0.5, 'y': 0.9},
            {'name': 'Corner Three', 'difficulty': 'hard', 'multiplier': 1.4, 'x': 0.1, 'y': 0.7},
          ],
          'unlocked': true,
        },
        {
          'id': 'odisha_2',
          'name': 'Angul Stadium Basketball Court',
          'location': 'Angul, Odisha, India',
          'type': 'outdoor_court',
          'surface': 'synthetic',
          'difficulty': 'beginner',
          'capacity': 1500,
          'lighting': 'standard',
          'crowdNoise': 45,
          'isRealVenue': true,
          'isPrimary': true,
          'zones': [
            {'name': 'Close Range', 'difficulty': 'easy', 'multiplier': 1.0, 'x': 0.5, 'y': 0.85},
            {'name': 'Mid Range', 'difficulty': 'medium', 'multiplier': 1.2, 'x': 0.4, 'y': 0.7},
            {'name': 'Three Point', 'difficulty': 'hard', 'multiplier': 1.4, 'x': 0.3, 'y': 0.6},
          ],
          'unlocked': true,
        },
        // INDIAN VENUES (75% unlock)
        {
          'id': 'india_1',
          'name': 'Indira Gandhi Arena',
          'location': 'New Delhi, India',
          'type': 'arena',
          'surface': 'hardwood',
          'difficulty': 'advanced',
          'capacity': 15000,
          'lighting': 'professional',
          'crowdNoise': 85,
          'isRealVenue': true,
          'isPrimary': false,
          'unlockRequirement': {'minScore': 75},
          'zones': [
            {'name': 'Free Throw', 'difficulty': 'medium', 'multiplier': 1.0, 'x': 0.5, 'y': 0.8},
            {'name': 'Three Point Arc', 'difficulty': 'hard', 'multiplier': 1.5, 'x': 0.3, 'y': 0.6},
            {'name': 'Paint Zone', 'difficulty': 'medium', 'multiplier': 1.3, 'x': 0.5, 'y': 0.9},
            {'name': 'Baseline', 'difficulty': 'hard', 'multiplier': 1.4, 'x': 0.5, 'y': 0.95},
          ],
          'unlocked': false,
        },
        // INTERNATIONAL VENUES (90% unlock)
        {
          'id': 'international_1',
          'name': 'Madison Square Garden',
          'location': 'New York, USA',
          'type': 'arena',
          'surface': 'hardwood',
          'difficulty': 'professional',
          'capacity': 20789,
          'lighting': 'professional',
          'crowdNoise': 95,
          'isRealVenue': true,
          'isPrimary': false,
          'unlockRequirement': {'minScore': 90},
          'zones': [
            {'name': 'Free Throw', 'difficulty': 'hard', 'multiplier': 1.2, 'x': 0.5, 'y': 0.8},
            {'name': 'Three Point Arc', 'difficulty': 'expert', 'multiplier': 1.8, 'x': 0.3, 'y': 0.6},
            {'name': 'Paint Zone', 'difficulty': 'hard', 'multiplier': 1.5, 'x': 0.5, 'y': 0.9},
            {'name': 'Clutch Shot', 'difficulty': 'expert', 'multiplier': 2.0, 'x': 0.7, 'y': 0.5},
          ],
          'unlocked': false,
        },
      ],
      'football': [
        // PRIMARY VENUES - Odisha
        {
          'id': 'odisha_f1',
          'name': 'East Coast Railway Stadium',
          'location': 'Bhubaneswar, Odisha, India',
          'type': 'stadium',
          'surface': 'grass',
          'difficulty': 'intermediate',
          'capacity': 15000,
          'lighting': 'floodlights',
          'crowdNoise': 75,
          'isRealVenue': true,
          'isPrimary': true,
          'zones': [
            {'name': 'Penalty Box', 'difficulty': 'hard', 'multiplier': 1.5, 'x': 0.1, 'y': 0.5},
            {'name': 'Goal Area', 'difficulty': 'medium', 'multiplier': 2.0, 'x': 0.05, 'y': 0.5},
            {'name': 'Center Circle', 'difficulty': 'easy', 'multiplier': 1.0, 'x': 0.5, 'y': 0.5},
            {'name': 'Wing Areas', 'difficulty': 'medium', 'multiplier': 1.2, 'x': 0.3, 'y': 0.2},
          ],
          'unlocked': true,
        },
        {
          'id': 'odisha_f2',
          'name': 'Ispat Stadium',
          'location': 'Rourkela, Odisha, India',
          'type': 'stadium',
          'surface': 'grass',
          'difficulty': 'beginner',
          'capacity': 8000,
          'lighting': 'natural',
          'crowdNoise': 50,
          'isRealVenue': true,
          'isPrimary': true,
          'zones': [
            {'name': 'Shooting Zone', 'difficulty': 'easy', 'multiplier': 1.2, 'x': 0.15, 'y': 0.5},
            {'name': 'Passing Zone', 'difficulty': 'easy', 'multiplier': 1.0, 'x': 0.4, 'y': 0.5},
            {'name': 'Dribbling Area', 'difficulty': 'medium', 'multiplier': 1.1, 'x': 0.6, 'y': 0.3},
          ],
          'unlocked': true,
        },
        // INDIAN VENUES (75% unlock)
        {
          'id': 'india_f1',
          'name': 'Salt Lake Stadium',
          'location': 'Kolkata, India',
          'type': 'stadium',
          'surface': 'grass',
          'difficulty': 'advanced',
          'capacity': 85000,
          'lighting': 'floodlights',
          'crowdNoise': 90,
          'isRealVenue': true,
          'isPrimary': false,
          'unlockRequirement': {'minScore': 75},
          'zones': [
            {'name': 'Penalty Box', 'difficulty': 'hard', 'multiplier': 1.6, 'x': 0.1, 'y': 0.5},
            {'name': 'Goal Area', 'difficulty': 'hard', 'multiplier': 2.2, 'x': 0.05, 'y': 0.5},
            {'name': 'Midfield', 'difficulty': 'medium', 'multiplier': 1.1, 'x': 0.5, 'y': 0.5},
            {'name': 'Wing Play', 'difficulty': 'hard', 'multiplier': 1.4, 'x': 0.3, 'y': 0.1},
          ],
          'unlocked': false,
        },
        // INTERNATIONAL VENUES (90% unlock)
        {
          'id': 'international_f1',
          'name': 'Wembley Stadium',
          'location': 'London, England',
          'type': 'stadium',
          'surface': 'grass',
          'difficulty': 'professional',
          'capacity': 90000,
          'lighting': 'professional',
          'crowdNoise': 95,
          'isRealVenue': true,
          'isPrimary': false,
          'unlockRequirement': {'minScore': 90},
          'zones': [
            {'name': 'Penalty Box', 'difficulty': 'expert', 'multiplier': 1.8, 'x': 0.1, 'y': 0.5},
            {'name': 'Goal Area', 'difficulty': 'expert', 'multiplier': 2.5, 'x': 0.05, 'y': 0.5},
            {'name': 'Center Circle', 'difficulty': 'hard', 'multiplier': 1.2, 'x': 0.5, 'y': 0.5},
            {'name': 'Final Third', 'difficulty': 'expert', 'multiplier': 1.6, 'x': 0.25, 'y': 0.5},
          ],
          'unlocked': false,
        },
      ],
      'hockey': [
        // PRIMARY VENUES - Odisha (Hockey Capital of India)
        {
          'id': 'odisha_h1',
          'name': 'Biju Patnaik Hockey Stadium',
          'location': 'Rourkela, Odisha, India',
          'type': 'hockey_stadium',
          'surface': 'artificial_turf',
          'difficulty': 'advanced',
          'capacity': 20000,
          'lighting': 'professional',
          'crowdNoise': 85,
          'isRealVenue': true,
          'isPrimary': true,
          'zones': [
            {'name': 'Shooting Circle', 'difficulty': 'hard', 'multiplier': 1.6, 'x': 0.1, 'y': 0.5},
            {'name': 'Penalty Corner', 'difficulty': 'expert', 'multiplier': 2.0, 'x': 0.05, 'y': 0.3},
            {'name': 'Midfield', 'difficulty': 'medium', 'multiplier': 1.0, 'x': 0.5, 'y': 0.5},
            {'name': 'Wing Play', 'difficulty': 'hard', 'multiplier': 1.3, 'x': 0.3, 'y': 0.1},
          ],
          'unlocked': true,
        },
        {
          'id': 'odisha_h2',
          'name': 'Birsa Munda International Hockey Stadium',
          'location': 'Rourkela, Odisha, India',
          'type': 'international_stadium',
          'surface': 'blue_turf',
          'difficulty': 'professional',
          'capacity': 20000,
          'lighting': 'world_class',
          'crowdNoise': 90,
          'isRealVenue': true,
          'isPrimary': true,
          'zones': [
            {'name': 'D-Zone Attack', 'difficulty': 'expert', 'multiplier': 1.8, 'x': 0.1, 'y': 0.5},
            {'name': 'PC Execution', 'difficulty': 'expert', 'multiplier': 2.2, 'x': 0.05, 'y': 0.3},
            {'name': 'Center Pass', 'difficulty': 'hard', 'multiplier': 1.2, 'x': 0.5, 'y': 0.5},
            {'name': 'Baseline', 'difficulty': 'hard', 'multiplier': 1.4, 'x': 0.15, 'y': 0.05},
          ],
          'unlocked': true,
        },
      ],
      'cricket': [
        // PRIMARY VENUES - Odisha
        {
          'id': 'odisha_c1',
          'name': 'Barabati Stadium',
          'location': 'Cuttack, Odisha, India',
          'type': 'cricket_stadium',
          'surface': 'grass',
          'difficulty': 'intermediate',
          'capacity': 45000,
          'lighting': 'floodlights',
          'crowdNoise': 80,
          'isRealVenue': true,
          'isPrimary': true,
          'zones': [
            {'name': 'Off Side', 'difficulty': 'medium', 'multiplier': 1.2, 'x': 0.3, 'y': 0.6},
            {'name': 'Leg Side', 'difficulty': 'medium', 'multiplier': 1.2, 'x': 0.7, 'y': 0.6},
            {'name': 'Straight Drive', 'difficulty': 'easy', 'multiplier': 1.0, 'x': 0.5, 'y': 0.8},
            {'name': 'Square Cut', 'difficulty': 'hard', 'multiplier': 1.5, 'x': 0.2, 'y': 0.5},
          ],
          'unlocked': true,
        },
      ],
    };

    return venueConfigs[sport] ?? [];
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _scanController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final sportConfig = _getSportConfiguration(widget.selectedSport);
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera Preview
          _buildCameraPreview(),
          
          // AR Overlay
          if (widget.isAnalyzing && widget.analysisData != null)
            _buildAROverlay(),
          
          // Top Controls Bar
          _buildTopControlsBar(sportConfig),
          
          // Bottom Analysis Panel
          _buildBottomAnalysisPanel(sportConfig),
          
          // Side Metrics Panel
          if (widget.isAnalyzing)
            _buildSideMetricsPanel(),
          
          // Analysis Type Selector
          if (_showAnalysisTypes)
            _buildAnalysisTypeSelector(sportConfig),
          
          // Virtual Venue Selector
          if (_showVenueSelector)
            _buildVenueSelector(),
          
          // Real-time Feedback Overlay
          if (widget.isAnalyzing)
            _buildRealtimeFeedbackOverlay(),
        ],
      ),
    );
  }

  Widget _buildCameraPreview() {
    if (widget.cameraController == null ||
        !widget.cameraController!.value.isInitialized) {
      return Container(
        color: Colors.black,
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.camera_alt,
                size: 64,
                color: Colors.white54,
              ),
              SizedBox(height: 16),
              Text(
                'Initializing Camera...',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Positioned.fill(
      child: CameraPreview(widget.cameraController!),
    );
  }

  Widget _buildAROverlay() {
    return Positioned.fill(
      child: CustomPaint(
        painter: EnhancedARPainter(
          analysisData: widget.analysisData!,
          sport: widget.selectedSport,
          animation: _pulseController,
        ),
      ),
    );
  }

  Widget _buildTopControlsBar(Map<String, dynamic> sportConfig) {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: EdgeInsets.only(
          top: MediaQuery.of(context).padding.top + 8,
          left: 16,
          right: 16,
          bottom: 12,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Colors.black.withOpacity(0.8),
              Colors.transparent,
            ],
          ),
        ),
        child: Row(
          children: [
            // Back Button
            Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.3),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white24),
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: Colors.white),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ),
            
            const SizedBox(width: 16),
            
            // Sport Selector
            Expanded(
              child: GestureDetector(
                onTap: () => _showSportSelector(),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(25),
                    border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.5)),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _getSportIcon(widget.selectedSport),
                        color: Colors.white,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        sportConfig['title'] as String,
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      const Spacer(),
                      const Icon(
                        Icons.expand_more,
                        color: Colors.white70,
                        size: 20,
                      ),
                    ],
                  ),
                ),
              ),
            ),
            
            const SizedBox(width: 8),
            
            // Virtual Venue Button
            Container(
              decoration: BoxDecoration(
                color: widget.selectedVenue != null 
                    ? AppTheme.primaryBlue.withOpacity(0.3)
                    : Colors.black.withOpacity(0.3),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: widget.selectedVenue != null 
                      ? AppTheme.primaryBlue
                      : Colors.white24
                ),
              ),
              child: IconButton(
                icon: Icon(
                  Icons.stadium,
                  color: widget.selectedVenue != null 
                      ? AppTheme.primaryBlue
                      : Colors.white,
                ),
                onPressed: () => setState(() => _showVenueSelector = !_showVenueSelector),
              ),
            ),
            
            const SizedBox(width: 8),
            
            // Settings Button
            Container(
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.3),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white24),
              ),
              child: IconButton(
                icon: const Icon(Icons.settings, color: Colors.white),
                onPressed: () => _showAnalysisSettings(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomAnalysisPanel(Map<String, dynamic> sportConfig) {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      child: Container(
        padding: EdgeInsets.only(
          left: 16,
          right: 16,
          top: 20,
          bottom: MediaQuery.of(context).padding.bottom + 16,
        ),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.bottomCenter,
            end: Alignment.topCenter,
            colors: [
              Colors.black.withOpacity(0.9),
              Colors.transparent,
            ],
          ),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Analysis Type Selector Button
            GestureDetector(
              onTap: () => setState(() => _showAnalysisTypes = true),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                decoration: BoxDecoration(
                  color: AppTheme.primaryBlue.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(25),
                  border: Border.all(color: AppTheme.primaryBlue),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.tune,
                      color: AppTheme.primaryBlue,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Analysis Types',
                      style: TextStyle(
                        color: AppTheme.primaryBlue,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(
                      Icons.arrow_upward,
                      color: AppTheme.primaryBlue,
                      size: 16,
                    ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 20),
            
            // Main Analysis Control
            Row(
              children: [
                // Sport Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.selectedSport.toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 1,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.isAnalyzing ? 'Analyzing Performance...' : 'Ready for Analysis',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                
                // Analysis Button
                GestureDetector(
                  onTap: widget.isAnalyzing ? widget.onStopAnalysis : widget.onStartAnalysis,
                  child: AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      return Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: RadialGradient(
                            colors: [
                              widget.isAnalyzing 
                                  ? Colors.red.withOpacity(0.8)
                                  : AppTheme.primaryGreen.withOpacity(0.8),
                              widget.isAnalyzing 
                                  ? Colors.red.withOpacity(0.4)
                                  : AppTheme.primaryGreen.withOpacity(0.4),
                            ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: (widget.isAnalyzing ? Colors.red : AppTheme.primaryGreen)
                                  .withOpacity(0.3 + _pulseController.value * 0.2),
                              blurRadius: 20,
                              spreadRadius: widget.isAnalyzing ? 5 : 0,
                            ),
                          ],
                        ),
                        child: Icon(
                          widget.isAnalyzing ? Icons.stop : Icons.play_arrow,
                          color: Colors.white,
                          size: 36,
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSideMetricsPanel() {
    // Extract real values from analysis data or show defaults
    final analysis = widget.analysisData?['analysis'] as Map<String, dynamic>?;
    final formScore = analysis?['formScore'] ?? 0;
    final powerScore = analysis?['powerScore'] ?? 0;
    final precisionScore = analysis?['precisionScore'] ?? 0;
    final balanceScore = analysis?['balanceScore'] ?? 0;
    
    return Positioned(
      left: 16,
      top: MediaQuery.of(context).size.height * 0.3,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildMetricCard('Form Score', '${formScore.round()}%', AppTheme.primaryGreen, Icons.star),
          const SizedBox(height: 12),
          _buildMetricCard('Power', '${powerScore.round()}%', AppTheme.primaryBlue, Icons.fitness_center),
          const SizedBox(height: 12),
          _buildMetricCard('Precision', '${precisionScore.round()}%', AppTheme.primaryOrange, Icons.center_focus_strong),
          const SizedBox(height: 12),
          _buildMetricCard('Balance', '${balanceScore.round()}%', AppTheme.primaryGold, Icons.balance),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnalysisTypeSelector(Map<String, dynamic> sportConfig) {
    final analysisTypes = sportConfig['analysisTypes'] as List<String>;
    
    return Positioned.fill(
      child: GestureDetector(
        onTap: () => setState(() => _showAnalysisTypes = false),
        child: Container(
          color: Colors.black.withOpacity(0.8),
          child: Center(
            child: Container(
              margin: const EdgeInsets.all(20),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.shade900,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.3)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Select Analysis Type',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 20),
                  ...analysisTypes.map((type) => 
                    _buildAnalysisTypeItem(type),
                  ).toList(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildAnalysisTypeItem(String type) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () {
          setState(() => _showAnalysisTypes = false);
          // Handle analysis type selection
        },
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.primaryBlue.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.3)),
          ),
          child: Text(
            type,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRealtimeFeedbackOverlay() {
    // Extract real feedback from analysis data
    final analysis = widget.analysisData?['analysis'] as Map<String, dynamic>?;
    final coachingTips = analysis?['coaching_tips'] as List<dynamic>? ?? [];
    final poseDetected = analysis?['pose_detected'] ?? false;
    
    // Default feedback if no analysis data available
    List<String> feedbackItems;
    if (!widget.isAnalyzing) {
      feedbackItems = ['Ready for analysis'];
    } else if (coachingTips.isEmpty) {
      feedbackItems = poseDetected 
          ? ['Analyzing your technique...', 'Keep your position steady']
          : ['Position yourself in the camera view', 'Ensure good lighting'];
    } else {
      feedbackItems = coachingTips.cast<String>().take(3).toList();
    }
    
    return Positioned(
      right: 16,
      top: MediaQuery.of(context).size.height * 0.3,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.8),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppTheme.primaryGreen.withOpacity(0.5)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                AnimatedBuilder(
                  animation: _pulseController,
                  builder: (context, child) {
                    return Container(
                      width: 8,
                      height: 8,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: AppTheme.primaryGreen.withOpacity(
                          0.5 + _pulseController.value * 0.5,
                        ),
                      ),
                    );
                  },
                ),
                const SizedBox(width: 8),
                const Text(
                  'Live Feedback',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            ...feedbackItems.map((tip) => _buildFeedbackItem(
              tip, 
              tip.toLowerCase().contains('excellent') || tip.toLowerCase().contains('good') 
                  ? AppTheme.primaryGreen 
                  : tip.toLowerCase().contains('position') || tip.toLowerCase().contains('lighting')
                      ? AppTheme.primaryOrange
                      : AppTheme.primaryBlue
            )),
          ],
        ),
      ),
    );
  }

  Widget _buildFeedbackItem(String text, Color color) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 4,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: color,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              color: color,
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  void _showSportSelector() {
    // Implementation for sport selector
  }

  void _showAnalysisSettings() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('AR Analysis Settings'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SwitchListTile(
              title: const Text('Real-time Feedback'),
              subtitle: const Text('Show live coaching tips'),
              value: true,
              onChanged: (value) {},
            ),
            SwitchListTile(
              title: const Text('Pose Overlay'),
              subtitle: const Text('Display skeleton overlay'),
              value: true,
              onChanged: (value) {},
            ),
            SwitchListTile(
              title: const Text('Performance Metrics'),
              subtitle: const Text('Show live performance data'),
              value: true,
              onChanged: (value) {},
            ),
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

  Map<String, dynamic> _getSportConfiguration(String sport) {
    // Sport configurations matching web design
    const configs = {
      'basketball': {
        'title': 'Basketball AR Analysis',
        'description': 'Professional basketball shooting and movement analysis',
        'analysisTypes': [
          'Shooting Form',
          'Dribbling Technique',
          'Defensive Stance',
          'Footwork',
          'Jump Shot',
          'Free Throws',
        ],
      },
      'archery': {
        'title': 'Archery AR Analysis',
        'description': 'Precision archery form and technique analysis',
        'analysisTypes': [
          'Drawing Technique',
          'Anchor Point',
          'Release Form',
          'Follow Through',
          'Stance Analysis',
          'Breathing Pattern',
        ],
      },
    };

    return configs[sport] ?? {
      'title': '${sport.toUpperCase()} AR Analysis',
      'description': 'Advanced $sport technique analysis',
      'analysisTypes': ['Basic Form', 'Advanced Technique'],
    };
  }

  IconData _getSportIcon(String sport) {
    switch (sport) {
      case 'basketball': return Icons.sports_basketball;
      case 'archery': return Icons.sports;
      case 'football': return Icons.sports_soccer;
      case 'tennis': return Icons.sports_tennis;
      default: return Icons.sports;
    }
  }

  Widget _buildVenueSelector() {
    return Positioned.fill(
      child: GestureDetector(
        onTap: () => setState(() => _showVenueSelector = false),
        child: Container(
          color: Colors.black.withOpacity(0.8),
          child: Center(
            child: Container(
              margin: const EdgeInsets.all(20),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.grey.shade900,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppTheme.primaryBlue.withOpacity(0.3)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.stadium, color: Colors.white, size: 24),
                      const SizedBox(width: 12),
                      Text(
                        'Select Virtual Venue',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.white),
                        onPressed: () => setState(() => _showVenueSelector = false),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  if (_availableVenues.isEmpty)
                    const Padding(
                      padding: EdgeInsets.all(20),
                      child: Text(
                        'No venues available for this sport',
                        style: TextStyle(color: Colors.white70),
                      ),
                    )
                  else
                    SizedBox(
                      height: 300,
                      child: ListView.builder(
                        itemCount: _availableVenues.length,
                        itemBuilder: (context, index) {
                          final venue = _availableVenues[index];
                          final isSelected = widget.selectedVenue?['id'] == venue['id'];
                          final isUnlocked = venue['unlocked'] ?? true;
                          
                          return _buildVenueItem(venue, isSelected, isUnlocked);
                        },
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVenueItem(Map<String, dynamic> venue, bool isSelected, bool isUnlocked) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: GestureDetector(
        onTap: () {
          if (isUnlocked) {
            widget.onVenueChanged?.call(venue);
            setState(() => _showVenueSelector = false);
          } else {
            // Show unlock requirements
            _showUnlockRequirements(venue);
          }
        },
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isSelected 
                ? AppTheme.primaryBlue.withOpacity(0.2)
                : isUnlocked 
                    ? AppTheme.primaryBlue.withOpacity(0.1)
                    : Colors.grey.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected 
                  ? AppTheme.primaryBlue
                  : AppTheme.primaryBlue.withOpacity(0.3),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: _getVenueTypeColor(venue['type']),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      _getVenueTypeIcon(venue['type']),
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          venue['name'],
                          style: TextStyle(
                            color: isUnlocked ? Colors.white : Colors.white54,
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        if (venue['location'] != null)
                          Text(
                            venue['location'],
                            style: TextStyle(
                              color: isUnlocked ? Colors.white70 : Colors.white38,
                              fontSize: 12,
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (!isUnlocked)
                    const Icon(Icons.lock, color: Colors.orange, size: 20)
                  else if (isSelected)
                    const Icon(Icons.check_circle, color: Colors.green, size: 20),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _buildVenueTag(venue['difficulty'], _getDifficultyColor(venue['difficulty'])),
                  const SizedBox(width: 8),
                  _buildVenueTag(venue['surface'], AppTheme.primaryGreen),
                  const SizedBox(width: 8),
                  _buildVenueTag('${venue['zones'].length} zones', AppTheme.primaryOrange),
                ],
              ),
              if (!isUnlocked && venue['unlockRequirement'] != null)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Text(
                    'Unlock: Score ${venue['unlockRequirement']['minScore']}% or higher',
                    style: const TextStyle(
                      color: Colors.orange,
                      fontSize: 11,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
              if (venue['isRealVenue'] == true)
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Row(
                    children: [
                      Icon(Icons.verified, color: AppTheme.primaryGold, size: 12),
                      const SizedBox(width: 4),
                      Text(
                        'Authentic Venue',
                        style: TextStyle(
                          color: AppTheme.primaryGold,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVenueTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.2),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: color,
          fontSize: 10,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Color _getVenueTypeColor(String type) {
    switch (type) {
      case 'arena': case 'stadium': return AppTheme.primaryBlue;
      case 'court': return AppTheme.primaryGreen;
      case 'field': return Colors.green;
      case 'range': return AppTheme.primaryOrange;
      case 'indoor': return Colors.purple;
      default: return Colors.grey;
    }
  }

  IconData _getVenueTypeIcon(String type) {
    switch (type) {
      case 'arena': case 'stadium': return Icons.stadium;
      case 'court': return Icons.sports_tennis;
      case 'field': return Icons.grass;
      case 'range': return Icons.gps_fixed;
      case 'indoor': return Icons.business;
      default: return Icons.place;
    }
  }

  Color _getDifficultyColor(String difficulty) {
    switch (difficulty) {
      case 'beginner': return Colors.green;
      case 'intermediate': return Colors.blue;
      case 'advanced': return Colors.orange;
      case 'professional': return Colors.purple;
      default: return Colors.grey;
    }
  }

  void _showUnlockRequirements(Map<String, dynamic> venue) {
    // Show dialog with unlock requirements
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Venue Locked'),
        content: Text(
          'To unlock ${venue['name']}, you need to achieve a score of ${venue['unlockRequirement']}% or higher in ${widget.selectedSport}.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showSportSelector() {
    // Implementation for sport selector
  }

  void _showAnalysisSettings() {
    // Implementation for analysis settings
  }
}

class EnhancedARPainter extends CustomPainter {
  final Map<String, dynamic> analysisData;
  final String sport;
  final Animation<double> animation;

  EnhancedARPainter({
    required this.analysisData,
    required this.sport,
    required this.animation,
  }) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    // Draw pose skeleton
    _drawPoseSkeleton(canvas, size);
    
    // Draw joint angle indicators
    _drawJointAngles(canvas, size);
    
    // Draw trajectory lines (for sports like basketball)
    if (sport == 'basketball' || sport == 'tennis') {
      _drawTrajectoryLines(canvas, size);
    }
    
    // Draw performance zones
    _drawPerformanceZones(canvas, size);
  }

  void _drawPoseSkeleton(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.primaryBlue.withOpacity(0.8)
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    // Draw skeleton lines based on pose landmarks
    // This would connect to real MediaPipe data
    final landmarks = analysisData['landmarks'] as List<dynamic>? ?? [];
    
    if (landmarks.isNotEmpty) {
      // Draw connections between key pose points
      for (int i = 0; i < landmarks.length - 1; i++) {
        final start = Offset(
          landmarks[i]['x'] * size.width,
          landmarks[i]['y'] * size.height,
        );
        final end = Offset(
          landmarks[i + 1]['x'] * size.width,
          landmarks[i + 1]['y'] * size.height,
        );
        canvas.drawLine(start, end, paint);
      }
    }
  }

  void _drawJointAngles(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.primaryGreen.withOpacity(0.7)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    // Draw angle indicators at key joints
    final angles = analysisData['jointAngles'] as Map<String, dynamic>? ?? {};
    
    angles.forEach((joint, angle) {
      // Position based on joint location
      final center = Offset(size.width * 0.5, size.height * 0.4);
      canvas.drawCircle(center, 30, paint);
      
      // Draw angle text
      final textPainter = TextPainter(
        text: TextSpan(
          text: '${angle}°',
          style: const TextStyle(color: Colors.white, fontSize: 12),
        ),
        textDirection: TextDirection.ltr,
      );
      textPainter.layout();
      textPainter.paint(canvas, center - Offset(textPainter.width / 2, textPainter.height / 2));
    });
  }

  void _drawTrajectoryLines(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.primaryOrange.withOpacity(0.8)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    // Draw trajectory path for ball movement
    final trajectory = analysisData['trajectory'] as List<dynamic>? ?? [];
    
    if (trajectory.length > 1) {
      final path = Path();
      path.moveTo(
        trajectory[0]['x'] * size.width,
        trajectory[0]['y'] * size.height,
      );
      
      for (int i = 1; i < trajectory.length; i++) {
        path.lineTo(
          trajectory[i]['x'] * size.width,
          trajectory[i]['y'] * size.height,
        );
      }
      
      canvas.drawPath(path, paint);
    }
  }

  void _drawPerformanceZones(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppTheme.primaryGreen.withOpacity(0.2)
      ..style = PaintingStyle.fill;

    // Draw zones based on performance analysis
    final zones = analysisData['performanceZones'] as List<dynamic>? ?? [];
    
    for (final zone in zones) {
      final rect = Rect.fromLTWH(
        zone['x'] * size.width,
        zone['y'] * size.height,
        zone['width'] * size.width,
        zone['height'] * size.height,
      );
      canvas.drawRect(rect, paint);
    }
  }

  @override
  bool shouldRepaint(EnhancedARPainter oldDelegate) {
    return oldDelegate.analysisData != analysisData ||
           oldDelegate.animation != animation;
  }
}