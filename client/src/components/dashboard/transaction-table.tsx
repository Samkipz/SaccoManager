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
import { motion, AnimatePresence } from "framer-motion";

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

  // Define animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
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

  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        delayChildren: 0.2
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 18 
      }
    },
    hover: { 
      scale: 1.01,
      backgroundColor: "rgba(249, 250, 251, 0.5)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 15 
      }
    },
    hover: { 
      scale: 1.1,
      rotate: [0, -5, 5, -5, 0],
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };
  
  return (
    <div>
      {showViewAll && (
        <motion.div 
          className="flex items-center justify-between mb-4"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <motion.button
            onClick={onViewAll}
            className="text-sm text-primary hover:text-primary-700 font-medium"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View All
          </motion.button>
        </motion.div>
      )}
      
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
      >
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
            <AnimatePresence>
              <motion.tbody
                variants={tableVariants}
                initial="hidden"
                animate="visible"
              >
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction, index) => (
                    <motion.tr 
                      key={transaction.id}
                      className="border-b transition-colors hover:bg-gray-50"
                      variants={rowVariants}
                      custom={index}
                      whileHover="hover"
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -50 }}
                    >
                      <TableCell>
                        <div className="flex items-center">
                          <motion.div
                            variants={iconVariants}
                            whileHover="hover"
                          >
                            {getTransactionIcon(transaction.type)}
                          </motion.div>
                          <span className="text-sm font-medium text-gray-900">
                            {getTransactionLabel(transaction.type)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(transaction.date, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="font-mono text-sm font-medium">
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + (index * 0.05) }}
                        >
                          {getAmountDisplay(transaction.type, transaction.amount)}
                        </motion.span>
                      </TableCell>
                      <TableCell>
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.4 + (index * 0.05) }}
                        >
                          {getStatusBadge(transaction.status)}
                        </motion.div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </motion.tbody>
            </AnimatePresence>
          </Table>
        </div>
      </motion.div>
    </div>
  );
}
