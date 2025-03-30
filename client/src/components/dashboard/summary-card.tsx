import React from "react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

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
  highlight?: boolean;
}

export function SummaryCard({
  title,
  value,
  icon,
  trend,
  linkHref,
  linkText,
  className,
  highlight = false,
}: SummaryCardProps) {
  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    hover: { 
      y: -5,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    }
  };

  // Icon animation variants
  const iconVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Link arrow animation
  const arrowVariants = {
    rest: { x: 0 },
    hover: { 
      x: 5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Pulsing animation for highlighted cards
  const pulseAnimation = highlight ? {
    animate: {
      boxShadow: [
        "0 0 0 0 rgba(239, 68, 68, 0)",
        "0 0 0 4px rgba(239, 68, 68, 0.2)",
        "0 0 0 0 rgba(239, 68, 68, 0)"
      ],
      transition: {
        repeat: Infinity,
        duration: 2
      }
    }
  } : {};

  return (
    <motion.div 
      className={cn(
        "bg-white rounded-xl shadow-sm border overflow-hidden", 
        highlight ? "border-red-400" : "border-gray-100",
        className
      )}
      initial="hidden"
      animate={{
        ...pulseAnimation.animate,
        opacity: 1,
        y: 0
      }}
      whileHover="hover"
      variants={cardVariants}
    >
      <div className={cn(
        "p-5",
        highlight && "bg-gradient-to-r from-red-50 to-white"
      )}>
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn(
            "text-sm font-semibold",
            highlight ? "text-red-600" : "text-gray-500"
          )}>
            {title}
            {highlight && (
              <span className="inline-block ml-2 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full animate-pulse">
                ATTENTION
              </span>
            )}
          </h3>
          <motion.div 
            className={cn(
              "p-1.5 rounded-lg",
              highlight ? "bg-red-100 text-red-600" : "bg-primary-50 text-primary"
            )}
            variants={iconVariants}
          >
            {icon}
          </motion.div>
        </div>
        <motion.div 
          className="flex items-baseline"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <span className={cn(
            "text-2xl font-bold font-mono",
            highlight ? "text-red-600" : "text-gray-900"
          )}>
            {value}
          </span>
          {trend && (
            <motion.span 
              className={cn(
                "ml-2 text-xs font-medium",
                highlight ? "text-red-600" : (trend.positive ? "text-green-600" : "text-amber-600")
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {trend.value}
            </motion.span>
          )}
        </motion.div>
        {linkHref && linkText && (
          <div className="mt-4">
            <Link 
              href={linkHref}
              className={cn(
                "text-sm font-medium flex items-center",
                highlight ? "text-red-600 hover:text-red-700" : "text-primary hover:text-primary-700"
              )}
            >
              <motion.div
                className="flex items-center"
                initial="rest"
                whileHover="hover"
              >
                {linkText}
                <motion.div variants={arrowVariants}>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </motion.div>
              </motion.div>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
