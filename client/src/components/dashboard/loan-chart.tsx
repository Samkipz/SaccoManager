import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
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
import { BarChart2, PieChart as PieChartIcon, Clock } from 'lucide-react';

interface LoanData {
  name: string;
  amount: number;
  interest: number; 
  remaining: number;
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

interface LoanChartProps {
  loans: LoanData[];
  loanDistribution: PieChartData[];
  className?: string;
}

export function LoanChart({ 
  loans, 
  loanDistribution,
  className 
}: LoanChartProps) {
  const [activeTab, setActiveTab] = useState("breakdown");
  
  // Calculate totals
  const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
  const totalInterest = loans.reduce((sum, loan) => sum + loan.interest, 0);
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  // Format months
  const formatMonths = (months: number) => {
    return months === 1 ? '1 month' : `${months} months`;
  };
  
  // Custom tooltip for bar chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-sm">
          <p className="text-sm font-medium">{label}</p>
          <div className="mt-1">
            <p className="text-xs flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
              Principal: {formatCurrency(payload[0].value)}
            </p>
            <p className="text-xs flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-1" />
              Interest: {formatCurrency(payload[1].value)}
            </p>
          </div>
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
            <CardTitle className="text-xl font-bold">Loan Overview</CardTitle>
            <CardDescription>
              Active loans and repayment details
            </CardDescription>
          </div>
          <div className="flex items-center">
            <BarChart2 className="h-5 w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-primary-50 p-3 rounded-md space-y-1">
              <p className="text-xs text-muted-foreground">Total Principal</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(totalAmount)}</p>
            </div>
            <div className="bg-amber-50 p-3 rounded-md space-y-1">
              <p className="text-xs text-muted-foreground">Total Interest</p>
              <p className="text-lg font-bold text-amber-600">{formatCurrency(totalInterest)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-md space-y-1">
              <p className="text-xs text-muted-foreground">Avg. Remaining Time</p>
              <p className="text-lg font-bold text-slate-700 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {formatMonths(Math.round(
                  loans.reduce((sum, loan) => sum + loan.remaining, 0) / Math.max(1, loans.length)
                ))}
              </p>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="breakdown" className="text-xs">
                <BarChart2 className="h-3 w-3 mr-1" />
                Breakdown
              </TabsTrigger>
              <TabsTrigger value="distribution" className="text-xs">
                <PieChartIcon className="h-3 w-3 mr-1" />
                Distribution
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="breakdown" className="space-y-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={loans}
                    margin={{ top: 10, right: 0, left: 0, bottom: 20 }}
                    barCategoryGap={20}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.1} />
                    <XAxis 
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <YAxis 
                      type="category"
                      dataKey="name" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" stackId="a" fill="#3B82F6" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="interest" stackId="a" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-end gap-4 mt-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm mr-1" />
                    <span className="text-xs text-gray-600">Principal</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-sm mr-1" />
                    <span className="text-xs text-gray-600">Interest</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="distribution" className="space-y-4">
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={loanDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {loanDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Legend 
                      layout="vertical" 
                      verticalAlign="middle" 
                      align="right"
                      iconType="circle"
                      formatter={(value, entry, index) => {
                        const item = loanDistribution[index as number];
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