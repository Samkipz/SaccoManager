import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { UserWithSavingsAndLoans, LoanWithRepayments } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { LoanApplicationForm } from "@/components/loans/loan-application-form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Coins, Timer, LineChart } from "lucide-react";

export default function LoansPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openLoanDialog, setOpenLoanDialog] = useState(false);
  
  // Fetch user data with loans
  const { data: userData, isLoading: userLoading } = useQuery<UserWithSavingsAndLoans>({
    queryKey: [`/api/users/${user?.id}`],
  });

  // Fetch all user loans with details
  const { data: loansData, isLoading: loansLoading } = useQuery<LoanWithRepayments[]>({
    queryKey: [`/api/loans/user/${user?.id}`],
  });

  // Calculate loan metrics
  const activeLoans = loansData?.filter(loan => loan.status === "APPROVED") || [];
  const pendingLoans = loansData?.filter(loan => loan.status === "PENDING") || [];
  
  const activeLoanAmount = activeLoans.reduce(
    (sum, loan) => sum + parseFloat(loan.amount.toString()), 
    0
  );
  
  const pendingLoanAmount = pendingLoans.reduce(
    (sum, loan) => sum + parseFloat(loan.amount.toString()), 
    0
  );
  
  // Calculate eligible loan amount (for demo, we'll use a formula based on savings)
  const savingsBalance = userData?.savings?.balance 
    ? parseFloat(userData.savings.balance.toString()) 
    : 0;
  
  const eligibleLoanAmount = Math.max(0, (savingsBalance * 2) - activeLoanAmount);

  const loanColumns = [
    {
      header: "Loan ID",
      accessorKey: "id",
      cell: (row: LoanWithRepayments) => (
        <span className="text-sm font-medium text-gray-900">#{row.id}</span>
      ),
      sortable: true,
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row: LoanWithRepayments) => (
        <span className="font-mono text-sm font-medium text-gray-900">
          ${parseFloat(row.amount.toString()).toFixed(2)}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Date Applied",
      accessorKey: (row: LoanWithRepayments) => format(new Date(row.createdAt), "MMM dd, yyyy"),
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: LoanWithRepayments) => {
        let badgeClass = "";
        switch (row.status) {
          case "APPROVED":
            badgeClass = "bg-green-100 text-green-800 hover:bg-green-100";
            break;
          case "PENDING":
            badgeClass = "bg-amber-100 text-amber-800 hover:bg-amber-100";
            break;
          case "REJECTED":
            badgeClass = "bg-red-100 text-red-800 hover:bg-red-100";
            break;
        }
        return (
          <Badge variant="outline" className={badgeClass}>
            {row.status.charAt(0) + row.status.slice(1).toLowerCase()}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      header: "Action",
      accessorKey: "id",
      cell: (row: LoanWithRepayments) => (
        <Button 
          variant="link" 
          className="p-0 h-auto font-medium"
          onClick={() => handleViewLoanDetails(row.id)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleViewLoanDetails = (loanId: number) => {
    toast({
      title: "Loan Details",
      description: `Viewing details for loan #${loanId}`,
    });
    // In a real app, this would navigate to a loan details page or open a modal
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
    queryClient.invalidateQueries({ queryKey: [`/api/loans/user/${user?.id}`] });
  };

  if (userLoading || loansLoading) {
    return (
      <AppLayout title="Loan Management" description="Loading loan information...">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 h-32" />
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-64" />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Loan Management" description="Apply for loans and manage your loan applications">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500">Active Loans</h3>
            <div className="bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900 font-mono">
              ${activeLoanAmount.toFixed(2)}
            </span>
          </div>
          {activeLoans.length > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: "40%" }} // In a real app, this would be a calculated percentage
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>$800.00 repaid</span>
                <span>$2,000.00 total</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500">Pending Applications</h3>
            <div className="bg-amber-50 text-amber-600 p-1.5 rounded-lg">
              <Timer className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900 font-mono">
              ${pendingLoanAmount.toFixed(2)}
            </span>
          </div>
          {pendingLoans.length > 0 ? (
            <div className="mt-2 text-sm text-amber-600">
              <span>Pending approval</span>
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-500">
              <span>No pending applications</span>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-500">Max. Eligible Amount</h3>
            <div className="bg-green-50 text-green-600 p-1.5 rounded-lg">
              <LineChart className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-bold text-gray-900 font-mono">
              ${eligibleLoanAmount.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 text-sm">
            <Dialog open={openLoanDialog} onOpenChange={setOpenLoanDialog}>
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto font-medium">
                  Apply for a loan <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <LoanApplicationForm
                  userId={user?.id || 0}
                  maxEligibleAmount={eligibleLoanAmount}
                  onClose={() => setOpenLoanDialog(false)}
                  onSuccess={handleSuccess}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Loan Applications</h3>
        <DataTable
          data={loansData || []}
          columns={loanColumns}
          searchable
          searchPlaceholder="Search loan applications..."
        />
      </div>
    </AppLayout>
  );
}

import { ArrowRight } from "lucide-react";
