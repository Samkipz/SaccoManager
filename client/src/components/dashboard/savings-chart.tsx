import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from "framer-motion";
import { ArrowUp, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface SavingsChartData {
  date: string;
  amount: number;
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface SavingsChartProps {
  savingsData: SavingsChartData[];
  savingsDistribution: PieChartData[];
  savingsGoal?: number;
  className?: string;
}

export function SavingsChart({ 
  savingsData, 
  savingsDistribution,
  savingsGoal,
  className 
}: SavingsChartProps) {
  const [activeTab, setActiveTab] = useState("history");
  
  // Get current amount (last entry in savingsData)
  const currentAmount = savingsData.length > 0 
    ? savingsData[savingsData.length - 1].amount 
    : 0;
  
  // Calculate growth percentage (comparing current with first entry)
  const firstAmount = savingsData.length > 0 
    ? savingsData[0].amount 
    : 0;
  const growthPercentage = firstAmount > 0 
    ? ((currentAmount - firstAmount) / firstAmount) * 100 
    : 0;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Custom tooltip for area chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-primary font-semibold">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom label for pie chart
  const renderCustomizedLabel = ({ 
    cx, 
    cy, 
    midAngle, 
    innerRadius, 
    outerRadius, 
    percent 
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Card animation
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
  
  return (
    <motion.div
      className={className}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Savings Overview</CardTitle>
            <CardDescription>
              Track your savings progress and distribution
            </CardDescription>
          </div>
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <h2 className="text-3xl font-bold text-primary">
                {formatCurrency(currentAmount)}
              </h2>
              {savingsGoal && (
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(savingsGoal - currentAmount)} away from next tier
                </p>
              )}
            </div>
            <div className="bg-primary-50 p-2 rounded-md">
              <div className="flex items-center">
                <ArrowUp className={`h-4 w-4 ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600 rotate-180'}`} />
                <span className={`ml-1 text-sm font-medium ${growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(growthPercentage).toFixed(1)}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Last 6 Months</p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="history" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Growth
              </TabsTrigger>
              <TabsTrigger value="distribution" className="text-xs">
                <PieChartIcon className="h-3 w-3 mr-1" />
                Distribution
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={savingsData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#2563EB" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorAmount)"
                    />
                    {savingsGoal && (
                      <CartesianGrid y={savingsGoal} strokeWidth={1} strokeDasharray="3 3" stroke="#f59e0b" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
                {savingsGoal && (
                  <div className="flex items-center justify-end mt-1">
                    <div className="w-3 h-0 border-t-2 border-dashed border-amber-500" />
                    <span className="text-xs ml-1 text-amber-600">Next Tier Goal: {formatCurrency(savingsGoal)}</span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="distribution" className="space-y-4">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={savingsDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {savingsDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconType="circle"
                      formatter={(value, entry, index) => {
                        const item = savingsDistribution[index as number];
                        return (
                          <span className="text-xs">
                            {value} ({formatCurrency(item.value)})
                          </span>
                        );
                      }}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}