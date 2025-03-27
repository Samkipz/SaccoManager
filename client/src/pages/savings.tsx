import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { SavingsWithTransactions, Deposit, Withdrawal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { DepositForm } from "@/components/savings/deposit-form";
import { WithdrawalForm } from "@/components/savings/withdrawal-form";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function SavingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDepositDialog, setOpenDepositDialog] = useState(false);
  const [openWithdrawalDialog, setOpenWithdrawalDialog] = useState(false);
  
  // Fetch user savings data
  const { data: savingsData, isLoading } = useQuery<SavingsWithTransactions>({
    queryKey: [`/api/savings/${user?.id}`],
  });

  const savingsBalance = savingsData?.balance ? parseFloat(savingsData.balance.toString()) : 0;
  const currentMonthDeposits = savingsData?.deposits
    ?.filter(deposit => {
      const depositDate = new Date(deposit.createdAt);
      const now = new Date();
      return depositDate.getMonth() === now.getMonth() &&
             depositDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, deposit) => sum + parseFloat(deposit.amount.toString()), 0) || 0;

  // Format all transactions for the table (deposits and withdrawals)
  const allTransactions = [
    ...(savingsData?.deposits || []).map(deposit => ({
      ...deposit,
      type: 'deposit' as const,
      status: 'completed' as const,
    })),
    ...(savingsData?.withdrawals || []).map(withdrawal => ({
      ...withdrawal,
      type: 'withdrawal' as const,
      status: withdrawal.status.toLowerCase() as 'completed' | 'pending' | 'rejected',
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const transactionColumns = [
    {
      header: "Transaction",
      accessorKey: "type",
      cell: (row: any) => (
        <div className="flex items-center">
          {row.type === 'deposit' ? (
            <div className="bg-green-100 p-1.5 rounded-lg text-green-600 mr-3">
              <ArrowDownCircle className="h-4 w-4" />
            </div>
          ) : (
            <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600 mr-3">
              <ArrowUpCircle className="h-4 w-4" />
            </div>
          )}
          <div>
            <span className="text-sm font-medium text-gray-900">
              {row.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </span>
            <p className="text-xs text-gray-500">#{row.id}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "Date",
      accessorKey: (row: any) => format(new Date(row.createdAt), "MMM dd, yyyy • h:mm a"),
      sortable: true,
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row: any) => {
        const amount = parseFloat(row.amount);
        return (
          <span className={`font-mono text-sm font-medium ${row.type === 'deposit' ? 'text-green-600' : 'text-amber-600'}`}>
            {row.type === 'deposit' ? '+' : '-'}${amount.toFixed(2)}
          </span>
        );
      },
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: any) => {
        let badgeClass = "";
        switch (row.status) {
          case "completed":
            badgeClass = "bg-green-100 text-green-800 hover:bg-green-100";
            break;
          case "pending":
            badgeClass = "bg-amber-100 text-amber-800 hover:bg-amber-100";
            break;
          case "rejected":
            badgeClass = "bg-red-100 text-red-800 hover:bg-red-100";
            break;
        }
        return (
          <Badge variant="outline" className={badgeClass}>
            {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          </Badge>
        );
      },
      sortable: true,
    },
  ];

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: [`/api/savings/${user?.id}`] });
    queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
    queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
  };

  return (
    <AppLayout title="Savings Management" description="Manage your savings account and transactions">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
        <div className="md:col-span-3 bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Savings Balance</h2>
              <p className="text-gray-500 text-sm">Your current savings account</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 font-mono">${savingsBalance.toFixed(2)}</p>
              <p className="text-green-600 text-sm">+${currentMonthDeposits.toFixed(2)} this month</p>
            </div>
          </div>
          
          <div className="h-40 w-full bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-400 italic text-sm">Savings growth chart will appear here</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <Dialog open={openDepositDialog} onOpenChange={setOpenDepositDialog}>
            <DialogTrigger asChild>
              <Button className="w-full mb-3">Deposit Funds</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DepositForm
                savingsId={savingsData?.id || 0}
                onClose={() => setOpenDepositDialog(false)}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={openWithdrawalDialog} onOpenChange={setOpenWithdrawalDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">Request Withdrawal</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <WithdrawalForm
                savingsId={savingsData?.id || 0}
                availableBalance={savingsBalance}
                onClose={() => setOpenWithdrawalDialog(false)}
                onSuccess={handleSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
        <DataTable
          data={allTransactions}
          columns={transactionColumns}
          searchable
          searchPlaceholder="Search transactions..."
        />
      </div>
    </AppLayout>
  );
}
