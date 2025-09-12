using UnityEngine;

namespace EkkalavyaAR.Drill
{
    public enum DrillMarkerState
    {
        Inactive,
        Active,
        Completed,
        Missed
    }
    
    public class DrillMarker : MonoBehaviour
    {
        [Header("Visual Settings")]
        [SerializeField] private float pulseSpeed = 2f;
        [SerializeField] private float pulseIntensity = 0.3f;
        [SerializeField] private Color inactiveColor = Color.gray;
        [SerializeField] private Color activeColor = Color.green;
        [SerializeField] private Color completedColor = Color.blue;
        [SerializeField] private Color missedColor = Color.red;
        
        public int Index { get; private set; }
        public Vector2 CourtPosition { get; private set; }
        public float ToleranceRadius { get; private set; }
        public DrillMarkerState CurrentState { get; private set; } = DrillMarkerState.Inactive;
        
        private Renderer markerRenderer;
        private Material markerMaterial;
        private Color baseColor;
        private float pulseTimer = 0f;
        
        public void Initialize(int index, Vector2 courtPosition, float toleranceRadius)
        {
            Index = index;
            CourtPosition = courtPosition;
            ToleranceRadius = toleranceRadius;
            
            SetupVisuals();
            SetState(DrillMarkerState.Inactive);
        }
        
        private void SetupVisuals()
        {
            markerRenderer = GetComponent<Renderer>();
            if (markerRenderer != null)
            {
                markerMaterial = markerRenderer.material;
            }
        }
        
        public void SetState(DrillMarkerState newState)
        {
            CurrentState = newState;
            
            switch (newState)
            {
                case DrillMarkerState.Inactive:
                    baseColor = inactiveColor;
                    break;
                case DrillMarkerState.Active:
                    baseColor = activeColor;
                    break;
                case DrillMarkerState.Completed:
                    baseColor = completedColor;
                    break;
                case DrillMarkerState.Missed:
                    baseColor = missedColor;
                    break;
            }
            
            UpdateVisual();
        }
        
        private void Update()
        {
            if (CurrentState == DrillMarkerState.Active)
            {
                pulseTimer += Time.deltaTime * pulseSpeed;
                UpdateVisual();
            }
        }
        
        private void UpdateVisual()
        {
            if (markerMaterial == null) return;
            
            Color currentColor = baseColor;
            
            if (CurrentState == DrillMarkerState.Active)
            {
                float pulse = (Mathf.Sin(pulseTimer) + 1f) * 0.5f;
                currentColor = Color.Lerp(baseColor, Color.white, pulse * pulseIntensity);
            }
            
            markerMaterial.color = currentColor;
        }
        
        public float GetErrorDistance(Vector2 ballPosition)
        {
            return Vector2.Distance(ballPosition, CourtPosition);
        }
        
        public bool IsWithinTolerance(Vector2 ballPosition)
        {
            return GetErrorDistance(ballPosition) <= ToleranceRadius;
        }
        
        public Vector3 GetWorldPosition()
        {
            return transform.position;
        }
    }
}