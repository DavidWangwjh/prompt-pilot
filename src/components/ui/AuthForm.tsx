'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Reusable UI Components
const Label = (props: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className="text-sm font-medium leading-none text-gray-700" {...props} />
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input 
    className="flex h-10 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" 
    {...props} 
  />
);

const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button 
    className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 w-full" 
    {...props} 
  />
);

interface AuthFormProps {
  mode: 'login' | 'signup';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const title = mode === 'login' ? 'Welcome Back' : 'Create an Account';
  const buttonText = mode === 'login' ? 'Login' : 'Sign Up';
  const footerText = mode === 'login' ? "Don't have an account?" : 'Already have an account?';
  const footerLink = mode === 'login' ? '/signup' : '/login';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
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
          <Input id="email" type="email" placeholder="m@example.com" />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
        
        {mode === 'signup' && (
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" />
          </div>
        )}
        
        <Button type="submit">{buttonText}</Button>
      </form>
      
      <div className="mt-4 text-center text-sm">
        {footerText}{' '}
        <Link href={footerLink} className="text-blue-600 hover:text-blue-700 underline">
          {mode === 'login' ? 'Sign up' : 'Login'}
        </Link>
      </div>
    </div>
  );
} 