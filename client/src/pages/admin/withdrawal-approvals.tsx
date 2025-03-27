import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Withdrawal } from "@shared/schema";
import { format } from "date-fns";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle2, XCircle } from "lucide-react";

// Extended type with user info
interface WithdrawalWithUser extends Withdrawal {
  user?: {
    id: number;
    name: string;
    email: string;
  };
  savings?: {
    id: number;
    balance: string;
  };
}

// Define DataTableColumn interface to match the one in data-table.tsx
interface DataTableColumn<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => any);
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export default function WithdrawalApprovalsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalWithUser | null>(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  
  // Fetch pending withdrawals with user information
  const { data: pendingWithdrawals, isLoading } = useQuery<WithdrawalWithUser[]>({
    queryKey: ['/api/savings/withdrawals/pending'],
  });

  // Approve withdrawal mutation
  const approveMutation = useMutation({
    mutationFn: async (withdrawalId: number) => {
      return apiRequest("POST", `/api/savings/withdrawal/${withdrawalId}/approve`, {});
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal approved",
        description: "The withdrawal request has been approved",
      });
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/savings/withdrawals/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      setOpenApproveDialog(false);
      setSelectedWithdrawal(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to approve withdrawal",
        variant: "destructive",
      });
    }
  });

  // Reject withdrawal mutation
  const rejectMutation = useMutation({
    mutationFn: async (withdrawalId: number) => {
      return apiRequest("POST", `/api/savings/withdrawal/${withdrawalId}/reject`, {});
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal rejected",
        description: "The withdrawal request has been rejected",
      });
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/savings/withdrawals/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      
      setOpenRejectDialog(false);
      setSelectedWithdrawal(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to reject withdrawal",
        variant: "destructive",
      });
    }
  });

  const handleApprove = () => {
    if (selectedWithdrawal) {
      approveMutation.mutate(selectedWithdrawal.id);
    }
  };

  const handleReject = () => {
    if (selectedWithdrawal) {
      rejectMutation.mutate(selectedWithdrawal.id);
    }
  };

  const columns: DataTableColumn<WithdrawalWithUser>[] = [
    {
      header: "Member",
      accessorKey: (row: WithdrawalWithUser) => row.user?.name || "Unknown Member",
      cell: (row: WithdrawalWithUser) => row.user?.name || "Unknown Member",
    },
    {
      header: "Amount",
      accessorKey: (row: WithdrawalWithUser) => row.amount,
      cell: (row: WithdrawalWithUser) => `$${parseFloat(row.amount.toString()).toFixed(2)}`,
    },
    {
      header: "Method",
      accessorKey: (row: WithdrawalWithUser) => row.method,
      cell: (row: WithdrawalWithUser) => row.method.charAt(0).toUpperCase() + row.method.slice(1),
    },
    {
      header: "Date Requested",
      accessorKey: (row: WithdrawalWithUser) => format(new Date(row.createdAt), "MMM dd, yyyy • h:mm a"),
      cell: (row: WithdrawalWithUser) => format(new Date(row.createdAt), "MMM dd, yyyy • h:mm a"),
    },
    {
      header: "Status",
      accessorKey: (row: WithdrawalWithUser) => row.status,
      cell: (row: WithdrawalWithUser) => (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: (row: WithdrawalWithUser) => row.id.toString(),
      cell: (row: WithdrawalWithUser) => {
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
              onClick={() => {
                setSelectedWithdrawal(row);
                setOpenApproveDialog(true);
              }}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
              onClick={() => {
                setSelectedWithdrawal(row);
                setOpenRejectDialog(true);
              }}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <AppLayout 
      title="Withdrawal Approvals" 
      description="Review and manage pending withdrawal requests"
      adminRequired
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Pending Withdrawal Requests</h3>
        </div>
        
        <div className="p-5">
          <DataTable
            data={pendingWithdrawals || []}
            columns={columns}
            searchable
            searchPlaceholder="Search withdrawals..."
          />
        </div>
      </div>

      {/* Approve Confirmation Dialog */}
      <AlertDialog open={openApproveDialog} onOpenChange={setOpenApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Withdrawal Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this withdrawal of ${selectedWithdrawal ? parseFloat(selectedWithdrawal.amount).toFixed(2) : "0.00"}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={approveMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleApprove} 
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {approveMutation.isPending ? "Processing..." : "Approve Withdrawal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Confirmation Dialog */}
      <AlertDialog open={openRejectDialog} onOpenChange={setOpenRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Withdrawal Request</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this withdrawal request of ${selectedWithdrawal ? parseFloat(selectedWithdrawal.amount).toFixed(2) : "0.00"}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReject} 
              disabled={rejectMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isPending ? "Processing..." : "Reject Withdrawal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}