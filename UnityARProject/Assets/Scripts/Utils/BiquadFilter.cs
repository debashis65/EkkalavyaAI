using UnityEngine;

namespace EkkalavyaAR.Utils
{
    /// <summary>
    /// Biquad filter implementation for audio processing
    /// Supports low-pass, high-pass, band-pass, and notch filters
    /// </summary>
    public class BiquadFilter
    {
        public enum FilterType
        {
            LowPass,
            HighPass,
            BandPass,
            Notch,
            AllPass,
            Peaking,
            LowShelf,
            HighShelf
        }
        
        // Filter coefficients
        private float b0, b1, b2, a1, a2;
        
        // Filter state (previous inputs and outputs)
        private float x1, x2, y1, y2;
        
        public BiquadFilter(FilterType type, float normalizedFrequency, float Q = 0.707f, float gain = 0f)
        {
            CalculateCoefficients(type, normalizedFrequency, Q, gain);
            Reset();
        }
        
        private void CalculateCoefficients(FilterType type, float normalizedFreq, float Q, float gain)
        {
            // Clamp normalized frequency to valid range (0 to 0.5)
            normalizedFreq = Mathf.Clamp(normalizedFreq, 0.001f, 0.499f);
            
            float omega = 2f * Mathf.PI * normalizedFreq;
            float sin = Mathf.Sin(omega);
            float cos = Mathf.Cos(omega);
            float alpha = sin / (2f * Q);
            float A = Mathf.Pow(10f, gain / 40f); // Convert dB to linear
            float beta = Mathf.Sqrt(A) / Q;
            
            // Initialize coefficients to identity (no filtering)
            b0 = 1f; b1 = 0f; b2 = 0f;
            float a0 = 1f; a1 = 0f; a2 = 0f;
            
            switch (type)
            {
                case FilterType.LowPass:
                    b0 = (1f - cos) / 2f;
                    b1 = 1f - cos;
                    b2 = (1f - cos) / 2f;
                    a0 = 1f + alpha;
                    a1 = -2f * cos;
                    a2 = 1f - alpha;
                    break;
                    
                case FilterType.HighPass:
                    b0 = (1f + cos) / 2f;
                    b1 = -(1f + cos);
                    b2 = (1f + cos) / 2f;
                    a0 = 1f + alpha;
                    a1 = -2f * cos;
                    a2 = 1f - alpha;
                    break;
                    
                case FilterType.BandPass:
                    b0 = alpha;
                    b1 = 0f;
                    b2 = -alpha;
                    a0 = 1f + alpha;
                    a1 = -2f * cos;
                    a2 = 1f - alpha;
                    break;
                    
                case FilterType.Notch:
                    b0 = 1f;
                    b1 = -2f * cos;
                    b2 = 1f;
                    a0 = 1f + alpha;
                    a1 = -2f * cos;
                    a2 = 1f - alpha;
                    break;
                    
                case FilterType.AllPass:
                    b0 = 1f - alpha;
                    b1 = -2f * cos;
                    b2 = 1f + alpha;
                    a0 = 1f + alpha;
                    a1 = -2f * cos;
                    a2 = 1f - alpha;
                    break;
                    
                case FilterType.Peaking:
                    b0 = 1f + alpha * A;
                    b1 = -2f * cos;
                    b2 = 1f - alpha * A;
                    a0 = 1f + alpha / A;
                    a1 = -2f * cos;
                    a2 = 1f - alpha / A;
                    break;
                    
                case FilterType.LowShelf:
                    {
                        float S = 1f;
                        float beta2 = Mathf.Sqrt(A) / Q;
                        
                        b0 = A * ((A + 1f) - (A - 1f) * cos + beta2 * sin);
                        b1 = 2f * A * ((A - 1f) - (A + 1f) * cos);
                        b2 = A * ((A + 1f) - (A - 1f) * cos - beta2 * sin);
                        a0 = (A + 1f) + (A - 1f) * cos + beta2 * sin;
                        a1 = -2f * ((A - 1f) + (A + 1f) * cos);
                        a2 = (A + 1f) + (A - 1f) * cos - beta2 * sin;
                    }
                    break;
                    
                case FilterType.HighShelf:
                    {
                        float S = 1f;
                        float beta2 = Mathf.Sqrt(A) / Q;
                        
                        b0 = A * ((A + 1f) + (A - 1f) * cos + beta2 * sin);
                        b1 = -2f * A * ((A - 1f) + (A + 1f) * cos);
                        b2 = A * ((A + 1f) + (A - 1f) * cos - beta2 * sin);
                        a0 = (A + 1f) - (A - 1f) * cos + beta2 * sin;
                        a1 = 2f * ((A - 1f) - (A + 1f) * cos);
                        a2 = (A + 1f) - (A - 1f) * cos - beta2 * sin;
                    }
                    break;
            }
            
            // Normalize coefficients
            b0 /= a0;
            b1 /= a0;
            b2 /= a0;
            this.a1 = a1 / a0;
            this.a2 = a2 / a0;
        }
        
        public float Process(float input)
        {
            // Direct Form I implementation
            float output = b0 * input + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
            
            // Update state
            x2 = x1;
            x1 = input;
            y2 = y1;
            y1 = output;
            
            return output;
        }
        
        public void Reset()
        {
            x1 = x2 = y1 = y2 = 0f;
        }
        
        public void ProcessBuffer(float[] buffer)
        {
            for (int i = 0; i < buffer.Length; i++)
            {
                buffer[i] = Process(buffer[i]);
            }
        }
        
        // Properties for debugging
        public float GetMagnitudeResponse(float normalizedFrequency)
        {
            float omega = 2f * Mathf.PI * normalizedFrequency;
            
            // Calculate magnitude response at given frequency
            Complex numerator = new Complex(
                b0 + b1 * Mathf.Cos(omega) + b2 * Mathf.Cos(2f * omega),
                -b1 * Mathf.Sin(omega) - b2 * Mathf.Sin(2f * omega)
            );
            
            Complex denominator = new Complex(
                1f + a1 * Mathf.Cos(omega) + a2 * Mathf.Cos(2f * omega),
                -a1 * Mathf.Sin(omega) - a2 * Mathf.Sin(2f * omega)
            );
            
            return numerator.magnitude / denominator.magnitude;
        }
        
        public float GetPhaseResponse(float normalizedFrequency)
        {
            float omega = 2f * Mathf.PI * normalizedFrequency;
            
            Complex numerator = new Complex(
                b0 + b1 * Mathf.Cos(omega) + b2 * Mathf.Cos(2f * omega),
                -b1 * Mathf.Sin(omega) - b2 * Mathf.Sin(2f * omega)
            );
            
            Complex denominator = new Complex(
                1f + a1 * Mathf.Cos(omega) + a2 * Mathf.Cos(2f * omega),
                -a1 * Mathf.Sin(omega) - a2 * Mathf.Sin(2f * omega)
            );
            
            return Mathf.Atan2(numerator.imaginary, numerator.real) - 
                   Mathf.Atan2(denominator.imaginary, denominator.real);
        }
    }
    
    /// <summary>
    /// Simple complex number implementation for frequency response calculations
    /// </summary>
    public struct Complex
    {
        public float real;
        public float imaginary;
        
        public Complex(float real, float imaginary)
        {
            this.real = real;
            this.imaginary = imaginary;
        }
        
        public float magnitude => Mathf.Sqrt(real * real + imaginary * imaginary);
        public float phase => Mathf.Atan2(imaginary, real);
        
        public static Complex operator +(Complex a, Complex b)
        {
            return new Complex(a.real + b.real, a.imaginary + b.imaginary);
        }
        
        public static Complex operator -(Complex a, Complex b)
        {
            return new Complex(a.real - b.real, a.imaginary - b.imaginary);
        }
        
        public static Complex operator *(Complex a, Complex b)
        {
            return new Complex(
                a.real * b.real - a.imaginary * b.imaginary,
                a.real * b.imaginary + a.imaginary * b.real
            );
        }
        
        public static Complex operator /(Complex a, Complex b)
        {
            float denominator = b.real * b.real + b.imaginary * b.imaginary;
            return new Complex(
                (a.real * b.real + a.imaginary * b.imaginary) / denominator,
                (a.imaginary * b.real - a.real * b.imaginary) / denominator
            );
        }
    }
}