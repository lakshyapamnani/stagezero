import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Role } from '../models/types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('freelancer');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard');
      } else {
        await register(email, password, name, role);
        if (role === 'freelancer') {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error(err);
      let message = 'Authentication failed';
      
      // Handle common Firebase Auth errors
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Invalid email or password. If you haven\'t created an account yet, please Sign Up.';
      } else if (err.code === 'auth/email-already-in-use') {
        message = 'Email is already registered. Please login instead.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginWithGoogle(role);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary-text">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <p className="text-secondary-text mt-2">
            {isLogin ? 'Enter your credentials to access your account' : 'Join the community of founders and builders'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <Input 
                label="Full Name" 
                placeholder="John Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            
            <Input 
              label="Email" 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary-text">I am a...</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      role === 'freelancer' 
                        ? 'bg-accent/10 border-accent text-accent' 
                        : 'border-border text-secondary-text hover:border-accent/50'
                    }`}
                    onClick={() => setRole('freelancer')}
                  >
                    Freelancer
                  </button>
                  <button
                    type="button"
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      role === 'founder' 
                        ? 'bg-accent/10 border-accent text-accent' 
                        : 'border-border text-secondary-text hover:border-accent/50'
                    }`}
                    onClick={() => setRole('founder')}
                  >
                    Founder
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-secondary-text">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
              </svg>
              Google
            </Button>

            <div className="text-center mt-4">
              <button
                type="button"
                className="text-sm text-accent hover:underline"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
