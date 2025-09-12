using System;
using System.Collections.Generic;
using UnityEngine;
using EkkalavyaAR.Utils;

namespace EkkalavyaAR.Tracking
{
    public class BounceFusion : MonoBehaviour
    {
        [Header("Fusion Settings")]
        [SerializeField] private float temporalWindow = 0.05f; // ±50ms window
        [SerializeField] private float verticalVelocityThreshold = 0.5f;
        [SerializeField] private int minPointsForVelocity = 3;
        [SerializeField] private float gravityConstant = 9.81f;
        [SerializeField] private float dampingFactor = 0.8f;
        
        [Header("Prediction")]
        [SerializeField] private bool enableBouncePreiction = true;
        [SerializeField] private float maxPredictionTime = 0.3f;
        [SerializeField] private int trajectoryPoints = 10;
        
        [Header("Debug")]
        [SerializeField] private bool showDebugInfo = false;
        [SerializeField] private bool visualizeTrajectory = false;
        [SerializeField] private Material trajectoryMaterial;
        
        // Events
        public event Action<Vector2, long, float> OnBounce; // pixelUV, timeMs, confidence
        public event Action<Vector2, float> OnBouncePreicted; // predicted position, time to bounce
        public event Action<TrajectoryData> OnTrajectoryUpdated;
        
        // Properties  
        public TrajectoryData CurrentTrajectory { get; private set; }
        public Vector2 LastBouncePosition { get; private set; }
        public long LastBounceTime { get; private set; }
        public float TrackingConfidence { get; private set; }
        
        private BallTracker ballTracker;
        private AudioBounceDetector audioBounceDetector;
        
        // Ball position tracking
        private Queue<BallTrackPoint> trackPoints = new Queue<BallTrackPoint>();
        private List<AudioBounceEvent> pendingAudioEvents = new List<AudioBounceEvent>();
        
        // Trajectory calculation
        private Vector2 currentVelocity;
        private float currentVerticalVelocity;
        private Vector2 lastPosition;
        private float lastPositionTime;
        
        // Physics simulation
        private PhysicsPredictor physicsPredictor;
        
        // Visualization
        private LineRenderer trajectoryLine;
        
        private void Start()
        {
            // Get required components
            ballTracker = GetComponent<BallTracker>();
            audioBounceDetector = GetComponent<AudioBounceDetector>();
            
            if (ballTracker == null)
                ballTracker = FindObjectOfType<BallTracker>();
            
            if (audioBounceDetector == null)
                audioBounceDetector = FindObjectOfType<AudioBounceDetector>();
            
            // Subscribe to events
            if (ballTracker != null)
            {
                ballTracker.OnBallScreenPoint += OnBallPositionReceived;
                ballTracker.OnBallPredicted += OnBallPredicted;
            }
            
            if (audioBounceDetector != null)
            {
                audioBounceDetector.OnAudioBounce += OnAudioBounceReceived;
            }
            
            // Initialize physics predictor
            physicsPredictor = new PhysicsPredictor(gravityConstant, dampingFactor);
            
            // Setup trajectory visualization
            if (visualizeTrajectory)
            {
                SetupTrajectoryVisualization();
            }
            
            CurrentTrajectory = new TrajectoryData();
        }
        
        private void OnDestroy()
        {
            if (ballTracker != null)
            {
                ballTracker.OnBallScreenPoint -= OnBallPositionReceived;
                ballTracker.OnBallPredicted -= OnBallPredicted;
            }
            
            if (audioBounceDetector != null)
            {
                audioBounceDetector.OnAudioBounce -= OnAudioBounceReceived;
            }
        }
        
        private void Update()
        {
            UpdateTrajectory();
            CleanupOldData();
            
            if (enableBouncePreiction)
            {
                PredictBounce();
            }
            
            if (visualizeTrajectory)
            {
                UpdateTrajectoryVisualization();
            }
        }
        
        private void OnBallPositionReceived(Vector2 position, float confidence)
        {
            long currentTimeMs = GetCurrentTimeMs();
            
            // Add tracking point
            var trackPoint = new BallTrackPoint
            {
                position = position,
                timestamp = currentTimeMs,
                confidence = confidence
            };
            
            trackPoints.Enqueue(trackPoint);
            TrackingConfidence = confidence;
            
            // Update velocity calculation
            UpdateVelocity(position, currentTimeMs);
            
            // Check for pending audio events
            CheckForBounceFusion();
        }
        
        private void OnBallPredicted(Vector2 predictedPosition)
        {
            // Use predicted position when ball is occluded
            long currentTimeMs = GetCurrentTimeMs();
            
            var trackPoint = new BallTrackPoint
            {
                position = predictedPosition,
                timestamp = currentTimeMs,
                confidence = 0.5f, // Lower confidence for predicted points
                isPredicted = true
            };
            
            trackPoints.Enqueue(trackPoint);
        }
        
        private void OnAudioBounceReceived(int bounceTimeMs)
        {
            // Add audio event to pending list
            var audioEvent = new AudioBounceEvent
            {
                timestamp = bounceTimeMs,
                isProcessed = false
            };
            
            pendingAudioEvents.Add(audioEvent);
            
            // Immediate fusion check
            CheckForBounceFusion();
        }
        
        private void UpdateVelocity(Vector2 position, long timestamp)
        {
            if (lastPositionTime > 0)
            {
                float deltaTime = (timestamp - lastPositionTime) / 1000f; // Convert to seconds
                if (deltaTime > 0 && deltaTime < 0.1f) // Valid time delta
                {
                    Vector2 deltaPos = position - lastPosition;
                    Vector2 instantVelocity = deltaPos / deltaTime;
                    
                    // Smooth velocity using exponential moving average
                    float smoothingFactor = 0.3f;
                    currentVelocity = Vector2.Lerp(currentVelocity, instantVelocity, smoothingFactor);
                    
                    // Calculate vertical velocity (y-component represents vertical motion)
                    currentVerticalVelocity = Mathf.Lerp(currentVerticalVelocity, instantVelocity.y, smoothingFactor);
                }
            }
            
            lastPosition = position;
            lastPositionTime = timestamp;
        }
        
        private void CheckForBounceFusion()
        {
            long currentTime = GetCurrentTimeMs();
            
            // Process each pending audio event
            for (int i = pendingAudioEvents.Count - 1; i >= 0; i--)
            {
                var audioEvent = pendingAudioEvents[i];
                if (audioEvent.isProcessed) continue;
                
                // Check if we have a ball position within the temporal window
                var matchingVisualPoint = FindMatchingVisualPoint(audioEvent.timestamp);
                
                if (matchingVisualPoint.HasValue)
                {
                    // Fusion successful
                    ProcessBounceFusion(matchingVisualPoint.Value, audioEvent);
                    audioEvent.isProcessed = true;
                }
                else if (currentTime - audioEvent.timestamp > temporalWindow * 2000) // 2x window in ms
                {
                    // Audio event too old, discard
                    pendingAudioEvents.RemoveAt(i);
                }
            }
        }
        
        private BallTrackPoint? FindMatchingVisualPoint(long audioTime)
        {
            BallTrackPoint? bestMatch = null;
            float bestTimeDiff = float.MaxValue;
            
            foreach (var trackPoint in trackPoints)
            {
                float timeDiff = Mathf.Abs(trackPoint.timestamp - audioTime) / 1000f; // Convert to seconds
                
                if (timeDiff <= temporalWindow && timeDiff < bestTimeDiff)
                {
                    // Check if this point represents a ground contact
                    if (IsGroundContactPoint(trackPoint))
                    {
                        bestMatch = trackPoint;
                        bestTimeDiff = timeDiff;
                    }
                }
            }
            
            return bestMatch;
        }
        
        private bool IsGroundContactPoint(BallTrackPoint trackPoint)
        {
            // Check if vertical velocity indicates ground contact
            // This is simplified - in practice, you'd analyze the trajectory more thoroughly
            
            if (trackPoints.Count < minPointsForVelocity) return false;
            
            // Look at recent points to determine vertical motion phase
            var recentPoints = GetRecentPoints(5);
            if (recentPoints.Count < 3) return false;
            
            // Calculate vertical motion trend
            float verticalTrend = CalculateVerticalTrend(recentPoints);
            
            // Ground contact typically occurs when:
            // 1. Vertical velocity changes from negative (falling) to positive (rising)
            // 2. Or at the lowest point of trajectory
            return Mathf.Abs(currentVerticalVelocity) < verticalVelocityThreshold || 
                   (verticalTrend > 0 && currentVerticalVelocity < 0);
        }
        
        private List<BallTrackPoint> GetRecentPoints(int count)
        {
            var recentPoints = new List<BallTrackPoint>();
            var pointArray = trackPoints.ToArray();
            
            int startIndex = Mathf.Max(0, pointArray.Length - count);
            for (int i = startIndex; i < pointArray.Length; i++)
            {
                recentPoints.Add(pointArray[i]);
            }
            
            return recentPoints;
        }
        
        private float CalculateVerticalTrend(List<BallTrackPoint> points)
        {
            if (points.Count < 2) return 0f;
            
            float trend = 0f;
            for (int i = 1; i < points.Count; i++)
            {
                trend += points[i].position.y - points[i - 1].position.y;
            }
            
            return trend / (points.Count - 1);
        }
        
        private void ProcessBounceFusion(BallTrackPoint visualPoint, AudioBounceEvent audioEvent)
        {
            // Calculate fusion confidence based on temporal and spatial consistency
            float temporalConfidence = 1f - (Mathf.Abs(visualPoint.timestamp - audioEvent.timestamp) / 1000f) / temporalWindow;
            float spatialConfidence = visualPoint.confidence;
            float fusionConfidence = (temporalConfidence + spatialConfidence) / 2f;
            
            LastBouncePosition = visualPoint.position;
            LastBounceTime = audioEvent.timestamp;
            
            // Update trajectory data
            UpdateTrajectoryData(visualPoint, fusionConfidence);
            
            if (showDebugInfo)
            {
                Debug.Log($"Bounce fused at position {visualPoint.position} with confidence {fusionConfidence:F2}");
            }
            
            OnBounce?.Invoke(visualPoint.position, audioEvent.timestamp, fusionConfidence);
        }
        
        private void UpdateTrajectory()
        {
            if (trackPoints.Count < 3) return;
            
            // Calculate trajectory parameters
            var recentPoints = GetRecentPoints(trajectoryPoints);
            CurrentTrajectory = CalculateTrajectory(recentPoints);
            
            OnTrajectoryUpdated?.Invoke(CurrentTrajectory);
        }
        
        private TrajectoryData CalculateTrajectory(List<BallTrackPoint> points)
        {
            var trajectory = new TrajectoryData();
            
            if (points.Count < 3)
            {
                trajectory.isValid = false;
                return trajectory;
            }
            
            // Fit parabolic trajectory to points
            var fitter = new ParabolicTrajectoryFitter();
            trajectory = fitter.FitTrajectory(points);
            
            // Predict future points
            if (trajectory.isValid && enableBouncePreiction)
            {
                trajectory.predictedPoints = PredictTrajectoryPoints(trajectory, 10);
            }
            
            return trajectory;
        }
        
        private Vector2[] PredictTrajectoryPoints(TrajectoryData trajectory, int pointCount)
        {
            var predictedPoints = new Vector2[pointCount];
            float currentTime = Time.time;
            float timeStep = maxPredictionTime / pointCount;
            
            for (int i = 0; i < pointCount; i++)
            {
                float futureTime = currentTime + i * timeStep;
                predictedPoints[i] = physicsPredictor.PredictPosition(
                    trajectory.currentPosition,
                    trajectory.velocity,
                    futureTime - currentTime
                );
            }
            
            return predictedPoints;
        }
        
        private void PredictBounce()
        {
            if (!CurrentTrajectory.isValid) return;
            
            // Predict when and where the next bounce will occur
            float timeToBounce = physicsPredictor.PredictTimeToBounce(
                CurrentTrajectory.currentPosition,
                CurrentTrajectory.velocity
            );
            
            if (timeToBounce > 0 && timeToBounce < maxPredictionTime)
            {
                Vector2 bouncePosition = physicsPredictor.PredictPosition(
                    CurrentTrajectory.currentPosition,
                    CurrentTrajectory.velocity,
                    timeToBounce
                );
                
                OnBouncePreicted?.Invoke(bouncePosition, timeToBounce);
            }
        }
        
        private void CleanupOldData()
        {
            long currentTime = GetCurrentTimeMs();
            
            // Remove old tracking points (keep last 2 seconds)
            while (trackPoints.Count > 0 && 
                   (currentTime - trackPoints.Peek().timestamp) > 2000)
            {
                trackPoints.Dequeue();
            }
            
            // Remove old audio events
            for (int i = pendingAudioEvents.Count - 1; i >= 0; i--)
            {
                if ((currentTime - pendingAudioEvents[i].timestamp) > temporalWindow * 4000) // 4x window
                {
                    pendingAudioEvents.RemoveAt(i);
                }
            }
        }
        
        private void SetupTrajectoryVisualization()
        {
            GameObject trajectoryObj = new GameObject("Trajectory Visualization");
            trajectoryObj.transform.SetParent(transform);
            
            trajectoryLine = trajectoryObj.AddComponent<LineRenderer>();
            trajectoryLine.material = trajectoryMaterial != null ? trajectoryMaterial : new Material(Shader.Find("Sprites/Default"));
            trajectoryLine.startWidth = 0.02f;
            trajectoryLine.endWidth = 0.02f;
            trajectoryLine.positionCount = 0;
            trajectoryLine.useWorldSpace = true;
        }
        
        private void UpdateTrajectoryVisualization()
        {
            if (trajectoryLine == null || !CurrentTrajectory.isValid) return;
            
            var points = CurrentTrajectory.predictedPoints;
            if (points == null || points.Length == 0) return;
            
            trajectoryLine.positionCount = points.Length;
            
            for (int i = 0; i < points.Length; i++)
            {
                // Convert screen position to world position for visualization
                Vector3 worldPos = Camera.main.ScreenToWorldPoint(new Vector3(
                    points[i].x * Screen.width,
                    points[i].y * Screen.height,
                    2f // Distance in front of camera
                ));
                trajectoryLine.SetPosition(i, worldPos);
            }
        }
        
        private long GetCurrentTimeMs()
        {
            return (long)(Time.time * 1000f);
        }
        
        public void ResetTracking()
        {
            trackPoints.Clear();
            pendingAudioEvents.Clear();
            currentVelocity = Vector2.zero;
            currentVerticalVelocity = 0f;
            CurrentTrajectory = new TrajectoryData();
            TrackingConfidence = 0f;
        }
        
        // Public API for external systems
        public bool HasValidTrajectory => CurrentTrajectory.isValid;
        
        public Vector2 GetPredictedPositionAt(float futureTime)
        {
            if (!CurrentTrajectory.isValid) return Vector2.zero;
            
            return physicsPredictor.PredictPosition(
                CurrentTrajectory.currentPosition,
                CurrentTrajectory.velocity,
                futureTime
            );
        }
    }
    
    // Data structures
    [System.Serializable]
    public struct BallTrackPoint
    {
        public Vector2 position;
        public long timestamp;
        public float confidence;
        public bool isPredicted;
    }
    
    [System.Serializable]
    public struct AudioBounceEvent
    {
        public long timestamp;
        public bool isProcessed;
    }
    
    [System.Serializable]
    public class TrajectoryData
    {
        public bool isValid;
        public Vector2 currentPosition;
        public Vector2 velocity;
        public float curvature;
        public Vector2[] predictedPoints;
        public float confidence;
        
        public TrajectoryData()
        {
            isValid = false;
            currentPosition = Vector2.zero;
            velocity = Vector2.zero;
            curvature = 0f;
            predictedPoints = new Vector2[0];
            confidence = 0f;
        }
    }
}