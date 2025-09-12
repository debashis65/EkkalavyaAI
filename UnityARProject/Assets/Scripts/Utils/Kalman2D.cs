using UnityEngine;

namespace EkkalavyaAR.Utils
{
    public class Kalman2D
    {
        // State vector: [x, y, vx, vy] (position and velocity)
        private Vector4 state;
        
        // Error covariance matrix (4x4)
        private Matrix4x4 P;
        
        // Process noise covariance
        private Matrix4x4 Q;
        
        // Measurement noise covariance  
        private Matrix4x4 R;
        
        // State transition matrix
        private Matrix4x4 F;
        
        // Measurement matrix
        private Matrix4x4 H;
        
        private float processNoise;
        private float measurementNoise;
        private float deltaTime;
        private bool initialized = false;
        
        public Kalman2D(float processNoise = 0.01f, float measurementNoise = 0.1f)
        {
            this.processNoise = processNoise;
            this.measurementNoise = measurementNoise;
            
            InitializeMatrices();
        }
        
        private void InitializeMatrices()
        {
            // Initialize state transition matrix F
            // F = [[1, 0, dt, 0],
            //      [0, 1, 0, dt],
            //      [0, 0, 1, 0],
            //      [0, 0, 0, 1]]
            F = Matrix4x4.identity;
            
            // Initialize measurement matrix H  
            // H = [[1, 0, 0, 0],
            //      [0, 1, 0, 0],
            //      [0, 0, 0, 0],
            //      [0, 0, 0, 0]]
            H = Matrix4x4.zero;
            H[0, 0] = 1f; // Measure x position
            H[1, 1] = 1f; // Measure y position
            
            // Initialize process noise covariance Q
            Q = Matrix4x4.zero;
            
            // Initialize measurement noise covariance R
            R = Matrix4x4.zero;
            R[0, 0] = measurementNoise;
            R[1, 1] = measurementNoise;
            
            // Initialize error covariance P
            P = Matrix4x4.identity;
            P *= 1000f; // Large initial uncertainty
        }
        
        public void Initialize(Vector2 initialPosition, Vector2 initialVelocity = default)
        {
            state = new Vector4(initialPosition.x, initialPosition.y, initialVelocity.x, initialVelocity.y);
            initialized = true;
        }
        
        public void Update(Vector2 measurement)
        {
            if (!initialized)
            {
                Initialize(measurement);
                return;
            }
            
            deltaTime = Time.deltaTime;
            UpdateMatricesWithDeltaTime();
            
            // Prediction step
            Predict();
            
            // Update step
            UpdateWithMeasurement(measurement);
        }
        
        private void UpdateMatricesWithDeltaTime()
        {
            // Update state transition matrix with current delta time
            F[0, 2] = deltaTime; // x += vx * dt
            F[1, 3] = deltaTime; // y += vy * dt
            
            // Update process noise covariance Q
            float dt2 = deltaTime * deltaTime;
            float dt3 = dt2 * deltaTime;
            float dt4 = dt3 * deltaTime;
            
            Q[0, 0] = dt4 / 4f * processNoise;
            Q[0, 2] = dt3 / 2f * processNoise;
            Q[1, 1] = dt4 / 4f * processNoise;
            Q[1, 3] = dt3 / 2f * processNoise;
            Q[2, 0] = dt3 / 2f * processNoise;
            Q[2, 2] = dt2 * processNoise;
            Q[3, 1] = dt3 / 2f * processNoise;
            Q[3, 3] = dt2 * processNoise;
        }
        
        private void Predict()
        {
            // Predict state: x = F * x
            state = MultiplyMatrixVector(F, state);
            
            // Predict error covariance: P = F * P * F^T + Q
            P = MultiplyMatrices(F, P);
            P = MultiplyMatrices(P, Transpose(F));
            P = AddMatrices(P, Q);
        }
        
        private void UpdateWithMeasurement(Vector2 measurement)
        {
            // Innovation (measurement residual): y = z - H * x
            Vector4 expectedMeasurement = MultiplyMatrixVector(H, state);
            Vector4 innovation = new Vector4(
                measurement.x - expectedMeasurement.x,
                measurement.y - expectedMeasurement.y,
                0f, 0f
            );
            
            // Innovation covariance: S = H * P * H^T + R
            Matrix4x4 HT = Transpose(H);
            Matrix4x4 S = MultiplyMatrices(H, P);
            S = MultiplyMatrices(S, HT);
            S = AddMatrices(S, R);
            
            // Kalman gain: K = P * H^T * S^-1
            Matrix4x4 K = MultiplyMatrices(P, HT);
            K = MultiplyMatrices(K, Inverse(S));
            
            // Update state: x = x + K * y
            Vector4 correction = MultiplyMatrixVector(K, innovation);
            state = AddVectors(state, correction);
            
            // Update error covariance: P = (I - K * H) * P
            Matrix4x4 KH = MultiplyMatrices(K, H);
            Matrix4x4 I_KH = SubtractMatrices(Matrix4x4.identity, KH);
            P = MultiplyMatrices(I_KH, P);
        }
        
        public Vector2 GetPosition()
        {
            return new Vector2(state.x, state.y);
        }
        
        public Vector2 GetVelocity()
        {
            return new Vector2(state.z, state.w);
        }
        
        public Vector2 GetPrediction(float futureTime = 0f)
        {
            if (futureTime <= 0f) return GetPosition();
            
            Vector2 currentPos = GetPosition();
            Vector2 currentVel = GetVelocity();
            
            return currentPos + currentVel * futureTime;
        }
        
        public void Reset()
        {
            initialized = false;
            state = Vector4.zero;
            InitializeMatrices();
        }
        
        // Matrix operations (Unity doesn't provide all we need)
        private Matrix4x4 MultiplyMatrices(Matrix4x4 a, Matrix4x4 b)
        {
            Matrix4x4 result = new Matrix4x4();
            
            for (int i = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    float sum = 0f;
                    for (int k = 0; k < 4; k++)
                    {
                        sum += a[i, k] * b[k, j];
                    }
                    result[i, j] = sum;
                }
            }
            
            return result;
        }
        
        private Vector4 MultiplyMatrixVector(Matrix4x4 m, Vector4 v)
        {
            return new Vector4(
                m[0, 0] * v.x + m[0, 1] * v.y + m[0, 2] * v.z + m[0, 3] * v.w,
                m[1, 0] * v.x + m[1, 1] * v.y + m[1, 2] * v.z + m[1, 3] * v.w,
                m[2, 0] * v.x + m[2, 1] * v.y + m[2, 2] * v.z + m[2, 3] * v.w,
                m[3, 0] * v.x + m[3, 1] * v.y + m[3, 2] * v.z + m[3, 3] * v.w
            );
        }
        
        private Matrix4x4 AddMatrices(Matrix4x4 a, Matrix4x4 b)
        {
            Matrix4x4 result = new Matrix4x4();
            
            for (int i = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    result[i, j] = a[i, j] + b[i, j];
                }
            }
            
            return result;
        }
        
        private Matrix4x4 SubtractMatrices(Matrix4x4 a, Matrix4x4 b)
        {
            Matrix4x4 result = new Matrix4x4();
            
            for (int i = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    result[i, j] = a[i, j] - b[i, j];
                }
            }
            
            return result;
        }
        
        private Vector4 AddVectors(Vector4 a, Vector4 b)
        {
            return new Vector4(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w);
        }
        
        private Matrix4x4 Transpose(Matrix4x4 m)
        {
            Matrix4x4 result = new Matrix4x4();
            
            for (int i = 0; i < 4; i++)
            {
                for (int j = 0; j < 4; j++)
                {
                    result[i, j] = m[j, i];
                }
            }
            
            return result;
        }
        
        private Matrix4x4 Inverse(Matrix4x4 m)
        {
            // Simplified 4x4 matrix inversion (for this specific use case)
            // In production, use a robust matrix inversion algorithm
            return m.inverse;
        }
        
        // Properties for debugging
        public bool IsInitialized => initialized;
        public Vector4 State => state;
        public float ProcessNoise => processNoise;
        public float MeasurementNoise => measurementNoise;
    }
}