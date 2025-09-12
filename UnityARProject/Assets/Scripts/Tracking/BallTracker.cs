using System;
using System.Collections;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;
using EkkalavyaAR.AR;
using EkkalavyaAR.Utils;

namespace EkkalavyaAR.Tracking
{
    public class BallTracker : MonoBehaviour
    {
        [Header("Camera Settings")]
        [SerializeField] private int downsampleWidth = 320;
        [SerializeField] private int downsampleHeight = 240;
        [SerializeField] private int trackingFPS = 30;
        
        [Header("Room Mode Optimization")]
        [SerializeField] private bool enableRoomModeOptimization = true;
        [SerializeField] private int roomModeDownsampleWidth = 160; // Ultra-low resolution for room mode
        [SerializeField] private int roomModeDownsampleHeight = 120;
        [SerializeField] private int roomModeTrackingFPS = 60; // Higher FPS for responsive room tracking
        [SerializeField] private float roomModeDetectionThreshold = 0.3f; // Lower threshold for confined spaces
        
        [Header("Ball Detection")]
        [SerializeField] private float hsvHueMin = 10f;     // Orange hue range
        [SerializeField] private float hsvHueMax = 25f;
        [SerializeField] private float hsvSatMin = 0.6f;
        [SerializeField] private float hsvSatMax = 1.0f;
        [SerializeField] private float hsvValMin = 0.5f;
        [SerializeField] private float hsvValMax = 1.0f;
        [SerializeField] private float minCircularity = 0.7f;
        [SerializeField] private float minBallRadius = 10f;
        [SerializeField] private float maxBallRadius = 50f;
        [SerializeField] private bool useAutoGainFallback = true;
        
        [Header("Kalman Filter")]
        [SerializeField] private float processNoise = 0.01f;
        [SerializeField] private float measurementNoise = 0.1f;
        [SerializeField] private float occlusionTimeout = 0.3f;
        
        [Header("Debug")]
        [SerializeField] private bool showDebugVisuals = false;
        [SerializeField] private Material debugMaterial;
        
        // Events
        public event Action<Vector2, float> OnBallScreenPoint;
        public event Action OnBallLost;
        public event Action<Vector2> OnBallPredicted;
        
        // Properties
        public Vector2 LastKnownPosition { get; private set; }
        public Vector2 PredictedPosition { get; private set; }
        public float LastConfidence { get; private set; }
        public bool IsBallTracked { get; private set; }
        public bool IsOccluded { get; private set; }
        
        private ARBootstrap arBootstrap;
        private ARCameraManager cameraManager;
        private Camera arCamera;
        
        private Texture2D cameraTexture;
        private Texture2D downsampledTexture;
        private Color32[] pixels;
        private Color32[] downsampledPixels;
        
        private Kalman2D kalmanFilter;
        private float lastTrackTime;
        private float lastDetectionTime;
        private bool isInitialized = false;
        
        // HSV conversion cache
        private float[,] hsvCache;
        
        // Circularity detection
        private bool[,] binaryMask;
        private int[,] labelMap;
        
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
            
            if (cameraManager != null)
            {
                cameraManager.frameReceived -= OnCameraFrameReceived;
            }
            
            CleanupTextures();
        }
        
        private void OnARReady()
        {
            cameraManager = arBootstrap.CameraManager;
            arCamera = cameraManager.GetComponent<Camera>();
            
            if (cameraManager != null)
            {
                cameraManager.frameReceived += OnCameraFrameReceived;
                
                // Initialize Kalman filter
                kalmanFilter = new Kalman2D(processNoise, measurementNoise);
                
                InitializeTextures();
                isInitialized = true;
                
                Debug.Log("Ball tracker initialized");
            }
        }
        
        private void InitializeTextures()
        {
            downsampledTexture = new Texture2D(downsampleWidth, downsampleHeight, TextureFormat.RGB24, false);
            downsampledPixels = new Color32[downsampleWidth * downsampleHeight];
            
            // Initialize processing arrays
            hsvCache = new float[downsampleWidth, downsampleHeight];
            binaryMask = new bool[downsampleWidth, downsampleHeight];
            labelMap = new int[downsampleWidth, downsampleHeight];
        }
        
        private void CleanupTextures()
        {
            if (cameraTexture != null) Destroy(cameraTexture);
            if (downsampledTexture != null) Destroy(downsampledTexture);
        }
        
        private void OnCameraFrameReceived(ARCameraFrameEventArgs eventArgs)
        {
            // Dynamic FPS based on room mode
            float currentFPS = enableRoomModeOptimization && IsRoomMode() ? roomModeTrackingFPS : trackingFPS;
            
            if (!isInitialized || Time.time - lastTrackTime < 1f / currentFPS)
                return;
            
            lastTrackTime = Time.time;
            StartCoroutine(ProcessCameraFrame());
        }
        
        private bool IsRoomMode()
        {
            // Check if we're in room mode (could be set by plane scanner or calibration)
            var planeScanController = FindObjectOfType<EkkalavyaAR.AR.PlaneScanController>();
            return planeScanController != null && planeScanController.IsRoomModeActive;
        }
        
        private IEnumerator ProcessCameraFrame()
        {
            // Get camera texture
            if (!TryGetCameraTexture())
            {
                yield break;
            }
            
            // Downsample for performance
            DownsampleTexture();
            
            // Convert to HSV and apply color filter
            ApplyHSVFilter();
            
            // Find circular objects
            var candidates = FindCircularObjects();
            
            // Evaluate candidates
            var bestCandidate = EvaluateCandidates(candidates);
            
            if (bestCandidate.HasValue)
            {
                ProcessDetection(bestCandidate.Value);
            }
            else
            {
                ProcessNoDetection();
            }
            
            yield return null;
        }
        
        private bool TryGetCameraTexture()
        {
            if (cameraManager == null) return false;
            
            // Try to get the camera image
            if (cameraManager.TryAcquireLatestCpuImage(out var image))
            {
                using (image)
                {
                    UpdateCameraTexture(image);
                    return true;
                }
            }
            
            return false;
        }
        
        private void UpdateCameraTexture(XRCpuImage image)
        {
            // Convert XRCpuImage to Texture2D
            var conversionParams = new XRCpuImage.ConversionParams
            {
                inputRect = new RectInt(0, 0, image.width, image.height),
                outputDimensions = new Vector2Int(image.width, image.height),
                outputFormat = TextureFormat.RGB24,
                transformation = XRCpuImage.Transformation.MirrorY
            };
            
            if (cameraTexture == null || cameraTexture.width != image.width || cameraTexture.height != image.height)
            {
                if (cameraTexture != null) Destroy(cameraTexture);
                cameraTexture = new Texture2D(image.width, image.height, TextureFormat.RGB24, false);
                pixels = new Color32[image.width * image.height];
            }
            
            image.Convert(conversionParams, pixels);
            cameraTexture.SetPixels32(pixels);
            cameraTexture.Apply();
        }
        
        private void DownsampleTexture()
        {
            if (cameraTexture == null) return;
            
            // Use room mode optimized resolution if enabled
            int targetWidth = enableRoomModeOptimization && IsRoomMode() ? roomModeDownsampleWidth : downsampleWidth;
            int targetHeight = enableRoomModeOptimization && IsRoomMode() ? roomModeDownsampleHeight : downsampleHeight;
            
            // Reallocate textures if room mode resolution changed
            if (downsampledTexture.width != targetWidth || downsampledTexture.height != targetHeight)
            {
                Destroy(downsampledTexture);
                downsampledTexture = new Texture2D(targetWidth, targetHeight, TextureFormat.RGB24, false);
                downsampledPixels = new Color32[targetWidth * targetHeight];
                
                // Reinitialize processing arrays
                hsvCache = new float[targetWidth, targetHeight];
                binaryMask = new bool[targetWidth, targetHeight];
                labelMap = new int[targetWidth, targetHeight];
            }
            
            float scaleX = (float)cameraTexture.width / targetWidth;
            float scaleY = (float)cameraTexture.height / targetHeight;
            
            for (int y = 0; y < targetHeight; y++)
            {
                for (int x = 0; x < targetWidth; x++)
                {
                    int srcX = Mathf.FloorToInt(x * scaleX);
                    int srcY = Mathf.FloorToInt(y * scaleY);
                    
                    Color pixel = cameraTexture.GetPixel(srcX, srcY);
                    downsampledPixels[y * targetWidth + x] = pixel;
                }
            }
            
            downsampledTexture.SetPixels32(downsampledPixels);
            downsampledTexture.Apply();
        }
        
        private void ApplyHSVFilter()
        {
            for (int y = 0; y < downsampleHeight; y++)
            {
                for (int x = 0; x < downsampleWidth; x++)
                {
                    Color32 pixel = downsampledPixels[y * downsampleWidth + x];
                    
                    // Convert RGB to HSV
                    RGBToHSV(pixel, out float h, out float s, out float v);
                    
                    // Check if pixel matches ball color criteria
                    bool isOrange = (h >= hsvHueMin && h <= hsvHueMax) &&
                                   (s >= hsvSatMin && s <= hsvSatMax) &&
                                   (v >= hsvValMin && v <= hsvValMax);
                    
                    // Auto-gain fallback for different lighting conditions
                    if (!isOrange && useAutoGainFallback)
                    {
                        isOrange = CheckAutoGainFallback(h, s, v);
                    }
                    
                    binaryMask[x, y] = isOrange;
                }
            }
        }
        
        private bool CheckAutoGainFallback(float h, float s, float v)
        {
            // Relaxed criteria for challenging lighting
            bool relaxedHue = (h >= hsvHueMin - 5f && h <= hsvHueMax + 5f);
            bool relaxedSat = (s >= hsvSatMin - 0.2f);
            bool relaxedVal = (v >= hsvValMin - 0.2f);
            
            return relaxedHue && relaxedSat && relaxedVal;
        }
        
        private void RGBToHSV(Color32 rgb, out float h, out float s, out float v)
        {
            float r = rgb.r / 255f;
            float g = rgb.g / 255f;
            float b = rgb.b / 255f;
            
            float max = Mathf.Max(r, Mathf.Max(g, b));
            float min = Mathf.Min(r, Mathf.Min(g, b));
            float delta = max - min;
            
            // Value
            v = max;
            
            // Saturation
            s = (max != 0f) ? delta / max : 0f;
            
            // Hue
            if (delta == 0f)
            {
                h = 0f;
            }
            else if (max == r)
            {
                h = ((g - b) / delta) % 6f;
            }
            else if (max == g)
            {
                h = (b - r) / delta + 2f;
            }
            else
            {
                h = (r - g) / delta + 4f;
            }
            
            h *= 60f;
            if (h < 0f) h += 360f;
        }
        
        private CircleCandidate[] FindCircularObjects()
        {
            var candidates = new System.Collections.Generic.List<CircleCandidate>();
            
            // Simple blob detection and circularity analysis
            bool[,] visited = new bool[downsampleWidth, downsampleHeight];
            
            for (int y = 1; y < downsampleHeight - 1; y++)
            {
                for (int x = 1; x < downsampleWidth - 1; x++)
                {
                    if (binaryMask[x, y] && !visited[x, y])
                    {
                        var blob = FloodFill(x, y, visited);
                        if (blob.Count >= 20) // Minimum blob size
                        {
                            var candidate = AnalyzeBlob(blob);
                            if (candidate.circularity >= minCircularity && 
                                candidate.radius >= minBallRadius && 
                                candidate.radius <= maxBallRadius)
                            {
                                candidates.Add(candidate);
                            }
                        }
                    }
                }
            }
            
            return candidates.ToArray();
        }
        
        private System.Collections.Generic.List<Vector2Int> FloodFill(int startX, int startY, bool[,] visited)
        {
            var blob = new System.Collections.Generic.List<Vector2Int>();
            var queue = new System.Collections.Generic.Queue<Vector2Int>();
            
            queue.Enqueue(new Vector2Int(startX, startY));
            visited[startX, startY] = true;
            
            while (queue.Count > 0)
            {
                var current = queue.Dequeue();
                blob.Add(current);
                
                // Check 8-connected neighbors
                for (int dy = -1; dy <= 1; dy++)
                {
                    for (int dx = -1; dx <= 1; dx++)
                    {
                        if (dx == 0 && dy == 0) continue;
                        
                        int nx = current.x + dx;
                        int ny = current.y + dy;
                        
                        if (nx >= 0 && nx < downsampleWidth && 
                            ny >= 0 && ny < downsampleHeight &&
                            binaryMask[nx, ny] && !visited[nx, ny])
                        {
                            visited[nx, ny] = true;
                            queue.Enqueue(new Vector2Int(nx, ny));
                        }
                    }
                }
            }
            
            return blob;
        }
        
        private CircleCandidate AnalyzeBlob(System.Collections.Generic.List<Vector2Int> blob)
        {
            // Calculate centroid
            Vector2 centroid = Vector2.zero;
            foreach (var point in blob)
            {
                centroid += new Vector2(point.x, point.y);
            }
            centroid /= blob.Count;
            
            // Calculate average radius
            float totalDistance = 0f;
            foreach (var point in blob)
            {
                totalDistance += Vector2.Distance(centroid, new Vector2(point.x, point.y));
            }
            float avgRadius = totalDistance / blob.Count;
            
            // Calculate circularity (how close the blob is to a perfect circle)
            float expectedArea = Mathf.PI * avgRadius * avgRadius;
            float actualArea = blob.Count;
            float circularity = (4f * Mathf.PI * actualArea) / (GetPerimeter(blob) * GetPerimeter(blob));
            
            return new CircleCandidate
            {
                center = centroid,
                radius = avgRadius,
                circularity = circularity,
                pixelCount = blob.Count
            };
        }
        
        private float GetPerimeter(System.Collections.Generic.List<Vector2Int> blob)
        {
            // Simplified perimeter calculation
            var edgePoints = new System.Collections.Generic.HashSet<Vector2Int>();
            
            foreach (var point in blob)
            {
                bool isEdge = false;
                for (int dy = -1; dy <= 1; dy++)
                {
                    for (int dx = -1; dx <= 1; dx++)
                    {
                        if (dx == 0 && dy == 0) continue;
                        
                        int nx = point.x + dx;
                        int ny = point.y + dy;
                        
                        if (nx < 0 || nx >= downsampleWidth || 
                            ny < 0 || ny >= downsampleHeight ||
                            !binaryMask[nx, ny])
                        {
                            isEdge = true;
                            break;
                        }
                    }
                    if (isEdge) break;
                }
                
                if (isEdge)
                {
                    edgePoints.Add(point);
                }
            }
            
            return edgePoints.Count;
        }
        
        private CircleCandidate? EvaluateCandidates(CircleCandidate[] candidates)
        {
            if (candidates.Length == 0) return null;
            
            CircleCandidate best = candidates[0];
            float bestScore = 0f;
            
            foreach (var candidate in candidates)
            {
                float score = CalculateCandidateScore(candidate);
                if (score > bestScore)
                {
                    bestScore = score;
                    best = candidate;
                }
            }
            
            return bestScore > 0.5f ? best : null;
        }
        
        private float CalculateCandidateScore(CircleCandidate candidate)
        {
            float circularityScore = candidate.circularity;
            float sizeScore = Mathf.Clamp01((candidate.radius - minBallRadius) / (maxBallRadius - minBallRadius));
            
            // Temporal consistency bonus
            float temporalScore = 0f;
            if (IsBallTracked)
            {
                float distance = Vector2.Distance(candidate.center, LastKnownPosition);
                float maxExpectedMovement = 50f; // pixels
                temporalScore = Mathf.Clamp01(1f - (distance / maxExpectedMovement));
            }
            
            return circularityScore * 0.4f + sizeScore * 0.3f + temporalScore * 0.3f;
        }
        
        private void ProcessDetection(CircleCandidate candidate)
        {
            // Convert to normalized screen coordinates
            Vector2 screenPos = new Vector2(
                candidate.center.x / downsampleWidth,
                candidate.center.y / downsampleHeight
            );
            
            // Update Kalman filter
            if (!IsBallTracked)
            {
                kalmanFilter.Initialize(screenPos);
                IsBallTracked = true;
            }
            else
            {
                kalmanFilter.Update(screenPos);
            }
            
            LastKnownPosition = screenPos;
            PredictedPosition = kalmanFilter.GetPrediction();
            LastConfidence = CalculateCandidateScore(candidate);
            lastDetectionTime = Time.time;
            IsOccluded = false;
            
            OnBallScreenPoint?.Invoke(screenPos, LastConfidence);
        }
        
        private void ProcessNoDetection()
        {
            float timeSinceLastDetection = Time.time - lastDetectionTime;
            
            if (IsBallTracked && timeSinceLastDetection < occlusionTimeout)
            {
                // Ball is temporarily occluded - use prediction
                PredictedPosition = kalmanFilter.GetPrediction();
                IsOccluded = true;
                
                OnBallPredicted?.Invoke(PredictedPosition);
            }
            else if (timeSinceLastDetection >= occlusionTimeout)
            {
                // Ball is lost
                IsBallTracked = false;
                IsOccluded = false;
                LastConfidence = 0f;
                
                OnBallLost?.Invoke();
            }
        }
        
        public void ResetTracking()
        {
            IsBallTracked = false;
            IsOccluded = false;
            LastConfidence = 0f;
            kalmanFilter?.Reset();
        }
        
        public Vector2 ConvertToWorldScreenPoint(Vector2 normalizedPos)
        {
            return new Vector2(
                normalizedPos.x * Screen.width,
                normalizedPos.y * Screen.height
            );
        }
    }
    
    [System.Serializable]
    public struct CircleCandidate
    {
        public Vector2 center;
        public float radius;
        public float circularity;
        public int pixelCount;
    }
}