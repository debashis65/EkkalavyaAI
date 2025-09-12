using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

namespace EkkalavyaAR.AR
{
    public enum SpaceMode
    {
        VenueMode,
        RoomMode
    }
    
    public class PlaneScanController : MonoBehaviour
    {
        [Header("Plane Visualization")]
        [SerializeField] private Material planeMaterial;
        [SerializeField] private Color scanningColor = Color.green;
        [SerializeField] private Color selectedColor = Color.blue;
        [SerializeField] private Color roomModeColor = Color.yellow;
        [SerializeField] private float gridSize = 0.5f;
        [SerializeField] private float minPlaneSize = 6f; // Minimum plane size in square meters
        
        [Header("Room Mode Detection")]
        [SerializeField] private float roomModeThreshold = 9f; // 3x3 meters threshold for room mode
        [SerializeField] private float minRoomSize = 2.25f; // Minimum 1.5x1.5 meters for micro mode
        [SerializeField] private float flatnessThreshold = 0.01f; // 10mm flatness variance threshold
        [SerializeField] private float safetyEnvelopeMargin = 0.3f; // 30cm safety margin from walls
        [SerializeField] private int flatnessSampleCount = 25; // 5x5 grid for flatness checking
        
        [Header("Ceiling and Wall Detection")]
        [SerializeField] private float minCeilingHeight = 2.2f; // Minimum safe ceiling height
        [SerializeField] private float maxReachHeight = 2.5f; // Maximum player reach height
        [SerializeField] private float wallProximityThreshold = 1.0f; // Distance to start warning about walls
        [SerializeField] private bool enableVerticalPlaneDetection = true;
        
        [Header("UI")]
        [SerializeField] private GameObject scanInstructions;
        [SerializeField] private GameObject useAreaButton;
        [SerializeField] private GameObject roomModeUI;
        [SerializeField] private GameObject roomModeInstructions;
        
        // Events
        public event Action<ARPlane> OnPlaneSelected;
        public event Action<Bounds> OnUsableBoundsCalculated;
        public event Action<SpaceMode> OnSpaceModeChanged;
        public event Action<Vector2, bool> OnRoomConstraintsDetected; // size, isFlat
        public event Action<float> OnCeilingHeightDetected; // ceiling height
        public event Action<List<ARPlane>> OnWallsDetected; // detected wall planes
        public event Action<bool> OnSafeHeightStatus; // safe for overhead movement
        
        // Properties
        public ARPlane SelectedPlane { get; private set; }
        public Bounds UsableBounds { get; private set; }
        public Vector2 ConvexHullBounds { get; private set; }
        public bool IsPlaneLocked { get; private set; }
        public SpaceMode CurrentSpaceMode { get; private set; } = SpaceMode.VenueMode;
        public bool IsRoomModeActive => CurrentSpaceMode == SpaceMode.RoomMode;
        public float FlatenessVariance { get; private set; }
        public List<Vector2> NoGoZones { get; private set; } = new List<Vector2>();
        public float CeilingHeight { get; private set; } = float.MaxValue;
        public List<ARPlane> DetectedWalls { get; private set; } = new List<ARPlane>();
        public bool IsSafeForOverheadMovement => CeilingHeight > maxReachHeight;
        
        private ARBootstrap arBootstrap;
        private ARPlaneManager planeManager;
        private Dictionary<TrackableId, GameObject> planeVisualizations = new Dictionary<TrackableId, GameObject>();
        private List<ARPlane> detectedPlanes = new List<ARPlane>();
        
        private void Start()
        {
            arBootstrap = ARBootstrap.Instance;
            if (arBootstrap == null)
            {
                Debug.LogError("ARBootstrap instance not found!");
                return;
            }
            
            arBootstrap.OnARSessionReady += OnARReady;
        }
        
        private void OnDestroy()
        {
            if (arBootstrap != null)
            {
                arBootstrap.OnARSessionReady -= OnARReady;
            }
            
            if (planeManager != null)
            {
                planeManager.planesChanged -= OnPlanesChanged;
            }
        }
        
        private void OnARReady()
        {
            planeManager = arBootstrap.PlaneManager;
            if (planeManager != null)
            {
                planeManager.planesChanged += OnPlanesChanged;
                
                // Enable both horizontal and vertical plane detection for room mode
                if (enableVerticalPlaneDetection)
                {
                    planeManager.requestedDetectionMode = PlaneDetectionMode.Horizontal | PlaneDetectionMode.Vertical;
                }
                else
                {
                    planeManager.requestedDetectionMode = PlaneDetectionMode.Horizontal;
                }
                
                // Show scanning instructions
                scanInstructions?.SetActive(true);
                useAreaButton?.SetActive(false);
            }
        }
        
        private void OnPlanesChanged(ARPlanesChangedEventArgs args)
        {
            // Handle new planes
            foreach (var plane in args.added)
            {
                if (plane.alignment == PlaneAlignment.HorizontalUp || plane.alignment == PlaneAlignment.HorizontalDown)
                {
                    if (IsPlaneUsable(plane))
                    {
                        detectedPlanes.Add(plane);
                        CreatePlaneVisualization(plane);
                    }
                }
                else if (plane.alignment == PlaneAlignment.Vertical)
                {
                    // Handle vertical planes (walls/ceiling)
                    HandleVerticalPlane(plane, true);
                }
            }
            
            // Handle updated planes
            foreach (var plane in args.updated)
            {
                if (plane.alignment == PlaneAlignment.HorizontalUp || plane.alignment == PlaneAlignment.HorizontalDown)
                {
                    if (IsPlaneUsable(plane))
                    {
                        if (!detectedPlanes.Contains(plane))
                        {
                            detectedPlanes.Add(plane);
                            CreatePlaneVisualization(plane);
                        }
                        else
                        {
                            UpdatePlaneVisualization(plane);
                        }
                    }
                    else
                    {
                        // Remove plane if it's no longer usable
                        if (detectedPlanes.Contains(plane))
                        {
                            detectedPlanes.Remove(plane);
                            RemovePlaneVisualization(plane);
                        }
                    }
                }
                else if (plane.alignment == PlaneAlignment.Vertical)
                {
                    HandleVerticalPlane(plane, false);
                }
            }
            
            // Handle removed planes
            foreach (var plane in args.removed)
            {
                detectedPlanes.Remove(plane);
                DetectedWalls.Remove(plane);
                RemovePlaneVisualization(plane);
            }
            
            // Update ceiling and wall detection
            if (CurrentSpaceMode == SpaceMode.RoomMode)
            {
                UpdateCeilingDetection();
                UpdateWallProximityWarnings();
            }
            
            // Show appropriate button based on mode and plane suitability
            bool hasSuitablePlanes;
            if (CurrentSpaceMode == SpaceMode.RoomMode)
            {
                hasSuitablePlanes = detectedPlanes.Any(p => CalculatePlaneArea(p) >= minRoomSize && IsPlaneFlat(p));
            }
            else
            {
                hasSuitablePlanes = detectedPlanes.Any(p => CalculatePlaneArea(p) >= minPlaneSize);
            }
            useAreaButton?.SetActive(hasSuitablePlanes && !IsPlaneLocked);
        }
        
        private bool IsPlaneUsable(ARPlane plane)
        {
            // Check if plane is horizontal
            if (plane.alignment != PlaneAlignment.HorizontalUp && 
                plane.alignment != PlaneAlignment.HorizontalDown)
            {
                return false;
            }
            
            // Calculate plane dimensions and area
            float area = CalculatePlaneArea(plane);
            Vector2 dimensions = GetPlaneDimensions(plane);
            float minDimension = Mathf.Min(dimensions.x, dimensions.y);
            
            // Determine and apply space mode
            SpaceMode detectedMode = DetermineSpaceMode(area, minDimension);
            if (detectedMode != CurrentSpaceMode)
            {
                SwitchSpaceMode(detectedMode, dimensions);
            }
            
            // Check usability based on current mode
            if (CurrentSpaceMode == SpaceMode.RoomMode)
            {
                return area >= minRoomSize && IsPlaneFlat(plane);
            }
            else
            {
                return area >= minPlaneSize;
            }
        }
        
        private SpaceMode DetermineSpaceMode(float area, float minDimension)
        {
            // Switch to room mode if area is below threshold OR smallest dimension is < 3m
            if (area < roomModeThreshold || minDimension < 3.0f)
            {
                return SpaceMode.RoomMode;
            }
            return SpaceMode.VenueMode;
        }
        
        private void SwitchSpaceMode(SpaceMode newMode, Vector2 planeDimensions)
        {
            if (newMode == CurrentSpaceMode) return;
            
            CurrentSpaceMode = newMode;
            
            // Update UI based on mode
            if (newMode == SpaceMode.RoomMode)
            {
                scanInstructions?.SetActive(false);
                roomModeInstructions?.SetActive(true);
                roomModeUI?.SetActive(true);
                
                // Check flatness for room constraints
                bool isFlat = FlatenessVariance <= flatnessThreshold;
                OnRoomConstraintsDetected?.Invoke(planeDimensions, isFlat);
                
                Debug.Log($"Switched to Room Mode - Space: {planeDimensions.x:F1}m x {planeDimensions.y:F1}m, Flat: {isFlat}");
            }
            else
            {
                scanInstructions?.SetActive(true);
                roomModeInstructions?.SetActive(false);
                roomModeUI?.SetActive(false);
                
                Debug.Log("Switched to Venue Mode - Full court space detected");
            }
            
            OnSpaceModeChanged?.Invoke(newMode);
        }
        
        private Vector2 GetPlaneDimensions(ARPlane plane)
        {
            if (plane.boundary.Count < 3) return Vector2.zero;
            
            Vector2 min = plane.boundary[0];
            Vector2 max = plane.boundary[0];
            
            foreach (Vector2 point in plane.boundary)
            {
                if (point.x < min.x) min.x = point.x;
                if (point.y < min.y) min.y = point.y;
                if (point.x > max.x) max.x = point.x;
                if (point.y > max.y) max.y = point.y;
            }
            
            return new Vector2(max.x - min.x, max.y - min.y);
        }
        
        private bool IsPlaneFlat(ARPlane plane)
        {
            FlatenessVariance = CalculateFlatnessVariance(plane);
            return FlatenessVariance <= flatnessThreshold;
        }
        
        private float CalculateFlatnessVariance(ARPlane plane)
        {
            if (plane.boundary.Count < 3) return float.MaxValue;
            
            // Get plane bounds for sampling
            Vector2 planeDimensions = GetPlaneDimensions(plane);
            Vector2 min = Vector2.zero;
            Vector2 max = planeDimensions;
            
            List<float> heightSamples = new List<float>();
            int samplesPerDimension = Mathf.CeilToInt(Mathf.Sqrt(flatnessSampleCount));
            
            // Sample heights across the plane in a grid pattern
            for (int y = 0; y < samplesPerDimension; y++)
            {
                for (int x = 0; x < samplesPerDimension; x++)
                {
                    float normalizedX = (float)x / (samplesPerDimension - 1);
                    float normalizedY = (float)y / (samplesPerDimension - 1);
                    
                    Vector2 samplePos = Vector2.Lerp(min, max, new Vector2(normalizedX, normalizedY));
                    
                    if (IsPointInPolygon(samplePos, plane.boundary))
                    {
                        // Transform to world space and get Y coordinate
                        Vector3 worldPos = plane.transform.TransformPoint(new Vector3(samplePos.x, 0, samplePos.y));
                        heightSamples.Add(worldPos.y);
                    }
                }
            }
            
            // Calculate variance
            if (heightSamples.Count < 3) return 0f;
            
            float mean = heightSamples.Average();
            float variance = heightSamples.Select(h => (h - mean) * (h - mean)).Average();
            
            return Mathf.Sqrt(variance); // Return standard deviation
        }
        
        private float CalculatePlaneArea(ARPlane plane)
        {
            if (plane.boundary.Count < 3) return 0f;
            
            // Calculate area using shoelace formula
            float area = 0f;
            int vertexCount = plane.boundary.Count;
            
            for (int i = 0; i < vertexCount; i++)
            {
                Vector2 current = plane.boundary[i];
                Vector2 next = plane.boundary[(i + 1) % vertexCount];
                area += current.x * next.y - next.x * current.y;
            }
            
            return Mathf.Abs(area) * 0.5f;
        }
        
        private void CreatePlaneVisualization(ARPlane plane)
        {
            GameObject visualization = CreatePlaneVisualizationObject(plane);
            planeVisualizations[plane.trackableId] = visualization;
        }
        
        private void UpdatePlaneVisualization(ARPlane plane)
        {
            if (planeVisualizations.TryGetValue(plane.trackableId, out GameObject visualization))
            {
                UpdatePlaneVisualizationMesh(visualization, plane);
            }
        }
        
        private void RemovePlaneVisualization(ARPlane plane)
        {
            if (planeVisualizations.TryGetValue(plane.trackableId, out GameObject visualization))
            {
                Destroy(visualization);
                planeVisualizations.Remove(plane.trackableId);
            }
        }
        
        private GameObject CreatePlaneVisualizationObject(ARPlane plane)
        {
            GameObject planeObj = new GameObject($"PlaneVisualization_{plane.trackableId}");
            planeObj.transform.SetParent(plane.transform);
            planeObj.transform.localPosition = Vector3.zero;
            planeObj.transform.localRotation = Quaternion.identity;
            
            // Add mesh components
            MeshFilter meshFilter = planeObj.AddComponent<MeshFilter>();
            MeshRenderer meshRenderer = planeObj.AddComponent<MeshRenderer>();
            
            // Set material with appropriate color for mode
            if (planeMaterial != null)
            {
                meshRenderer.material = planeMaterial;
                meshRenderer.material.color = CurrentSpaceMode == SpaceMode.RoomMode ? roomModeColor : scanningColor;
            }
            
            // Generate mesh
            UpdatePlaneVisualizationMesh(planeObj, plane);
            
            return planeObj;
        }
        
        private void UpdatePlaneVisualizationMesh(GameObject visualization, ARPlane plane)
        {
            MeshFilter meshFilter = visualization.GetComponent<MeshFilter>();
            if (meshFilter == null) return;
            
            Mesh mesh = new Mesh();
            
            // Generate grid mesh for the plane boundary
            GenerateGridMesh(plane.boundary, mesh);
            
            meshFilter.mesh = mesh;
        }
        
        private void GenerateGridMesh(List<Vector2> boundary, Mesh mesh)
        {
            if (boundary.Count < 3) return;
            
            // Get bounds of the boundary
            Vector2 min = boundary[0];
            Vector2 max = boundary[0];
            
            foreach (Vector2 point in boundary)
            {
                if (point.x < min.x) min.x = point.x;
                if (point.y < min.y) min.y = point.y;
                if (point.x > max.x) max.x = point.x;
                if (point.y > max.y) max.y = point.y;
            }
            
            // Generate grid points
            List<Vector3> vertices = new List<Vector3>();
            List<int> triangles = new List<int>();
            List<Vector2> uvs = new List<Vector2>();
            
            float width = max.x - min.x;
            float height = max.y - min.y;
            
            int gridX = Mathf.CeilToInt(width / gridSize);
            int gridY = Mathf.CeilToInt(height / gridSize);
            
            // Generate vertices
            for (int y = 0; y <= gridY; y++)
            {
                for (int x = 0; x <= gridX; x++)
                {
                    float posX = min.x + (width * x / gridX);
                    float posY = min.y + (height * y / gridY);
                    
                    if (IsPointInPolygon(new Vector2(posX, posY), boundary))
                    {
                        vertices.Add(new Vector3(posX, 0, posY));
                        uvs.Add(new Vector2((float)x / gridX, (float)y / gridY));
                    }
                }
            }
            
            // Generate triangles (simplified for demonstration)
            // In a full implementation, you would use proper triangulation
            if (vertices.Count >= 3)
            {
                for (int i = 0; i < vertices.Count - 2; i++)
                {
                    triangles.Add(0);
                    triangles.Add(i + 1);
                    triangles.Add(i + 2);
                }
            }
            
            mesh.vertices = vertices.ToArray();
            mesh.triangles = triangles.ToArray();
            mesh.uv = uvs.ToArray();
            mesh.RecalculateNormals();
        }
        
        private bool IsPointInPolygon(Vector2 point, List<Vector2> polygon)
        {
            bool isInside = false;
            int j = polygon.Count - 1;
            
            for (int i = 0; i < polygon.Count; i++)
            {
                Vector2 pi = polygon[i];
                Vector2 pj = polygon[j];
                
                if (((pi.y > point.y) != (pj.y > point.y)) &&
                    (point.x < (pj.x - pi.x) * (point.y - pi.y) / (pj.y - pi.y) + pi.x))
                {
                    isInside = !isInside;
                }
                
                j = i;
            }
            
            return isInside;
        }
        
        public void SelectLargestPlane()
        {
            if (IsPlaneLocked) return;
            
            ARPlane largestPlane = null;
            float largestArea = 0f;
            
            foreach (ARPlane plane in detectedPlanes)
            {
                float area = CalculatePlaneArea(plane);
                if (area > largestArea)
                {
                    largestArea = area;
                    largestPlane = plane;
                }
            }
            
            if (largestPlane != null)
            {
                SelectPlane(largestPlane);
            }
        }
        
        private void SelectPlane(ARPlane plane)
        {
            SelectedPlane = plane;
            IsPlaneLocked = true;
            
            // Hide other planes
            foreach (var kvp in planeVisualizations)
            {
                if (kvp.Key != plane.trackableId)
                {
                    kvp.Value.SetActive(false);
                }
                else
                {
                    // Highlight selected plane
                    MeshRenderer renderer = kvp.Value.GetComponent<MeshRenderer>();
                    if (renderer != null && renderer.material != null)
                    {
                        renderer.material.color = selectedColor;
                    }
                }
            }
            
            // Disable plane detection
            if (planeManager != null)
            {
                planeManager.requestedDetectionMode = PlaneDetectionMode.None;
            }
            
            // Calculate usable bounds
            CalculateUsableBounds(plane);
            
            // Calculate safety envelope for room mode
            if (CurrentSpaceMode == SpaceMode.RoomMode)
            {
                CalculateSafetyEnvelope(plane);
            }
            
            // Hide UI
            scanInstructions?.SetActive(false);
            roomModeInstructions?.SetActive(false);
            useAreaButton?.SetActive(false);
            roomModeUI?.SetActive(false);
            
            OnPlaneSelected?.Invoke(plane);
        }
        
        private void CalculateUsableBounds(ARPlane plane)
        {
            if (plane.boundary.Count < 3) return;
            
            // Calculate convex hull
            List<Vector2> convexHull = CalculateConvexHull(plane.boundary);
            
            // Get bounds
            Vector2 min = convexHull[0];
            Vector2 max = convexHull[0];
            
            foreach (Vector2 point in convexHull)
            {
                if (point.x < min.x) min.x = point.x;
                if (point.y < min.y) min.y = point.y;
                if (point.x > max.x) max.x = point.x;
                if (point.y > max.y) max.y = point.y;
            }
            
            ConvexHullBounds = max - min;
            
            // Create 3D bounds in world space
            Vector3 center3D = plane.transform.TransformPoint(new Vector3((min.x + max.x) * 0.5f, 0, (min.y + max.y) * 0.5f));
            Vector3 size3D = new Vector3(ConvexHullBounds.x, 0.1f, ConvexHullBounds.y);
            
            UsableBounds = new Bounds(center3D, size3D);
            
            OnUsableBoundsCalculated?.Invoke(UsableBounds);
            
            Debug.Log($"Usable area calculated: {ConvexHullBounds.x:F1}m x {ConvexHullBounds.y:F1}m");
        }
        
        private List<Vector2> CalculateConvexHull(List<Vector2> points)
        {
            // Graham scan algorithm for convex hull
            if (points.Count < 3) return points.ToList();
            
            List<Vector2> sortedPoints = points.OrderBy(p => p.x).ThenBy(p => p.y).ToList();
            List<Vector2> hull = new List<Vector2>();
            
            // Build lower hull
            for (int i = 0; i < sortedPoints.Count; i++)
            {
                while (hull.Count >= 2 && CrossProduct(hull[hull.Count - 2], hull[hull.Count - 1], sortedPoints[i]) <= 0)
                {
                    hull.RemoveAt(hull.Count - 1);
                }
                hull.Add(sortedPoints[i]);
            }
            
            // Build upper hull
            int lowerCount = hull.Count;
            for (int i = sortedPoints.Count - 2; i >= 0; i--)
            {
                while (hull.Count > lowerCount && CrossProduct(hull[hull.Count - 2], hull[hull.Count - 1], sortedPoints[i]) <= 0)
                {
                    hull.RemoveAt(hull.Count - 1);
                }
                hull.Add(sortedPoints[i]);
            }
            
            // Remove last point as it's same as first
            if (hull.Count > 0)
                hull.RemoveAt(hull.Count - 1);
            
            return hull;
        }
        
        private float CrossProduct(Vector2 a, Vector2 b, Vector2 c)
        {
            return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
        }
        
        public void OnUseAreaButtonPressed()
        {
            SelectLargestPlane();
        }
        
        public void ResetPlaneSelection()
        {
            IsPlaneLocked = false;
            SelectedPlane = null;
            NoGoZones.Clear();
            
            // Show all plane visualizations again with appropriate colors
            foreach (var visualization in planeVisualizations.Values)
            {
                visualization.SetActive(true);
                MeshRenderer renderer = visualization.GetComponent<MeshRenderer>();
                if (renderer != null && renderer.material != null)
                {
                    renderer.material.color = CurrentSpaceMode == SpaceMode.RoomMode ? roomModeColor : scanningColor;
                }
            }
            
            // Re-enable plane detection
            if (planeManager != null)
            {
                planeManager.requestedDetectionMode = PlaneDetectionMode.Horizontal;
            }
            
            // Show appropriate UI
            if (CurrentSpaceMode == SpaceMode.RoomMode)
            {
                roomModeInstructions?.SetActive(true);
                useAreaButton?.SetActive(detectedPlanes.Any(p => CalculatePlaneArea(p) >= minRoomSize && IsPlaneFlat(p)));
            }
            else
            {
                scanInstructions?.SetActive(true);
                useAreaButton?.SetActive(detectedPlanes.Any(p => CalculatePlaneArea(p) >= minPlaneSize));
            }
        }
        
        public void ForceSpaceMode(SpaceMode mode)
        {
            if (mode != CurrentSpaceMode)
            {
                CurrentSpaceMode = mode;
                OnSpaceModeChanged?.Invoke(mode);
                
                // Update UI
                if (mode == SpaceMode.RoomMode)
                {
                    scanInstructions?.SetActive(false);
                    roomModeInstructions?.SetActive(true);
                    roomModeUI?.SetActive(true);
                }
                else
                {
                    scanInstructions?.SetActive(true);
                    roomModeInstructions?.SetActive(false);
                    roomModeUI?.SetActive(false);
                }
                
                // Update plane visualizations
                UpdatePlaneColorsForMode();
            }
        }
        
        private void UpdatePlaneColorsForMode()
        {
            Color targetColor = CurrentSpaceMode == SpaceMode.RoomMode ? roomModeColor : scanningColor;
            
            foreach (var visualization in planeVisualizations.Values)
            {
                MeshRenderer renderer = visualization.GetComponent<MeshRenderer>();
                if (renderer != null && renderer.material != null)
                {
                    renderer.material.color = targetColor;
                }
            }
        }
        
        private void CalculateSafetyEnvelope(ARPlane plane)
        {
            NoGoZones.Clear();
            
            if (plane.boundary.Count < 3) return;
            
            Vector2 dimensions = GetPlaneDimensions(plane);
            Vector2 center = Vector2.zero;
            
            // Calculate center of the plane
            foreach (Vector2 point in plane.boundary)
            {
                center += point;
            }
            center /= plane.boundary.Count;
            
            // Create safety envelope by shrinking the usable area
            float safeWidth = Mathf.Max(1.0f, dimensions.x - (safetyEnvelopeMargin * 2));
            float safeHeight = Mathf.Max(1.0f, dimensions.y - (safetyEnvelopeMargin * 2));
            
            // Mark areas outside safety envelope as no-go zones
            List<Vector2> boundaryPoints = new List<Vector2>();
            for (int i = 0; i < plane.boundary.Count; i++)
            {
                Vector2 point = plane.boundary[i];
                Vector2 directionToCenter = (center - point).normalized;
                Vector2 safePoint = point + directionToCenter * safetyEnvelopeMargin;
                
                // Check if safe point is still reasonably within the plane
                if (IsPointInPolygon(safePoint, plane.boundary))
                {
                    boundaryPoints.Add(safePoint);
                }
                else
                {
                    // If we can't maintain safe margin, mark original point as no-go
                    NoGoZones.Add(point);
                }
            }
            
            Debug.Log($"Safety envelope calculated - Safe area: {safeWidth:F1}m x {safeHeight:F1}m, No-go zones: {NoGoZones.Count}");
        }
        
        public bool IsPointInSafeZone(Vector2 point)
        {
            if (SelectedPlane == null) return false;
            
            // Check if point is within the selected plane boundaries
            if (!IsPointInPolygon(point, SelectedPlane.boundary)) return false;
            
            // Check if point is not in any no-go zone
            foreach (Vector2 noGoZone in NoGoZones)
            {
                if (Vector2.Distance(point, noGoZone) < safetyEnvelopeMargin)
                {
                    return false;
                }
            }
            
            return true;
        }
        
        public Vector2 GetSafeAreaDimensions()
        {
            if (SelectedPlane == null) return Vector2.zero;
            
            Vector2 planeDimensions = GetPlaneDimensions(SelectedPlane);
            return new Vector2(
                Mathf.Max(1.0f, planeDimensions.x - (safetyEnvelopeMargin * 2)),
                Mathf.Max(1.0f, planeDimensions.y - (safetyEnvelopeMargin * 2))
            );
        }
        
        private void HandleVerticalPlane(ARPlane plane, bool isNewPlane)
        {
            // Determine if this is a wall or ceiling based on its position and orientation
            Vector3 planePosition = plane.transform.position;
            Vector3 planeNormal = plane.transform.up;
            
            // Check if this is likely a ceiling (horizontal plane above ground level)
            bool isPotentialCeiling = Mathf.Abs(Vector3.Dot(planeNormal, Vector3.down)) > 0.8f && planePosition.y > 1.5f;
            
            if (isPotentialCeiling)
            {
                // Handle ceiling detection
                float estimatedCeilingHeight = planePosition.y;
                if (estimatedCeilingHeight < CeilingHeight)
                {
                    CeilingHeight = estimatedCeilingHeight;
                    OnCeilingHeightDetected?.Invoke(CeilingHeight);
                    OnSafeHeightStatus?.Invoke(IsSafeForOverheadMovement);
                    
                    Debug.Log($"Ceiling detected at height: {CeilingHeight:F2}m - Safe for overhead: {IsSafeForOverheadMovement}");
                }
            }
            else
            {
                // Handle wall detection
                if (isNewPlane && !DetectedWalls.Contains(plane))
                {
                    DetectedWalls.Add(plane);
                    Debug.Log($"Wall detected - Total walls: {DetectedWalls.Count}");
                }
                else if (!isNewPlane && DetectedWalls.Contains(plane))
                {
                    // Update existing wall plane
                    int wallIndex = DetectedWalls.IndexOf(plane);
                    if (wallIndex >= 0)
                    {
                        DetectedWalls[wallIndex] = plane;
                    }
                }
            }
            
            // Trigger wall detection event
            if (DetectedWalls.Count > 0)
            {
                OnWallsDetected?.Invoke(DetectedWalls);
            }
        }
        
        private void UpdateCeilingDetection()
        {
            // Recalculate ceiling height based on all detected planes
            float lowestCeiling = float.MaxValue;
            bool foundCeiling = false;
            
            // Check all planes for potential ceiling
            var allPlanes = planeManager.trackables;
            foreach (var plane in allPlanes)
            {
                if (plane.alignment == PlaneAlignment.HorizontalDown && plane.transform.position.y > 1.5f)
                {
                    float height = plane.transform.position.y;
                    if (height < lowestCeiling)
                    {
                        lowestCeiling = height;
                        foundCeiling = true;
                    }
                }
            }
            
            if (foundCeiling && Mathf.Abs(lowestCeiling - CeilingHeight) > 0.1f)
            {
                CeilingHeight = lowestCeiling;
                OnCeilingHeightDetected?.Invoke(CeilingHeight);
                OnSafeHeightStatus?.Invoke(IsSafeForOverheadMovement);
                
                if (CeilingHeight < minCeilingHeight)
                {
                    Debug.LogWarning($"Low ceiling detected: {CeilingHeight:F2}m - Minimum recommended: {minCeilingHeight:F2}m");
                }
            }
        }
        
        private void UpdateWallProximityWarnings()
        {
            if (SelectedPlane == null || DetectedWalls.Count == 0) return;
            
            // Check distance from floor plane center to nearest walls
            Vector3 floorCenter = SelectedPlane.center;
            float nearestWallDistance = float.MaxValue;
            ARPlane nearestWall = null;
            
            foreach (ARPlane wall in DetectedWalls)
            {
                // Calculate distance from floor center to wall plane
                Vector3 wallPosition = wall.transform.position;
                float distance = Vector3.Distance(new Vector3(floorCenter.x, wallPosition.y, floorCenter.z), wallPosition);
                
                if (distance < nearestWallDistance)
                {
                    nearestWallDistance = distance;
                    nearestWall = wall;
                }
            }
            
            // Issue warning if walls are too close for safe training
            if (nearestWallDistance < wallProximityThreshold)
            {
                Debug.LogWarning($"Wall proximity warning - Nearest wall: {nearestWallDistance:F2}m (threshold: {wallProximityThreshold:F2}m)");
                // Could trigger UI warning here
            }
        }
        
        public float GetDistanceToNearestWall(Vector3 position)
        {
            if (DetectedWalls.Count == 0) return float.MaxValue;
            
            float nearestDistance = float.MaxValue;
            foreach (ARPlane wall in DetectedWalls)
            {
                Vector3 wallPosition = wall.transform.position;
                float distance = Vector3.Distance(position, wallPosition);
                if (distance < nearestDistance)
                {
                    nearestDistance = distance;
                }
            }
            
            return nearestDistance;
        }
        
        public bool IsPositionSafeFromWalls(Vector3 position, float safetyMargin = 0.5f)
        {
            return GetDistanceToNearestWall(position) > safetyMargin;
        }
        
        public List<Vector3> GetWallPositions()
        {
            List<Vector3> wallPositions = new List<Vector3>();
            foreach (ARPlane wall in DetectedWalls)
            {
                wallPositions.Add(wall.transform.position);
            }
            return wallPositions;
        }
    }
}