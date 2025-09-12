using System;
using System.Collections.Generic;
using UnityEngine;

namespace EkkalavyaAR.Drill
{
    [System.Serializable]
    public class DrillConfig
    {
        public string id;
        public string sport;
        public DrillRequirements requirements;
        public DrillLayout layout;
        public DrillTolerance tolerance_m;
        public string difficulty;
        public DrillWeights weights;
        public float pace_target_hz;
        public RoomModeConfig roomMode; // New room mode configuration
    }
    
    [System.Serializable]
    public class DrillRequirements
    {
        public float[] min_plane_m = new float[2]; // [width, height]
        public float[] min_room_m = new float[2]; // [width, height] minimum for room mode
        public float min_ceiling_height_m = 2.2f; // Minimum ceiling height for safety
        public float min_wall_distance_m = 1.0f; // Minimum distance from walls
        public bool supports_room_mode = true; // Whether this sport supports room mode
        public string[] restricted_movements; // Movements to disable in room mode
    }
    
    [System.Serializable]
    public class RoomModeConfig
    {
        public bool enabled = true;
        public RoomSafetyConstraints safety;
        public RoomToleranceModifiers toleranceModifiers;
        public RoomPatternPreferences patternPreferences;
        public RoomAdaptiveSettings adaptive;
    }
    
    [System.Serializable]
    public class RoomSafetyConstraints
    {
        public float ceiling_clearance_m = 2.2f; // Required ceiling clearance
        public float wall_safety_margin_m = 0.3f; // Safety margin from walls
        public float max_reach_envelope_m = 1.2f; // Maximum reach envelope 
        public bool disable_jumps = false; // Disable jumping movements
        public bool disable_lateral_bursts = false; // Disable fast lateral movements
        public bool require_flatness_check = true; // Require floor flatness validation
        public float max_flatness_variance_mm = 10f; // Maximum floor variance in mm
    }
    
    [System.Serializable]
    public class RoomToleranceModifiers
    {
        public float precision_multiplier = 1.2f; // Make targets slightly more forgiving
        public float pace_reduction_factor = 0.85f; // Reduce pace by 15% for safety
        public float streak_bonus_multiplier = 1.1f; // Bonus for maintaining streaks in confined space
        public bool adaptive_difficulty = true; // Adjust difficulty based on space constraints
    }
    
    [System.Serializable]
    public class RoomPatternPreferences
    {
        public string[] preferred_patterns = { "dribble_box", "micro_ladder", "figure_8" }; // Preferred patterns for this sport
        public string fallback_pattern = "dribble_box"; // Fallback if space is too small
        public float[] pattern_weights = { 0.4f, 0.3f, 0.2f, 0.1f }; // Weighting for pattern selection
        public bool allow_wall_rebound = false; // Whether wall rebound is suitable
        public bool support_seated_mode = true; // Whether seated mode is available
    }
    
    [System.Serializable]
    public class RoomAdaptiveSettings
    {
        public float[] space_thresholds_m = { 2.25f, 4.0f, 6.25f }; // Space thresholds for micro/small/medium modes
        public string[] threshold_patterns = { "seated_control", "dribble_box", "micro_ladder" }; // Patterns for each threshold
        public float scaling_factor = 1.0f; // Scaling factor for this sport in rooms
        public bool auto_select_pattern = true; // Automatically select best pattern for space
        public float fatigue_consideration = 1.0f; // Fatigue factor (higher = more rest needed)
    }
    
    [System.Serializable]
    public class DrillLayout
    {
        public string pattern;
        public float dx_m;
        public float dy_m;
        public int count;
        public float start_y_m;
    }
    
    [System.Serializable]
    public class DrillTolerance
    {
        public float easy;
        public float medium;
        public float hard;
        public float expert;
    }
    
    [System.Serializable]
    public class DrillWeights
    {
        public float precision;
        public float pace;
        public float streak;
    }
    
    [System.Serializable]
    public class SessionLog
    {
        public long ts_unix;
        public DeviceInfo device;
        public CalibrationInfo calibration;
        public string drill_id;
        public List<BounceEvent> events;
        public SessionSummary summary;
    }
    
    [System.Serializable]
    public class DeviceInfo
    {
        public string model;
        public string platform;
    }
    
    [System.Serializable]
    public class CalibrationInfo
    {
        public float[] origin_world = new float[3];
        public float[] x_axis_world = new float[3];
        public float[] z_axis_world = new float[3];
    }
    
    [System.Serializable]
    public class BounceEvent
    {
        public int t_ms;
        public float[] bounce_world = new float[3];
        public float[] bounce_court_xy = new float[2];
        public int target_index;
        public float error_m;
        public bool hit;
    }
    
    [System.Serializable]
    public class SessionSummary
    {
        public int score;
        public float hit_pct;
        public float avg_error_m;
        public float pace_hz;
        public int streak_max;
    }
    
    public class DrillConfigLoader : MonoBehaviour
    {
        [Header("Configuration")]
        [SerializeField] private TextAsset[] drillConfigFiles;
        [SerializeField] private bool loadOnStart = true;
        
        // Events
        public event Action<Dictionary<string, DrillConfig>> OnConfigsLoaded;
        public event Action<string> OnConfigLoadError;
        
        // Properties
        public Dictionary<string, DrillConfig> LoadedConfigs { get; private set; } = new Dictionary<string, DrillConfig>();
        public bool IsLoaded { get; private set; }
        
        // All 54+ sports drill configurations
        private readonly string[] ALL_SPORTS = {
            "basketball", "archery", "football", "cricket", "swimming", "athletics", 
            "volleyball", "tennis", "badminton", "squash", "gymnastics", "yoga", 
            "table_tennis", "cycling", "long_jump", "high_jump", "pole_vault", "hurdle", 
            "boxing", "shotput_throw", "discus_throw", "javelin_throw", "hockey", 
            "wrestling", "judo", "weightlifting", "karate", "skating", "ice_skating", 
            "golf", "kabaddi", "kho_kho",
            // Para sports
            "para_archery", "para_swimming", "para_basketball", "para_football", 
            "para_cricket", "para_athletics", "para_tennis", "para_badminton", 
            "para_volleyball", "para_table_tennis", "para_boxing", "para_wrestling", 
            "para_judo", "para_weightlifting", "para_cycling", "para_skating", 
            "wheelchair_basketball", "wheelchair_tennis", "wheelchair_racing", 
            "blind_football", "goalball", "sitting_volleyball"
        };
        
        private void Start()
        {
            if (loadOnStart)
            {
                LoadAllConfigs();
            }
        }
        
        public void LoadAllConfigs()
        {
            try
            {
                LoadedConfigs.Clear();
                
                // Load from TextAsset files first
                if (drillConfigFiles != null)
                {
                    foreach (var configFile in drillConfigFiles)
                    {
                        LoadConfigFromTextAsset(configFile);
                    }
                }
                
                // Generate default configs for all sports
                GenerateDefaultConfigs();
                
                IsLoaded = true;
                OnConfigsLoaded?.Invoke(LoadedConfigs);
                
                Debug.Log($"Loaded {LoadedConfigs.Count} drill configurations");
            }
            catch (Exception ex)
            {
                Debug.LogError($"Failed to load drill configs: {ex.Message}");
                OnConfigLoadError?.Invoke(ex.Message);
            }
        }
        
        private void LoadConfigFromTextAsset(TextAsset configFile)
        {
            try
            {
                DrillConfig config = JsonUtility.FromJson<DrillConfig>(configFile.text);
                LoadedConfigs[config.id] = config;
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"Failed to parse config file {configFile.name}: {ex.Message}");
            }
        }
        
        private void GenerateDefaultConfigs()
        {
            foreach (string sport in ALL_SPORTS)
            {
                string configId = $"{sport}_precision_v1";
                
                if (!LoadedConfigs.ContainsKey(configId))
                {
                    DrillConfig config = GenerateDefaultConfigForSport(sport);
                    LoadedConfigs[configId] = config;
                }
            }
        }
        
        private DrillConfig GenerateDefaultConfigForSport(string sport)
        {
            var config = new DrillConfig
            {
                id = $"{sport}_precision_v1",
                sport = sport,
                difficulty = "medium",
                pace_target_hz = 2.2f
            };
            
            // Set sport-specific requirements and layout
            SetSportSpecificConfig(config, sport);
            
            // Set default tolerance
            config.tolerance_m = new DrillTolerance
            {
                easy = 0.30f,
                medium = 0.20f,
                hard = 0.10f,
                expert = 0.05f
            };
            
            // Set default weights
            config.weights = new DrillWeights
            {
                precision = 0.6f,
                pace = 0.3f,
                streak = 0.1f
            };
            
            return config;
        }
        
        private void SetSportSpecificConfig(DrillConfig config, string sport)
        {
            switch (sport)
            {
                case "basketball":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 8.0f, 6.0f },
                        min_room_m = new float[] { 2.2f, 2.2f },
                        min_ceiling_height_m = 2.5f,
                        min_wall_distance_m = 1.2f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { "overhead_shots", "jump_shots" }
                    };
                    config.layout = new DrillLayout { pattern = "zigzag", dx_m = 1.5f, dy_m = 1.2f, count = 8, start_y_m = 2.0f };
                    config.roomMode = CreateBasketballRoomConfig();
                    break;
                    
                case "tennis":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 12.0f, 8.0f },
                        min_room_m = new float[] { 2.4f, 2.0f },
                        min_ceiling_height_m = 2.3f,
                        min_wall_distance_m = 1.5f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { "overhead_serves", "high_volleys" }
                    };
                    config.layout = new DrillLayout { pattern = "baseline", dx_m = 2.0f, dy_m = 1.0f, count = 6, start_y_m = 1.0f };
                    config.roomMode = CreateRacquetSportRoomConfig("tennis");
                    break;
                    
                case "football":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 15.0f, 10.0f },
                        min_room_m = new float[] { 2.5f, 2.5f },
                        min_ceiling_height_m = 2.4f,
                        min_wall_distance_m = 1.5f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { "high_kicks", "headers", "long_passes" }
                    };
                    config.layout = new DrillLayout { pattern = "penalty_area", dx_m = 2.5f, dy_m = 2.0f, count = 6, start_y_m = 3.0f };
                    config.roomMode = CreateBallSportRoomConfig("football");
                    break;
                    
                case "volleyball":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 9.0f, 6.0f },
                        min_room_m = new float[] { 2.0f, 2.0f },
                        min_ceiling_height_m = 2.6f,
                        min_wall_distance_m = 1.0f,
                        supports_room_mode = false, // Too much overhead movement
                        restricted_movements = new string[] { "spikes", "serves", "blocks" }
                    };
                    config.layout = new DrillLayout { pattern = "net_line", dx_m = 1.8f, dy_m = 1.5f, count = 6, start_y_m = 1.5f };
                    config.roomMode = CreateOverheadSportRoomConfig("volleyball");
                    break;
                    
                case "badminton":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 7.0f, 4.0f },
                        min_room_m = new float[] { 2.0f, 2.0f },
                        min_ceiling_height_m = 2.5f,
                        min_wall_distance_m = 1.0f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { "overhead_clears", "high_serves" }
                    };
                    config.layout = new DrillLayout { pattern = "service_court", dx_m = 1.3f, dy_m = 1.0f, count = 4, start_y_m = 1.0f };
                    config.roomMode = CreateRacquetSportRoomConfig("badminton");
                    break;
                    
                case "archery":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 30.0f, 5.0f },
                        min_room_m = new float[] { 1.5f, 1.5f },
                        min_ceiling_height_m = 2.2f,
                        min_wall_distance_m = 1.5f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { } // Archery is well-suited for rooms
                    };
                    config.layout = new DrillLayout { pattern = "target_distance", dx_m = 5.0f, dy_m = 1.0f, count = 6, start_y_m = 2.5f };
                    config.roomMode = CreatePrecisionSportRoomConfig("archery");
                    break;
                    
                case "swimming":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 25.0f, 12.0f },
                        min_room_m = new float[] { 2.0f, 1.5f },
                        min_ceiling_height_m = 2.0f,
                        min_wall_distance_m = 0.5f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { "diving", "flip_turns" } // Dry-land training
                    };
                    config.layout = new DrillLayout { pattern = "lane_markers", dx_m = 5.0f, dy_m = 2.5f, count = 8, start_y_m = 2.5f };
                    config.roomMode = CreateEnduranceSportRoomConfig("swimming");
                    break;
                    
                case "cricket":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 12.0f, 8.0f },
                        min_room_m = new float[] { 2.2f, 2.2f },
                        min_ceiling_height_m = 2.4f,
                        min_wall_distance_m = 1.2f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { "bowling", "big_hits", "fielding" }
                    };
                    config.layout = new DrillLayout { pattern = "wicket_line", dx_m = 2.0f, dy_m = 1.5f, count = 6, start_y_m = 2.0f };
                    config.roomMode = CreateBallSportRoomConfig("cricket");
                    break;
                    
                case "athletics":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 20.0f, 8.0f },
                        min_room_m = new float[] { 2.0f, 2.0f },
                        min_ceiling_height_m = 2.2f,
                        min_wall_distance_m = 1.0f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { "throwing", "jumping", "sprinting" }
                    };
                    config.layout = new DrillLayout { pattern = "track_marks", dx_m = 3.0f, dy_m = 2.0f, count = 8, start_y_m = 2.0f };
                    config.roomMode = CreateEnduranceSportRoomConfig("athletics");
                    break;
                    
                case "boxing":
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 6.0f, 6.0f },
                        min_room_m = new float[] { 2.2f, 2.2f },
                        min_ceiling_height_m = 2.3f,
                        min_wall_distance_m = 1.0f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { } // Boxing works well in confined spaces
                    };
                    config.layout = new DrillLayout { pattern = "ring_corners", dx_m = 1.5f, dy_m = 1.5f, count = 4, start_y_m = 1.5f };
                    config.roomMode = CreateCombatSportRoomConfig("boxing");
                    break;
                    
                default:
                    // Default configuration for any sport not explicitly defined
                    config.requirements = new DrillRequirements { 
                        min_plane_m = new float[] { 6.0f, 4.0f },
                        min_room_m = new float[] { 2.0f, 2.0f },
                        min_ceiling_height_m = 2.2f,
                        min_wall_distance_m = 1.0f,
                        supports_room_mode = true,
                        restricted_movements = new string[] { }
                    };
                    config.layout = new DrillLayout { pattern = "grid", dx_m = 1.5f, dy_m = 1.5f, count = 6, start_y_m = 2.0f };
                    config.roomMode = CreateDefaultRoomConfig();
                    break;
            }
            
            // Adjust for para sports
            if (sport.StartsWith("para_") || sport.StartsWith("wheelchair_") || sport.Contains("blind_"))
            {
                // Para sports typically need more accessible spacing
                config.layout.dx_m *= 1.3f;
                config.layout.dy_m *= 1.3f;
                config.tolerance_m = new DrillTolerance
                {
                    easy = 0.40f,
                    medium = 0.25f,
                    hard = 0.15f,
                    expert = 0.08f
                };
                
                // Para sports room mode adjustments
                if (config.roomMode != null)
                {
                    config.roomMode.toleranceModifiers.precision_multiplier = 1.4f; // More forgiving
                    config.roomMode.toleranceModifiers.pace_reduction_factor = 0.7f; // Slower pace
                    config.roomMode.adaptive.fatigue_consideration = 1.5f; // More rest consideration
                    config.roomMode.patternPreferences.support_seated_mode = true; // Always support seated
                    config.roomMode.safety.wall_safety_margin_m = 0.5f; // Larger safety margin
                }
            }
        }
        
        public DrillConfig GetConfig(string sport, string difficulty = "medium")
        {
            string configId = $"{sport}_precision_v1";
            
            if (LoadedConfigs.TryGetValue(configId, out DrillConfig config))
            {
                // Clone and adjust for difficulty
                DrillConfig adjustedConfig = JsonUtility.FromJson<DrillConfig>(JsonUtility.ToJson(config));
                adjustedConfig.difficulty = difficulty;
                return adjustedConfig;
            }
            
            Debug.LogWarning($"Config not found for sport: {sport}");
            return null;
        }
        
        public List<string> GetSupportedSports()
        {
            return new List<string>(ALL_SPORTS);
        }
        
        public float GetToleranceForDifficulty(DrillConfig config, string difficulty)
        {
            switch (difficulty.ToLower())
            {
                case "easy": return config.tolerance_m.easy;
                case "medium": return config.tolerance_m.medium;
                case "hard": return config.tolerance_m.hard;
                case "expert": return config.tolerance_m.expert;
                default: return config.tolerance_m.medium;
            }
        }
        
        public SessionLog CreateSessionLog(string drillId, CalibrationInfo calibration)
        {
            return new SessionLog
            {
                ts_unix = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                device = new DeviceInfo
                {
                    model = SystemInfo.deviceModel,
                    platform = Application.platform.ToString()
                },
                calibration = calibration,
                drill_id = drillId,
                events = new List<BounceEvent>(),
                summary = new SessionSummary()
            };
        }
        
        // === ROOM MODE CONFIG CREATORS ===
        
        private RoomModeConfig CreateBasketballRoomConfig()
        {
            return new RoomModeConfig
            {
                enabled = true,
                safety = new RoomSafetyConstraints
                {
                    ceiling_clearance_m = 2.5f,
                    wall_safety_margin_m = 0.4f,
                    max_reach_envelope_m = 1.2f,
                    disable_jumps = true,
                    disable_lateral_bursts = true,
                    require_flatness_check = true,
                    max_flatness_variance_mm = 8f
                },
                toleranceModifiers = new RoomToleranceModifiers
                {
                    precision_multiplier = 1.3f,
                    pace_reduction_factor = 0.8f,
                    streak_bonus_multiplier = 1.2f,
                    adaptive_difficulty = true
                },
                patternPreferences = new RoomPatternPreferences
                {
                    preferred_patterns = new string[] { "dribble_box", "figure_8", "micro_ladder" },
                    fallback_pattern = "dribble_box",
                    pattern_weights = new float[] { 0.5f, 0.3f, 0.2f },
                    allow_wall_rebound = true,
                    support_seated_mode = true
                },
                adaptive = new RoomAdaptiveSettings
                {
                    space_thresholds_m = new float[] { 2.25f, 4.0f, 6.25f },
                    threshold_patterns = new string[] { "seated_control", "dribble_box", "micro_ladder" },
                    scaling_factor = 0.9f,
                    auto_select_pattern = true,
                    fatigue_consideration = 1.1f
                }
            };
        }
        
        private RoomModeConfig CreateRacquetSportRoomConfig(string sport)
        {
            bool isOverhead = sport == "tennis" || sport == "badminton";
            
            return new RoomModeConfig
            {
                enabled = true,
                safety = new RoomSafetyConstraints
                {
                    ceiling_clearance_m = isOverhead ? 2.5f : 2.2f,
                    wall_safety_margin_m = 0.3f,
                    max_reach_envelope_m = 1.0f,
                    disable_jumps = isOverhead,
                    disable_lateral_bursts = false,
                    require_flatness_check = true,
                    max_flatness_variance_mm = 10f
                },
                toleranceModifiers = new RoomToleranceModifiers
                {
                    precision_multiplier = 1.2f,
                    pace_reduction_factor = 0.85f,
                    streak_bonus_multiplier = 1.1f,
                    adaptive_difficulty = true
                },
                patternPreferences = new RoomPatternPreferences
                {
                    preferred_patterns = new string[] { "figure_8", "micro_ladder", "dribble_box" },
                    fallback_pattern = "figure_8",
                    pattern_weights = new float[] { 0.4f, 0.35f, 0.25f },
                    allow_wall_rebound = sport == "tennis", // Tennis benefits from wall practice
                    support_seated_mode = true
                },
                adaptive = new RoomAdaptiveSettings
                {
                    space_thresholds_m = new float[] { 2.0f, 3.5f, 5.0f },
                    threshold_patterns = new string[] { "seated_control", "figure_8", "micro_ladder" },
                    scaling_factor = 0.95f,
                    auto_select_pattern = true,
                    fatigue_consideration = 1.0f
                }
            };
        }
        
        private RoomModeConfig CreateBallSportRoomConfig(string sport)
        {
            bool isFootball = sport == "football";
            
            return new RoomModeConfig
            {
                enabled = true,
                safety = new RoomSafetyConstraints
                {
                    ceiling_clearance_m = isFootball ? 2.4f : 2.3f,
                    wall_safety_margin_m = 0.4f,
                    max_reach_envelope_m = 1.3f,
                    disable_jumps = true,
                    disable_lateral_bursts = true,
                    require_flatness_check = true,
                    max_flatness_variance_mm = 12f
                },
                toleranceModifiers = new RoomToleranceModifiers
                {
                    precision_multiplier = 1.4f, // More forgiving for ball control
                    pace_reduction_factor = 0.75f,
                    streak_bonus_multiplier = 1.3f,
                    adaptive_difficulty = true
                },
                patternPreferences = new RoomPatternPreferences
                {
                    preferred_patterns = new string[] { "dribble_box", "figure_8", "micro_ladder" },
                    fallback_pattern = "dribble_box",
                    pattern_weights = new float[] { 0.6f, 0.25f, 0.15f },
                    allow_wall_rebound = sport == "football", // Football wall passing
                    support_seated_mode = true
                },
                adaptive = new RoomAdaptiveSettings
                {
                    space_thresholds_m = new float[] { 2.5f, 4.0f, 6.0f },
                    threshold_patterns = new string[] { "seated_control", "dribble_box", "figure_8" },
                    scaling_factor = 0.85f,
                    auto_select_pattern = true,
                    fatigue_consideration = 1.2f
                }
            };
        }
        
        private RoomModeConfig CreateOverheadSportRoomConfig(string sport)
        {
            return new RoomModeConfig
            {
                enabled = false, // Most overhead sports disabled in rooms by default
                safety = new RoomSafetyConstraints
                {
                    ceiling_clearance_m = 2.8f, // High clearance needed
                    wall_safety_margin_m = 0.5f,
                    max_reach_envelope_m = 1.5f,
                    disable_jumps = true,
                    disable_lateral_bursts = true,
                    require_flatness_check = true,
                    max_flatness_variance_mm = 8f
                },
                toleranceModifiers = new RoomToleranceModifiers
                {
                    precision_multiplier = 1.5f, // Very forgiving due to constraints
                    pace_reduction_factor = 0.6f, // Much slower
                    streak_bonus_multiplier = 1.4f,
                    adaptive_difficulty = true
                },
                patternPreferences = new RoomPatternPreferences
                {
                    preferred_patterns = new string[] { "seated_control", "micro_ladder" },
                    fallback_pattern = "seated_control",
                    pattern_weights = new float[] { 0.7f, 0.3f },
                    allow_wall_rebound = false,
                    support_seated_mode = true
                },
                adaptive = new RoomAdaptiveSettings
                {
                    space_thresholds_m = new float[] { 2.0f, 3.0f, 4.0f },
                    threshold_patterns = new string[] { "seated_control", "seated_control", "micro_ladder" },
                    scaling_factor = 0.7f,
                    auto_select_pattern = true,
                    fatigue_consideration = 1.4f
                }
            };
        }
        
        private RoomModeConfig CreatePrecisionSportRoomConfig(string sport)
        {
            return new RoomModeConfig
            {
                enabled = true,
                safety = new RoomSafetyConstraints
                {
                    ceiling_clearance_m = 2.2f,
                    wall_safety_margin_m = 0.2f,
                    max_reach_envelope_m = 0.8f,
                    disable_jumps = false,
                    disable_lateral_bursts = false,
                    require_flatness_check = true,
                    max_flatness_variance_mm = 5f // High precision needs flat surface
                },
                toleranceModifiers = new RoomToleranceModifiers
                {
                    precision_multiplier = 1.0f, // Keep precision standards high
                    pace_reduction_factor = 0.95f, // Minimal pace reduction
                    streak_bonus_multiplier = 1.1f,
                    adaptive_difficulty = false // Fixed difficulty for precision
                },
                patternPreferences = new RoomPatternPreferences
                {
                    preferred_patterns = new string[] { "micro_ladder", "figure_8", "seated_control" },
                    fallback_pattern = "seated_control",
                    pattern_weights = new float[] { 0.4f, 0.35f, 0.25f },
                    allow_wall_rebound = false,
                    support_seated_mode = true
                },
                adaptive = new RoomAdaptiveSettings
                {
                    space_thresholds_m = new float[] { 1.5f, 2.5f, 3.5f },
                    threshold_patterns = new string[] { "seated_control", "micro_ladder", "figure_8" },
                    scaling_factor = 1.0f, // No scaling for precision sports
                    auto_select_pattern = true,
                    fatigue_consideration = 0.8f // Less fatigue consideration
                }
            };
        }
        
        private RoomModeConfig CreateEnduranceSportRoomConfig(string sport)
        {
            return new RoomModeConfig
            {
                enabled = true,
                safety = new RoomSafetyConstraints
                {
                    ceiling_clearance_m = 2.2f,
                    wall_safety_margin_m = 0.3f,
                    max_reach_envelope_m = 1.0f,
                    disable_jumps = sport != "swimming", // Swimming dry-land can include jumps
                    disable_lateral_bursts = false,
                    require_flatness_check = true,
                    max_flatness_variance_mm = 15f
                },
                toleranceModifiers = new RoomToleranceModifiers
                {
                    precision_multiplier = 1.3f,
                    pace_reduction_factor = 0.9f, // Focus on endurance over speed
                    streak_bonus_multiplier = 1.2f,
                    adaptive_difficulty = true
                },
                patternPreferences = new RoomPatternPreferences
                {
                    preferred_patterns = new string[] { "micro_ladder", "figure_8", "dribble_box" },
                    fallback_pattern = "micro_ladder",
                    pattern_weights = new float[] { 0.5f, 0.3f, 0.2f },
                    allow_wall_rebound = false,
                    support_seated_mode = true
                },
                adaptive = new RoomAdaptiveSettings
                {
                    space_thresholds_m = new float[] { 2.0f, 3.5f, 5.0f },
                    threshold_patterns = new string[] { "seated_control", "micro_ladder", "figure_8" },
                    scaling_factor = 0.9f,
                    auto_select_pattern = true,
                    fatigue_consideration = 1.3f // Higher fatigue consideration for endurance
                }
            };
        }
        
        private RoomModeConfig CreateCombatSportRoomConfig(string sport)
        {
            return new RoomModeConfig
            {
                enabled = true,
                safety = new RoomSafetyConstraints
                {
                    ceiling_clearance_m = 2.3f,
                    wall_safety_margin_m = 0.4f,
                    max_reach_envelope_m = 1.1f,
                    disable_jumps = false,
                    disable_lateral_bursts = false, // Combat sports need lateral movement
                    require_flatness_check = true,
                    max_flatness_variance_mm = 10f
                },
                toleranceModifiers = new RoomToleranceModifiers
                {
                    precision_multiplier = 1.1f,
                    pace_reduction_factor = 0.9f,
                    streak_bonus_multiplier = 1.2f,
                    adaptive_difficulty = true
                },
                patternPreferences = new RoomPatternPreferences
                {
                    preferred_patterns = new string[] { "figure_8", "dribble_box", "micro_ladder" },
                    fallback_pattern = "figure_8",
                    pattern_weights = new float[] { 0.4f, 0.35f, 0.25f },
                    allow_wall_rebound = false,
                    support_seated_mode = true
                },
                adaptive = new RoomAdaptiveSettings
                {
                    space_thresholds_m = new float[] { 2.2f, 3.5f, 5.0f },
                    threshold_patterns = new string[] { "seated_control", "figure_8", "dribble_box" },
                    scaling_factor = 0.95f,
                    auto_select_pattern = true,
                    fatigue_consideration = 1.1f
                }
            };
        }
        
        private RoomModeConfig CreateDefaultRoomConfig()
        {
            return new RoomModeConfig
            {
                enabled = true,
                safety = new RoomSafetyConstraints
                {
                    ceiling_clearance_m = 2.2f,
                    wall_safety_margin_m = 0.3f,
                    max_reach_envelope_m = 1.0f,
                    disable_jumps = false,
                    disable_lateral_bursts = false,
                    require_flatness_check = true,
                    max_flatness_variance_mm = 10f
                },
                toleranceModifiers = new RoomToleranceModifiers
                {
                    precision_multiplier = 1.2f,
                    pace_reduction_factor = 0.85f,
                    streak_bonus_multiplier = 1.1f,
                    adaptive_difficulty = true
                },
                patternPreferences = new RoomPatternPreferences
                {
                    preferred_patterns = new string[] { "dribble_box", "micro_ladder", "figure_8" },
                    fallback_pattern = "dribble_box",
                    pattern_weights = new float[] { 0.4f, 0.3f, 0.3f },
                    allow_wall_rebound = false,
                    support_seated_mode = true
                },
                adaptive = new RoomAdaptiveSettings
                {
                    space_thresholds_m = new float[] { 2.25f, 4.0f, 6.25f },
                    threshold_patterns = new string[] { "seated_control", "dribble_box", "micro_ladder" },
                    scaling_factor = 1.0f,
                    auto_select_pattern = true,
                    fatigue_consideration = 1.0f
                }
            };
        }
    }
}