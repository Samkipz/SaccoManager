import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";

export default function LoginPage() {
  const [showRegister, setShowRegister] = useState(false);
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md">
        <LoginForm onShowRegister={() => setShowRegister(true)} />
        
        {showRegister && (
          <div className="mt-4">
            <RegisterForm onClose={() => setShowRegister(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
