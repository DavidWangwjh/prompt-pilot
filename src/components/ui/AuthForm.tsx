'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';

// Reusable UI Components - you can replace these with a UI library like shadcn/ui
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700" {...props} />
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200" 
    {...props} 
  />
);

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button 
    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full btn-hover" 
    {...props} 
  />
);

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const title = mode === 'login' ? 'Welcome Back' : 'Create an Account';
  const buttonText = mode === 'login' ? 'Login' : 'Sign Up';
  const footerText = mode === 'login' ? "Don't have an account?" : 'Already have an account?';
  const footerLink = mode === 'login' ? '/signup' : '/login';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'signup' && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log({ email, password });
      // Handle successful submission
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500">Enter your credentials to continue</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            value={email} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
            }}
            className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.email && (
            <p className="text-sm text-red-500 animate-pulse">{errors.email}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            required 
            value={password} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
            }}
            className={errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}
          />
          {errors.password && (
            <p className="text-sm text-red-500 animate-pulse">{errors.password}</p>
          )}
        </div>
        
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input 
              id="confirm-password" 
              type="password" 
              required 
              value={confirmPassword} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              className={errors.confirmPassword ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 animate-pulse">{errors.confirmPassword}</p>
            )}
          </div>
        )}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            buttonText
          )}
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm">
        {footerText}{' '}
        <Link href={footerLink} className="text-blue-600 hover:text-blue-700 underline transition-colors duration-200">
          {mode === 'login' ? 'Sign up' : 'Login'}
        </Link>
      </div>
    </div>
  );
} 