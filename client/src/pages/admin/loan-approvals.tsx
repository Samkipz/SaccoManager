import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { LoanReviewForm } from "@/components/loans/loan-review-form";
import { useToast } from "@/hooks/use-toast";
import { LoanWithRepayments } from "@shared/schema";
import { format } from "date-fns";

export default function LoanApprovalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLoan, setSelectedLoan] = useState<LoanWithRepayments | null>(null);
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  
  // Fetch pending loan applications
  const { data: pendingLoans, isLoading } = useQuery<LoanWithRepayments[]>({
    queryKey: ['/api/loans/pending'],
  });

  const columns = [
    {
      header: "Loan ID",
      accessorKey: "id",
      cell: (row: LoanWithRepayments) => (
        <span className="text-sm font-medium text-gray-900">#{row.id}</span>
      ),
      sortable: true,
    },
    {
      header: "Member",
      accessorKey: (row: LoanWithRepayments) => row.user?.name || "Unknown",
      cell: (row: LoanWithRepayments) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="text-sm font-medium text-gray-900">
            {row.user?.name || "Unknown"}
          </div>
        </div>
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
      header: "Purpose",
      accessorKey: "purpose",
      cell: (row: LoanWithRepayments) => (
        <span className="text-sm text-gray-500 capitalize">
          {row.purpose}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Date Applied",
      accessorKey: (row: LoanWithRepayments) => new Date(row.createdAt).getTime(),
      cell: (row: LoanWithRepayments) => (
        <span className="text-sm text-gray-500">
          {format(new Date(row.createdAt), "MMM dd, yyyy")}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: LoanWithRepayments) => (
        <Button
          size="sm"
          onClick={() => handleReviewLoan(row)}
        >
          Review
        </Button>
      ),
    },
  ];

  const handleReviewLoan = (loan: LoanWithRepayments) => {
    setSelectedLoan(loan);
    setOpenReviewDialog(true);
  };

  const handleReviewSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/loans/pending'] });
    // Also invalidate any other relevant queries
    queryClient.invalidateQueries({ queryKey: ['/api/loans'] });
  };

  return (
    <AppLayout 
      title="Loan Approvals" 
      description="Review and manage pending loan applications"
      adminRequired
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Pending Applications</h3>
        </div>
        
        <div className="p-5">
          <DataTable
            data={pendingLoans || []}
            columns={columns}
            searchable
            searchPlaceholder="Search loan applications..."
          />
        </div>
      </div>

      {selectedLoan && (
        <Dialog open={openReviewDialog} onOpenChange={setOpenReviewDialog}>
          <DialogContent className="sm:max-w-2xl">
            <LoanReviewForm
              loan={selectedLoan}
              onClose={() => setOpenReviewDialog(false)}
              onSuccess={handleReviewSuccess}
            />
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
