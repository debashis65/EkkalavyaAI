/**
 * Enhanced AR Visualization with Professional Biomechanical Tools
 * Integrates OpenSim, BTK, YOLO+Pose, ST-GCN concepts
 */

import React from 'react';
import { BiomechanicalMetrics, EquipmentTracking } from '../../lib/enhanced-biomechanics';

interface EnhancedVisualizationProps {
  biomechanics: BiomechanicalMetrics;
  equipment: EquipmentTracking;
  flexibilityScore: number;
  actionRecognition: string;
  sport: string;
}

export const EnhancedVisualization: React.FC<EnhancedVisualizationProps> = ({
  biomechanics,
  equipment,
  flexibilityScore,
  actionRecognition,
  sport
}) => {
  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800">
        Enhanced Biomechanical Analysis
      </h3>
      
      {/* OpenSim-inspired Physics Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/70 p-3 rounded">
          <h4 className="font-medium text-sm text-blue-700">Power Output</h4>
          <div className="text-xl font-bold text-blue-900">
            {biomechanics.powerOutput.toFixed(1)} W
          </div>
        </div>
        <div className="bg-white/70 p-3 rounded">
          <h4 className="font-medium text-sm text-green-700">Efficiency</h4>
          <div className="text-xl font-bold text-green-900">
            {(biomechanics.efficiency * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* YOLO+Pose Equipment Tracking */}
      {equipment.detected && (
        <div className="bg-orange-50 p-3 rounded border border-orange-200">
          <h4 className="font-medium text-orange-800">Equipment Analysis</h4>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>Type: {equipment.type}</div>
            <div>Velocity: {equipment.velocity.toFixed(2)} m/s</div>
            <div>Angle: {equipment.angle.toFixed(1)}°</div>
            <div>Position: ({equipment.position.x.toFixed(2)}, {equipment.position.y.toFixed(2)})</div>
          </div>
        </div>
      )}

      {/* DeepPoseKit Flexibility Analysis */}
      <div className="bg-purple-50 p-3 rounded border border-purple-200">
        <h4 className="font-medium text-purple-800">Flexibility Score</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-purple-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${flexibilityScore}%` }}
            />
          </div>
          <span className="text-purple-900 font-bold">
            {flexibilityScore.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* ST-GCN Action Recognition */}
      <div className="bg-green-50 p-3 rounded border border-green-200">
        <h4 className="font-medium text-green-800">Action Recognition</h4>
        <div className="text-green-900 font-medium capitalize">
          {actionRecognition.replace(/_/g, ' ')}
        </div>
      </div>

      {/* BTK-inspired Motion Analysis */}
      <div className="bg-blue-50 p-3 rounded border border-blue-200">
        <h4 className="font-medium text-blue-800">Motion Analysis</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-blue-600">Symmetry:</span>
            <span className="ml-2 font-bold">{(biomechanics.symmetry * 100).toFixed(1)}%</span>
          </div>
          <div>
            <span className="text-blue-600">Stability:</span>
            <span className="ml-2 font-bold">{(biomechanics.stability * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Sport-specific Advanced Metrics */}
      {sport === 'boxing' || sport === 'wrestling' || sport === 'judo' ? (
        <div className="bg-red-50 p-3 rounded border border-red-200">
          <h4 className="font-medium text-red-800">Combat Sports Analysis</h4>
          <div className="text-red-900">
            Action Pattern: {actionRecognition}
          </div>
        </div>
      ) : null}

      {/* Para Sports Adaptation */}
      <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
        <h4 className="font-medium text-indigo-800">Adaptive Analysis</h4>
        <div className="text-sm text-indigo-700">
          Analysis adapted for individual biomechanical needs
        </div>
      </div>
    </div>
  );
};

export default EnhancedVisualization;