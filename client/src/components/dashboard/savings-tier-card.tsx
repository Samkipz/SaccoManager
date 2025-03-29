import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Coins, TrendingUp, ShieldCheck, Award } from "lucide-react";
import { motion } from "framer-motion";

interface SavingsTierCardProps {
  currentTier: {
    name: string;
    description: string;
    color: string;
    interestRate: number;
    benefits: string[];
  };
  nextTier?: {
    name: string;
    description: string;
    interestRate: number;
    requiredBalance: number;
    benefits: string[];
  };
  currentBalance: number;
  className?: string;
}

export function SavingsTierCard({
  currentTier,
  nextTier,
  currentBalance,
  className
}: SavingsTierCardProps) {
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
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      }
    }
  };

  // Calculate progress percentage if next tier exists
  const progressPercentage = nextTier 
    ? Math.min(100, (currentBalance / nextTier.requiredBalance) * 100)
    : 100;

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="overflow-hidden">
        <div className="relative">
          <div 
            className="absolute top-0 left-0 w-full h-2"
            style={{ backgroundColor: currentTier.color }}
          />
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  <span className="flex items-center">
                    Your Savings Tier
                    <Badge className="ml-2" variant="outline" style={{ borderColor: currentTier.color, color: currentTier.color }}>
                      {currentTier.name}
                    </Badge>
                  </span>
                </CardTitle>
                <CardDescription className="mt-1">
                  {currentTier.description}
                </CardDescription>
              </div>
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${currentTier.color}20` }}
              >
                <Award className="h-5 w-5" style={{ color: currentTier.color }} />
              </div>
            </div>
          </CardHeader>
        </div>

        <CardContent>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Interest Rate</span>
              <span className="text-lg font-bold text-primary">{currentTier.interestRate}%</span>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Your Benefits</h4>
              <motion.div 
                className="grid grid-cols-1 gap-2"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {currentTier.benefits.map((benefit, index) => (
                  <motion.div 
                    key={index}
                    className="flex items-center text-sm bg-primary-50 p-2 rounded-md"
                    variants={itemVariants}
                  >
                    <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                    {benefit}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>

          {nextTier && (
            <div className="mt-6 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                Next Tier: {nextTier.name}
              </h4>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1 text-sm">
                  <span>Progress to Next Tier</span>
                  <span className="font-medium">
                    {formatCurrency(currentBalance)} / {formatCurrency(nextTier.requiredBalance)}
                  </span>
                </div>
                <div className="relative pt-1">
                  <Progress value={progressPercentage} className="h-2" />
                </div>
                <p className="text-xs mt-1 text-gray-500">
                  {formatCurrency(nextTier.requiredBalance - currentBalance)} more needed for {nextTier.interestRate}% interest rate
                </p>
              </div>
              
              <div className="mt-4">
                <h5 className="text-xs font-medium mb-2 text-gray-500">WHAT YOU'LL GET</h5>
                <div className="flex flex-wrap gap-2">
                  {nextTier.benefits.map((benefit, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-50">
                      <Coins className="h-3 w-3 mr-1" />
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}