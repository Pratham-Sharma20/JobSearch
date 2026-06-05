import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { api } from '../lib/api';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Check if user just registered
    const params = new URLSearchParams(location.search);
    if (params.get('registered') === 'true') {
      setSuccessMsg('Account created successfully! Please sign in.');
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    try {
      await api.post('/auth/login', formData);
      // On successful login, redirect to jobs page or dashboard
      navigate('/jobs');
    } catch (err: any) {
      // Extract error message from API response or use a generic one
      const message = err.response?.data?.message || err.response?.data?.error || 'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 w-full">
      <Card variant="flat" className="w-full max-w-[28rem] p-8 md:p-10 shadow-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-medium text-ink mb-2">Welcome back</h1>
          <p className="text-body text-[14px]">Sign in to your ClaudeJobs account</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-3 bg-success/10 border border-success/20 text-success rounded-md text-sm">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-error/10 border border-error/20 text-error rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-medium text-[14px] text-ink" htmlFor="email">Email</label>
            <Input 
              id="email"
              name="email"
              type="email" 
              placeholder="name@example.com" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="font-sans font-medium text-[14px] text-ink" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="text-[13px] text-primary hover:underline">Forgot password?</Link>
            </div>
            <Input 
              id="password"
              name="password"
              type="password" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <Button variant="primary" className="w-full h-10 mt-2" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-hairline text-center text-[14px] text-body">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Create account
          </Link>
        </div>
      </Card>
    </div>
  );
}
