using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using EkkalavyaAR.AR;

namespace EkkalavyaAR.Calibration
{
    public class TwoPointCalibration : MonoBehaviour
    {
        [Header("UI References")]
        [SerializeField] private GameObject instructionPanel;
        [SerializeField] private GameObject baselineAInstructions;
        [SerializeField] private GameObject baselineBInstructions;
        [SerializeField] private GameObject calibrationComplete;
        [SerializeField] private GameObject tapIndicator;
        
        [Header("Visual Feedback")]
        [SerializeField] private GameObject pointMarkerPrefab;
        [SerializeField] private LineRenderer baselineRenderer;
        [SerializeField] private Material baselineMaterial;
        [SerializeField] private Color pointAColor = Color.green;
        [SerializeField] private Color pointBColor = Color.red;
        [SerializeField] private float markerScale = 0.1f;
        
        [Header("Basketball Reference")]
        [SerializeField] private float basketballDiameter = 0.239f; // Official basketball diameter in meters
        [SerializeField] private bool useBasketballScaling = false;
        
        [Header("Room Mode Calibration")]
        [SerializeField] private bool enableRoomModeCalibration = true;
        [SerializeField] private float roomModeMinDistance = 0.5f; // Minimum baseline for room mode
        [SerializeField] private float roomModeMaxDistance = 3.0f; // Maximum baseline for room mode
        [SerializeField] private Vector2 roomModeReferenceSize = new Vector2(2.4f, 1.8f); // Standard room training area
        
        // Events
        public event Action<Transform> OnCalibrationComplete;
        public event Action<Vector3> OnBaselineASet;
        public event Action<Vector3> OnBaselineBSet;
        public event Action OnCalibrationReset;
        
        // Properties
        public Transform CourtTransform { get; private set; }
        public Vector3 BaselineA { get; private set; }
        public Vector3 BaselineB { get; private set; }
        public float BaselineDistance { get; private set; }
        public bool IsCalibrated { get; private set; }
        public bool IsRoomMode { get; private set; }
        public Vector3 RoomCenter { get; private set; }
        public Vector2 RoomBounds { get; private set; }
        public float RoomScaleFactor { get; private set; } = 1.0f;
        
        private ARBootstrap arBootstrap;
        private PlaneScanController planeScanController;
        private ARRaycastManager raycastManager;
        private Camera arCamera;
        
        private GameObject pointAMarker;
        private GameObject pointBMarker;
        private List<ARRaycastHit> raycastHits = new List<ARRaycastHit>();
        
        private enum CalibrationState
        {
            WaitingForPlane,
            SettingBaselineA,
            SettingBaselineB,
            Complete
        }
        
        private CalibrationState currentState = CalibrationState.WaitingForPlane;
        
        private void Start()
        {
            arBootstrap = ARBootstrap.Instance;
            planeScanController = FindObjectOfType<PlaneScanController>();
            
            if (arBootstrap == null)
            {
                Debug.LogError("ARBootstrap instance not found!");
                return;
            }
            
            arBootstrap.OnARSessionReady += OnARReady;
            
            if (planeScanController != null)
            {
                planeScanController.OnPlaneSelected += OnPlaneSelected;
            }
            
            // Initialize UI
            SetUIState(CalibrationState.WaitingForPlane);
        }
        
        private void OnDestroy()
        {
            if (arBootstrap != null)
            {
                arBootstrap.OnARSessionReady -= OnARReady;
            }
            
            if (planeScanController != null)
            {
                planeScanController.OnPlaneSelected -= OnPlaneSelected;
            }
        }
        
        private void OnARReady()
        {
            raycastManager = arBootstrap.RaycastManager;
            arCamera = arBootstrap.CameraManager.GetComponent<ARCamera>();
        }
        
        private void OnPlaneSelected(ARPlane plane)
        {
            // Determine if this is room mode based on plane scanner
            IsRoomMode = planeScanController != null && planeScanController.IsRoomModeActive;
            
            if (IsRoomMode)
            {
                CalculateRoomBounds(plane);
            }
            
            currentState = CalibrationState.SettingBaselineA;
            SetUIState(currentState);
        }
        
        private void CalculateRoomBounds(ARPlane plane)
        {
            if (plane == null) return;
            
            // Calculate room center and bounds
            RoomCenter = plane.center;
            
            // Get room dimensions from plane scanner
            if (planeScanController != null)
            {
                RoomBounds = planeScanController.ConvexHullBounds;
            }
            else
            {
                // Fallback calculation
                RoomBounds = GetPlaneDimensions(plane);
            }
            
            Debug.Log($"Room bounds calculated: {RoomBounds.x:F2}m x {RoomBounds.y:F2}m");
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
        
        private void Update()
        {
            if (currentState == CalibrationState.SettingBaselineA || 
                currentState == CalibrationState.SettingBaselineB)
            {
                HandleTouchInput();
                UpdateTapIndicator();
            }
        }
        
        private void HandleTouchInput()
        {
            if (raycastManager == null) return;
            
            Vector2 screenPoint = Vector2.zero;
            bool hasTouch = false;
            
            #if UNITY_EDITOR
            if (Input.GetMouseButtonDown(0))
            {
                screenPoint = Input.mousePosition;
                hasTouch = true;
            }
            #else
            if (Input.touchCount > 0 && Input.GetTouch(0).phase == TouchPhase.Began)
            {
                screenPoint = Input.GetTouch(0).position;
                hasTouch = true;
            }
            #endif
            
            if (hasTouch)
            {
                ProcessTouch(screenPoint);
            }
        }
        
        private void ProcessTouch(Vector2 screenPoint)
        {
            raycastHits.Clear();
            
            if (raycastManager.Raycast(screenPoint, raycastHits, TrackableType.PlaneWithinBounds))
            {
                ARRaycastHit hit = raycastHits[0];
                Vector3 hitPosition = hit.pose.position;
                
                switch (currentState)
                {
                    case CalibrationState.SettingBaselineA:
                        SetBaselineA(hitPosition);
                        break;
                    case CalibrationState.SettingBaselineB:
                        SetBaselineB(hitPosition);
                        break;
                }
            }
        }
        
        private void SetBaselineA(Vector3 position)
        {
            BaselineA = position;
            
            // Create marker
            CreatePointMarker(ref pointAMarker, position, pointAColor, "Baseline A");
            
            // Update state
            currentState = CalibrationState.SettingBaselineB;
            SetUIState(currentState);
            
            OnBaselineASet?.Invoke(position);
        }
        
        private void SetBaselineB(Vector3 position)
        {
            BaselineB = position;
            
            // Create marker
            CreatePointMarker(ref pointBMarker, position, pointBColor, "Baseline B");
            
            // Calculate distance
            BaselineDistance = Vector3.Distance(BaselineA, BaselineB);
            
            // Validate baseline for room mode
            if (IsRoomMode && enableRoomModeCalibration)
            {
                if (BaselineDistance < roomModeMinDistance)
                {
                    Debug.LogWarning($"Baseline too short for room mode: {BaselineDistance:F2}m < {roomModeMinDistance:F2}m");
                    // Auto-adjust baseline for room mode
                    AdjustBaselineForRoomMode();
                }
                else if (BaselineDistance > roomModeMaxDistance)
                {
                    Debug.LogWarning($"Baseline too long for room mode: {BaselineDistance:F2}m > {roomModeMaxDistance:F2}m");
                    // Scale down for room mode
                    AdjustBaselineForRoomMode();
                }
            }
            
            // Create baseline visualization
            CreateBaselineVisualization();
            
            // Complete calibration
            CompleteCalibration();
            
            OnBaselineBSet?.Invoke(position);
        }
        
        private void AdjustBaselineForRoomMode()
        {
            // Calculate optimal baseline for room constraints
            float targetDistance = Mathf.Clamp(BaselineDistance, roomModeMinDistance, roomModeMaxDistance);
            
            // If using basketball scaling, use basketball diameter as reference
            if (useBasketballScaling)
            {
                targetDistance = basketballDiameter * 8f; // Approximately 8 basketball diameters for small court
            }
            
            // Adjust positions to achieve target distance
            Vector3 direction = (BaselineB - BaselineA).normalized;
            Vector3 center = (BaselineA + BaselineB) * 0.5f;
            
            BaselineA = center - direction * (targetDistance * 0.5f);
            BaselineB = center + direction * (targetDistance * 0.5f);
            BaselineDistance = targetDistance;
            
            // Update markers
            if (pointAMarker != null)
            {
                pointAMarker.transform.position = BaselineA;
            }
            if (pointBMarker != null)
            {
                pointBMarker.transform.position = BaselineB;
            }
            
            Debug.Log($"Baseline adjusted for room mode: {BaselineDistance:F2}m");
        }
        
        private void CreatePointMarker(ref GameObject marker, Vector3 position, Color color, string name)
        {
            if (marker != null)
            {
                Destroy(marker);
            }
            
            if (pointMarkerPrefab != null)
            {
                marker = Instantiate(pointMarkerPrefab, position, Quaternion.identity);
            }
            else
            {
                // Create simple marker
                marker = GameObject.CreatePrimitive(PrimitiveType.Sphere);
                marker.transform.position = position;
                marker.transform.localScale = Vector3.one * markerScale;
                
                // Remove collider
                Collider collider = marker.GetComponent<Collider>();
                if (collider != null) Destroy(collider);
            }
            
            marker.name = name;
            
            // Set color
            Renderer renderer = marker.GetComponent<Renderer>();
            if (renderer != null)
            {
                renderer.material.color = color;
            }
        }
        
        private void CreateBaselineVisualization()
        {
            if (baselineRenderer == null)
            {
                GameObject lineObj = new GameObject("Baseline");
                baselineRenderer = lineObj.AddComponent<LineRenderer>();
            }
            
            // Configure line renderer
            baselineRenderer.material = baselineMaterial;
            baselineRenderer.startWidth = 0.02f;
            baselineRenderer.endWidth = 0.02f;
            baselineRenderer.positionCount = 2;
            baselineRenderer.useWorldSpace = true;
            
            // Set positions
            baselineRenderer.SetPosition(0, BaselineA);
            baselineRenderer.SetPosition(1, BaselineB);
        }
        
        private void CompleteCalibration()
        {
            // Create court coordinate system
            CreateCourtTransform();
            
            currentState = CalibrationState.Complete;
            SetUIState(currentState);
            IsCalibrated = true;
            
            OnCalibrationComplete?.Invoke(CourtTransform);
            
            Debug.Log($"Calibration complete. Baseline distance: {BaselineDistance:F2}m");
        }
        
        private void CreateCourtTransform()
        {
            // Create court transform GameObject
            GameObject courtObject = new GameObject(IsRoomMode ? "Room Transform" : "Court Transform");
            CourtTransform = courtObject.transform;
            
            Vector3 origin;
            Vector3 xAxis;
            Vector3 yAxis;
            Vector3 zAxis = Vector3.up;
            
            if (IsRoomMode)
            {
                // For room mode, center the coordinate system in the room
                origin = RoomCenter;
                
                // X axis points towards the longest room dimension
                if (RoomBounds.x >= RoomBounds.y)
                {
                    // Room is wider than deep - align X with width
                    xAxis = (BaselineB - BaselineA).normalized;
                }
                else
                {
                    // Room is deeper than wide - align X with depth
                    Vector3 baselineDirection = (BaselineB - BaselineA).normalized;
                    xAxis = Vector3.Cross(Vector3.up, baselineDirection).normalized;
                }
                
                // Calculate room scale factor for confined space
                CalculateRoomScaleFactor();
            }
            else
            {
                // Standard court setup
                origin = BaselineA;
                xAxis = (BaselineB - BaselineA).normalized;
                RoomScaleFactor = GetCourtScale();
            }
            
            // Y axis = Z × X (perpendicular to baseline on horizontal plane)
            yAxis = Vector3.Cross(zAxis, xAxis);
            
            // Set transform
            CourtTransform.position = origin;
            CourtTransform.rotation = Quaternion.LookRotation(yAxis, zAxis);
            
            // Store the transformation matrix for later use
            Matrix4x4 courtMatrix = Matrix4x4.TRS(origin, CourtTransform.rotation, Vector3.one * RoomScaleFactor);
            
            string modeText = IsRoomMode ? "Room" : "Court";
            Debug.Log($"{modeText} coordinate system established at {origin}");
            Debug.Log($"X-axis (baseline): {xAxis}");
            Debug.Log($"Y-axis ({modeText.ToLower()} width): {yAxis}");
            Debug.Log($"Z-axis ({modeText.ToLower()} normal): {zAxis}");
            Debug.Log($"Scale factor: {RoomScaleFactor:F3}");
        }
        
        private void CalculateRoomScaleFactor()
        {
            if (useBasketballScaling)
            {
                // Use basketball diameter as reference unit
                // 1 basketball diameter = 0.239m
                // Scale factor based on how many basketball diameters fit in baseline
                RoomScaleFactor = BaselineDistance / (basketballDiameter * 8f);
            }
            else
            {
                // Use room reference size for scaling
                float roomReferenceDistance = Mathf.Max(roomModeReferenceSize.x, roomModeReferenceSize.y);
                RoomScaleFactor = BaselineDistance / roomReferenceDistance;
            }
            
            // Clamp scale factor for reasonable range
            RoomScaleFactor = Mathf.Clamp(RoomScaleFactor, 0.3f, 2.0f);
        }
        
        private void SetUIState(CalibrationState state)
        {
            // Hide all UI elements first
            instructionPanel?.SetActive(false);
            baselineAInstructions?.SetActive(false);
            baselineBInstructions?.SetActive(false);
            calibrationComplete?.SetActive(false);
            tapIndicator?.SetActive(false);
            
            // Show appropriate UI for current state
            switch (state)
            {
                case CalibrationState.WaitingForPlane:
                    instructionPanel?.SetActive(true);
                    break;
                    
                case CalibrationState.SettingBaselineA:
                    baselineAInstructions?.SetActive(true);
                    tapIndicator?.SetActive(true);
                    break;
                    
                case CalibrationState.SettingBaselineB:
                    baselineBInstructions?.SetActive(true);
                    tapIndicator?.SetActive(true);
                    break;
                    
                case CalibrationState.Complete:
                    calibrationComplete?.SetActive(true);
                    break;
            }
        }
        
        private void UpdateTapIndicator()
        {
            if (tapIndicator == null || raycastManager == null || arCamera == null) return;
            
            Vector2 screenCenter = new Vector2(Screen.width * 0.5f, Screen.height * 0.5f);
            raycastHits.Clear();
            
            if (raycastManager.Raycast(screenCenter, raycastHits, TrackableType.PlaneWithinBounds))
            {
                ARRaycastHit hit = raycastHits[0];
                tapIndicator.transform.position = hit.pose.position;
                tapIndicator.transform.rotation = hit.pose.rotation;
                tapIndicator.SetActive(true);
            }
            else
            {
                tapIndicator.SetActive(false);
            }
        }
        
        public void ResetCalibration()
        {
            // Destroy markers and visualization
            if (pointAMarker != null) Destroy(pointAMarker);
            if (pointBMarker != null) Destroy(pointBMarker);
            if (baselineRenderer != null) Destroy(baselineRenderer.gameObject);
            if (CourtTransform != null) Destroy(CourtTransform.gameObject);
            
            // Reset state
            currentState = CalibrationState.WaitingForPlane;
            IsCalibrated = false;
            CourtTransform = null;
            
            SetUIState(currentState);
            
            OnCalibrationReset?.Invoke();
        }
        
        public Vector2 WorldToCourtCoordinates(Vector3 worldPosition)
        {
            if (!IsCalibrated || CourtTransform == null)
            {
                return Vector2.zero;
            }
            
            Vector3 localPosition = CourtTransform.InverseTransformPoint(worldPosition);
            return new Vector2(localPosition.x, localPosition.z);
        }
        
        public Vector3 CourtToWorldCoordinates(Vector2 courtPosition)
        {
            if (!IsCalibrated || CourtTransform == null)
            {
                return Vector3.zero;
            }
            
            Vector3 localPosition = new Vector3(courtPosition.x, 0, courtPosition.y);
            return CourtTransform.TransformPoint(localPosition);
        }
        
        public float GetCourtScale()
        {
            if (IsRoomMode)
            {
                return RoomScaleFactor;
            }
            else
            {
                // Return the scale factor based on baseline distance
                // This can be used to adjust court dimensions
                return BaselineDistance / 28.65f; // NBA court length is 28.65m
            }
        }
        
        public Vector2 GetRoomCoordinates(Vector3 worldPosition)
        {
            if (!IsCalibrated || CourtTransform == null || !IsRoomMode)
            {
                return Vector2.zero;
            }
            
            // Transform to room coordinate system
            Vector3 localPosition = CourtTransform.InverseTransformPoint(worldPosition);
            
            // Scale by room factor and return 2D coordinates
            return new Vector2(localPosition.x / RoomScaleFactor, localPosition.z / RoomScaleFactor);
        }
        
        public Vector3 RoomToWorldCoordinates(Vector2 roomPosition)
        {
            if (!IsCalibrated || CourtTransform == null || !IsRoomMode)
            {
                return Vector3.zero;
            }
            
            // Apply room scaling
            Vector3 scaledPosition = new Vector3(
                roomPosition.x * RoomScaleFactor, 
                0, 
                roomPosition.y * RoomScaleFactor
            );
            
            return CourtTransform.TransformPoint(scaledPosition);
        }
        
        public bool IsPositionInRoomBounds(Vector3 worldPosition)
        {
            if (!IsRoomMode) return true;
            
            Vector2 roomPos = GetRoomCoordinates(worldPosition);
            float halfWidth = RoomBounds.x * 0.5f;
            float halfDepth = RoomBounds.y * 0.5f;
            
            return roomPos.x >= -halfWidth && roomPos.x <= halfWidth &&
                   roomPos.y >= -halfDepth && roomPos.y <= halfDepth;
        }
        
        public Vector3 ClampToRoomBounds(Vector3 worldPosition, float margin = 0.3f)
        {
            if (!IsRoomMode) return worldPosition;
            
            Vector2 roomPos = GetRoomCoordinates(worldPosition);
            float halfWidth = (RoomBounds.x * 0.5f) - margin;
            float halfDepth = (RoomBounds.y * 0.5f) - margin;
            
            roomPos.x = Mathf.Clamp(roomPos.x, -halfWidth, halfWidth);
            roomPos.y = Mathf.Clamp(roomPos.y, -halfDepth, halfDepth);
            
            return RoomToWorldCoordinates(roomPos);
        }
        
        // Public methods for UI
        public void OnSkipCalibrationPressed()
        {
            // Create default calibration for testing
            if (planeScanController != null && planeScanController.SelectedPlane != null)
            {
                Vector3 center = planeScanController.SelectedPlane.center;
                SetBaselineA(center + Vector3.forward * 10f);
                SetBaselineB(center + Vector3.back * 10f);
            }
        }
    }
}