import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { api } from '../lib/api';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/auth/register', formData);
      // On success, redirect to login page
      navigate('/login?registered=true');
    } catch (err: any) {
      // Extract error message from API response or use a generic one
      const message = err.response?.data?.message || err.response?.data?.error || 'Failed to create account. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 w-full">
      <Card variant="flat" className="w-full max-w-[28rem] p-8 md:p-10 shadow-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-medium text-ink mb-2">Create an account</h1>
          <p className="text-body text-[14px]">Join the waitlist for premium early-career roles</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error/10 border border-error/20 text-error rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="font-sans font-medium text-[14px] text-ink" htmlFor="name">Full Name</label>
            <Input 
              id="name"
              name="name"
              type="text" 
              placeholder="Jane Doe" 
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-sans font-medium text-[14px] text-ink" htmlFor="email">Email</label>
            <Input 
              id="email"
              name="email"
              type="email" 
              placeholder="name@university.edu" 
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="font-sans font-medium text-[14px] text-ink" htmlFor="password">Password</label>
            <Input 
              id="password"
              name="password"
              type="password" 
              placeholder="Create a strong password" 
              value={formData.password}
              onChange={handleChange}
              required
            />
            <p className="text-xs text-muted-soft mt-1">
              Must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character.
            </p>
          </div>

          <Button variant="primary" className="w-full h-10 mt-2" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-hairline text-center text-[14px] text-body">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </div>
  );
}
