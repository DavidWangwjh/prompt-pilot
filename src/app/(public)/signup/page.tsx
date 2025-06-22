'use client';

import AuthForm from "@/components/ui/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm mode="signup" />
    </div>
  );
} 