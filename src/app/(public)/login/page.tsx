'use client';

import AuthForm from "@/components/ui/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthForm mode="login" />
    </div>
  );
} 