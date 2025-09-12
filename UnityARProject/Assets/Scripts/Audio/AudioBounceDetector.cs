using System;
using System.Collections;
using UnityEngine;
using EkkalavyaAR.Utils;

namespace EkkalavyaAR.Audio
{
    public class AudioBounceDetector : MonoBehaviour
    {
        [Header("Audio Settings")]
        [SerializeField] private int sampleRate = 44100;
        [SerializeField] private int audioBufferSize = 1024;
        [SerializeField] private float updateInterval = 0.02f; // 50Hz update rate
        
        [Header("Detection Parameters")]
        [SerializeField] private float amplitudeThreshold = 0.01f;
        [SerializeField] private float spectralThreshold = 0.005f;
        [SerializeField] private float minTimeBetweenBounces = 0.1f; // 100ms cooldown
        [SerializeField] private float[] targetFrequencies = { 200f, 800f, 1600f, 3200f }; // Ball bounce frequencies
        [SerializeField] private float frequencyTolerance = 50f;
        
        [Header("Ball Type Profiles")]
        [SerializeField] private BallAudioProfile basketballProfile;
        [SerializeField] private BallAudioProfile tennisProfile;
        [SerializeField] private BallAudioProfile footballProfile;
        
        public event Action OnBounceDetected;
        public event Action<float> OnConfidenceChanged;
        public event Action<string> OnAudioError;
        
        // Properties
        public bool IsListening { get; private set; }
        public float CurrentAmplitude { get; private set; }
        public float CurrentConfidence { get; private set; }
        public string CurrentMicrophoneDevice { get; private set; }
        
        private AudioClip microphoneClip;
        private string[] availableMicrophones;
        private float[] audioBuffer;
        private float[] spectrumBuffer;
        private float lastBounceTime = -1f;
        private BallAudioProfile currentProfile;
        
        // Audio analysis
        private MathHelpers.RingBuffer<float> amplitudeHistory;
        private MathHelpers.RingBuffer<float> spectrumHistory;
        private MathHelpers.MovingAverage noiseFloor;
        
        private void Awake()
        {
            InitializeAudioProfiles();
            InitializeBuffers();
        }
        
        private void InitializeAudioProfiles()
        {
            // Basketball - hollow bounce, mid-range frequencies
            basketballProfile = new BallAudioProfile
            {
                name = "Basketball",
                primaryFrequency = 400f,
                secondaryFrequencies = new float[] { 200f, 800f, 1200f },
                amplitudeRange = new Vector2(0.01f, 0.8f),
                spectralCentroid = 600f,
                harmonicRatio = 0.3f,
                attackTime = 0.01f,
                decayTime = 0.15f
            };
            
            // Tennis Ball - higher pitched, sharper attack
            tennisProfile = new BallAudioProfile
            {
                name = "Tennis Ball",
                primaryFrequency = 800f,
                secondaryFrequencies = new float[] { 400f, 1600f, 2400f },
                amplitudeRange = new Vector2(0.005f, 0.4f),
                spectralCentroid = 1200f,
                harmonicRatio = 0.4f,
                attackTime = 0.005f,
                decayTime = 0.08f
            };
            
            // Football - lower frequencies, more thud-like
            footballProfile = new BallAudioProfile
            {
                name = "Football",
                primaryFrequency = 150f,
                secondaryFrequencies = new float[] { 100f, 300f, 600f },
                amplitudeRange = new Vector2(0.02f, 1.0f),
                spectralCentroid = 400f,
                harmonicRatio = 0.2f,
                attackTime = 0.02f,
                decayTime = 0.25f
            };
            
            // Set default profile
            currentProfile = basketballProfile;
        }
        
        private void InitializeBuffers()
        {
            audioBuffer = new float[audioBufferSize];
            spectrumBuffer = new float[audioBufferSize / 2];
            amplitudeHistory = new MathHelpers.RingBuffer<float>(100); // 2 seconds at 50Hz
            spectrumHistory = new MathHelpers.RingBuffer<float>(100);
            noiseFloor = new MathHelpers.MovingAverage(50); // 1 second of noise floor averaging
        }
        
        public void StartListening(string ballType = "basketball")
        {
            if (IsListening) return;
            
            // Set ball profile
            SetBallProfile(ballType);
            
            // Get available microphones
            availableMicrophones = Microphone.devices;
            
            if (availableMicrophones.Length == 0)
            {
                OnAudioError?.Invoke("No microphones detected");
                return;
            }
            
            // Use first available microphone
            CurrentMicrophoneDevice = availableMicrophones[0];
            
            try
            {
                // Start recording
                microphoneClip = Microphone.Start(CurrentMicrophoneDevice, true, 1, sampleRate);
                
                if (microphoneClip == null)
                {
                    OnAudioError?.Invoke("Failed to start microphone recording");
                    return;
                }
                
                IsListening = true;
                StartCoroutine(AudioAnalysisCoroutine());
                
                Debug.Log($"Audio bounce detection started with {CurrentMicrophoneDevice} for {ballType}");
            }
            catch (Exception ex)
            {
                OnAudioError?.Invoke($"Microphone error: {ex.Message}");
            }
        }
        
        public void StopListening()
        {
            if (!IsListening) return;
            
            IsListening = false;
            
            if (!string.IsNullOrEmpty(CurrentMicrophoneDevice))
            {
                Microphone.End(CurrentMicrophoneDevice);
            }
            
            if (microphoneClip != null)
            {
                Destroy(microphoneClip);
                microphoneClip = null;
            }
            
            Debug.Log("Audio bounce detection stopped");
        }
        
        public void SetBallProfile(string ballType)
        {
            switch (ballType.ToLower())
            {
                case "basketball":
                    currentProfile = basketballProfile;
                    break;
                case "tennis":
                case "tennis ball":
                    currentProfile = tennisProfile;
                    break;
                case "football":
                case "soccer":
                    currentProfile = footballProfile;
                    break;
                default:
                    currentProfile = basketballProfile;
                    Debug.LogWarning($"Unknown ball type: {ballType}, using basketball profile");
                    break;
            }
            
            Debug.Log($"Audio profile set to: {currentProfile.name}");
        }
        
        private IEnumerator AudioAnalysisCoroutine()
        {
            while (IsListening)
            {
                AnalyzeAudio();
                yield return new WaitForSeconds(updateInterval);
            }
        }
        
        private void AnalyzeAudio()
        {
            if (microphoneClip == null || !Microphone.IsRecording(CurrentMicrophoneDevice))
                return;
            
            // Get current audio data
            int micPosition = Microphone.GetPosition(CurrentMicrophoneDevice);
            if (micPosition < audioBufferSize) return;
            
            // Copy audio data to buffer
            microphoneClip.GetData(audioBuffer, micPosition - audioBufferSize);
            
            // Calculate amplitude
            float amplitude = CalculateRMSAmplitude(audioBuffer);
            CurrentAmplitude = amplitude;
            
            // Add to history
            amplitudeHistory.Add(amplitude);
            
            // Update noise floor
            if (amplitude < amplitudeThreshold * 0.5f)
            {
                noiseFloor.AddValue(amplitude);
            }
            
            // Detect potential bounce
            if (DetectBounceCandidate(amplitude))
            {
                // Perform spectral analysis
                float confidence = PerformSpectralAnalysis();
                CurrentConfidence = confidence;
                OnConfidenceChanged?.Invoke(confidence);
                
                // If confidence is high enough, register bounce
                if (confidence > 0.6f && CanDetectBounce())
                {
                    RegisterBounce();
                }
            }
        }
        
        private bool DetectBounceCandidate(float amplitude)
        {
            float noiseFloorValue = noiseFloor.GetAverage();
            float dynamicThreshold = Mathf.Max(amplitudeThreshold, noiseFloorValue * 3f);
            
            // Check if amplitude exceeds threshold
            if (amplitude < dynamicThreshold) return false;
            
            // Check for sharp attack (sudden increase)
            if (amplitudeHistory.Count < 3) return false;
            
            float prevAmplitude = amplitudeHistory.GetAt(-2);
            float amplitudeIncrease = amplitude - prevAmplitude;
            
            return amplitudeIncrease > dynamicThreshold * 0.5f;
        }
        
        private float PerformSpectralAnalysis()
        {
            // Get frequency spectrum using FFT
            AudioListener.GetSpectrumData(spectrumBuffer, 0, FFTWindow.Hanning);
            
            float confidence = 0f;
            float totalEnergy = 0f;
            float targetEnergy = 0f;
            
            // Calculate total energy and target frequency energy
            for (int i = 0; i < spectrumBuffer.Length; i++)
            {
                float frequency = i * sampleRate / (2 * spectrumBuffer.Length);
                float magnitude = spectrumBuffer[i];
                
                totalEnergy += magnitude;
                
                // Check if frequency matches ball profile
                if (IsTargetFrequency(frequency))
                {
                    targetEnergy += magnitude * GetFrequencyWeight(frequency);
                }
            }
            
            // Calculate confidence based on spectral match
            if (totalEnergy > 0f)
            {
                float spectralRatio = targetEnergy / totalEnergy;
                confidence = Mathf.Clamp01(spectralRatio * 2f); // Scale confidence
                
                // Bonus for spectral centroid match
                float spectralCentroid = CalculateSpectralCentroid();
                float centroidMatch = 1f - Mathf.Abs(spectralCentroid - currentProfile.spectralCentroid) / currentProfile.spectralCentroid;
                confidence *= Mathf.Clamp01(centroidMatch + 0.5f);
            }
            
            return confidence;
        }
        
        private bool IsTargetFrequency(float frequency)
        {
            // Check primary frequency
            if (Mathf.Abs(frequency - currentProfile.primaryFrequency) <= frequencyTolerance)
                return true;
            
            // Check secondary frequencies
            foreach (float targetFreq in currentProfile.secondaryFrequencies)
            {
                if (Mathf.Abs(frequency - targetFreq) <= frequencyTolerance)
                    return true;
            }
            
            return false;
        }
        
        private float GetFrequencyWeight(float frequency)
        {
            // Primary frequency gets highest weight
            if (Mathf.Abs(frequency - currentProfile.primaryFrequency) <= frequencyTolerance)
                return 1f;
            
            // Secondary frequencies get lower weights
            foreach (float targetFreq in currentProfile.secondaryFrequencies)
            {
                if (Mathf.Abs(frequency - targetFreq) <= frequencyTolerance)
                    return 0.7f;
            }
            
            return 0.1f;
        }
        
        private float CalculateSpectralCentroid()
        {
            float weightedSum = 0f;
            float magnitudeSum = 0f;
            
            for (int i = 1; i < spectrumBuffer.Length; i++)
            {
                float frequency = i * sampleRate / (2 * spectrumBuffer.Length);
                float magnitude = spectrumBuffer[i];
                
                weightedSum += frequency * magnitude;
                magnitudeSum += magnitude;
            }
            
            return magnitudeSum > 0f ? weightedSum / magnitudeSum : 0f;
        }
        
        private float CalculateRMSAmplitude(float[] samples)
        {
            float sum = 0f;
            foreach (float sample in samples)
            {
                sum += sample * sample;
            }
            return Mathf.Sqrt(sum / samples.Length);
        }
        
        private bool CanDetectBounce()
        {
            float currentTime = Time.time;
            return (lastBounceTime < 0f || currentTime - lastBounceTime >= minTimeBetweenBounces);
        }
        
        private void RegisterBounce()
        {
            lastBounceTime = Time.time;
            OnBounceDetected?.Invoke();
            
            Debug.Log($"Audio bounce detected! Confidence: {CurrentConfidence:F2}, Amplitude: {CurrentAmplitude:F4}");
        }
        
        public void SetSensitivity(float sensitivity)
        {
            // Sensitivity from 0.0 (low) to 1.0 (high)
            amplitudeThreshold = Mathf.Lerp(0.001f, 0.05f, 1f - sensitivity);
            spectralThreshold = Mathf.Lerp(0.001f, 0.01f, 1f - sensitivity);
            
            Debug.Log($"Audio sensitivity set to {sensitivity:F2} (threshold: {amplitudeThreshold:F4})");
        }
        
        public string[] GetAvailableMicrophones()
        {
            return Microphone.devices ?? new string[0];
        }
        
        public void SetMicrophone(string deviceName)
        {
            if (IsListening)
            {
                StopListening();
                CurrentMicrophoneDevice = deviceName;
                StartListening(currentProfile.name);
            }
            else
            {
                CurrentMicrophoneDevice = deviceName;
            }
        }
        
        private void OnDestroy()
        {
            StopListening();
        }
        
        // Audio profile data structure
        [System.Serializable]
        private class BallAudioProfile
        {
            public string name;
            public float primaryFrequency;
            public float[] secondaryFrequencies;
            public Vector2 amplitudeRange;
            public float spectralCentroid;
            public float harmonicRatio;
            public float attackTime;
            public float decayTime;
        }
    }
}