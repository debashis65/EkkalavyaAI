import 'package:flutter/material.dart';
import 'package:flutter_app/core/theme/app_theme.dart';

class RoomModeInstructions extends StatelessWidget {
  final VoidCallback? onContinue;
  final bool isScanning;
  final String? currentStep;

  const RoomModeInstructions({
    super.key,
    this.onContinue,
    this.isScanning = false,
    this.currentStep,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header with icon
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppTheme.primaryOrange.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.home,
              size: 32,
              color: AppTheme.primaryOrange,
            ),
          ),
          const SizedBox(height: 16),
          
          // Title
          Text(
            isScanning ? 'Scanning Room Space' : 'Room Mode Setup',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          
          // Subtitle
          Text(
            isScanning 
              ? 'Please wait while we analyze your training space...'
              : 'Get ready for confined space training',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey[600],
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          
          // Instructions
          if (isScanning) ...[
            _buildScanningInstructions(),
          ] else ...[
            _buildSetupInstructions(),
          ],
          
          const SizedBox(height: 24),
          
          // Action button
          if (!isScanning && onContinue != null)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: onContinue,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryOrange,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Continue Setup',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildScanningInstructions() {
    return Column(
      children: [
        // Scanning animation
        Container(
          width: 60,
          height: 60,
          decoration: BoxDecoration(
            color: AppTheme.primaryOrange.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: const Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 40,
                height: 40,
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(AppTheme.primaryOrange),
                  strokeWidth: 3,
                ),
              ),
              Icon(
                Icons.radar,
                size: 24,
                color: AppTheme.primaryOrange,
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        
        // Scanning steps
        _buildInstructionItem(
          Icons.move_to_inbox,
          'Move Slowly',
          'Pan your device around the room to map the space',
          isActive: currentStep == 'mapping',
        ),
        const SizedBox(height: 12),
        _buildInstructionItem(
          Icons.straighten,
          'Check Floor',
          'Ensure you have a flat, clear training surface',
          isActive: currentStep == 'floor_check',
        ),
        const SizedBox(height: 12),
        _buildInstructionItem(
          Icons.height,
          'Ceiling Height',
          'We\'ll check for adequate overhead clearance',
          isActive: currentStep == 'ceiling_check',
        ),
      ],
    );
  }

  Widget _buildSetupInstructions() {
    return Column(
      children: [
        _buildInstructionItem(
          Icons.space_bar,
          'Clear Space',
          'Ensure you have at least 1.5m × 1.5m of clear floor space',
        ),
        const SizedBox(height: 12),
        _buildInstructionItem(
          Icons.pan_tool,
          'Safety First',
          'Keep arms length from walls and obstacles',
        ),
        const SizedBox(height: 12),
        _buildInstructionItem(
          Icons.volume_up,
          'Audio Cues',
          'Follow audio instructions for safe movement',
        ),
        const SizedBox(height: 12),
        _buildInstructionItem(
          Icons.fitness_center,
          'Adaptive Training',
          'Drills will automatically adjust to your space',
        ),
      ],
    );
  }

  Widget _buildInstructionItem(
    IconData icon,
    String title,
    String description, {
    bool isActive = false,
  }) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: isActive 
              ? AppTheme.primaryOrange
              : AppTheme.primaryOrange.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            size: 20,
            color: isActive ? Colors.white : AppTheme.primaryOrange,
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
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                  color: isActive ? AppTheme.primaryOrange : Colors.black87,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                description,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}