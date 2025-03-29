import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { 
  TransactionTable, 
  Transaction 
} from "@/components/dashboard/transaction-table";
import { SavingsChart } from "@/components/dashboard/savings-chart";
import { LoanChart } from "@/components/dashboard/loan-chart";
import { SavingsTierCard } from "@/components/dashboard/savings-tier-card";
import { FinancialTipsButton } from "@/components/dashboard/financial-tips-button";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  DollarSign, 
  Coins, 
  Clock, 
  RefreshCw,
  CreditCard,
  LineChart
} from "lucide-react";
import { UserWithSavingsAndLoans, SavingsProduct } from "@shared/schema";
import { motion } from "framer-motion";
import { format, subMonths, differenceInMonths } from "date-fns";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user data with savings and loans
  const { data: userData, isLoading: userLoading } = useQuery<UserWithSavingsAndLoans>({
    queryKey: [`/api/users/${user?.id}`],
  });

  // Fetch recent transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions/recent'],
  });
  
  // Fetch savings product
  const { data: savingsProducts } = useQuery<SavingsProduct[]>({
    queryKey: ['/api/savings-products'],
  });

  if (userLoading) {
    return (
      <AppLayout title="Dashboard" description="Loading your dashboard...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 h-32" />
          ))}
        </div>
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 h-64" />
      </AppLayout>
    );
  }

  const savingsBalance = userData?.savings?.balance ? parseFloat(userData.savings.balance.toString()) : 0;
  
  // Calculate active loans amount (loans with APPROVED status)
  const activeLoansAmount = userData?.loans
    ?.filter(loan => loan.status === "APPROVED")
    .reduce((total, loan) => total + parseFloat(loan.amount.toString()), 0) || 0;
  
  // Calculate pending applications count
  const pendingApplicationsCount = userData?.loans
    ?.filter(loan => loan.status === "PENDING")
    .length || 0;
  
  // Recent transactions count for display
  const recentTransactionsCount = transactionsData?.length || 0;

  // Create animation variants for staggered animations
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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const tableVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 100, 
        damping: 20,
        delay: 0.4 
      }
    }
  };
  
  // Generate mock chart data based on transactions
  // In a real application, this would come from API endpoints with actual historical data
  const generateSavingsChartData = () => {
    const today = new Date();
    const data = [];
    
    // Start with a base amount (current balance divided by some factor to show growth)
    let baseAmount = savingsBalance * 0.5;
    const min = baseAmount * 0.8;
    
    // Generate data points for the last 6 months
    for (let i = 6; i >= 0; i--) {
      const date = subMonths(today, i);
      // Gradually increase to current balance
      const amount = i === 0 
        ? savingsBalance 
        : min + ((savingsBalance - min) * (1 - i/7));
      
      data.push({
        date: format(date, 'MMM yyyy'),
        amount: Number(amount.toFixed(2))
      });
    }
    
    return data;
  };
  
  // Generate savings distribution data
  const generateSavingsDistribution = () => {
    // For a real app, this would come from actual data categories
    return [
      { name: 'Regular Savings', value: savingsBalance * 0.65, color: '#1E40AF' },
      { name: 'Emergency Fund', value: savingsBalance * 0.25, color: '#059669' },
      { name: 'Education', value: savingsBalance * 0.1, color: '#D97706' },
    ];
  };
  
  // Generate loan data
  const generateLoanData = () => {
    if (!userData?.loans || userData.loans.length === 0) {
      return [];
    }
    
    return userData.loans
      .filter(loan => loan.status === "APPROVED")
      .map(loan => {
        const amount = parseFloat(loan.amount.toString());
        const interestRate = parseFloat(loan.interestRate?.toString() || "10");
        const term = loan.term || 12;
        
        // Calculate estimated interest (simple interest calculation)
        const interest = (amount * interestRate * term / 12) / 100;
        
        // Assume we're halfway through the loan term
        const remainingMonths = term / 2;
        
        return {
          name: loan.purpose,
          amount,
          interest,
          remaining: remainingMonths
        };
      });
  };
  
  // Generate loan distribution data
  const generateLoanDistribution = () => {
    if (!userData?.loans || userData.loans.length === 0) {
      return [{ name: 'No Loans', value: 100, color: '#E5E7EB' }];
    }
    
    const distribution = userData.loans
      .filter(loan => loan.status === "APPROVED")
      .map((loan, index) => {
        const colors = ['#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED'];
        return {
          name: loan.purpose,
          value: parseFloat(loan.amount.toString()),
          color: colors[index % colors.length]
        };
      });
      
    return distribution.length > 0 ? distribution : [{ name: 'No Loans', value: 100, color: '#E5E7EB' }];
  };
  
  // Determine current savings tier and next tier
  const determineSavingsTier = () => {
    // Default tiers if products not loaded yet
    if (!savingsProducts || !savingsProducts.length || !userData?.savings?.productId) {
      return {
        currentTier: {
          name: "Regular",
          description: "Standard savings account",
          color: "#1E40AF",
          interestRate: 3.5,
          benefits: ["Standard interest rate", "Access to loans"]
        },
        nextTier: {
          name: "Premium",
          description: "Enhanced savings with better benefits",
          interestRate: 4.5,
          requiredBalance: 5000,
          benefits: ["Higher interest rate", "Priority loan approval", "Reduced fees"]
        }
      };
    }
    
    // Sort products by interest rate (assuming higher is better)
    const sortedProducts = [...savingsProducts].sort(
      (a, b) => parseFloat(b.interestRate.toString()) - parseFloat(a.interestRate.toString())
    );
    
    // Find current product
    const currentProduct = savingsProducts.find(p => p.id === userData.savings?.productId);
    
    if (!currentProduct) {
      // Fallback
      return {
        currentTier: {
          name: "Basic",
          description: "Standard savings account",
          color: "#1E40AF",
          interestRate: 3.5,
          benefits: ["Standard interest rate", "Access to loans"]
        },
        nextTier: {
          name: "Premium",
          description: "Enhanced savings with better benefits",
          interestRate: 4.5,
          requiredBalance: 5000,
          benefits: ["Higher interest rate", "Priority loan approval", "Reduced fees"]
        }
      };
    }
    
    // Get current tier benefits and color
    const tierColors = {
      REGULAR: "#1E40AF",
      FIXED_DEPOSIT: "#059669",
      EDUCATION: "#D97706",
      RETIREMENT: "#7C3AED",
      HOLIDAY: "#DB2777",
      EMERGENCY: "#DC2626"
    };
    
    const tierBenefits = {
      REGULAR: [
        "Standard interest rate",
        "Basic loan eligibility",
        "Mobile banking access"
      ],
      FIXED_DEPOSIT: [
        "Higher interest rates",
        "Loan collateral option",
        "Fixed term commitment"
      ],
      EDUCATION: [
        "Education-specific interest rate",
        "Flexible withdrawal for education expenses",
        "Education loan eligibility"
      ],
      RETIREMENT: [
        "Long-term growth focus",
        "Tax advantages",
        "Retirement planning support"
      ],
      HOLIDAY: [
        "Seasonal saving goal support",
        "Scheduled payouts for holidays",
        "Flexible deposit schedule"
      ],
      EMERGENCY: [
        "Quick access to funds",
        "No penalties for withdrawals",
        "Automatic monthly transfers option"
      ]
    };
    
    // Find next tier (product with higher interest rate)
    const currentInterestRate = parseFloat(currentProduct.interestRate.toString());
    const nextProduct = sortedProducts.find(p => 
      parseFloat(p.interestRate.toString()) > currentInterestRate && 
      parseFloat(p.minBalance.toString()) > savingsBalance
    );
    
    return {
      currentTier: {
        name: currentProduct.name,
        description: currentProduct.description,
        color: tierColors[currentProduct.type as keyof typeof tierColors] || "#1E40AF",
        interestRate: parseFloat(currentProduct.interestRate.toString()),
        benefits: tierBenefits[currentProduct.type as keyof typeof tierBenefits] || ["Standard interest rate"]
      },
      nextTier: nextProduct ? {
        name: nextProduct.name,
        description: nextProduct.description,
        interestRate: parseFloat(nextProduct.interestRate.toString()),
        requiredBalance: parseFloat(nextProduct.minBalance.toString()),
        benefits: tierBenefits[nextProduct.type as keyof typeof tierBenefits] || ["Higher interest rate"]
      } : undefined
    };
  };
  
  const savingsChartData = generateSavingsChartData();
  const savingsDistribution = generateSavingsDistribution();
  const loanData = generateLoanData();
  const loanDistribution = generateLoanDistribution();
  const { currentTier, nextTier } = determineSavingsTier();

  return (
    <AppLayout 
      title="Member Dashboard" 
      description={`Welcome back, ${user?.name}`}
      className="member-dashboard"
    >
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
        <FinancialTipsButton />
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} custom={0}>
          <SummaryCard
            title="Total Savings"
            value={`$${savingsBalance.toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5" />}
            trend={{ value: `${currentTier.interestRate}% interest`, positive: true }}
            linkHref="/savings"
            linkText="View Details"
          />
        </motion.div>
        
        <motion.div variants={itemVariants} custom={1}>
          <SummaryCard
            title="Active Loans"
            value={`$${activeLoansAmount.toFixed(2)}`}
            icon={<CreditCard className="h-5 w-5" />}
            trend={{ value: userData?.loans?.filter(l => l.status === "APPROVED").length + " active", positive: false }}
            linkHref="/loans"
            linkText="View Details"
          />
        </motion.div>
        
        <motion.div variants={itemVariants} custom={2}>
          <SummaryCard
            title="Pending Applications"
            value={pendingApplicationsCount}
            icon={<Clock className="h-5 w-5" />}
            linkHref="/loans"
            linkText="View Applications"
          />
        </motion.div>
        
        <motion.div variants={itemVariants} custom={3}>
          <SummaryCard
            title="Recent Transactions"
            value={recentTransactionsCount}
            icon={<RefreshCw className="h-5 w-5" />}
            trend={{ value: "last 30 days", positive: true }}
            linkHref="/transactions"
            linkText="View All Transactions"
          />
        </motion.div>
      </motion.div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SavingsChart 
            savingsData={savingsChartData}
            savingsDistribution={savingsDistribution}
            savingsGoal={nextTier?.requiredBalance}
          />
        </div>
        <div className="lg:col-span-1">
          <SavingsTierCard 
            currentTier={currentTier}
            nextTier={nextTier}
            currentBalance={savingsBalance}
          />
        </div>
      </div>
      
      {activeLoansAmount > 0 && (
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <LoanChart 
            loans={loanData}
            loanDistribution={loanDistribution}
          />
        </motion.div>
      )}
      
      <motion.div 
        className="mt-8"
        initial="hidden"
        animate="visible"
        variants={tableVariants}
      >
        <TransactionTable 
          transactions={transactionsData || []}
          showViewAll
          onViewAll={() => window.location.href = "/transactions"}
        />
      </motion.div>
    </AppLayout>
  );
}
