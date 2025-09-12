using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using UnityEngine.XR.ARFoundation;
using TMPro;
using EkkalavyaAR.AR;
using EkkalavyaAR.Calibration;
using EkkalavyaAR.Court;
using EkkalavyaAR.Drill;
using EkkalavyaAR.Tracking;
using EkkalavyaAR.Audio;
using EkkalavyaAR.Scoring;

namespace EkkalavyaAR.UI
{
    public class ARSessionManager : MonoBehaviour
    {
        [Header("UI Panels")]
        [SerializeField] private GameObject loadingPanel;
        [SerializeField] private GameObject planeScanPanel;
        [SerializeField] private GameObject calibrationPanel;
        [SerializeField] private GameObject drillSelectionPanel;
        [SerializeField] private GameObject gameplayPanel;
        [SerializeField] private GameObject resultsPanel;
        [SerializeField] private GameObject errorPanel;
        
        [Header("Loading UI")]
        [SerializeField] private TextMeshProUGUI loadingText;
        [SerializeField] private Slider progressBar;
        
        [Header("Drill Selection UI")]
        [SerializeField] private TMP_Dropdown sportDropdown;
        [SerializeField] private TMP_Dropdown difficultyDropdown;
        [SerializeField] private Button startDrillButton;
        
        [Header("Gameplay UI")]
        [SerializeField] private TextMeshProUGUI scoreText;
        [SerializeField] private TextMeshProUGUI accuracyText;
        [SerializeField] private TextMeshProUGUI streakText;
        [SerializeField] private TextMeshProUGUI targetText;
        [SerializeField] private Button pauseButton;
        [SerializeField] private Button exitButton;
        [SerializeField] private Slider paceSlider;
        
        [Header("Results UI")]
        [SerializeField] private TextMeshProUGUI finalScoreText;
        [SerializeField] private TextMeshProUGUI accuracyResultText;
        [SerializeField] private TextMeshProUGUI bestStreakText;
        [SerializeField] private TextMeshProUGUI avgErrorText;
        [SerializeField] private TextMeshProUGUI sessionTimeText;
        [SerializeField] private Button playAgainButton;
        [SerializeField] private Button mainMenuButton;
        
        [Header("Error UI")]
        [SerializeField] private TextMeshProUGUI errorMessageText;
        [SerializeField] private Button retryButton;
        
        // Events
        public event Action OnSessionStarted;
        public event Action OnSessionEnded;
        public event Action<string> OnSessionError;
        
        // Properties
        public SessionState CurrentState { get; private set; } = SessionState.Loading;
        public string CurrentSport { get; private set; }
        public string CurrentDifficulty { get; private set; }
        
        // Component references
        private ARBootstrap arBootstrap;
        private PlaneScanController planeScanController;
        private TwoPointCalibration calibrationController;
        private CourtGenerator courtGenerator;
        private DrillConfigLoader drillConfigLoader;
        private MarkerSpawner markerSpawner;
        private BallTracker ballTracker;
        private AudioBounceDetector audioBounceDetector;
        private BounceFusion bounceFusion;
        private ScoringEngine scoringEngine;
        
        // Session data
        private DrillConfig currentDrillConfig;
        private SessionLog sessionLog;
        private float sessionStartTime;
        private bool isPaused = false;
        
        private void Start()
        {
            InitializeComponents();
            InitializeUI();
            StartCoroutine(InitializeSession());
        }
        
        private void InitializeComponents()
        {
            // Find all required components
            arBootstrap = FindObjectOfType<ARBootstrap>();
            planeScanController = FindObjectOfType<PlaneScanController>();
            calibrationController = FindObjectOfType<TwoPointCalibration>();
            courtGenerator = FindObjectOfType<CourtGenerator>();
            drillConfigLoader = FindObjectOfType<DrillConfigLoader>();
            markerSpawner = FindObjectOfType<MarkerSpawner>();
            ballTracker = FindObjectOfType<BallTracker>();
            audioBounceDetector = FindObjectOfType<AudioBounceDetector>();
            bounceFusion = FindObjectOfType<BounceFusion>();
            scoringEngine = FindObjectOfType<ScoringEngine>();
            
            // Subscribe to events
            if (arBootstrap != null)
            {
                arBootstrap.OnARSessionReady += OnARReady;
                arBootstrap.OnARError += OnARError;
            }
            
            if (planeScanController != null)
            {
                planeScanController.OnPlaneSelected += OnPlaneSelected;
            }
            
            if (calibrationController != null)
            {
                calibrationController.OnCalibrationComplete += OnCalibrationComplete;
            }
            
            if (drillConfigLoader != null)
            {
                drillConfigLoader.OnConfigsLoaded += OnDrillConfigsLoaded;
            }
            
            if (markerSpawner != null)
            {
                markerSpawner.OnAllTargetsCompleted += OnDrillComplete;
            }
            
            if (bounceFusion != null)
            {
                bounceFusion.OnBounce += OnBounceDetected;
            }
            
            if (scoringEngine != null)
            {
                scoringEngine.OnScoreChanged += OnScoreChanged;
                scoringEngine.OnAccuracyChanged += OnAccuracyChanged;
                scoringEngine.OnStreakChanged += OnStreakChanged;
            }
        }
        
        private void InitializeUI()
        {
            // Setup dropdown options
            if (difficultyDropdown != null)
            {
                difficultyDropdown.ClearOptions();
                difficultyDropdown.AddOptions(new List<string> { "Easy", "Medium", "Hard", "Expert" });
                difficultyDropdown.value = 1; // Default to Medium
            }
            
            // Setup button listeners
            if (startDrillButton != null)
                startDrillButton.onClick.AddListener(OnStartDrillPressed);
            
            if (pauseButton != null)
                pauseButton.onClick.AddListener(OnPausePressed);
            
            if (exitButton != null)
                exitButton.onClick.AddListener(OnExitPressed);
            
            if (playAgainButton != null)
                playAgainButton.onClick.AddListener(OnPlayAgainPressed);
            
            if (mainMenuButton != null)
                mainMenuButton.onClick.AddListener(OnMainMenuPressed);
            
            if (retryButton != null)
                retryButton.onClick.AddListener(OnRetryPressed);
            
            SetState(SessionState.Loading);
        }
        
        private IEnumerator InitializeSession()
        {
            SetLoadingMessage("Initializing AR session...", 0.1f);
            yield return new WaitForSeconds(0.5f);
            
            // Wait for AR to be ready
            while (arBootstrap == null || !arBootstrap.IsARReady)
            {
                yield return new WaitForSeconds(0.1f);
            }
            
            SetLoadingMessage("Loading configurations...", 0.3f);
            
            // Load drill configurations
            if (drillConfigLoader != null)
            {
                drillConfigLoader.LoadAllConfigs();
                
                while (!drillConfigLoader.IsLoaded)
                {
                    yield return new WaitForSeconds(0.1f);
                }
            }
            
            SetLoadingMessage("Ready to start!", 1f);
            yield return new WaitForSeconds(0.5f);
            
            SetState(SessionState.PlaneScanning);
        }
        
        private void OnARReady()
        {
            Debug.Log("AR session ready");
        }
        
        private void OnARError(string error)
        {
            ShowError($"AR Error: {error}");
        }
        
        private void OnPlaneSelected(ARPlane plane)
        {
            SetState(SessionState.Calibration);
        }
        
        private void OnCalibrationComplete(Transform courtTransform)
        {
            SetState(SessionState.DrillSelection);
        }
        
        private void OnDrillConfigsLoaded(Dictionary<string, DrillConfig> configs)
        {
            // Populate sport dropdown
            if (sportDropdown != null)
            {
                sportDropdown.ClearOptions();
                var sports = new List<string>();
                
                foreach (var config in configs.Values)
                {
                    if (!sports.Contains(config.sport))
                    {
                        sports.Add(config.sport);
                    }
                }
                
                sports.Sort();
                sportDropdown.AddOptions(sports);
            }
        }
        
        private void OnStartDrillPressed()
        {
            CurrentSport = sportDropdown.options[sportDropdown.value].text;
            CurrentDifficulty = difficultyDropdown.options[difficultyDropdown.value].text;
            
            StartDrill(CurrentSport, CurrentDifficulty.ToLower());
        }
        
        private void StartDrill(string sport, string difficulty)
        {
            if (drillConfigLoader == null) return;
            
            currentDrillConfig = drillConfigLoader.GetConfig(sport, difficulty);
            if (currentDrillConfig == null)
            {
                ShowError($"Drill configuration not found for {sport} ({difficulty})");
                return;
            }
            
            // Generate court for selected sport
            if (courtGenerator != null)
            {
                courtGenerator.GenerateCourt(sport);
            }
            
            // Setup drill markers
            if (markerSpawner != null && calibrationController != null)
            {
                markerSpawner.SpawnMarkersForDrill(currentDrillConfig, calibrationController.CourtTransform);
            }
            
            // Initialize scoring engine
            if (scoringEngine != null)
            {
                scoringEngine.StartSession(currentDrillConfig);
            }
            
            // Create session log
            if (calibrationController != null)
            {
                var calibrationInfo = new CalibrationInfo
                {
                    origin_world = new float[] { 
                        calibrationController.BaselineA.x, 
                        calibrationController.BaselineA.y, 
                        calibrationController.BaselineA.z 
                    },
                    x_axis_world = new float[] { 1f, 0f, 0f },
                    z_axis_world = new float[] { 0f, 1f, 0f }
                };
                
                sessionLog = drillConfigLoader.CreateSessionLog(currentDrillConfig.id, calibrationInfo);
            }
            
            sessionStartTime = Time.time;
            SetState(SessionState.Gameplay);
            
            OnSessionStarted?.Invoke();
            
            Debug.Log($"Started drill: {sport} ({difficulty})");
        }
        
        private void OnBounceDetected(Vector2 position, long timestamp, float confidence)
        {
            if (CurrentState != SessionState.Gameplay || isPaused) return;
            
            // Get active target
            var activeTarget = markerSpawner?.GetActiveTarget();
            if (activeTarget == null) return;
            
            // Calculate error distance
            float errorDistance = activeTarget.GetErrorDistance(position);
            bool isHit = activeTarget.IsWithinTolerance(position);
            
            // Process hit with scoring engine
            if (scoringEngine != null)
            {
                scoringEngine.ProcessBounce(position, activeTarget.Index, errorDistance);
            }
            
            // Log bounce event
            if (sessionLog != null)
            {
                var bounceEvent = new BounceEvent
                {
                    t_ms = (int)(timestamp - (long)(sessionStartTime * 1000)),
                    bounce_world = new float[] { position.x, 0f, position.y },
                    bounce_court_xy = new float[] { position.x, position.y },
                    target_index = activeTarget.Index,
                    error_m = errorDistance,
                    hit = isHit
                };
                
                sessionLog.events.Add(bounceEvent);
            }
            
            // Advance target if hit
            if (isHit)
            {
                markerSpawner?.AdvanceTargetOnHit();
            }
            else
            {
                markerSpawner?.MarkTargetMissed();
            }
        }
        
        private void OnDrillComplete()
        {
            EndSession();
        }
        
        private void OnScoreChanged(int newScore)
        {
            if (scoreText != null)
                scoreText.text = $"Score: {newScore}";
        }
        
        private void OnAccuracyChanged(float newAccuracy)
        {
            if (accuracyText != null)
                accuracyText.text = $"Accuracy: {newAccuracy:P1}";
        }
        
        private void OnStreakChanged(int newStreak)
        {
            if (streakText != null)
                streakText.text = $"Streak: {newStreak}";
        }
        
        private void OnPausePressed()
        {
            isPaused = !isPaused;
            // TODO: Implement pause functionality
        }
        
        private void OnExitPressed()
        {
            EndSession();
        }
        
        private void OnPlayAgainPressed()
        {
            if (currentDrillConfig != null)
            {
                StartDrill(CurrentSport, CurrentDifficulty.ToLower());
            }
        }
        
        private void OnMainMenuPressed()
        {
            SetState(SessionState.DrillSelection);
        }
        
        private void OnRetryPressed()
        {
            SetState(SessionState.PlaneScanning);
        }
        
        private void EndSession()
        {
            // Complete session log
            if (sessionLog != null && scoringEngine != null)
            {
                sessionLog.summary = scoringEngine.GetSessionSummary();
            }
            
            // TODO: Send session log to backend
            
            SetState(SessionState.Results);
            OnSessionEnded?.Invoke();
            
            Debug.Log("Session ended");
        }
        
        private void SetState(SessionState newState)
        {
            CurrentState = newState;
            
            // Hide all panels
            loadingPanel?.SetActive(false);
            planeScanPanel?.SetActive(false);
            calibrationPanel?.SetActive(false);
            drillSelectionPanel?.SetActive(false);
            gameplayPanel?.SetActive(false);
            resultsPanel?.SetActive(false);
            errorPanel?.SetActive(false);
            
            // Show appropriate panel
            switch (newState)
            {
                case SessionState.Loading:
                    loadingPanel?.SetActive(true);
                    break;
                case SessionState.PlaneScanning:
                    planeScanPanel?.SetActive(true);
                    break;
                case SessionState.Calibration:
                    calibrationPanel?.SetActive(true);
                    break;
                case SessionState.DrillSelection:
                    drillSelectionPanel?.SetActive(true);
                    break;
                case SessionState.Gameplay:
                    gameplayPanel?.SetActive(true);
                    UpdateGameplayUI();
                    break;
                case SessionState.Results:
                    resultsPanel?.SetActive(true);
                    UpdateResultsUI();
                    break;
                case SessionState.Error:
                    errorPanel?.SetActive(true);
                    break;
            }
        }
        
        private void UpdateGameplayUI()
        {
            // Update target info
            var activeTarget = markerSpawner?.GetActiveTarget();
            if (activeTarget != null && targetText != null)
            {
                int remaining = markerSpawner.SpawnedMarkers.Count - activeTarget.Index;
                targetText.text = $"Target: {activeTarget.Index + 1} / {markerSpawner.SpawnedMarkers.Count}";
            }
        }
        
        private void UpdateResultsUI()
        {
            if (scoringEngine == null) return;
            
            var metrics = scoringEngine.CurrentMetrics;
            
            if (finalScoreText != null)
                finalScoreText.text = $"{metrics.totalScore}";
            
            if (accuracyResultText != null)
                accuracyResultText.text = $"{metrics.accuracy:P1}";
            
            if (bestStreakText != null)
                bestStreakText.text = $"{metrics.maxStreak}";
            
            if (avgErrorText != null)
                avgErrorText.text = $"{metrics.averageError:F3}m";
            
            if (sessionTimeText != null)
            {
                TimeSpan timeSpan = TimeSpan.FromSeconds(metrics.sessionDuration);
                sessionTimeText.text = $"{timeSpan:mm\\:ss}";
            }
        }
        
        private void SetLoadingMessage(string message, float progress)
        {
            if (loadingText != null)
                loadingText.text = message;
            
            if (progressBar != null)
                progressBar.value = progress;
        }
        
        private void ShowError(string message)
        {
            if (errorMessageText != null)
                errorMessageText.text = message;
            
            SetState(SessionState.Error);
            OnSessionError?.Invoke(message);
        }
        
        private void Update()
        {
            if (CurrentState == SessionState.Gameplay && !isPaused)
            {
                UpdateGameplayUI();
                
                // Update pace indicator
                if (paceSlider != null && currentDrillConfig != null)
                {
                    float targetPace = currentDrillConfig.pace_target_hz;
                    float currentPace = scoringEngine?.CurrentMetrics.averagePace ?? 0f;
                    paceSlider.value = Mathf.Clamp01(currentPace / (targetPace * 2f));
                }
            }
        }
    }
    
    public enum SessionState
    {
        Loading,
        PlaneScanning,
        Calibration,
        DrillSelection,
        Gameplay,
        Results,
        Error
    }
}