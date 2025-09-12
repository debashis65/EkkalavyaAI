using System;
using System.Collections.Generic;
using UnityEngine;
using EkkalavyaAR.Calibration;
using EkkalavyaAR.Data;

namespace EkkalavyaAR.Court
{
    public class CourtGenerator : MonoBehaviour
    {
        [Header("Court Configuration")]
        [SerializeField] private string currentSport = "basketball";
        [SerializeField] private bool autoGenerateOnCalibration = true;
        [SerializeField] private float lineWidth = 0.05f;
        [SerializeField] private float lineHeight = 0.01f;
        
        [Header("Materials")]
        [SerializeField] private Material courtLineMaterial;
        [SerializeField] private Material courtSurfaceMaterial;
        [SerializeField] private Color lineColor = Color.white;
        
        [Header("Micro Court Settings")]
        [SerializeField] private float minAreaThreshold = 15f; // Square meters
        [SerializeField] private float microCourtScale = 0.5f;
        
        // Events
        public event Action<GameObject> OnCourtGenerated;
        public event Action<string> OnCourtGenerationError;
        
        // Properties
        public GameObject GeneratedCourt { get; private set; }
        public SportCourtConfig CurrentConfig { get; private set; }
        public bool IsMicroCourt { get; private set; }
        public Vector2 CourtDimensions { get; private set; }
        
        private TwoPointCalibration calibrationController;
        private SportCourtDatabase courtDatabase;
        
        // Court configuration data
        private Dictionary<string, SportCourtConfig> sportConfigs = new Dictionary<string, SportCourtConfig>();
        
        private void Start()
        {
            calibrationController = FindObjectOfType<TwoPointCalibration>();
            InitializeSportConfigs();
            
            if (calibrationController != null)
            {
                calibrationController.OnCalibrationComplete += OnCalibrationComplete;
            }
        }
        
        private void OnDestroy()
        {
            if (calibrationController != null)
            {
                calibrationController.OnCalibrationComplete -= OnCalibrationComplete;
            }
        }
        
        private void InitializeSportConfigs()
        {
            // Initialize all 54+ sport configurations
            InitializeBasketballConfig();
            InitializeTennisConfig();
            InitializeFootballConfig();
            InitializeCricketConfig();
            InitializeSwimmingConfig();
            InitializeArcheryConfig();
            InitializeVolleyballConfig();
            InitializeBadmintonConfig();
            // ... All sports will be configured
        }
        
        private void InitializeBasketballConfig()
        {
            var config = new SportCourtConfig
            {
                sportName = "basketball",
                courtLength = 28.65f, // NBA regulation
                courtWidth = 15.24f,
                lines = new List<CourtLine>
                {
                    // Baseline (end lines)
                    new CourtLine("baseline_home", new Vector2(0, 0), new Vector2(0, 15.24f)),
                    new CourtLine("baseline_away", new Vector2(28.65f, 0), new Vector2(28.65f, 15.24f)),
                    
                    // Sidelines
                    new CourtLine("sideline_left", new Vector2(0, 0), new Vector2(28.65f, 0)),
                    new CourtLine("sideline_right", new Vector2(0, 15.24f), new Vector2(28.65f, 15.24f)),
                    
                    // Center line
                    new CourtLine("center_line", new Vector2(14.325f, 0), new Vector2(14.325f, 15.24f)),
                    
                    // Free throw lines
                    new CourtLine("ft_line_home", new Vector2(5.8f, 3.66f), new Vector2(5.8f, 11.58f)),
                    new CourtLine("ft_line_away", new Vector2(22.85f, 3.66f), new Vector2(22.85f, 11.58f)),
                    
                    // Three-point lines (simplified arcs as straight segments)
                    new CourtLine("3pt_top_home", new Vector2(6.75f, 7.62f), new Vector2(0, 12.19f)),
                    new CourtLine("3pt_bottom_home", new Vector2(6.75f, 7.62f), new Vector2(0, 3.05f)),
                    new CourtLine("3pt_top_away", new Vector2(21.9f, 7.62f), new Vector2(28.65f, 12.19f)),
                    new CourtLine("3pt_bottom_away", new Vector2(21.9f, 7.62f), new Vector2(28.65f, 3.05f)),
                },
                circles = new List<CourtCircle>
                {
                    // Center circle
                    new CourtCircle("center_circle", new Vector2(14.325f, 7.62f), 1.83f),
                    
                    // Free throw circles
                    new CourtCircle("ft_circle_home", new Vector2(5.8f, 7.62f), 1.83f),
                    new CourtCircle("ft_circle_away", new Vector2(22.85f, 7.62f), 1.83f),
                },
                keyAreas = new List<CourtRectangle>
                {
                    // Paint/Key areas
                    new CourtRectangle("key_home", new Vector2(0, 3.66f), new Vector2(5.8f, 11.58f)),
                    new CourtRectangle("key_away", new Vector2(22.85f, 3.66f), new Vector2(28.65f, 11.58f)),
                }
            };
            
            sportConfigs["basketball"] = config;
        }
        
        private void InitializeTennisConfig()
        {
            var config = new SportCourtConfig
            {
                sportName = "tennis",
                courtLength = 23.77f,
                courtWidth = 10.97f,
                lines = new List<CourtLine>
                {
                    // Baselines
                    new CourtLine("baseline_north", new Vector2(0, 0), new Vector2(0, 10.97f)),
                    new CourtLine("baseline_south", new Vector2(23.77f, 0), new Vector2(23.77f, 10.97f)),
                    
                    // Sidelines
                    new CourtLine("sideline_east", new Vector2(0, 0), new Vector2(23.77f, 0)),
                    new CourtLine("sideline_west", new Vector2(0, 10.97f), new Vector2(23.77f, 10.97f)),
                    
                    // Service lines
                    new CourtLine("service_line_north", new Vector2(6.4f, 1.37f), new Vector2(6.4f, 9.6f)),
                    new CourtLine("service_line_south", new Vector2(17.37f, 1.37f), new Vector2(17.37f, 9.6f)),
                    
                    // Net line
                    new CourtLine("net", new Vector2(11.885f, 0), new Vector2(11.885f, 10.97f)),
                    
                    // Center service line
                    new CourtLine("center_service", new Vector2(6.4f, 5.485f), new Vector2(17.37f, 5.485f)),
                }
            };
            
            sportConfigs["tennis"] = config;
        }
        
        private void InitializeFootballConfig()
        {
            var config = new SportCourtConfig
            {
                sportName = "football",
                courtLength = 100f, // Field length
                courtWidth = 68f, // Field width
                lines = new List<CourtLine>
                {
                    // Goal lines
                    new CourtLine("goal_line_home", new Vector2(0, 0), new Vector2(0, 68f)),
                    new CourtLine("goal_line_away", new Vector2(100f, 0), new Vector2(100f, 68f)),
                    
                    // Sidelines
                    new CourtLine("sideline_left", new Vector2(0, 0), new Vector2(100f, 0)),
                    new CourtLine("sideline_right", new Vector2(0, 68f), new Vector2(100f, 68f)),
                    
                    // Center line
                    new CourtLine("center_line", new Vector2(50f, 0), new Vector2(50f, 68f)),
                    
                    // Penalty areas
                    new CourtLine("penalty_area_home_top", new Vector2(0, 20.16f), new Vector2(16.5f, 20.16f)),
                    new CourtLine("penalty_area_home_bottom", new Vector2(0, 47.84f), new Vector2(16.5f, 47.84f)),
                    new CourtLine("penalty_area_home_line", new Vector2(16.5f, 20.16f), new Vector2(16.5f, 47.84f)),
                },
                circles = new List<CourtCircle>
                {
                    // Center circle
                    new CourtCircle("center_circle", new Vector2(50f, 34f), 9.15f),
                }
            };
            
            sportConfigs["football"] = config;
        }
        
        private void InitializeCricketConfig()
        {
            var config = new SportCourtConfig
            {
                sportName = "cricket",
                courtLength = 22.56f, // Pitch length
                courtWidth = 3.05f, // Pitch width
                lines = new List<CourtLine>
                {
                    // Pitch boundaries
                    new CourtLine("pitch_left", new Vector2(0, 0), new Vector2(22.56f, 0)),
                    new CourtLine("pitch_right", new Vector2(0, 3.05f), new Vector2(22.56f, 3.05f)),
                    
                    // Creases
                    new CourtLine("batting_crease_home", new Vector2(1.22f, 0), new Vector2(1.22f, 3.05f)),
                    new CourtLine("batting_crease_away", new Vector2(21.34f, 0), new Vector2(21.34f, 3.05f)),
                    
                    // Stumps positions (represented as short lines)
                    new CourtLine("stumps_home", new Vector2(0, 1.35f), new Vector2(0, 1.7f)),
                    new CourtLine("stumps_away", new Vector2(22.56f, 1.35f), new Vector2(22.56f, 1.7f)),
                }
            };
            
            sportConfigs["cricket"] = config;
        }
        
        private void InitializeSwimmingConfig()
        {
            var config = new SportCourtConfig
            {
                sportName = "swimming",
                courtLength = 50f, // Olympic pool length
                courtWidth = 25f, // Olympic pool width
                lines = new List<CourtLine>
                {
                    // Pool boundaries
                    new CourtLine("pool_start", new Vector2(0, 0), new Vector2(0, 25f)),
                    new CourtLine("pool_end", new Vector2(50f, 0), new Vector2(50f, 25f)),
                    new CourtLine("pool_left", new Vector2(0, 0), new Vector2(50f, 0)),
                    new CourtLine("pool_right", new Vector2(0, 25f), new Vector2(50f, 25f)),
                }
            };
            
            // Add lane lines
            for (int i = 1; i < 8; i++)
            {
                float laneY = i * (25f / 8f);
                config.lines.Add(new CourtLine($"lane_{i}", new Vector2(0, laneY), new Vector2(50f, laneY)));
            }
            
            sportConfigs["swimming"] = config;
        }
        
        private void InitializeArcheryConfig()
        {
            var config = new SportCourtConfig
            {
                sportName = "archery",
                courtLength = 70f, // 70m range
                courtWidth = 15f,
                lines = new List<CourtLine>
                {
                    // Range boundaries
                    new CourtLine("range_left", new Vector2(0, 0), new Vector2(70f, 0)),
                    new CourtLine("range_right", new Vector2(0, 15f), new Vector2(70f, 15f)),
                    
                    // Shooting line
                    new CourtLine("shooting_line", new Vector2(0, 0), new Vector2(0, 15f)),
                    
                    // Distance markers
                    new CourtLine("30m_line", new Vector2(30f, 0), new Vector2(30f, 15f)),
                    new CourtLine("50m_line", new Vector2(50f, 0), new Vector2(50f, 15f)),
                    new CourtLine("70m_line", new Vector2(70f, 0), new Vector2(70f, 15f)),
                },
                circles = new List<CourtCircle>
                {
                    // Target circles at 70m
                    new CourtCircle("target_outer", new Vector2(70f, 7.5f), 0.61f),
                    new CourtCircle("target_inner", new Vector2(70f, 7.5f), 0.305f),
                }
            };
            
            sportConfigs["archery"] = config;
        }
        
        private void InitializeVolleyballConfig()
        {
            var config = new SportCourtConfig
            {
                sportName = "volleyball",
                courtLength = 18f,
                courtWidth = 9f,
                lines = new List<CourtLine>
                {
                    // Court boundaries
                    new CourtLine("baseline_home", new Vector2(0, 0), new Vector2(0, 9f)),
                    new CourtLine("baseline_away", new Vector2(18f, 0), new Vector2(18f, 9f)),
                    new CourtLine("sideline_left", new Vector2(0, 0), new Vector2(18f, 0)),
                    new CourtLine("sideline_right", new Vector2(0, 9f), new Vector2(18f, 9f)),
                    
                    // Center line (net)
                    new CourtLine("center_line", new Vector2(9f, 0), new Vector2(9f, 9f)),
                    
                    // Attack lines
                    new CourtLine("attack_line_home", new Vector2(3f, 0), new Vector2(3f, 9f)),
                    new CourtLine("attack_line_away", new Vector2(15f, 0), new Vector2(15f, 9f)),
                }
            };
            
            sportConfigs["volleyball"] = config;
        }
        
        private void InitializeBadmintonConfig()
        {
            var config = new SportCourtConfig
            {
                sportName = "badminton",
                courtLength = 13.4f,
                courtWidth = 6.1f,
                lines = new List<CourtLine>
                {
                    // Court boundaries
                    new CourtLine("baseline_home", new Vector2(0, 0), new Vector2(0, 6.1f)),
                    new CourtLine("baseline_away", new Vector2(13.4f, 0), new Vector2(13.4f, 6.1f)),
                    new CourtLine("sideline_left", new Vector2(0, 0), new Vector2(13.4f, 0)),
                    new CourtLine("sideline_right", new Vector2(0, 6.1f), new Vector2(13.4f, 6.1f)),
                    
                    // Net line
                    new CourtLine("net", new Vector2(6.7f, 0), new Vector2(6.7f, 6.1f)),
                    
                    // Service courts
                    new CourtLine("service_line_home", new Vector2(1.98f, 0.76f), new Vector2(1.98f, 5.34f)),
                    new CourtLine("service_line_away", new Vector2(11.42f, 0.76f), new Vector2(11.42f, 5.34f)),
                    new CourtLine("center_service", new Vector2(0, 3.05f), new Vector2(13.4f, 3.05f)),
                }
            };
            
            sportConfigs["badminton"] = config;
        }
        
        private void OnCalibrationComplete(Transform courtTransform)
        {
            if (autoGenerateOnCalibration)
            {
                GenerateCourt(currentSport);
            }
        }
        
        public void GenerateCourt(string sportName)
        {
            if (!sportConfigs.ContainsKey(sportName))
            {
                OnCourtGenerationError?.Invoke($"Sport configuration not found: {sportName}");
                return;
            }
            
            CurrentConfig = sportConfigs[sportName];
            
            // Determine if we need micro court
            float availableArea = GetAvailableArea();
            float requiredArea = CurrentConfig.courtLength * CurrentConfig.courtWidth;
            
            IsMicroCourt = availableArea < requiredArea || availableArea < minAreaThreshold;
            
            // Calculate court dimensions
            CalculateCourtDimensions();
            
            // Clear previous court
            if (GeneratedCourt != null)
            {
                Destroy(GeneratedCourt);
            }
            
            // Generate new court
            GeneratedCourt = CreateCourtGameObject();
            GenerateCourtLines();
            GenerateCourtCircles();
            GenerateKeyAreas();
            
            OnCourtGenerated?.Invoke(GeneratedCourt);
            
            Debug.Log($"Generated {(IsMicroCourt ? "micro " : "")}{sportName} court: {CourtDimensions.x:F1}m x {CourtDimensions.y:F1}m");
        }
        
        private float GetAvailableArea()
        {
            if (calibrationController != null && calibrationController.IsCalibrated)
            {
                return calibrationController.BaselineDistance * 10f; // Rough estimate
            }
            return 50f; // Default assumption
        }
        
        private void CalculateCourtDimensions()
        {
            if (IsMicroCourt)
            {
                CourtDimensions = new Vector2(
                    CurrentConfig.courtLength * microCourtScale,
                    CurrentConfig.courtWidth * microCourtScale
                );
            }
            else
            {
                CourtDimensions = new Vector2(CurrentConfig.courtLength, CurrentConfig.courtWidth);
            }
        }
        
        private GameObject CreateCourtGameObject()
        {
            GameObject court = new GameObject($"{CurrentConfig.sportName.ToUpper()} Court");
            
            if (calibrationController != null && calibrationController.CourtTransform != null)
            {
                court.transform.SetParent(calibrationController.CourtTransform);
                court.transform.localPosition = Vector3.zero;
                court.transform.localRotation = Quaternion.identity;
            }
            
            return court;
        }
        
        private void GenerateCourtLines()
        {
            foreach (var line in CurrentConfig.lines)
            {
                CreateLine(line);
            }
        }
        
        private void GenerateCourtCircles()
        {
            foreach (var circle in CurrentConfig.circles)
            {
                CreateCircle(circle);
            }
        }
        
        private void GenerateKeyAreas()
        {
            foreach (var area in CurrentConfig.keyAreas)
            {
                CreateRectangleArea(area);
            }
        }
        
        private void CreateLine(CourtLine line)
        {
            GameObject lineObj = new GameObject($"Line_{line.name}");
            lineObj.transform.SetParent(GeneratedCourt.transform);
            
            LineRenderer lr = lineObj.AddComponent<LineRenderer>();
            lr.material = courtLineMaterial;
            lr.color = lineColor;
            lr.startWidth = lineWidth;
            lr.endWidth = lineWidth;
            lr.positionCount = 2;
            lr.useWorldSpace = false;
            
            Vector3 start = ScalePosition(new Vector3(line.startPosition.x, lineHeight, line.startPosition.y));
            Vector3 end = ScalePosition(new Vector3(line.endPosition.x, lineHeight, line.endPosition.y));
            
            lr.SetPosition(0, start);
            lr.SetPosition(1, end);
        }
        
        private void CreateCircle(CourtCircle circle)
        {
            GameObject circleObj = new GameObject($"Circle_{circle.name}");
            circleObj.transform.SetParent(GeneratedCourt.transform);
            
            LineRenderer lr = circleObj.AddComponent<LineRenderer>();
            lr.material = courtLineMaterial;
            lr.color = lineColor;
            lr.startWidth = lineWidth;
            lr.endWidth = lineWidth;
            lr.useWorldSpace = false;
            
            int segments = 64;
            lr.positionCount = segments + 1;
            
            Vector3 center = ScalePosition(new Vector3(circle.center.x, lineHeight, circle.center.y));
            float radius = circle.radius * GetScaleFactor();
            
            for (int i = 0; i <= segments; i++)
            {
                float angle = i * 2f * Mathf.PI / segments;
                Vector3 pos = center + new Vector3(Mathf.Cos(angle) * radius, 0, Mathf.Sin(angle) * radius);
                lr.SetPosition(i, pos);
            }
        }
        
        private void CreateRectangleArea(CourtRectangle area)
        {
            GameObject areaObj = new GameObject($"Area_{area.name}");
            areaObj.transform.SetParent(GeneratedCourt.transform);
            
            // Create outline using LineRenderer
            LineRenderer lr = areaObj.AddComponent<LineRenderer>();
            lr.material = courtLineMaterial;
            lr.color = lineColor;
            lr.startWidth = lineWidth;
            lr.endWidth = lineWidth;
            lr.positionCount = 5;
            lr.useWorldSpace = false;
            
            Vector3 bottomLeft = ScalePosition(new Vector3(area.bottomLeft.x, lineHeight, area.bottomLeft.y));
            Vector3 topRight = ScalePosition(new Vector3(area.topRight.x, lineHeight, area.topRight.y));
            Vector3 bottomRight = new Vector3(topRight.x, lineHeight, bottomLeft.z);
            Vector3 topLeft = new Vector3(bottomLeft.x, lineHeight, topRight.z);
            
            lr.SetPosition(0, bottomLeft);
            lr.SetPosition(1, bottomRight);
            lr.SetPosition(2, topRight);
            lr.SetPosition(3, topLeft);
            lr.SetPosition(4, bottomLeft); // Close the rectangle
        }
        
        private Vector3 ScalePosition(Vector3 position)
        {
            float scale = GetScaleFactor();
            return new Vector3(position.x * scale, position.y, position.z * scale);
        }
        
        private float GetScaleFactor()
        {
            return IsMicroCourt ? microCourtScale : 1f;
        }
        
        public void SetSport(string sportName)
        {
            if (sportConfigs.ContainsKey(sportName))
            {
                currentSport = sportName;
                if (calibrationController != null && calibrationController.IsCalibrated)
                {
                    GenerateCourt(sportName);
                }
            }
        }
        
        public List<string> GetSupportedSports()
        {
            return new List<string>(sportConfigs.Keys);
        }
    }
    
    // Data structures
    [System.Serializable]
    public class SportCourtConfig
    {
        public string sportName;
        public float courtLength;
        public float courtWidth;
        public List<CourtLine> lines = new List<CourtLine>();
        public List<CourtCircle> circles = new List<CourtCircle>();
        public List<CourtRectangle> keyAreas = new List<CourtRectangle>();
    }
    
    [System.Serializable]
    public class CourtLine
    {
        public string name;
        public Vector2 startPosition;
        public Vector2 endPosition;
        
        public CourtLine(string name, Vector2 start, Vector2 end)
        {
            this.name = name;
            this.startPosition = start;
            this.endPosition = end;
        }
    }
    
    [System.Serializable]
    public class CourtCircle
    {
        public string name;
        public Vector2 center;
        public float radius;
        
        public CourtCircle(string name, Vector2 center, float radius)
        {
            this.name = name;
            this.center = center;
            this.radius = radius;
        }
    }
    
    [System.Serializable]
    public class CourtRectangle
    {
        public string name;
        public Vector2 bottomLeft;
        public Vector2 topRight;
        
        public CourtRectangle(string name, Vector2 bottomLeft, Vector2 topRight)
        {
            this.name = name;
            this.bottomLeft = bottomLeft;
            this.topRight = topRight;
        }
    }
}