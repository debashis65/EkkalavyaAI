using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using EkkalavyaAR.Calibration;

namespace EkkalavyaAR.Drill
{
    public class MarkerSpawner : MonoBehaviour
    {
        [Header("Marker Prefab")]
        [SerializeField] private GameObject markerPrefab;
        [SerializeField] private float markerHeight = 0.1f;
        [SerializeField] private float pulseSpeed = 2f;
        [SerializeField] private float pulseIntensity = 0.3f;
        
        [Header("Visual States")]
        [SerializeField] private Color inactiveColor = Color.gray;
        [SerializeField] private Color activeColor = Color.green;
        [SerializeField] private Color completedColor = Color.blue;
        [SerializeField] private Color missedColor = Color.red;
        
        // Events
        public event Action<int> OnActiveTargetChanged;
        public event Action<int> OnTargetCompleted;
        public event Action OnAllTargetsCompleted;
        
        // Properties
        public List<DrillMarker> SpawnedMarkers { get; private set; } = new List<DrillMarker>();
        public int ActiveTargetIndex { get; private set; } = 0;
        public bool AllTargetsCompleted => ActiveTargetIndex >= SpawnedMarkers.Count;
        public DrillMarker ActiveTarget => (ActiveTargetIndex < SpawnedMarkers.Count) ? SpawnedMarkers[ActiveTargetIndex] : null;
        
        private TwoPointCalibration calibrationController;
        private DrillConfig currentDrillConfig;
        private Transform courtTransform;
        
        private void Start()
        {
            calibrationController = FindObjectOfType<TwoPointCalibration>();
        }
        
        public void SpawnMarkersForDrill(DrillConfig config, Transform courtSpace)
        {
            currentDrillConfig = config;
            courtTransform = courtSpace;
            
            ClearExistingMarkers();
            
            switch (config.layout.pattern.ToLower())
            {
                case "zigzag":
                    SpawnZigzagPattern(config.layout);
                    break;
                case "grid":
                    SpawnGridPattern(config.layout);
                    break;
                case "baseline":
                    SpawnBaselinePattern(config.layout);
                    break;
                case "penalty_area":
                    SpawnPenaltyAreaPattern(config.layout);
                    break;
                case "net_line":
                    SpawnNetLinePattern(config.layout);
                    break;
                case "service_court":
                    SpawnServiceCourtPattern(config.layout);
                    break;
                case "target_distance":
                    SpawnTargetDistancePattern(config.layout);
                    break;
                case "lane_markers":
                    SpawnLaneMarkersPattern(config.layout);
                    break;
                case "wicket_line":
                    SpawnWicketLinePattern(config.layout);
                    break;
                case "track_marks":
                    SpawnTrackMarksPattern(config.layout);
                    break;
                case "ring_corners":
                    SpawnRingCornersPattern(config.layout);
                    break;
                case "dribble_box":
                    SpawnDribbleBoxPattern(config.layout);
                    break;
                case "micro_ladder":
                    SpawnMicroLadderPattern(config.layout);
                    break;
                case "figure_8":
                    SpawnFigure8Pattern(config.layout);
                    break;
                case "wall_rebound":
                    SpawnWallReboundPattern(config.layout);
                    break;
                case "seated_control":
                    SpawnSeatedControlPattern(config.layout);
                    break;
                default:
                    SpawnDefaultPattern(config.layout);
                    break;
            }
            
            // Set first marker as active
            if (SpawnedMarkers.Count > 0)
            {
                ActiveTargetIndex = 0;
                SetActiveTarget(0);
            }
            
            Debug.Log($"Spawned {SpawnedMarkers.Count} markers in {config.layout.pattern} pattern");
        }
        
        private void SpawnZigzagPattern(DrillLayout layout)
        {
            bool isLeft = true;
            float currentY = layout.start_y_m;
            
            for (int i = 0; i < layout.count; i++)
            {
                float x = isLeft ? -layout.dx_m * 0.5f : layout.dx_m * 0.5f;
                Vector2 position = new Vector2(x, currentY);
                
                SpawnMarkerAtPosition(position, i);
                
                isLeft = !isLeft;
                currentY += layout.dy_m;
            }
        }
        
        private void SpawnGridPattern(DrillLayout layout)
        {
            int rows = Mathf.CeilToInt(Mathf.Sqrt(layout.count));
            int cols = Mathf.CeilToInt((float)layout.count / rows);
            
            int markerIndex = 0;
            for (int row = 0; row < rows && markerIndex < layout.count; row++)
            {
                for (int col = 0; col < cols && markerIndex < layout.count; col++)
                {
                    Vector2 position = new Vector2(
                        (col - (cols - 1) * 0.5f) * layout.dx_m,
                        layout.start_y_m + row * layout.dy_m
                    );
                    
                    SpawnMarkerAtPosition(position, markerIndex);
                    markerIndex++;
                }
            }
        }
        
        private void SpawnBaselinePattern(DrillLayout layout)
        {
            float startX = -(layout.count - 1) * layout.dx_m * 0.5f;
            
            for (int i = 0; i < layout.count; i++)
            {
                Vector2 position = new Vector2(startX + i * layout.dx_m, layout.start_y_m);
                SpawnMarkerAtPosition(position, i);
            }
        }
        
        private void SpawnPenaltyAreaPattern(DrillLayout layout)
        {
            // Spawn markers in penalty area formation
            Vector2[] positions = {
                new Vector2(-layout.dx_m, layout.start_y_m), // Left post
                new Vector2(layout.dx_m, layout.start_y_m),  // Right post
                new Vector2(0, layout.start_y_m + layout.dy_m), // Center
                new Vector2(-layout.dx_m * 0.5f, layout.start_y_m + layout.dy_m * 1.5f),
                new Vector2(layout.dx_m * 0.5f, layout.start_y_m + layout.dy_m * 1.5f),
                new Vector2(0, layout.start_y_m + layout.dy_m * 2f)
            };
            
            for (int i = 0; i < Mathf.Min(layout.count, positions.Length); i++)
            {
                SpawnMarkerAtPosition(positions[i], i);
            }
        }
        
        private void SpawnNetLinePattern(DrillLayout layout)
        {
            // Spawn markers along the net line
            float startX = -(layout.count - 1) * layout.dx_m * 0.5f;
            
            for (int i = 0; i < layout.count; i++)
            {
                Vector2 position = new Vector2(startX + i * layout.dx_m, 0); // Net is at y=0
                SpawnMarkerAtPosition(position, i);
            }
        }
        
        private void SpawnServiceCourtPattern(DrillLayout layout)
        {
            // Spawn markers in service court positions
            for (int i = 0; i < layout.count; i++)
            {
                float x = (i % 2 == 0) ? -layout.dx_m * 0.5f : layout.dx_m * 0.5f;
                float y = layout.start_y_m + (i / 2) * layout.dy_m;
                
                Vector2 position = new Vector2(x, y);
                SpawnMarkerAtPosition(position, i);
            }
        }
        
        private void SpawnTargetDistancePattern(DrillLayout layout)
        {
            // Spawn markers at increasing distances
            for (int i = 0; i < layout.count; i++)
            {
                Vector2 position = new Vector2(0, layout.start_y_m + i * layout.dy_m);
                SpawnMarkerAtPosition(position, i);
            }
        }
        
        private void SpawnLaneMarkersPattern(DrillLayout layout)
        {
            // Spawn markers in swimming lane pattern
            int lanesCount = layout.count;
            float totalWidth = (lanesCount - 1) * layout.dy_m;
            float startX = -totalWidth * 0.5f;
            
            for (int i = 0; i < lanesCount; i++)
            {
                Vector2 position = new Vector2(startX + i * layout.dy_m, layout.start_y_m);
                SpawnMarkerAtPosition(position, i);
            }
        }
        
        private void SpawnWicketLinePattern(DrillLayout layout)
        {
            // Spawn markers in cricket wicket positions
            for (int i = 0; i < layout.count; i++)
            {
                float y = layout.start_y_m + i * layout.dy_m;
                Vector2 position = new Vector2(0, y); // Center line
                SpawnMarkerAtPosition(position, i);
            }
        }
        
        private void SpawnTrackMarksPattern(DrillLayout layout)
        {
            // Spawn markers along track
            for (int i = 0; i < layout.count; i++)
            {
                Vector2 position = new Vector2(0, layout.start_y_m + i * layout.dy_m);
                SpawnMarkerAtPosition(position, i);
            }
        }
        
        private void SpawnRingCornersPattern(DrillLayout layout)
        {
            // Spawn markers in boxing ring corners
            Vector2[] corners = {
                new Vector2(-layout.dx_m, -layout.dy_m), // Bottom left
                new Vector2(layout.dx_m, -layout.dy_m),  // Bottom right
                new Vector2(layout.dx_m, layout.dy_m),   // Top right
                new Vector2(-layout.dx_m, layout.dy_m)   // Top left
            };
            
            for (int i = 0; i < Mathf.Min(layout.count, corners.Length); i++)
            {
                SpawnMarkerAtPosition(corners[i], i);
            }
        }
        
        private void SpawnDefaultPattern(DrillLayout layout)
        {
            SpawnGridPattern(layout); // Fall back to grid pattern
        }
        
        // === ROOM MODE DRILL PATTERNS ===
        
        private void SpawnDribbleBoxPattern(DrillLayout layout)
        {
            // Create a 2x2m dribble box with targets arranged around the perimeter and center
            float boxSize = 2.0f; // 2x2 meter box
            float halfBox = boxSize * 0.5f;
            
            List<Vector2> positions = new List<Vector2>();
            
            // Corner positions (4 corners)
            positions.Add(new Vector2(-halfBox, -halfBox)); // Bottom-left
            positions.Add(new Vector2(halfBox, -halfBox));  // Bottom-right
            positions.Add(new Vector2(halfBox, halfBox));   // Top-right
            positions.Add(new Vector2(-halfBox, halfBox));  // Top-left
            
            // Mid-edge positions (4 edges)
            positions.Add(new Vector2(0, -halfBox));        // Bottom center
            positions.Add(new Vector2(halfBox, 0));         // Right center
            positions.Add(new Vector2(0, halfBox));         // Top center
            positions.Add(new Vector2(-halfBox, 0));        // Left center
            
            // Center position
            positions.Add(new Vector2(0, 0));               // Center
            
            // Add additional positions if needed
            if (layout.count > positions.Count)
            {
                // Add diagonal positions for more targets
                float diagOffset = halfBox * 0.7f;
                positions.Add(new Vector2(-diagOffset, -diagOffset));
                positions.Add(new Vector2(diagOffset, -diagOffset));
                positions.Add(new Vector2(diagOffset, diagOffset));
                positions.Add(new Vector2(-diagOffset, diagOffset));
            }
            
            // Spawn markers up to the requested count
            for (int i = 0; i < Mathf.Min(layout.count, positions.Count); i++)
            {
                SpawnMarkerAtPosition(positions[i], i);
            }
            
            Debug.Log($"Spawned Dribble Box pattern: {Mathf.Min(layout.count, positions.Count)} markers in 2x2m box");
        }
        
        private void SpawnMicroLadderPattern(DrillLayout layout)
        {
            // Create a micro ladder with 6 rungs, 0.4m spacing, alternating L/R targets
            float rungSpacing = 0.4f;
            float laneWidth = 0.6f; // Distance between left and right targets
            int maxRungs = 6;
            int actualRungs = Mathf.Min(layout.count / 2, maxRungs);
            
            float startY = -((actualRungs - 1) * rungSpacing * 0.5f); // Center the ladder
            
            for (int rung = 0; rung < actualRungs; rung++)
            {
                float y = startY + rung * rungSpacing;
                
                // Left target
                if (rung * 2 < layout.count)
                {
                    SpawnMarkerAtPosition(new Vector2(-laneWidth * 0.5f, y), rung * 2);
                }
                
                // Right target
                if (rung * 2 + 1 < layout.count)
                {
                    SpawnMarkerAtPosition(new Vector2(laneWidth * 0.5f, y), rung * 2 + 1);
                }
            }
            
            Debug.Log($"Spawned Micro Ladder pattern: {actualRungs} rungs with {Mathf.Min(layout.count, actualRungs * 2)} targets");
        }
        
        private void SpawnFigure8Pattern(DrillLayout layout)
        {
            // Two anchor points for figure-8 dribbling, 1.0m apart
            float anchorDistance = 1.0f;
            float halfDistance = anchorDistance * 0.5f;
            
            List<Vector2> positions = new List<Vector2>();
            
            // Main anchor points
            positions.Add(new Vector2(-halfDistance, 0)); // Left anchor
            positions.Add(new Vector2(halfDistance, 0));  // Right anchor
            
            // Additional positions around the figure-8 path
            if (layout.count > 2)
            {
                float radius = 0.3f;
                
                // Left circle positions
                positions.Add(new Vector2(-halfDistance, radius));      // Left top
                positions.Add(new Vector2(-halfDistance, -radius));     // Left bottom
                
                // Right circle positions  
                positions.Add(new Vector2(halfDistance, radius));       // Right top
                positions.Add(new Vector2(halfDistance, -radius));      // Right bottom
                
                // Intersection positions
                positions.Add(new Vector2(0, radius * 0.5f));           // Center top
                positions.Add(new Vector2(0, -radius * 0.5f));          // Center bottom
            }
            
            // Spawn markers up to requested count
            for (int i = 0; i < Mathf.Min(layout.count, positions.Count); i++)
            {
                SpawnMarkerAtPosition(positions[i], i);
            }
            
            Debug.Log($"Spawned Figure-8 pattern: {Mathf.Min(layout.count, positions.Count)} markers around dual anchors");
        }
        
        private void SpawnWallReboundPattern(DrillLayout layout)
        {
            // Wall rebound drill - floor targets that work with wall at specific distance
            float wallDistance = 1.5f; // Assumed wall distance
            float targetSpread = 1.0f;  // Spread of floor targets
            
            List<Vector2> positions = new List<Vector2>();
            
            // Floor targets at various distances from wall
            float[] distances = { 0.5f, 0.8f, 1.1f, 1.4f };
            float[] spreads = { -0.3f, 0.0f, 0.3f };
            
            foreach (float distance in distances)
            {
                foreach (float spread in spreads)
                {
                    if (positions.Count < layout.count)
                    {
                        positions.Add(new Vector2(spread, -distance)); // Negative Y = towards wall
                    }
                }
            }
            
            // Add center targets if more are needed
            while (positions.Count < layout.count)
            {
                float randomX = UnityEngine.Random.Range(-0.4f, 0.4f);
                float randomY = UnityEngine.Random.Range(-1.6f, -0.3f);
                positions.Add(new Vector2(randomX, randomY));
            }
            
            // Spawn markers
            for (int i = 0; i < Mathf.Min(layout.count, positions.Count); i++)
            {
                SpawnMarkerAtPosition(positions[i], i);
            }
            
            Debug.Log($"Spawned Wall Rebound pattern: {Mathf.Min(layout.count, positions.Count)} floor targets for wall drill");
        }
        
        private void SpawnSeatedControlPattern(DrillLayout layout)
        {
            // Seated tight control drill - small area around sitting position
            float controlRadius = 0.8f; // 1.6m diameter control area
            int rings = 2; // Two rings of targets
            
            List<Vector2> positions = new List<Vector2>();
            
            // Center position
            positions.Add(Vector2.zero);
            
            // Inner ring (closer to seated position)
            float innerRadius = controlRadius * 0.4f;
            int innerCount = 4;
            for (int i = 0; i < innerCount; i++)
            {
                float angle = (i * 2 * Mathf.PI) / innerCount;
                float x = innerRadius * Mathf.Cos(angle);
                float y = innerRadius * Mathf.Sin(angle);
                positions.Add(new Vector2(x, y));
            }
            
            // Outer ring (edge of control area)
            float outerRadius = controlRadius * 0.8f;
            int outerCount = 6;
            for (int i = 0; i < outerCount; i++)
            {
                float angle = (i * 2 * Mathf.PI) / outerCount;
                float x = outerRadius * Mathf.Cos(angle);
                float y = outerRadius * Mathf.Sin(angle);
                positions.Add(new Vector2(x, y));
            }
            
            // Shuffle positions for varied training
            for (int i = 1; i < positions.Count; i++) // Skip center position
            {
                Vector2 temp = positions[i];
                int randomIndex = UnityEngine.Random.Range(1, positions.Count);
                positions[i] = positions[randomIndex];
                positions[randomIndex] = temp;
            }
            
            // Spawn markers
            for (int i = 0; i < Mathf.Min(layout.count, positions.Count); i++)
            {
                SpawnMarkerAtPosition(positions[i], i);
            }
            
            Debug.Log($"Spawned Seated Control pattern: {Mathf.Min(layout.count, positions.Count)} targets in {controlRadius * 2}m diameter");
        }
        
        private void SpawnMarkerAtPosition(Vector2 courtPosition, int index)
        {
            Vector3 worldPosition = Vector3.zero;
            
            if (calibrationController != null && calibrationController.IsCalibrated)
            {
                worldPosition = calibrationController.CourtToWorldCoordinates(courtPosition);
                worldPosition.y = markerHeight;
            }
            else
            {
                worldPosition = new Vector3(courtPosition.x, markerHeight, courtPosition.y);
            }
            
            GameObject markerObj = CreateMarkerObject(worldPosition, index);
            DrillMarker marker = markerObj.GetComponent<DrillMarker>();
            
            if (marker == null)
            {
                marker = markerObj.AddComponent<DrillMarker>();
            }
            
            marker.Initialize(index, courtPosition, GetToleranceRadius());
            SpawnedMarkers.Add(marker);
        }
        
        private GameObject CreateMarkerObject(Vector3 position, int index)
        {
            GameObject marker;
            
            if (markerPrefab != null)
            {
                marker = Instantiate(markerPrefab, position, Quaternion.identity);
            }
            else
            {
                // Create default marker
                marker = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                marker.transform.position = position;
                marker.transform.localScale = new Vector3(0.3f, 0.05f, 0.3f);
                
                // Remove collider
                Collider collider = marker.GetComponent<Collider>();
                if (collider != null) Destroy(collider);
            }
            
            marker.name = $"DrillMarker_{index:D2}";
            marker.transform.SetParent(transform);
            
            return marker;
        }
        
        private float GetToleranceRadius()
        {
            if (currentDrillConfig == null) return 0.15f;
            
            DrillConfigLoader loader = FindObjectOfType<DrillConfigLoader>();
            if (loader != null)
            {
                return loader.GetToleranceForDifficulty(currentDrillConfig, currentDrillConfig.difficulty);
            }
            
            return 0.15f;
        }
        
        private void SetActiveTarget(int index)
        {
            // Update all marker states
            for (int i = 0; i < SpawnedMarkers.Count; i++)
            {
                DrillMarker marker = SpawnedMarkers[i];
                
                if (i < index)
                {
                    marker.SetState(DrillMarkerState.Completed);
                }
                else if (i == index)
                {
                    marker.SetState(DrillMarkerState.Active);
                }
                else
                {
                    marker.SetState(DrillMarkerState.Inactive);
                }
            }
            
            OnActiveTargetChanged?.Invoke(index);
        }
        
        public void AdvanceTargetOnHit()
        {
            if (ActiveTargetIndex < SpawnedMarkers.Count)
            {
                SpawnedMarkers[ActiveTargetIndex].SetState(DrillMarkerState.Completed);
                OnTargetCompleted?.Invoke(ActiveTargetIndex);
                
                ActiveTargetIndex++;
                
                if (ActiveTargetIndex >= SpawnedMarkers.Count)
                {
                    OnAllTargetsCompleted?.Invoke();
                }
                else
                {
                    SetActiveTarget(ActiveTargetIndex);
                }
            }
        }
        
        public void MarkTargetMissed()
        {
            if (ActiveTargetIndex < SpawnedMarkers.Count)
            {
                SpawnedMarkers[ActiveTargetIndex].SetState(DrillMarkerState.Missed);
                // Don't advance on miss - let them try again
            }
        }
        
        public DrillMarker GetActiveTarget()
        {
            return ActiveTarget;
        }
        
        public Vector2 GetActiveTargetPosition()
        {
            DrillMarker activeMarker = GetActiveTarget();
            return activeMarker != null ? activeMarker.CourtPosition : Vector2.zero;
        }
        
        public void ResetDrill()
        {
            ActiveTargetIndex = 0;
            if (SpawnedMarkers.Count > 0)
            {
                SetActiveTarget(0);
            }
        }
        
        private void ClearExistingMarkers()
        {
            foreach (DrillMarker marker in SpawnedMarkers)
            {
                if (marker != null && marker.gameObject != null)
                {
                    Destroy(marker.gameObject);
                }
            }
            SpawnedMarkers.Clear();
        }
        
        private void OnDestroy()
        {
            ClearExistingMarkers();
        }
    }
    
    public enum DrillMarkerState
    {
        Inactive,
        Active,
        Completed,
        Missed
    }
    
    public class DrillMarker : MonoBehaviour
    {
        public int Index { get; private set; }
        public Vector2 CourtPosition { get; private set; }
        public float ToleranceRadius { get; private set; }
        public DrillMarkerState State { get; private set; }
        
        private Renderer markerRenderer;
        private float pulseTimer;
        private Color baseColor;
        
        // Colors from MarkerSpawner
        private static readonly Color InactiveColor = Color.gray;
        private static readonly Color ActiveColor = Color.green;
        private static readonly Color CompletedColor = Color.blue;
        private static readonly Color MissedColor = Color.red;
        
        private void Awake()
        {
            markerRenderer = GetComponent<Renderer>();
            if (markerRenderer == null)
            {
                markerRenderer = GetComponentInChildren<Renderer>();
            }
        }
        
        public void Initialize(int index, Vector2 courtPosition, float toleranceRadius)
        {
            Index = index;
            CourtPosition = courtPosition;
            ToleranceRadius = toleranceRadius;
            SetState(DrillMarkerState.Inactive);
        }
        
        public void SetState(DrillMarkerState newState)
        {
            State = newState;
            
            switch (newState)
            {
                case DrillMarkerState.Inactive:
                    baseColor = InactiveColor;
                    break;
                case DrillMarkerState.Active:
                    baseColor = ActiveColor;
                    break;
                case DrillMarkerState.Completed:
                    baseColor = CompletedColor;
                    break;
                case DrillMarkerState.Missed:
                    baseColor = MissedColor;
                    break;
            }
            
            UpdateVisual();
        }
        
        private void Update()
        {
            if (State == DrillMarkerState.Active)
            {
                // Pulse animation
                pulseTimer += Time.deltaTime * 2f;
                float pulseValue = (Mathf.Sin(pulseTimer) + 1f) * 0.5f;
                Color pulseColor = Color.Lerp(baseColor, Color.white, pulseValue * 0.3f);
                
                if (markerRenderer != null)
                {
                    markerRenderer.material.color = pulseColor;
                }
            }
        }
        
        private void UpdateVisual()
        {
            if (markerRenderer != null)
            {
                markerRenderer.material.color = baseColor;
            }
        }
        
        public bool IsWithinTolerance(Vector2 position)
        {
            float distance = Vector2.Distance(position, CourtPosition);
            return distance <= ToleranceRadius;
        }
        
        public float GetErrorDistance(Vector2 position)
        {
            return Vector2.Distance(position, CourtPosition);
        }
    }
}