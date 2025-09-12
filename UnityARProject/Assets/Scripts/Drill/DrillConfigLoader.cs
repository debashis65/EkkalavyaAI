using System;
using System.Collections.Generic;
using UnityEngine;
using System.IO;

namespace EkkalavyaAR.Drill
{
    public class DrillConfigLoader : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private string configDirectory = "Configs";
        [SerializeField] private bool loadOnStart = true;
        
        public event Action<Dictionary<string, DrillConfig>> OnConfigsLoaded;
        public event Action<string> OnLoadError;
        
        private Dictionary<string, DrillConfig> loadedConfigs = new Dictionary<string, DrillConfig>();
        private Dictionary<string, Dictionary<string, DrillConfig>> configsBySport = new Dictionary<string, Dictionary<string, DrillConfig>>();
        
        public bool IsLoaded { get; private set; } = false;
        
        private void Start()
        {
            if (loadOnStart)
            {
                LoadAllConfigs();
            }
        }
        
        public void LoadAllConfigs()
        {
            loadedConfigs.Clear();
            configsBySport.Clear();
            
            try
            {
                LoadConfigsFromResources();
                OrganizeConfigsBySport();
                IsLoaded = true;
                OnConfigsLoaded?.Invoke(loadedConfigs);
                
                Debug.Log($"Loaded {loadedConfigs.Count} drill configurations");
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to load drill configurations: {ex.Message}");
                OnLoadError?.Invoke(ex.Message);
            }
        }
        
        private void LoadConfigsFromResources()
        {
            // Load basketball configs
            LoadSportConfigs("basketball");
            LoadSportConfigs("tennis");
            LoadSportConfigs("football");
        }
        
        private void LoadSportConfigs(string sport)
        {
            // Create sample configurations for each sport
            switch (sport.ToLower())
            {
                case "basketball":
                    CreateBasketballConfigs();
                    break;
                case "tennis":
                    CreateTennisConfigs();
                    break;
                case "football":
                    CreateFootballConfigs();
                    break;
            }
        }
        
        private void CreateBasketballConfigs()
        {
            // Easy Basketball
            var easyBasketball = new DrillConfig
            {
                id = "basketball_easy_01",
                sport = "basketball",
                difficulty = "easy",
                drill_name = "Basic Shooting Practice",
                description = "Simple shooting targets around the key",
                pace_target_hz = 0.5f,
                layout = new DrillLayout
                {
                    pattern = "penalty_area",
                    count = 5,
                    dx_m = 2.0f,
                    dy_m = 1.5f,
                    start_y_m = 3.0f
                },
                tolerances = new DrillTolerances
                {
                    easy = 0.25f,
                    medium = 0.20f,
                    hard = 0.15f,
                    expert = 0.10f
                }
            };
            
            // Medium Basketball
            var mediumBasketball = new DrillConfig
            {
                id = "basketball_medium_01",
                sport = "basketball",
                difficulty = "medium",
                drill_name = "Free Throw Line Precision",
                description = "Accurate shots from free throw distance",
                pace_target_hz = 0.8f,
                layout = new DrillLayout
                {
                    pattern = "baseline",
                    count = 7,
                    dx_m = 1.5f,
                    dy_m = 1.0f,
                    start_y_m = 5.8f
                },
                tolerances = new DrillTolerances
                {
                    easy = 0.20f,
                    medium = 0.15f,
                    hard = 0.12f,
                    expert = 0.08f
                }
            };
            
            AddConfig(easyBasketball);
            AddConfig(mediumBasketball);
        }
        
        private void CreateTennisConfigs()
        {
            var easyTennis = new DrillConfig
            {
                id = "tennis_easy_01",
                sport = "tennis",
                difficulty = "easy",
                drill_name = "Service Court Practice",
                description = "Basic serve placement practice",
                pace_target_hz = 0.3f,
                layout = new DrillLayout
                {
                    pattern = "service_court",
                    count = 6,
                    dx_m = 3.0f,
                    dy_m = 2.0f,
                    start_y_m = 2.0f
                },
                tolerances = new DrillTolerances
                {
                    easy = 0.30f,
                    medium = 0.25f,
                    hard = 0.20f,
                    expert = 0.15f
                }
            };
            
            AddConfig(easyTennis);
        }
        
        private void CreateFootballConfigs()
        {
            var easyFootball = new DrillConfig
            {
                id = "football_easy_01",
                sport = "football",
                difficulty = "easy",
                drill_name = "Goal Shooting Practice",
                description = "Basic goal shooting accuracy",
                pace_target_hz = 0.4f,
                layout = new DrillLayout
                {
                    pattern = "penalty_area",
                    count = 8,
                    dx_m = 2.5f,
                    dy_m = 2.0f,
                    start_y_m = 8.0f
                },
                tolerances = new DrillTolerances
                {
                    easy = 0.35f,
                    medium = 0.28f,
                    hard = 0.22f,
                    expert = 0.18f
                }
            };
            
            AddConfig(easyFootball);
        }
        
        private void AddConfig(DrillConfig config)
        {
            string key = $"{config.sport}_{config.difficulty}";
            loadedConfigs[key] = config;
        }
        
        private void OrganizeConfigsBySport()
        {
            configsBySport.Clear();
            
            foreach (var config in loadedConfigs.Values)
            {
                if (!configsBySport.ContainsKey(config.sport))
                {
                    configsBySport[config.sport] = new Dictionary<string, DrillConfig>();
                }
                
                configsBySport[config.sport][config.difficulty] = config;
            }
        }
        
        public DrillConfig GetConfig(string sport, string difficulty)
        {
            string key = $"{sport}_{difficulty}";
            if (loadedConfigs.ContainsKey(key))
            {
                return loadedConfigs[key];
            }
            
            Debug.LogWarning($"Drill configuration not found: {sport} - {difficulty}");
            return null;
        }
        
        public Dictionary<string, DrillConfig> GetConfigsForSport(string sport)
        {
            if (configsBySport.ContainsKey(sport))
            {
                return new Dictionary<string, DrillConfig>(configsBySport[sport]);
            }
            
            return new Dictionary<string, DrillConfig>();
        }
        
        public List<string> GetAvailableSports()
        {
            return new List<string>(configsBySport.Keys);
        }
        
        public List<string> GetAvailableDifficulties(string sport)
        {
            if (configsBySport.ContainsKey(sport))
            {
                return new List<string>(configsBySport[sport].Keys);
            }
            
            return new List<string>();
        }
        
        public float GetToleranceForDifficulty(DrillConfig config, string difficulty)
        {
            if (config?.tolerances == null) return 0.15f;
            
            switch (difficulty.ToLower())
            {
                case "easy": return config.tolerances.easy;
                case "medium": return config.tolerances.medium;
                case "hard": return config.tolerances.hard;
                case "expert": return config.tolerances.expert;
                default: return config.tolerances.medium;
            }
        }
        
        public SessionLog CreateSessionLog(string configId, CalibrationInfo calibrationInfo)
        {
            return new SessionLog
            {
                config_id = configId,
                timestamp_utc = System.DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                calibration = calibrationInfo,
                events = new List<BounceEvent>(),
                summary = new SessionSummary()
            };
        }
    }
    
    // Data structures for drill configuration
    [System.Serializable]
    public class DrillConfig
    {
        public string id;
        public string sport;
        public string difficulty;
        public string drill_name;
        public string description;
        public float pace_target_hz;
        public DrillLayout layout;
        public DrillTolerances tolerances;
    }
    
    [System.Serializable]
    public class DrillLayout
    {
        public string pattern;
        public int count;
        public float dx_m;
        public float dy_m;
        public float start_y_m;
    }
    
    [System.Serializable]
    public class DrillTolerances
    {
        public float easy;
        public float medium;
        public float hard;
        public float expert;
    }
    
    // Session logging data structures
    [System.Serializable]
    public class SessionLog
    {
        public string config_id;
        public string timestamp_utc;
        public CalibrationInfo calibration;
        public List<BounceEvent> events;
        public SessionSummary summary;
    }
    
    [System.Serializable]
    public class CalibrationInfo
    {
        public float[] origin_world;
        public float[] x_axis_world;
        public float[] z_axis_world;
    }
    
    [System.Serializable]
    public class BounceEvent
    {
        public int t_ms;
        public float[] bounce_world;
        public float[] bounce_court_xy;
        public int target_index;
        public float error_m;
        public bool hit;
    }
    
    [System.Serializable]
    public class SessionSummary
    {
        public int total_bounces;
        public int successful_hits;
        public float accuracy_percentage;
        public float average_error_m;
        public int max_streak;
        public float session_duration_s;
        public float average_pace_hz;
    }
}