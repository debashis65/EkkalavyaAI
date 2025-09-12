using System;
using System.Collections.Generic;
using UnityEngine;
using EkkalavyaAR.Drill;
using EkkalavyaAR.Utils;

namespace EkkalavyaAR.Scoring
{
    public class ScoringEngine : MonoBehaviour
    {
        [Header("Scoring Settings")]
        [SerializeField] private int maxScore = 1000;
        [SerializeField] private float perfectHitBonus = 1.5f;
        [SerializeField] private float streakMultiplier = 1.2f;
        [SerializeField] private int minStreakForBonus = 3;
        
        [Header("Timing")]
        [SerializeField] private float optimalPaceWindow = 0.2f; // ±0.2s from target pace
        [SerializeField] private float paceToleranceWindow = 0.5f; // ±0.5s tolerance
        
        // Events
        public event Action<int> OnScoreChanged;
        public event Action<float> OnAccuracyChanged;
        public event Action<int> OnStreakChanged;
        public event Action<ScoringMetrics> OnMetricsUpdated;
        
        // Properties
        public int CurrentScore { get; private set; }
        public float CurrentAccuracy { get; private set; }
        public int CurrentStreak { get; private set; }
        public int MaxStreak { get; private set; }
        public ScoringMetrics CurrentMetrics { get; private set; }
        
        private DrillConfig currentDrill;
        private List<HitResult> hitResults = new List<HitResult>();
        private List<float> paceHistory = new List<float>();
        private float sessionStartTime;
        private float lastHitTime;
        private int totalAttempts;
        private int successfulHits;
        
        private void Start()
        {
            ResetSession();
        }
        
        public void StartSession(DrillConfig drill)
        {
            currentDrill = drill;
            ResetSession();
            sessionStartTime = Time.time;
            
            Debug.Log($"Scoring session started for drill: {drill.id}");
        }
        
        public void ResetSession()
        {
            CurrentScore = 0;
            CurrentAccuracy = 0f;
            CurrentStreak = 0;
            MaxStreak = 0;
            totalAttempts = 0;
            successfulHits = 0;
            
            hitResults.Clear();
            paceHistory.Clear();
            
            CurrentMetrics = new ScoringMetrics();
            
            OnScoreChanged?.Invoke(CurrentScore);
            OnAccuracyChanged?.Invoke(CurrentAccuracy);
            OnStreakChanged?.Invoke(CurrentStreak);
            OnMetricsUpdated?.Invoke(CurrentMetrics);
        }
        
        public void ProcessBounce(Vector2 bouncePosition, int targetIndex, float errorDistance)
        {
            if (currentDrill == null) return;
            
            totalAttempts++;
            float currentTime = Time.time;
            
            // Determine if hit was successful
            float tolerance = GetToleranceForDifficulty(currentDrill.difficulty);
            bool isHit = errorDistance <= tolerance;
            
            if (isHit)
            {
                successfulHits++;
                CurrentStreak++;
                if (CurrentStreak > MaxStreak)
                    MaxStreak = CurrentStreak;
            }
            else
            {
                CurrentStreak = 0;
            }
            
            // Calculate pace metrics
            float timeSinceLastHit = (lastHitTime > 0) ? (currentTime - lastHitTime) : 0f;
            if (timeSinceLastHit > 0)
            {
                float currentPace = 1f / timeSinceLastHit; // Hz
                paceHistory.Add(currentPace);
            }
            lastHitTime = currentTime;
            
            // Create hit result
            var hitResult = new HitResult
            {
                timestamp = currentTime - sessionStartTime,
                position = bouncePosition,
                targetIndex = targetIndex,
                errorDistance = errorDistance,
                isHit = isHit,
                tolerance = tolerance,
                timeSinceLastHit = timeSinceLastHit
            };
            
            hitResults.Add(hitResult);
            
            // Calculate scores
            int hitScore = CalculateHitScore(hitResult);
            CurrentScore += hitScore;
            
            // Update accuracy
            CurrentAccuracy = (float)successfulHits / totalAttempts;
            
            // Update metrics
            UpdateMetrics();
            
            // Fire events
            OnScoreChanged?.Invoke(CurrentScore);
            OnAccuracyChanged?.Invoke(CurrentAccuracy);
            OnStreakChanged?.Invoke(CurrentStreak);
            OnMetricsUpdated?.Invoke(CurrentMetrics);
            
            if (isHit)
            {
                Debug.Log($"Hit! Score: +{hitScore}, Total: {CurrentScore}, Streak: {CurrentStreak}, Error: {errorDistance:F3}m");
            }
            else
            {
                Debug.Log($"Miss. Error: {errorDistance:F3}m (tolerance: {tolerance:F3}m)");
            }
        }
        
        private int CalculateHitScore(HitResult hit)
        {
            if (!hit.isHit) return 0;
            
            // Base score calculation
            int baseScore = CalculateBaseScore(hit);
            
            // Apply multipliers
            float finalScore = baseScore;
            
            // Precision bonus (closer to center = higher score)
            float precisionMultiplier = CalculatePrecisionMultiplier(hit.errorDistance, hit.tolerance);
            finalScore *= precisionMultiplier;
            
            // Pace bonus
            float paceMultiplier = CalculatePaceMultiplier(hit.timeSinceLastHit);
            finalScore *= paceMultiplier;
            
            // Streak bonus
            if (CurrentStreak >= minStreakForBonus)
            {
                float streakBonus = 1f + (CurrentStreak - minStreakForBonus) * 0.1f;
                finalScore *= Mathf.Min(streakBonus, streakMultiplier);
            }
            
            // Perfect hit bonus
            if (hit.errorDistance < hit.tolerance * 0.2f) // Within 20% of tolerance center
            {
                finalScore *= perfectHitBonus;
            }
            
            return Mathf.RoundToInt(Mathf.Clamp(finalScore, 0f, maxScore * 0.1f)); // Max 10% of total score per hit
        }
        
        private int CalculateBaseScore(HitResult hit)
        {
            if (currentDrill == null) return 0;
            
            // Base score depends on drill difficulty
            switch (currentDrill.difficulty.ToLower())
            {
                case "easy": return 50;
                case "medium": return 75;
                case "hard": return 100;
                case "expert": return 150;
                default: return 75;
            }
        }
        
        private float CalculatePrecisionMultiplier(float error, float tolerance)
        {
            // Score ranges from 1.0 (at tolerance edge) to 2.0 (perfect center)
            float normalizedError = error / tolerance; // 0.0 = perfect, 1.0 = edge of tolerance
            return Mathf.Lerp(2f, 1f, normalizedError);
        }
        
        private float CalculatePaceMultiplier(float timeSinceLastHit)
        {
            if (currentDrill == null || timeSinceLastHit <= 0f) return 1f;
            
            float targetInterval = 1f / currentDrill.pace_target_hz;
            float timeDifference = Mathf.Abs(timeSinceLastHit - targetInterval);
            
            if (timeDifference <= optimalPaceWindow)
            {
                // Perfect pace bonus
                return 1.3f;
            }
            else if (timeDifference <= paceToleranceWindow)
            {
                // Good pace (linear interpolation)
                float paceScore = Mathf.Lerp(1.3f, 1f, (timeDifference - optimalPaceWindow) / (paceToleranceWindow - optimalPaceWindow));
                return paceScore;
            }
            else
            {
                // Poor pace penalty
                return 0.8f;
            }
        }
        
        private float GetToleranceForDifficulty(string difficulty)
        {
            if (currentDrill?.tolerances == null) return 0.15f;
            
            switch (difficulty.ToLower())
            {
                case "easy": return currentDrill.tolerances.easy;
                case "medium": return currentDrill.tolerances.medium;
                case "hard": return currentDrill.tolerances.hard;
                case "expert": return currentDrill.tolerances.expert;
                default: return currentDrill.tolerances.medium;
            }
        }
        
        private void UpdateMetrics()
        {
            CurrentMetrics = new ScoringMetrics
            {
                totalScore = CurrentScore,
                accuracy = CurrentAccuracy,
                currentStreak = CurrentStreak,
                maxStreak = MaxStreak,
                totalAttempts = totalAttempts,
                successfulHits = successfulHits,
                averageError = CalculateAverageError(),
                averagePace = CalculateAveragePace(),
                sessionDuration = Time.time - sessionStartTime,
                precisionRating = CalculatePrecisionRating(),
                paceRating = CalculatePaceRating(),
                consistencyRating = CalculateConsistencyRating()
            };
        }
        
        private float CalculateAverageError()
        {
            if (hitResults.Count == 0) return 0f;
            
            float totalError = 0f;
            int hitCount = 0;
            
            foreach (var result in hitResults)
            {
                if (result.isHit)
                {
                    totalError += result.errorDistance;
                    hitCount++;
                }
            }
            
            return hitCount > 0 ? totalError / hitCount : 0f;
        }
        
        private float CalculateAveragePace()
        {
            if (paceHistory.Count == 0) return 0f;
            
            float totalPace = 0f;
            foreach (float pace in paceHistory)
            {
                totalPace += pace;
            }
            
            return totalPace / paceHistory.Count;
        }
        
        private float CalculatePrecisionRating()
        {
            if (currentDrill == null || successfulHits == 0) return 0f;
            
            float averageError = CalculateAverageError();
            float tolerance = GetToleranceForDifficulty(currentDrill.difficulty);
            
            // Rating from 0-5 stars based on precision
            float precisionRatio = 1f - (averageError / tolerance);
            return Mathf.Clamp(precisionRatio * 5f, 0f, 5f);
        }
        
        private float CalculatePaceRating()
        {
            if (currentDrill == null || paceHistory.Count == 0) return 0f;
            
            float averagePace = CalculateAveragePace();
            float targetPace = currentDrill.pace_target_hz;
            float paceDeviation = Mathf.Abs(averagePace - targetPace) / targetPace;
            
            // Rating from 0-5 stars based on pace consistency
            float paceRatio = 1f - Mathf.Clamp01(paceDeviation);
            return paceRatio * 5f;
        }
        
        private float CalculateConsistencyRating()
        {
            if (hitResults.Count < 3) return 0f;
            
            // Calculate standard deviation of error distances
            var errors = new List<float>();
            foreach (var result in hitResults)
            {
                if (result.isHit)
                {
                    errors.Add(result.errorDistance);
                }
            }
            
            if (errors.Count < 3) return 0f;
            
            float standardDeviation = MathHelpers.Statistics.CalculateStandardDeviation(errors);
            float tolerance = GetToleranceForDifficulty(currentDrill.difficulty);
            
            // Lower standard deviation = higher consistency
            float consistencyRatio = 1f - Mathf.Clamp01(standardDeviation / tolerance);
            return consistencyRatio * 5f;
        }
        
        public SessionSummary GetSessionSummary()
        {
            return new SessionSummary
            {
                total_bounces = totalAttempts,
                successful_hits = successfulHits,
                accuracy_percentage = CurrentAccuracy * 100f,
                average_error_m = CalculateAverageError(),
                max_streak = MaxStreak,
                session_duration_s = Time.time - sessionStartTime,
                average_pace_hz = CalculateAveragePace()
            };
        }
        
        public List<BounceEvent> GetBounceEvents()
        {
            var events = new List<BounceEvent>();
            
            foreach (var result in hitResults)
            {
                events.Add(new BounceEvent
                {
                    t_ms = Mathf.RoundToInt(result.timestamp * 1000f),
                    bounce_world = new float[] { result.position.x, 0f, result.position.y },
                    bounce_court_xy = new float[] { result.position.x, result.position.y },
                    target_index = result.targetIndex,
                    error_m = result.errorDistance,
                    hit = result.isHit
                });
            }
            
            return events;
        }
        
        // Debug and analytics
        public void LogPerformanceStats()
        {
            Debug.Log($"=== Session Performance Stats ===");
            Debug.Log($"Score: {CurrentScore}/{maxScore}");
            Debug.Log($"Accuracy: {CurrentAccuracy:P1}");
            Debug.Log($"Max Streak: {MaxStreak}");
            Debug.Log($"Avg Error: {CalculateAverageError():F3}m");
            Debug.Log($"Avg Pace: {CalculateAveragePace():F1} Hz");
            Debug.Log($"Precision: {CalculatePrecisionRating():F1}/5 stars");
            Debug.Log($"Pace: {CalculatePaceRating():F1}/5 stars");
            Debug.Log($"Consistency: {CalculateConsistencyRating():F1}/5 stars");
        }
    }
    
    // Data structures
    [System.Serializable]
    public struct HitResult
    {
        public float timestamp;
        public Vector2 position;
        public int targetIndex;
        public float errorDistance;
        public bool isHit;
        public float tolerance;
        public float timeSinceLastHit;
    }
    
    [System.Serializable]
    public class ScoringMetrics
    {
        public int totalScore;
        public float accuracy;
        public int currentStreak;
        public int maxStreak;
        public int totalAttempts;
        public int successfulHits;
        public float averageError;
        public float averagePace;
        public float sessionDuration;
        public float precisionRating; // 0-5 stars
        public float paceRating; // 0-5 stars
        public float consistencyRating; // 0-5 stars
    }
}