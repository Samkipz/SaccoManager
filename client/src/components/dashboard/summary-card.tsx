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

  return (
    <motion.div 
      className={cn("bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden", className)}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
          <motion.div 
            className="text-primary p-1.5 rounded-lg bg-primary-50"
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
          <span className="text-2xl font-bold text-gray-900 font-mono">{value}</span>
          {trend && (
            <motion.span 
              className={cn(
                "ml-2 text-xs font-medium",
                trend.positive ? "text-green-600" : "text-amber-600"
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
            <Link href={linkHref}>
              <motion.a 
                className="text-sm text-primary hover:text-primary-700 font-medium flex items-center"
                initial="rest"
                whileHover="hover"
              >
                {linkText}
                <motion.div variants={arrowVariants}>
                  <ArrowRight className="ml-1 h-4 w-4" />
                </motion.div>
              </motion.a>
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
}
