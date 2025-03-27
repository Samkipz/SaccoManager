import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Coins 
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'loan_repayment';
  date: Date;
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  reference?: string;
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const [transactionType, setTransactionType] = useState<string>("all");
  const [timeRange, setTimeRange] = useState<string>("30");
  
  // Fetch all user transactions
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/${user?.id}`],
  });
  
  // Filter transactions based on selected filters
  const filteredTransactions = transactions?.filter(transaction => {
    // Filter by transaction type
    if (transactionType !== "all" && transaction.type !== transactionType) {
      return false;
    }
    
    // Filter by time range
    if (timeRange !== "all") {
      const daysAgo = parseInt(timeRange, 10);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      if (new Date(transaction.date) < cutoffDate) {
        return false;
      }
    }
    
    return true;
  }) || [];

  const columns = [
    {
      header: "Transaction",
      accessorKey: "type",
      cell: (row: Transaction) => {
        let icon;
        let label;
        let bgColor;
        let textColor;
        
        switch (row.type) {
          case "deposit":
            icon = <ArrowDownCircle className="h-4 w-4" />;
            label = "Deposit";
            bgColor = "bg-green-100";
            textColor = "text-green-600";
            break;
          case "withdrawal":
            icon = <ArrowUpCircle className="h-4 w-4" />;
            label = "Withdrawal";
            bgColor = "bg-amber-100";
            textColor = "text-amber-600";
            break;
          case "loan_repayment":
            icon = <Coins className="h-4 w-4" />;
            label = "Loan Repayment";
            bgColor = "bg-indigo-100";
            textColor = "text-indigo-600";
            break;
        }
        
        return (
          <div className="flex items-center">
            <div className={`${bgColor} p-1.5 rounded-lg ${textColor} mr-3`}>
              {icon}
            </div>
            <div>
              <span className="text-sm font-medium text-gray-900">{label}</span>
              {row.reference && <p className="text-xs text-gray-500">{row.reference}</p>}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Date",
      accessorKey: (row: Transaction) => format(new Date(row.date), "MMM dd, yyyy • h:mm a"),
      sortable: true,
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row: Transaction) => {
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(row.amount);
        
        const isDeposit = row.type === 'deposit';
        const textColor = isDeposit ? 'text-green-600' : 'text-amber-600';
        
        return (
          <span className={`font-mono text-sm font-medium ${textColor}`}>
            {isDeposit ? '+' : '-'}{formatted}
          </span>
        );
      },
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Transaction) => {
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

  return (
    <AppLayout title="Transactions" description="View your transaction history">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          <div className="flex items-center space-x-2">
            <Select value={transactionType} onValueChange={setTransactionType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Transactions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
                <SelectItem value="loan_repayment">Loan Repayments</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Last 30 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
                <SelectItem value="365">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="p-5">
          <DataTable 
            data={filteredTransactions}
            columns={columns}
            searchable
            searchPlaceholder="Search transactions..."
          />
        </div>
      </div>
    </AppLayout>
  );
}
