import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Coins,
} from "lucide-react";
import { format } from "date-fns";

export type TransactionType = "deposit" | "withdrawal" | "loan_repayment";

export interface Transaction {
  id: string;
  type: TransactionType;
  date: Date;
  amount: number;
  status: "completed" | "pending" | "rejected";
}

interface TransactionTableProps {
  transactions: Transaction[];
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function TransactionTable({
  transactions,
  showViewAll = false,
  onViewAll,
}: TransactionTableProps) {
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "deposit":
        return (
          <div className="bg-green-100 p-1.5 rounded-lg text-green-600 mr-3">
            <ArrowDownCircle className="h-4 w-4" />
          </div>
        );
      case "withdrawal":
        return (
          <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600 mr-3">
            <ArrowUpCircle className="h-4 w-4" />
          </div>
        );
      case "loan_repayment":
        return (
          <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600 mr-3">
            <Coins className="h-4 w-4" />
          </div>
        );
    }
  };

  const getTransactionLabel = (type: TransactionType) => {
    switch (type) {
      case "deposit":
        return "Deposit";
      case "withdrawal":
        return "Withdrawal";
      case "loan_repayment":
        return "Loan Repayment";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        );
    }
  };

  const getAmountDisplay = (type: TransactionType, amount: number) => {
    const formattedAmount = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);

    if (type === "deposit") {
      return <span className="text-green-600">{`+${formattedAmount}`}</span>;
    } else {
      return <span className="text-amber-600">{`-${formattedAmount}`}</span>;
    }
  };

  return (
    <div>
      {showViewAll && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <button
            onClick={onViewAll}
            className="text-sm text-primary hover:text-primary-700 font-medium"
          >
            View All
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.type)}
                        <span className="text-sm font-medium text-gray-900">
                          {getTransactionLabel(transaction.type)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(transaction.date, "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="font-mono text-sm font-medium">
                      {getAmountDisplay(transaction.type, transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
