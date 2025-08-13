import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:camera/camera.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:ekkalavya_sports_ai/core/theme/app_theme.dart';
import 'package:ekkalavya_sports_ai/features/shared/presentation/widgets/custom_app_bar.dart';

class VideoConsultation extends ConsumerStatefulWidget {
  const VideoConsultation({Key? key}) : super(key: key);

  @override
  ConsumerState<VideoConsultation> createState() => _VideoConsultationState();
}

class _VideoConsultationState extends ConsumerState<VideoConsultation> {
  CameraController? _cameraController;
  List<CameraDescription>? _cameras;
  bool _isCallActive = false;
  bool _isMuted = false;
  bool _isCameraOff = false;
  String? _errorMessage;
  Map<String, dynamic>? _selectedStudent;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    final cameraStatus = await Permission.camera.request();
    final microphoneStatus = await Permission.microphone.request();
    
    if (cameraStatus.isDenied || microphoneStatus.isDenied) {
      setState(() {
        _errorMessage = 'Camera and microphone permissions are required';
      });
      return;
    }

    try {
      _cameras = await availableCameras();
      if (_cameras!.isNotEmpty) {
        _cameraController = CameraController(
          _cameras![1], // Front camera for video calls
          ResolutionPreset.medium,
          enableAudio: true,
        );
        await _cameraController!.initialize();
        setState(() {});
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to initialize camera: $e';
      });
    }
  }

  @override
  void dispose() {
    _cameraController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const CustomAppBar(title: 'Video Consultation'),
      body: Column(
        children: [
          // Session Selection
          if (!_isCallActive) ...[
            Container(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Scheduled Sessions',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ..._buildScheduledSessions(),
                ],
              ),
            ),
          ],

          // Video Call Interface
          if (_isCallActive) ...[
            Expanded(
              child: _buildVideoCallInterface(),
            ),
          ] else ...[
            Expanded(
              child: _buildWaitingInterface(),
            ),
          ],
        ],
      ),
    );
  }

  List<Widget> _buildScheduledSessions() {
    final sessions = [
      {
        'id': '1',
        'student': 'Alex Rodriguez',
        'sport': 'Basketball',
        'time': '2:00 PM - 3:00 PM',
        'type': 'Technique Review',
        'status': 'upcoming',
        'avatar': 'A',
      },
      {
        'id': '2',
        'student': 'Lisa Wong',
        'sport': 'Tennis',
        'time': '4:00 PM - 5:00 PM',
        'type': 'Progress Assessment',
        'status': 'ready',
        'avatar': 'L',
      },
      {
        'id': '3',
        'student': 'James Miller',
        'sport': 'Swimming',
        'time': '6:00 PM - 7:00 PM',
        'type': 'Stroke Analysis',
        'status': 'waiting',
        'avatar': 'J',
      },
    ];

    return sessions.map((session) => Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 24,
            backgroundColor: AppTheme.primaryOrange,
            child: Text(
              session['avatar']!,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  session['student']!,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textPrimary,
                  ),
                ),
                Text(
                  '${session['sport']} • ${session['type']}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(
                      Icons.schedule,
                      size: 12,
                      color: AppTheme.textSecondary,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      session['time']!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: _getStatusColor(session['status']!).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        session['status']!.toUpperCase(),
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: _getStatusColor(session['status']!),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          ElevatedButton.icon(
            onPressed: session['status'] == 'ready' ? () {
              setState(() {
                _selectedStudent = session;
                _isCallActive = true;
              });
            } : null,
            icon: const Icon(Icons.video_call, size: 18),
            label: const Text('Join'),
            style: ElevatedButton.styleFrom(
              backgroundColor: session['status'] == 'ready' 
                  ? AppTheme.primaryGreen 
                  : Colors.grey,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            ),
          ),
        ],
      ),
    )).toList();
  }

  Widget _buildVideoCallInterface() {
    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16, color: Colors.red),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _initializeCamera,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    return Stack(
      children: [
        // Main video area (student's video would be here)
        Container(
          width: double.infinity,
          height: double.infinity,
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircleAvatar(
                  radius: 60,
                  backgroundColor: AppTheme.primaryOrange,
                  child: Icon(Icons.person, size: 60, color: Colors.white),
                ),
                SizedBox(height: 16),
                Text(
                  'Waiting for student to join...',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),

        // Coach's camera preview (picture-in-picture)
        Positioned(
          top: 16,
          right: 16,
          child: Container(
            width: 120,
            height: 160,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white, width: 2),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: _isCameraOff
                  ? Container(
                      color: Colors.black,
                      child: const Center(
                        child: Icon(
                          Icons.videocam_off,
                          color: Colors.white,
                          size: 32,
                        ),
                      ),
                    )
                  : (_cameraController?.value.isInitialized == true
                      ? CameraPreview(_cameraController!)
                      : const Center(child: CircularProgressIndicator())),
            ),
          ),
        ),

        // Session info overlay
        Positioned(
          top: 16,
          left: 16,
          child: Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.7),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _selectedStudent?['student'] ?? '',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${_selectedStudent?['sport']} • ${_selectedStudent?['type']}',
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 4),
                const Row(
                  children: [
                    Icon(Icons.circle, color: Colors.red, size: 8),
                    SizedBox(width: 4),
                    Text(
                      'LIVE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Control buttons
        Positioned(
          bottom: 32,
          left: 0,
          right: 0,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Mute button
              _ControlButton(
                icon: _isMuted ? Icons.mic_off : Icons.mic,
                backgroundColor: _isMuted ? Colors.red : Colors.white.withOpacity(0.2),
                iconColor: _isMuted ? Colors.white : Colors.white,
                onPressed: () {
                  setState(() {
                    _isMuted = !_isMuted;
                  });
                },
              ),
              
              const SizedBox(width: 24),
              
              // End call button
              _ControlButton(
                icon: Icons.call_end,
                backgroundColor: Colors.red,
                iconColor: Colors.white,
                onPressed: () {
                  setState(() {
                    _isCallActive = false;
                    _selectedStudent = null;
                  });
                },
              ),
              
              const SizedBox(width: 24),
              
              // Camera toggle button
              _ControlButton(
                icon: _isCameraOff ? Icons.videocam_off : Icons.videocam,
                backgroundColor: _isCameraOff ? Colors.red : Colors.white.withOpacity(0.2),
                iconColor: _isCameraOff ? Colors.white : Colors.white,
                onPressed: () {
                  setState(() {
                    _isCameraOff = !_isCameraOff;
                  });
                },
              ),
            ],
          ),
        ),

        // Analysis tools overlay
        Positioned(
          bottom: 120,
          right: 16,
          child: Column(
            children: [
              _AnalysisButton(
                icon: Icons.analytics,
                label: 'Real-time Analysis',
                onPressed: () {
                  _showAnalysisDialog();
                },
              ),
              const SizedBox(height: 12),
              _AnalysisButton(
                icon: Icons.note_add,
                label: 'Add Notes',
                onPressed: () {
                  _showNotesDialog();
                },
              ),
              const SizedBox(height: 12),
              _AnalysisButton(
                icon: Icons.screen_share,
                label: 'Share Screen',
                onPressed: () {
                  // TODO: Implement screen sharing
                },
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildWaitingInterface() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              color: AppTheme.primaryOrange.withOpacity(0.1),
              borderRadius: BorderRadius.circular(100),
            ),
            child: const Icon(
              Icons.video_call,
              size: 80,
              color: AppTheme.primaryOrange,
            ),
          ),
          const SizedBox(height: 32),
          const Text(
            'Ready for Video Consultation',
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 8),
          const Text(
            'Select a scheduled session above to begin',
            style: TextStyle(
              fontSize: 16,
              color: AppTheme.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'ready':
        return AppTheme.primaryGreen;
      case 'waiting':
        return AppTheme.primaryOrange;
      case 'upcoming':
        return AppTheme.primaryBlue;
      default:
        return AppTheme.textSecondary;
    }
  }

  void _showAnalysisDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Real-time Analysis'),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('AI analysis will be activated during the session to provide:'),
            SizedBox(height: 12),
            ListTile(
              leading: Icon(Icons.check_circle, color: AppTheme.primaryGreen),
              title: Text('Form and technique evaluation'),
              dense: true,
            ),
            ListTile(
              leading: Icon(Icons.check_circle, color: AppTheme.primaryGreen),
              title: Text('Real-time feedback'),
              dense: true,
            ),
            ListTile(
              leading: Icon(Icons.check_circle, color: AppTheme.primaryGreen),
              title: Text('Performance metrics'),
              dense: true,
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
              // TODO: Activate real-time analysis
            },
            child: const Text('Activate'),
          ),
        ],
      ),
    );
  }

  void _showNotesDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Session Notes'),
        content: const TextField(
          decoration: InputDecoration(
            hintText: 'Enter coaching notes...',
            border: OutlineInputBorder(),
          ),
          maxLines: 5,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              // TODO: Save notes
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

class _ControlButton extends StatelessWidget {
  final IconData icon;
  final Color backgroundColor;
  final Color iconColor;
  final VoidCallback onPressed;

  const _ControlButton({
    required this.icon,
    required this.backgroundColor,
    required this.iconColor,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(30),
        ),
        child: Icon(
          icon,
          color: iconColor,
          size: 28,
        ),
      ),
    );
  }
}

class _AnalysisButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  const _AnalysisButton({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Icon(icon, color: AppTheme.primaryOrange, size: 24),
            const SizedBox(height: 4),
            Text(
              label,
              style: const TextStyle(
                fontSize: 10,
                color: AppTheme.textPrimary,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}