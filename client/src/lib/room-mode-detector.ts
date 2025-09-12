/**
 * Room Mode Detection using Camera-based Plane Analysis
 * Detects room constraints and enables confined space training
 */

import { LandmarkPoint } from './mediapipe-analyzer';

export interface RoomDimensions {
  width: number;
  height: number;
  area: number;
  aspectRatio: number;
}

export interface RoomConstraints {
  detected: boolean;
  isRoomMode: boolean;
  dimensions: RoomDimensions;
  ceilingHeight: number;
  wallProximity: number[];
  floorFlatness: number;
  usableArea: RoomDimensions;
  safetyScore: number;
  recommendedPatterns: string[];
}

export interface RoomPlanePoint {
  x: number;
  y: number;
  z: number;
  confidence: number;
}

export interface RoomMarker {
  id: string;
  position: { x: number; y: number };
  type: 'target' | 'boundary' | 'warning' | 'pattern';
  active: boolean;
  size: number;
  pattern?: string;
}

export class RoomModeDetector {
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private roomConstraints: RoomConstraints | null = null;
  private currentMarkers: RoomMarker[] = [];
  private isAnalyzing = false;
  
  // Room detection parameters
  private readonly ROOM_AREA_THRESHOLD = 9.0; // 9 square meters
  private readonly MIN_DIMENSION_THRESHOLD = 3.0; // 3 meters
  private readonly CEILING_MIN_HEIGHT = 2.2; // 2.2 meters minimum
  private readonly FLATNESS_TOLERANCE = 0.01; // 10mm flatness variance
  private readonly WALL_PROXIMITY_THRESHOLD = 1.0; // 1 meter from walls

  constructor(videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) {
    this.videoElement = videoElement;
    this.canvasElement = canvasElement;
    this.ctx = canvasElement.getContext('2d');
  }

  /**
   * Analyze camera feed for room constraints using computer vision
   */
  async analyzeRoomConstraints(): Promise<RoomConstraints> {
    if (!this.videoElement || !this.ctx) {
      throw new Error('Room detector not properly initialized');
    }

    const imageData = this.captureFrame();
    const planePoints = await this.detectFloorPlane(imageData);
    const wallDistances = await this.estimateWallProximity(imageData);
    const ceilingHeight = await this.estimateCeilingHeight(imageData, planePoints);
    const dimensions = this.calculateRoomDimensions(planePoints);
    const flatness = this.analyzeFlatness(planePoints);
    
    const isRoomMode = dimensions.area < this.ROOM_AREA_THRESHOLD || 
                      dimensions.width < this.MIN_DIMENSION_THRESHOLD || 
                      dimensions.height < this.MIN_DIMENSION_THRESHOLD;

    const usableArea = this.calculateUsableArea(dimensions, wallDistances);
    const safetyScore = this.calculateSafetyScore(ceilingHeight, wallDistances, flatness);
    const recommendedPatterns = this.getRecommendedPatterns(usableArea, ceilingHeight);

    this.roomConstraints = {
      detected: true,
      isRoomMode,
      dimensions,
      ceilingHeight,
      wallProximity: wallDistances,
      floorFlatness: flatness,
      usableArea,
      safetyScore,
      recommendedPatterns
    };

    return this.roomConstraints;
  }

  /**
   * Capture current video frame for analysis
   */
  private captureFrame(): ImageData {
    if (!this.videoElement || !this.ctx || !this.canvasElement) {
      throw new Error('Cannot capture frame - missing elements');
    }

    // Match canvas to video dimensions
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;

    // Draw video frame to canvas
    this.ctx.drawImage(this.videoElement, 0, 0);
    
    return this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
  }

  /**
   * Detect floor plane using edge detection and perspective analysis
   */
  private async detectFloorPlane(imageData: ImageData): Promise<RoomPlanePoint[]> {
    const { width, height, data } = imageData;
    const planePoints: RoomPlanePoint[] = [];

    // Convert to grayscale for edge detection
    const gray = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      gray[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // Apply Sobel edge detection to find floor boundaries
    const edges = this.applySobelFilter(gray, width, height);
    
    // Find horizontal lines (floor edges) using Hough transform
    const horizontalLines = this.detectHorizontalLines(edges, width, height);
    
    // Estimate floor plane from detected lines
    if (horizontalLines.length >= 2) {
      // Use perspective geometry to estimate floor plane
      const floorLine1 = horizontalLines[0];
      const floorLine2 = horizontalLines[horizontalLines.length - 1];
      
      // Generate floor plane points using perspective projection
      for (let x = 0; x < width; x += 20) {
        const y1 = floorLine1.y + (floorLine1.slope || 0) * (x - floorLine1.x);
        const y2 = floorLine2.y + (floorLine2.slope || 0) * (x - floorLine2.x);
        
        // Map to 3D coordinates using camera calibration estimates
        const worldX = (x - width / 2) / width * 3.0; // Assume 3m field of view
        const worldZ = (y1 - height / 2) / height * 2.0; // Depth estimation
        const worldY = 0; // Floor plane
        
        planePoints.push({
          x: worldX,
          y: worldY,
          z: worldZ,
          confidence: 0.8
        });
      }
    }

    return planePoints;
  }

  /**
   * Apply Sobel edge detection filter
   */
  private applySobelFilter(gray: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const edges = new Uint8ClampedArray(width * height);
    
    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const pixel = gray[(y + ky) * width + (x + kx)];
            const kernelIndex = (ky + 1) * 3 + (kx + 1);
            gx += pixel * sobelX[kernelIndex];
            gy += pixel * sobelY[kernelIndex];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[y * width + x] = Math.min(255, magnitude);
      }
    }
    
    return edges;
  }

  /**
   * Detect horizontal lines using simplified Hough transform
   */
  private detectHorizontalLines(edges: Uint8ClampedArray, width: number, height: number): Array<{x: number, y: number, slope?: number}> {
    const lines: Array<{x: number, y: number, slope?: number}> = [];
    const threshold = 50;

    // Look for horizontal patterns in the lower 2/3 of image (floor area)
    for (let y = Math.floor(height * 0.4); y < height - 10; y += 10) {
      let edgeCount = 0;
      let totalX = 0;
      
      for (let x = 0; x < width; x++) {
        if (edges[y * width + x] > threshold) {
          edgeCount++;
          totalX += x;
        }
      }
      
      if (edgeCount > width * 0.1) { // Significant horizontal edge
        lines.push({
          x: totalX / edgeCount,
          y: y,
          slope: 0
        });
      }
    }

    return lines.sort((a, b) => a.y - b.y);
  }

  /**
   * Estimate wall proximity using depth analysis
   */
  private async estimateWallProximity(imageData: ImageData): Promise<number[]> {
    const { width, height, data } = imageData;
    
    // Analyze edges to estimate distances to walls
    const leftDistance = this.analyzeWallDistance(data, width, height, 'left');
    const rightDistance = this.analyzeWallDistance(data, width, height, 'right');
    const frontDistance = this.analyzeWallDistance(data, width, height, 'front');
    const backDistance = this.analyzeWallDistance(data, width, height, 'back');
    
    return [leftDistance, rightDistance, frontDistance, backDistance];
  }

  /**
   * Analyze wall distance using brightness and edge patterns
   */
  private analyzeWallDistance(data: Uint8ClampedArray, width: number, height: number, direction: string): number {
    let totalBrightness = 0;
    let pixelCount = 0;
    let edgeIntensity = 0;
    
    const midY = Math.floor(height / 2);
    const searchHeight = Math.floor(height / 4);
    
    switch (direction) {
      case 'left':
        // Analyze left edge of image
        for (let y = midY - searchHeight; y < midY + searchHeight; y++) {
          for (let x = 0; x < width * 0.2; x++) {
            const idx = (y * width + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            totalBrightness += brightness;
            pixelCount++;
            
            if (x > 0) {
              const prevIdx = (y * width + x - 1) * 4;
              const prevBrightness = (data[prevIdx] + data[prevIdx + 1] + data[prevIdx + 2]) / 3;
              edgeIntensity += Math.abs(brightness - prevBrightness);
            }
          }
        }
        break;
        
      case 'right':
        // Analyze right edge of image
        for (let y = midY - searchHeight; y < midY + searchHeight; y++) {
          for (let x = width * 0.8; x < width; x++) {
            const idx = (y * width + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            totalBrightness += brightness;
            pixelCount++;
            
            if (x < width - 1) {
              const nextIdx = (y * width + x + 1) * 4;
              const nextBrightness = (data[nextIdx] + data[nextIdx + 1] + data[nextIdx + 2]) / 3;
              edgeIntensity += Math.abs(brightness - nextBrightness);
            }
          }
        }
        break;
        
      case 'front':
        // Analyze bottom of image (closest area)
        for (let y = height * 0.8; y < height; y++) {
          for (let x = width * 0.3; x < width * 0.7; x++) {
            const idx = (y * width + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            totalBrightness += brightness;
            pixelCount++;
          }
        }
        break;
        
      case 'back':
        // Analyze top portion for far wall estimation
        for (let y = 0; y < height * 0.3; y++) {
          for (let x = width * 0.3; x < width * 0.7; x++) {
            const idx = (y * width + x) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            totalBrightness += brightness;
            pixelCount++;
          }
        }
        break;
    }
    
    const avgBrightness = totalBrightness / pixelCount;
    const avgEdgeIntensity = edgeIntensity / pixelCount;
    
    // Estimate distance based on brightness and edge patterns
    // Brighter areas typically indicate walls, darker areas indicate distance
    // Higher edge intensity indicates closer walls
    const distanceEstimate = Math.max(0.5, Math.min(4.0, 
      3.0 - (avgBrightness / 255 * 2) - (avgEdgeIntensity / 100 * 1)
    ));
    
    return distanceEstimate;
  }

  /**
   * Estimate ceiling height using perspective analysis
   */
  private async estimateCeilingHeight(imageData: ImageData, floorPoints: RoomPlanePoint[]): Promise<number> {
    const { width, height, data } = imageData;
    
    // Look for horizontal lines in upper portion (ceiling edges)
    const upperEdges = this.detectCeilingEdges(data, width, height);
    
    if (upperEdges.length === 0 || floorPoints.length === 0) {
      return 2.4; // Default ceiling height assumption
    }
    
    // Use perspective geometry to estimate ceiling height
    const floorY = height * 0.8; // Assume floor at bottom 20% of image
    const ceilingY = Math.min(...upperEdges.map(edge => edge.y));
    const perspectiveRatio = (floorY - ceilingY) / height;
    
    // Estimate height based on perspective distortion
    // Typical room camera setup assumptions
    const estimatedHeight = Math.max(2.0, Math.min(4.0, 2.2 + perspectiveRatio * 1.5));
    
    return estimatedHeight;
  }

  /**
   * Detect ceiling edges in upper portion of image
   */
  private detectCeilingEdges(data: Uint8ClampedArray, width: number, height: number): Array<{x: number, y: number}> {
    const edges: Array<{x: number, y: number}> = [];
    const threshold = 30;
    
    // Search upper third of image for ceiling edges
    for (let y = 10; y < height * 0.4; y += 5) {
      let edgeCount = 0;
      let totalX = 0;
      
      for (let x = 1; x < width - 1; x++) {
        const currentIdx = (y * width + x) * 4;
        const aboveIdx = ((y - 1) * width + x) * 4;
        
        const currentBrightness = (data[currentIdx] + data[currentIdx + 1] + data[currentIdx + 2]) / 3;
        const aboveBrightness = (data[aboveIdx] + data[aboveIdx + 1] + data[aboveIdx + 2]) / 3;
        
        const edgeStrength = Math.abs(currentBrightness - aboveBrightness);
        
        if (edgeStrength > threshold) {
          edgeCount++;
          totalX += x;
        }
      }
      
      if (edgeCount > width * 0.1) {
        edges.push({
          x: totalX / edgeCount,
          y: y
        });
      }
    }
    
    return edges;
  }

  /**
   * Calculate room dimensions from detected plane points
   */
  private calculateRoomDimensions(planePoints: RoomPlanePoint[]): RoomDimensions {
    if (planePoints.length === 0) {
      return { width: 3.0, height: 3.0, area: 9.0, aspectRatio: 1.0 };
    }

    const xCoords = planePoints.map(p => p.x);
    const zCoords = planePoints.map(p => p.z);
    
    const width = Math.max(...xCoords) - Math.min(...xCoords);
    const height = Math.max(...zCoords) - Math.min(...zCoords);
    const area = width * height;
    const aspectRatio = width / height;
    
    return {
      width: Math.max(1.5, width), // Minimum 1.5m width
      height: Math.max(1.5, height), // Minimum 1.5m height  
      area: Math.max(2.25, area), // Minimum 2.25 sq m
      aspectRatio: Math.max(0.5, Math.min(2.0, aspectRatio))
    };
  }

  /**
   * Analyze floor flatness variance
   */
  private analyzeFlatness(planePoints: RoomPlanePoint[]): number {
    if (planePoints.length < 3) return 0.02; // Assume 20mm variance if insufficient data
    
    const yValues = planePoints.map(p => p.y);
    const mean = yValues.reduce((sum, val) => sum + val, 0) / yValues.length;
    const variance = yValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / yValues.length;
    
    return Math.sqrt(variance); // Standard deviation in meters
  }

  /**
   * Calculate usable training area considering safety margins
   */
  private calculateUsableArea(dimensions: RoomDimensions, wallDistances: number[]): RoomDimensions {
    const safetyMargin = 0.5; // 0.5m safety margin from walls
    const minWallDistance = Math.min(...wallDistances);
    
    const usableWidth = Math.max(1.0, dimensions.width - (2 * Math.max(safetyMargin, 2.0 - minWallDistance)));
    const usableHeight = Math.max(1.0, dimensions.height - (2 * Math.max(safetyMargin, 2.0 - minWallDistance)));
    
    return {
      width: usableWidth,
      height: usableHeight,
      area: usableWidth * usableHeight,
      aspectRatio: usableWidth / usableHeight
    };
  }

  /**
   * Calculate overall safety score for room training
   */
  private calculateSafetyScore(ceilingHeight: number, wallDistances: number[], flatness: number): number {
    let score = 100;
    
    // Ceiling height penalty
    if (ceilingHeight < 2.2) score -= 30;
    else if (ceilingHeight < 2.4) score -= 10;
    
    // Wall proximity penalty
    const minWallDistance = Math.min(...wallDistances);
    if (minWallDistance < 1.0) score -= 25;
    else if (minWallDistance < 1.5) score -= 10;
    
    // Floor flatness penalty
    if (flatness > 0.02) score -= 20; // > 20mm variance
    else if (flatness > 0.01) score -= 10; // > 10mm variance
    
    return Math.max(0, score);
  }

  /**
   * Get recommended training patterns based on room constraints
   */
  private getRecommendedPatterns(usableArea: RoomDimensions, ceilingHeight: number): string[] {
    const patterns: string[] = [];
    
    // Pattern recommendations based on space
    if (usableArea.area >= 4.0) {
      patterns.push('micro_ladder', 'figure_8');
    }
    if (usableArea.area >= 2.25) {
      patterns.push('dribble_box');
    }
    if (ceilingHeight >= 2.4) {
      patterns.push('wall_rebound');
    }
    
    // Always include seated mode for accessibility
    patterns.push('seated_control');
    
    return patterns.length > 0 ? patterns : ['seated_control'];
  }

  /**
   * Generate 2D training markers for room mode
   */
  generateRoomMarkers(pattern: string, usableArea: RoomDimensions, canvasWidth: number, canvasHeight: number): RoomMarker[] {
    const markers: RoomMarker[] = [];
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const scaleX = canvasWidth / usableArea.width;
    const scaleY = canvasHeight / usableArea.height;
    
    switch (pattern) {
      case 'dribble_box':
        // 2x2m dribble box pattern (9 positions)
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            const x = centerX + (i - 1) * scaleX * 0.8;
            const y = centerY + (j - 1) * scaleY * 0.8;
            
            markers.push({
              id: `dribble_${i}_${j}`,
              position: { x, y },
              type: 'target',
              active: Math.random() < 0.3, // Random activation
              size: 40,
              pattern: 'dribble_box'
            });
          }
        }
        break;
        
      case 'micro_ladder':
        // 6-rung micro ladder with 0.4m spacing
        for (let i = 0; i < 6; i++) {
          const y = centerY - scaleY * 1.0 + (i * scaleY * 0.33);
          const leftX = centerX - scaleX * 0.3;
          const rightX = centerX + scaleX * 0.3;
          
          markers.push({
            id: `ladder_left_${i}`,
            position: { x: leftX, y },
            type: 'target',
            active: i % 2 === 0, // Alternating pattern
            size: 35,
            pattern: 'micro_ladder'
          });
          
          markers.push({
            id: `ladder_right_${i}`,
            position: { x: rightX, y },
            type: 'target',
            active: i % 2 === 1, // Alternating pattern
            size: 35,
            pattern: 'micro_ladder'
          });
        }
        break;
        
      case 'figure_8':
        // Figure-8 pattern with dual anchors
        const anchorDistance = scaleX * 0.5;
        const leftAnchorX = centerX - anchorDistance;
        const rightAnchorX = centerX + anchorDistance;
        
        // Main anchors
        markers.push({
          id: 'figure8_left_anchor',
          position: { x: leftAnchorX, y: centerY },
          type: 'target',
          active: true,
          size: 45,
          pattern: 'figure_8'
        });
        
        markers.push({
          id: 'figure8_right_anchor',
          position: { x: rightAnchorX, y: centerY },
          type: 'target',
          active: false,
          size: 45,
          pattern: 'figure_8'
        });
        
        // Path positions
        const pathPoints = 8;
        for (let i = 0; i < pathPoints; i++) {
          const angle = (i / pathPoints) * 2 * Math.PI;
          const x = centerX + Math.cos(angle) * scaleX * 0.7;
          const y = centerY + Math.sin(angle) * scaleY * 0.4;
          
          markers.push({
            id: `figure8_path_${i}`,
            position: { x, y },
            type: 'target',
            active: false,
            size: 30,
            pattern: 'figure_8'
          });
        }
        break;
        
      case 'seated_control':
        // 1.6m diameter control area (11 positions)
        const radius = Math.min(scaleX, scaleY) * 0.8;
        
        // Center position
        markers.push({
          id: 'seated_center',
          position: { x: centerX, y: centerY },
          type: 'target',
          active: true,
          size: 50,
          pattern: 'seated_control'
        });
        
        // Inner ring (5 positions)
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * 2 * Math.PI;
          const x = centerX + Math.cos(angle) * radius * 0.4;
          const y = centerY + Math.sin(angle) * radius * 0.4;
          
          markers.push({
            id: `seated_inner_${i}`,
            position: { x, y },
            type: 'target',
            active: false,
            size: 35,
            pattern: 'seated_control'
          });
        }
        
        // Outer ring (5 positions)
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * 2 * Math.PI + Math.PI / 5; // Offset from inner ring
          const x = centerX + Math.cos(angle) * radius * 0.8;
          const y = centerY + Math.sin(angle) * radius * 0.8;
          
          markers.push({
            id: `seated_outer_${i}`,
            position: { x, y },
            type: 'target',
            active: false,
            size: 40,
            pattern: 'seated_control'
          });
        }
        break;
        
      default:
        // Default single target
        markers.push({
          id: 'default_center',
          position: { x: centerX, y: centerY },
          type: 'target',
          active: true,
          size: 50,
          pattern: 'default'
        });
    }
    
    // Add boundary markers
    const boundaryMargin = 50;
    markers.push({
      id: 'boundary_warning',
      position: { x: boundaryMargin, y: boundaryMargin },
      type: 'boundary',
      active: true,
      size: 20,
      pattern: 'boundary'
    });
    
    return markers;
  }

  /**
   * Render room markers on canvas overlay
   */
  renderRoomMarkers(markers: RoomMarker[]): void {
    if (!this.ctx || !this.canvasElement) return;
    
    // Clear previous markers (preserve pose overlay)
    // Only clear marker areas, not the entire canvas
    
    markers.forEach(marker => {
      this.drawMarker(marker);
    });
  }

  /**
   * Draw individual room marker
   */
  private drawMarker(marker: RoomMarker): void {
    if (!this.ctx) return;
    
    const { x, y } = marker.position;
    const { size, type, active } = marker;
    
    // Marker styling based on type and state
    let fillColor = '#ffffff';
    let strokeColor = '#000000';
    let alpha = active ? 1.0 : 0.6;
    
    switch (type) {
      case 'target':
        fillColor = active ? '#00ff00' : '#ffffff';
        strokeColor = active ? '#008800' : '#666666';
        break;
      case 'boundary':
        fillColor = '#ff6600';
        strokeColor = '#cc4400';
        break;
      case 'warning':
        fillColor = '#ff0000';
        strokeColor = '#cc0000';
        alpha = 0.8;
        break;
    }
    
    this.ctx.globalAlpha = alpha;
    
    // Draw marker circle
    this.ctx.beginPath();
    this.ctx.arc(x, y, size / 2, 0, 2 * Math.PI);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // Draw marker center dot
    this.ctx.beginPath();
    this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
    this.ctx.fillStyle = strokeColor;
    this.ctx.fill();
    
    // Add marker ID text for debugging
    if (active) {
      this.ctx.fillStyle = strokeColor;
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(marker.id.split('_')[0], x, y - size / 2 - 8);
    }
    
    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Get current room constraints
   */
  getRoomConstraints(): RoomConstraints | null {
    return this.roomConstraints;
  }

  /**
   * Get current room markers
   */
  getCurrentMarkers(): RoomMarker[] {
    return this.currentMarkers;
  }

  /**
   * Update marker activation based on training pattern
   */
  updateMarkerActivation(activeMarkerIds: string[]): void {
    this.currentMarkers = this.currentMarkers.map(marker => ({
      ...marker,
      active: activeMarkerIds.includes(marker.id)
    }));
  }

  /**
   * Check if pose landmarks are within safe training area
   */
  validatePoseSafety(landmarks: LandmarkPoint[]): { safe: boolean; warnings: string[] } {
    const warnings: string[] = [];
    let safe = true;
    
    if (!this.roomConstraints) {
      return { safe: true, warnings: [] };
    }
    
    const { usableArea, safetyScore, ceilingHeight, wallProximity } = this.roomConstraints;
    
    // Check if pose extends beyond safe boundaries
    landmarks.forEach((landmark, index) => {
      const landmarkName = this.getLandmarkName(index);
      
      // Check horizontal boundaries
      if (Math.abs(landmark.x) > usableArea.width / 2) {
        warnings.push(`${landmarkName} too close to wall - move toward center`);
        safe = false;
      }
      
      // Check vertical boundaries (head clearance)
      if (index === 0 && landmark.y < -0.3) { // Nose landmark for head position
        warnings.push(`Head too close to ceiling - lower stance`);
        safe = false;
      }
    });
    
    // General safety warnings based on room constraints
    if (safetyScore < 70) {
      warnings.push('Room conditions may not be optimal for safe training');
    }
    
    if (Math.min(...wallProximity) < 1.0) {
      warnings.push('Very close to walls - use seated mode for safety');
    }
    
    return { safe, warnings };
  }

  /**
   * Get human-readable landmark name
   */
  private getLandmarkName(index: number): string {
    const landmarkNames: Record<number, string> = {
      0: 'Head',
      11: 'Left shoulder',
      12: 'Right shoulder',
      13: 'Left elbow',
      14: 'Right elbow',
      15: 'Left hand',
      16: 'Right hand',
      23: 'Left hip',
      24: 'Right hip',
      25: 'Left knee',
      26: 'Right knee',
      27: 'Left ankle',
      28: 'Right ankle'
    };
    
    return landmarkNames[index] || `Joint ${index}`;
  }
}