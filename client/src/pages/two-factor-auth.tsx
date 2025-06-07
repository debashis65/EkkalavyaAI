import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Key, Smartphone, RefreshCw } from 'lucide-react';

export default function TwoFactorAuth() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [currentCode, setCurrentCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(30);
  const { verifyTwoFactor, isLoading, pendingUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Generate current TOTP code for demo
  useEffect(() => {
    if (pendingUser) {
      const updateCode = () => {
        // For demo purposes, generate a simple code
        const time = Math.floor(Date.now() / 1000 / 30);
        const hash = (time + 'demo').split('').reduce((a, b) => {
          a = ((a << 5) - a + b.charCodeAt(0)) & 0xffffffff;
          return a < 0 ? a + 0x100000000 : a;
        }, 0);
        const newCode = String(hash).slice(-6).padStart(6, '0');
        setCurrentCode(newCode);
        setTimeLeft(30 - (Math.floor(Date.now() / 1000) % 30));
      };
      
      updateCode();
      const interval = setInterval(updateCode, 1000);
      return () => clearInterval(interval);
    }
  }, [pendingUser]);

  const handleSubmit = async () => {
    setError('');
    
    if (!code || code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    const success = await verifyTwoFactor(code);
    if (success) {
      navigate('/dashboard');
      toast({
        title: "Authentication successful",
        description: "Welcome to Ekalavya!",
      });
    } else {
      setError('Invalid verification code');
      setCode('');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (!pendingUser) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-green-500 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Key className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Two-Factor Authentication</CardTitle>
          <p className="text-gray-600">
            Enter the 6-digit code to complete your login
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Demo code display */}
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Demo Code (Auto-Generated)</span>
            </div>
            <div className="text-2xl font-mono font-bold text-green-800 mb-2">
              {currentCode}
            </div>
            <div className="flex items-center justify-center space-x-1">
              <RefreshCw className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">Refreshes in {timeLeft}s</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <Input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
              className="text-center text-lg font-mono"
              placeholder="000000"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || code.length !== 6}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button
              variant="outline"
              onClick={handleBackToLogin}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}