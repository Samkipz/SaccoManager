import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { 
  TransactionTable, 
  Transaction 
} from "@/components/dashboard/transaction-table";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  DollarSign, 
  Coins, 
  Clock, 
  RefreshCw 
} from "lucide-react";
import { UserWithSavingsAndLoans } from "@shared/schema";

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

  return (
    <AppLayout 
      title="Dashboard" 
      description={`Welcome back, ${user?.name}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <SummaryCard
          title="Total Savings"
          value={`$${savingsBalance.toFixed(2)}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: "+5.2%", positive: true }}
          linkHref="/savings"
          linkText="View Details"
        />
        
        <SummaryCard
          title="Active Loans"
          value={`$${activeLoansAmount.toFixed(2)}`}
          icon={<Coins className="h-5 w-5" />}
          trend={{ value: "Due in 45 days", positive: false }}
          linkHref="/loans"
          linkText="View Details"
        />
        
        <SummaryCard
          title="Pending Applications"
          value={pendingApplicationsCount}
          icon={<Clock className="h-5 w-5" />}
          linkHref="/loans"
          linkText="View Applications"
        />
        
        <SummaryCard
          title="Recent Transactions"
          value={recentTransactionsCount}
          icon={<RefreshCw className="h-5 w-5" />}
          trend={{ value: "last 30 days", positive: true }}
          linkHref="/transactions"
          linkText="View All Transactions"
        />
      </div>
      
      <div className="mt-8">
        <TransactionTable 
          transactions={transactionsData || []}
          showViewAll
          onViewAll={() => window.location.href = "/transactions"}
        />
      </div>
    </AppLayout>
  );
}
