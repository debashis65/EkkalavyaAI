using System.Collections.Generic;
using UnityEngine;

namespace EkkalavyaAR.Utils
{
    public static class MathHelpers
    {
        /// <summary>
        /// Fits a parabolic trajectory to a set of 2D points
        /// </summary>
        public class ParabolicTrajectoryFitter
        {
            public TrajectoryData FitTrajectory(List<BallTrackPoint> points)
            {
                var trajectory = new TrajectoryData();
                
                if (points.Count < 3)
                {
                    trajectory.isValid = false;
                    return trajectory;
                }
                
                // Extract positions and timestamps
                var positions = new List<Vector2>();
                var timestamps = new List<float>();
                
                foreach (var point in points)
                {
                    positions.Add(point.position);
                    timestamps.Add(point.timestamp / 1000f); // Convert to seconds
                }
                
                // Fit parabola using least squares
                if (FitParabola(positions, timestamps, out Vector2 initialPos, out Vector2 initialVel, out float curvature))
                {
                    trajectory.isValid = true;
                    trajectory.currentPosition = positions[positions.Count - 1];
                    trajectory.velocity = CalculateVelocityAtTime(initialPos, initialVel, curvature, timestamps[timestamps.Count - 1]);
                    trajectory.curvature = curvature;
                    trajectory.confidence = CalculateTrajectoryConfidence(positions, initialPos, initialVel, curvature, timestamps);
                }
                else
                {
                    trajectory.isValid = false;
                }
                
                return trajectory;
            }
            
            private bool FitParabola(List<Vector2> positions, List<float> timestamps, 
                                   out Vector2 initialPos, out Vector2 initialVel, out float curvature)
            {
                initialPos = Vector2.zero;
                initialVel = Vector2.zero;
                curvature = 0f;
                
                int n = positions.Count;
                if (n < 3) return false;
                
                // Normalize time to start from 0
                float t0 = timestamps[0];
                var normalizedTimes = new List<float>();
                foreach (var t in timestamps)
                {
                    normalizedTimes.Add(t - t0);
                }
                
                // Set up matrices for least squares fitting
                // For parabola: y = a + b*t + c*t^2
                // We solve for x and y components separately
                
                // Fit X component
                if (!FitParabolaComponent(positions.ConvertAll(p => p.x), normalizedTimes,
                                        out float x0, out float vx0, out float ax))
                    return false;
                
                // Fit Y component  
                if (!FitParabolaComponent(positions.ConvertAll(p => p.y), normalizedTimes,
                                        out float y0, out float vy0, out float ay))
                    return false;
                
                initialPos = new Vector2(x0, y0);
                initialVel = new Vector2(vx0, vy0);
                curvature = Mathf.Sqrt(ax * ax + ay * ay);
                
                return true;
            }
            
            private bool FitParabolaComponent(List<float> values, List<float> times,
                                            out float a, out float b, out float c)
            {
                a = b = c = 0f;
                int n = values.Count;
                
                if (n < 3) return false;
                
                // Set up normal equations for least squares
                // [n    Σt   Σt²  ] [a]   [Σy  ]
                // [Σt   Σt²  Σt³  ] [b] = [Σyt ]
                // [Σt²  Σt³  Σt⁴  ] [c]   [Σyt²]
                
                float sum_1 = n;
                float sum_t = 0f, sum_t2 = 0f, sum_t3 = 0f, sum_t4 = 0f;
                float sum_y = 0f, sum_yt = 0f, sum_yt2 = 0f;
                
                for (int i = 0; i < n; i++)
                {
                    float t = times[i];
                    float y = values[i];
                    float t2 = t * t;
                    float t3 = t2 * t;
                    float t4 = t2 * t2;
                    
                    sum_t += t;
                    sum_t2 += t2;
                    sum_t3 += t3;
                    sum_t4 += t4;
                    sum_y += y;
                    sum_yt += y * t;
                    sum_yt2 += y * t2;
                }
                
                // Solve 3x3 system using Cramer's rule
                float det = sum_1 * (sum_t2 * sum_t4 - sum_t3 * sum_t3) -
                           sum_t * (sum_t * sum_t4 - sum_t2 * sum_t3) +
                           sum_t2 * (sum_t * sum_t3 - sum_t2 * sum_t2);
                
                if (Mathf.Abs(det) < 1e-10f) return false;
                
                float det_a = sum_y * (sum_t2 * sum_t4 - sum_t3 * sum_t3) -
                             sum_yt * (sum_t * sum_t4 - sum_t2 * sum_t3) +
                             sum_yt2 * (sum_t * sum_t3 - sum_t2 * sum_t2);
                
                float det_b = sum_1 * (sum_yt * sum_t4 - sum_yt2 * sum_t3) -
                             sum_t * (sum_y * sum_t4 - sum_yt2 * sum_t2) +
                             sum_t2 * (sum_y * sum_t3 - sum_yt * sum_t2);
                
                float det_c = sum_1 * (sum_t2 * sum_yt2 - sum_t3 * sum_yt) -
                             sum_t * (sum_t * sum_yt2 - sum_t2 * sum_yt) +
                             sum_t2 * (sum_t * sum_yt - sum_t2 * sum_y);
                
                a = det_a / det;
                b = det_b / det;
                c = det_c / det;
                
                return true;
            }
            
            private Vector2 CalculateVelocityAtTime(Vector2 initialPos, Vector2 initialVel, float curvature, float time)
            {
                // For parabolic motion: v = v0 + a*t
                // This is simplified - in reality, you'd track acceleration components separately
                return initialVel + Vector2.down * curvature * time;
            }
            
            private float CalculateTrajectoryConfidence(List<Vector2> positions, Vector2 initialPos, 
                                                      Vector2 initialVel, float curvature, List<float> timestamps)
            {
                // Calculate R-squared (coefficient of determination)
                float totalError = 0f;
                float totalVariance = 0f;
                
                // Calculate mean position
                Vector2 meanPos = Vector2.zero;
                foreach (var pos in positions)
                {
                    meanPos += pos;
                }
                meanPos /= positions.Count;
                
                // Calculate errors and variance
                for (int i = 0; i < positions.Count; i++)
                {
                    float t = timestamps[i] - timestamps[0];
                    Vector2 predictedPos = initialPos + initialVel * t + 0.5f * Vector2.down * curvature * t * t;
                    
                    float error = Vector2.SqrMagnitude(positions[i] - predictedPos);
                    float variance = Vector2.SqrMagnitude(positions[i] - meanPos);
                    
                    totalError += error;
                    totalVariance += variance;
                }
                
                if (totalVariance < 1e-10f) return 0f;
                
                float rSquared = 1f - (totalError / totalVariance);
                return Mathf.Clamp01(rSquared);
            }
        }
        
        /// <summary>
        /// Physics predictor for ball trajectory
        /// </summary>
        public class PhysicsPredictor
        {
            private float gravity;
            private float dampingFactor;
            
            public PhysicsPredictor(float gravity = 9.81f, float dampingFactor = 0.8f)
            {
                this.gravity = gravity;
                this.dampingFactor = dampingFactor;
            }
            
            public Vector2 PredictPosition(Vector2 currentPos, Vector2 velocity, float time)
            {
                // Simple projectile motion with screen coordinates
                // Note: In screen space, Y increases downward, so gravity is positive
                Vector2 pos = currentPos;
                pos.x += velocity.x * time;
                pos.y += velocity.y * time + 0.5f * gravity * time * time;
                
                return pos;
            }
            
            public float PredictTimeToBounce(Vector2 currentPos, Vector2 velocity)
            {
                // Predict time until ball reaches bottom of screen (simplified ground)
                // Solve: y = y0 + vy*t + 0.5*g*t^2 for when y = 1 (bottom of screen in normalized coords)
                
                float y0 = currentPos.y;
                float vy = velocity.y;
                float target_y = 1f; // Bottom of screen
                
                // Quadratic formula: 0.5*g*t^2 + vy*t + (y0 - target_y) = 0
                float a = 0.5f * gravity;
                float b = vy;
                float c = y0 - target_y;
                
                float discriminant = b * b - 4f * a * c;
                if (discriminant < 0f) return -1f; // No solution
                
                float t1 = (-b + Mathf.Sqrt(discriminant)) / (2f * a);
                float t2 = (-b - Mathf.Sqrt(discriminant)) / (2f * a);
                
                // Return the positive time that's closest to now
                if (t1 > 0f && t2 > 0f) return Mathf.Min(t1, t2);
                if (t1 > 0f) return t1;
                if (t2 > 0f) return t2;
                
                return -1f; // No valid solution
            }
            
            public Vector2 PredictVelocityAfterBounce(Vector2 velocityBeforeBounce)
            {
                // Simple bounce model: reverse Y velocity and apply damping
                return new Vector2(
                    velocityBeforeBounce.x * dampingFactor,
                    -velocityBeforeBounce.y * dampingFactor
                );
            }
        }
        
        /// <summary>
        /// Utility functions for common mathematical operations
        /// </summary>
        public static class Geometry
        {
            public static float PointToLineDistance(Vector2 point, Vector2 lineStart, Vector2 lineEnd)
            {
                float lineLength = Vector2.Distance(lineStart, lineEnd);
                if (lineLength < 1e-10f) return Vector2.Distance(point, lineStart);
                
                float t = Mathf.Clamp01(Vector2.Dot(point - lineStart, lineEnd - lineStart) / (lineLength * lineLength));
                Vector2 projection = lineStart + t * (lineEnd - lineStart);
                
                return Vector2.Distance(point, projection);
            }
            
            public static bool IsPointInCircle(Vector2 point, Vector2 center, float radius)
            {
                return Vector2.Distance(point, center) <= radius;
            }
            
            public static bool IsPointInRectangle(Vector2 point, Vector2 rectCenter, Vector2 rectSize)
            {
                Vector2 halfSize = rectSize * 0.5f;
                Vector2 offset = point - rectCenter;
                
                return Mathf.Abs(offset.x) <= halfSize.x && Mathf.Abs(offset.y) <= halfSize.y;
            }
            
            public static Vector2 ClosestPointOnLine(Vector2 point, Vector2 lineStart, Vector2 lineEnd)
            {
                Vector2 line = lineEnd - lineStart;
                float lineLength = line.magnitude;
                
                if (lineLength < 1e-10f) return lineStart;
                
                float t = Mathf.Clamp01(Vector2.Dot(point - lineStart, line) / (lineLength * lineLength));
                return lineStart + t * line;
            }
        }
        
        /// <summary>
        /// Ring buffer for efficient circular data storage
        /// </summary>
        public class RingBuffer<T>
        {
            private T[] buffer;
            private int index;
            private int count;
            
            public int Count => count;
            public int Capacity => buffer.Length;
            
            public RingBuffer(int capacity)
            {
                buffer = new T[capacity];
                index = 0;
                count = 0;
            }
            
            public void Add(T item)
            {
                buffer[index] = item;
                index = (index + 1) % buffer.Length;
                
                if (count < buffer.Length)
                {
                    count++;
                }
            }
            
            public T GetAt(int relativeIndex)
            {
                if (count == 0) return default(T);
                
                // Convert relative index to actual buffer index
                int actualIndex;
                if (relativeIndex < 0)
                {
                    // Negative index: count from end
                    actualIndex = (index + relativeIndex + buffer.Length) % buffer.Length;
                }
                else
                {
                    // Positive index: count from start
                    int startIndex = count < buffer.Length ? 0 : index;
                    actualIndex = (startIndex + relativeIndex) % buffer.Length;
                }
                
                return buffer[actualIndex];
            }
            
            public void Clear()
            {
                count = 0;
                index = 0;
            }
        }
        
        /// <summary>
        /// Moving average calculator for smooth data analysis
        /// </summary>
        public class MovingAverage
        {
            private RingBuffer<float> values;
            private float sum;
            
            public MovingAverage(int windowSize)
            {
                values = new RingBuffer<float>(windowSize);
                sum = 0f;
            }
            
            public void AddValue(float value)
            {
                if (values.Count == values.Capacity)
                {
                    // Remove the oldest value from sum
                    sum -= values.GetAt(0);
                }
                
                values.Add(value);
                sum += value;
            }
            
            public float GetAverage()
            {
                return values.Count > 0 ? sum / values.Count : 0f;
            }
            
            public void Clear()
            {
                values.Clear();
                sum = 0f;
            }
        }
        
        /// <summary>
        /// Statistical functions for data analysis
        /// </summary>
        public static class Statistics
        {
            public static float CalculateMean(IList<float> values)
            {
                if (values.Count == 0) return 0f;
                
                float sum = 0f;
                foreach (float value in values)
                {
                    sum += value;
                }
                
                return sum / values.Count;
            }
            
            public static float CalculateStandardDeviation(IList<float> values)
            {
                if (values.Count == 0) return 0f;
                
                float mean = CalculateMean(values);
                float sumSquaredDifferences = 0f;
                
                foreach (float value in values)
                {
                    float diff = value - mean;
                    sumSquaredDifferences += diff * diff;
                }
                
                return Mathf.Sqrt(sumSquaredDifferences / values.Count);
            }
            
            public static float CalculatePercentile(IList<float> sortedValues, float percentile)
            {
                if (sortedValues.Count == 0) return 0f;
                if (percentile <= 0f) return sortedValues[0];
                if (percentile >= 1f) return sortedValues[sortedValues.Count - 1];
                
                float index = percentile * (sortedValues.Count - 1);
                int lowerIndex = Mathf.FloorToInt(index);
                int upperIndex = Mathf.CeilToInt(index);
                
                if (lowerIndex == upperIndex)
                {
                    return sortedValues[lowerIndex];
                }
                
                float weight = index - lowerIndex;
                return Mathf.Lerp(sortedValues[lowerIndex], sortedValues[upperIndex], weight);
            }
        }
    }
}