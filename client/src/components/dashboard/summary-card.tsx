import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  linkHref?: string;
  linkText?: string;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  icon,
  trend,
  linkHref,
  linkText,
  className,
}: SummaryCardProps) {
  return (
    <div className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
          <div className="text-primary p-1.5 rounded-lg bg-primary-50">
            {icon}
          </div>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-gray-900 font-mono">{value}</span>
          {trend && (
            <span className={cn(
              "ml-2 text-xs font-medium",
              trend.positive ? "text-green-600" : "text-amber-600"
            )}>
              {trend.value}
            </span>
          )}
        </div>
        {linkHref && linkText && (
          <div className="mt-4">
            <Link href={linkHref}>
              <a className="text-sm text-primary hover:text-primary-700 font-medium flex items-center">
                {linkText}
                <ArrowRight className="ml-1 h-4 w-4" />
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
