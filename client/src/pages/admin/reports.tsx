import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { 
  DollarSign, 
  Coins, 
  Users, 
  Percent,
  BarChart,
  PieChart,
  CalendarIcon,
  FileText,
  Download
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportSummary {
  totalSavings: number;
  totalLoans: number;
  activeMembers: number;
  loanRecoveryRate: number;
  monthlyGrowth: number;
  growthRate: number;
}

interface SavingsGrowthData {
  month: string;
  amount: number;
}

interface LoanDistributionData {
  purpose: string;
  count: number;
  amount: number;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState("financial");
  const [chartTimeRange, setChartTimeRange] = useState("6");
  const [distributionView, setDistributionView] = useState("purpose");
  
  // Fetch report summary data
  const { data: summaryData, isLoading: summaryLoading } = useQuery<ReportSummary>({
    queryKey: ['/api/reports/summary'],
  });
  
  // Fetch savings growth data
  const { data: savingsGrowthData, isLoading: growthLoading } = useQuery<SavingsGrowthData[]>({
    queryKey: ['/api/reports/savings-growth'],
  });
  
  // Fetch loan distribution data
  const { data: loanDistributionData, isLoading: distributionLoading } = useQuery<LoanDistributionData[]>({
    queryKey: ['/api/reports/loan-distribution'],
  });
  
  const handleGenerateReport = () => {
    toast({
      title: "Report Generation",
      description: "Your report is being generated and will be available for download shortly.",
    });
    // In a real app, this would trigger a report generation process
  };
  
  return (
    <AppLayout 
      title="Financial Reports" 
      description="View and generate financial reports"
      adminRequired
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <SummaryCard
          title="Total Savings"
          value={summaryLoading ? "Loading..." : `$${summaryData?.totalSavings.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={summaryData?.growthRate ? {
            value: `${summaryData.growthRate.toFixed(1)}% from previous month`,
            positive: summaryData.growthRate > 0
          } : undefined}
        />
        
        <SummaryCard
          title="Total Loans"
          value={summaryLoading ? "Loading..." : `$${summaryData?.totalLoans.toFixed(2)}`}
          icon={<Coins className="h-5 w-5" />}
          trend={summaryData ? {
            value: "8.3% from previous month",
            positive: true
          } : undefined}
        />
        
        <SummaryCard
          title="Active Members"
          value={summaryLoading ? "Loading..." : summaryData?.activeMembers}
          icon={<Users className="h-5 w-5" />}
          trend={summaryData ? {
            value: "4 new this month",
            positive: true
          } : undefined}
        />
        
        <SummaryCard
          title="Loan Recovery Rate"
          value={summaryLoading ? "Loading..." : `${summaryData?.loanRecoveryRate}%`}
          icon={<Percent className="h-5 w-5" />}
          trend={summaryData ? {
            value: "1.2% from previous month",
            positive: true
          } : undefined}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Savings Growth</CardTitle>
            <Select defaultValue={chartTimeRange} onValueChange={setChartTimeRange}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">Last 6 Months</SelectItem>
                <SelectItem value="12">Last Year</SelectItem>
                <SelectItem value="24">Last 2 Years</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {growthLoading ? (
                <div className="h-full w-full bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Loading chart data...</p>
                </div>
              ) : savingsGrowthData && savingsGrowthData.length > 0 ? (
                <div className="h-full w-full bg-gray-50 rounded-lg flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-gray-400 mr-2" />
                  <p className="text-gray-400 italic">Chart visualization would appear here with the loaded data</p>
                </div>
              ) : (
                <div className="h-full w-full bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 italic">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Loan Distribution</CardTitle>
            <Select defaultValue={distributionView} onValueChange={setDistributionView}>
              <SelectTrigger className="w-[180px] h-8">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purpose">By Purpose</SelectItem>
                <SelectItem value="amount">By Amount</SelectItem>
                <SelectItem value="term">By Term</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {distributionLoading ? (
                <div className="h-full w-full bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Loading chart data...</p>
                </div>
              ) : loanDistributionData && loanDistributionData.length > 0 ? (
                <div className="h-full w-full bg-gray-50 rounded-lg flex items-center justify-center">
                  <PieChart className="h-8 w-8 text-gray-400 mr-2" />
                  <p className="text-gray-400 italic">Chart visualization would appear here with the loaded data</p>
                </div>
              ) : (
                <div className="h-full w-full bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 italic">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generate Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-base font-medium mb-3">Report Type</h4>
              <Select defaultValue={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="financial">Financial Summary</SelectItem>
                  <SelectItem value="member">Member Activity</SelectItem>
                  <SelectItem value="loan">Loan Performance</SelectItem>
                  <SelectItem value="savings">Savings Growth</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>
              
              <h4 className="text-base font-medium mb-3 mt-6">Time Period</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">Start Date</Label>
                  <div className="relative">
                    <Input id="start-date" type="date" className="w-full pr-8" />
                    <CalendarIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">End Date</Label>
                  <div className="relative">
                    <Input id="end-date" type="date" className="w-full pr-8" />
                    <CalendarIcon className="absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-base font-medium mb-3">Report Format</h4>
              <RadioGroup defaultValue="pdf" className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="format-pdf" />
                  <Label htmlFor="format-pdf" className="text-sm font-medium text-gray-700">PDF Document</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excel" id="format-excel" />
                  <Label htmlFor="format-excel" className="text-sm font-medium text-gray-700">Excel Spreadsheet</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="csv" id="format-csv" />
                  <Label htmlFor="format-csv" className="text-sm font-medium text-gray-700">CSV File</Label>
                </div>
              </RadioGroup>
              
              <div className="mt-6">
                <Button 
                  className="w-full" 
                  onClick={handleGenerateReport}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
