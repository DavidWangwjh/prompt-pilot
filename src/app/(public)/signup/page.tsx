import AuthForm from "@/components/ui/AuthForm";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <AuthForm mode="signup" />
    </div>
  );
} 