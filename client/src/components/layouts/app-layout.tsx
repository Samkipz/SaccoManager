import React, { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  adminRequired?: boolean;
  title?: string;
  description?: string;
}

export function AppLayout({
  children,
  className,
  adminRequired = false,
  title,
  description,
}: AppLayoutProps) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (adminRequired && !isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 md:p-8">
          {(title || description) && (
            <header className="mb-6">
              {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
              {description && <p className="text-gray-600">{description}</p>}
            </header>
          )}
          <div className={cn("", className)}>{children}</div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
