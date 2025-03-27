import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  User,
  Savings,
  Loan,
  Deposit,
  Withdrawal,
  Repayment
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { AppLayout } from "@/components/layouts/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  UserIcon,
  WalletIcon,
  BanknoteIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  MailIcon,
  ClockIcon
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { Progress } from "@/components/ui/progress";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'loan_repayment';
  date: Date;
  amount: number;
  status: 'completed' | 'pending' | 'rejected';
  reference: string;
}

interface MemberDetails {
  user: User;
  savings?: Savings & {
    deposits?: Deposit[];
    withdrawals?: Withdrawal[];
  };
  loans?: (Loan & {
    repayments?: Repayment[];
  })[];
}

interface DataTableColumn<T> {
  header: string;
  accessorKey: keyof T | ((row: T) => any);
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

export default function MemberDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Fetch member details
  const { data: memberDetails, isLoading } = useQuery<MemberDetails>({
    queryKey: ['/api/users', parseInt(id)],
    queryFn: async () => {
      const user = await apiRequest("GET", `/api/users/${id}`);
      
      // Get savings with deposits and withdrawals
      let savings = null;
      try {
        savings = await apiRequest("GET", `/api/savings/${id}`);
      } catch (error) {
        console.error("Failed to fetch savings:", error);
      }
      
      // Get loans with repayments
      let loans = null;
      try {
        loans = await apiRequest("GET", `/api/loans/user/${id}`);
      } catch (error) {
        console.error("Failed to fetch loans:", error);
      }
      
      return { user, savings, loans };
    }
  });
  
  // Construct transaction history from deposits, withdrawals, and loan repayments
  const allTransactions: Transaction[] = [];
  
  if (memberDetails) {
    // Add deposits
    if (memberDetails.savings && Array.isArray(memberDetails.savings.deposits) && memberDetails.savings.deposits.length) {
      memberDetails.savings.deposits.forEach(deposit => {
        allTransactions.push({
          id: `dep-${deposit.id}`,
          type: 'deposit',
          date: new Date(deposit.createdAt),
          amount: parseFloat(deposit.amount),
          status: 'completed',
          reference: `#TRX-${deposit.id}${Math.floor(Math.random() * 1000)}`
        });
      });
    }
    
    // Add withdrawals
    if (memberDetails.savings && Array.isArray(memberDetails.savings.withdrawals) && memberDetails.savings.withdrawals.length) {
      memberDetails.savings.withdrawals.forEach(withdrawal => {
        allTransactions.push({
          id: `wdr-${withdrawal.id}`,
          type: 'withdrawal',
          date: new Date(withdrawal.createdAt),
          amount: parseFloat(withdrawal.amount),
          status: withdrawal.status.toLowerCase() as 'completed' | 'pending' | 'rejected',
          reference: `#TRX-${withdrawal.id}${Math.floor(Math.random() * 1000)}`
        });
      });
    }
    
    // Add loan repayments
    if (Array.isArray(memberDetails.loans) && memberDetails.loans.length) {
      memberDetails.loans.forEach(loan => {
        if (Array.isArray(loan.repayments) && loan.repayments.length) {
          loan.repayments.forEach(repayment => {
            allTransactions.push({
              id: `rep-${repayment.id}`,
              type: 'loan_repayment',
              date: new Date(repayment.createdAt),
              amount: parseFloat(repayment.amount),
              status: 'completed',
              reference: `#TRX-${repayment.id}${Math.floor(Math.random() * 1000)}`
            });
          });
        }
      });
    }
  }
  
  // Sort transactions by date (newest first)
  allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  
  const getTransactionTypeDisplay = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Deposit</Badge>;
      case 'withdrawal':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Withdrawal</Badge>;
      case 'loan_repayment':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Loan Repayment</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Transaction table columns
  const transactionColumns: DataTableColumn<Transaction>[] = [
    {
      header: "Transaction Type",
      accessorKey: "type",
      cell: (row: Transaction) => getTransactionTypeDisplay(row.type),
      sortable: true,
    },
    {
      header: "Date",
      accessorKey: (row: Transaction) => row.date ? format(new Date(row.date), "yyyy-MM-dd") : "",
      cell: (row: Transaction) => row.date ? format(new Date(row.date), "MMM dd, yyyy • h:mm a") : "Unknown",
      sortable: true,
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (row: Transaction) => {
        const prefix = row.type === 'withdrawal' ? '-' : '+';
        return <span className={row.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
          {prefix}${row.amount.toFixed(2)}
        </span>;
      },
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: Transaction) => getStatusBadge(row.status),
      sortable: true,
    },
    {
      header: "Reference",
      accessorKey: "reference",
      cell: (row: Transaction) => row.reference,
      sortable: true,
    },
  ];
  
  // Calculate financial metrics
  const calculateMetrics = () => {
    if (!memberDetails) return {
      totalSavings: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      loanBalance: 0,
      loanRepayments: 0
    };
    
    // Savings balance
    const savingsBalance = memberDetails.savings ? parseFloat(memberDetails.savings.balance) : 0;
    
    // Total deposits
    const totalDeposits = memberDetails.savings && Array.isArray(memberDetails.savings.deposits) 
      ? memberDetails.savings.deposits.reduce((sum, deposit) => {
          return sum + parseFloat(deposit.amount);
        }, 0) 
      : 0;
    
    // Total withdrawals
    const totalWithdrawals = 
      memberDetails.savings && 
      Array.isArray(memberDetails.savings.withdrawals) 
        ? memberDetails.savings.withdrawals
            .filter(w => w.status === 'APPROVED')
            .reduce((sum, withdrawal) => sum + parseFloat(withdrawal.amount), 0)
        : 0;
    
    // Loan balance (sum of all approved loans)
    const loanBalance = Array.isArray(memberDetails.loans) 
      ? memberDetails.loans
          .filter(loan => loan.status === 'APPROVED')
          .reduce((sum, loan) => sum + parseFloat(loan.amount), 0) 
      : 0;
    
    // Loan repayments
    const loanRepayments = Array.isArray(memberDetails.loans)
      ? memberDetails.loans.reduce((sum, loan) => {
          if (Array.isArray(loan.repayments) && loan.repayments.length) {
            return sum + loan.repayments.reduce((sum, repayment) => {
              return sum + parseFloat(repayment.amount);
            }, 0);
          }
          return sum;
        }, 0)
      : 0;
    
    return {
      totalSavings: savingsBalance,
      totalDeposits,
      totalWithdrawals,
      loanBalance,
      loanRepayments
    };
  };
  
  const metrics = calculateMetrics();
  
  if (isLoading) {
    return (
      <AppLayout 
        title="Member Details" 
        description="Viewing member details and activity"
        adminRequired
      >
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-lg">Loading member details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  if (!memberDetails?.user) {
    return (
      <AppLayout 
        title="Member Details" 
        description="Viewing member details and activity"
        adminRequired
      >
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Member Not Found</h2>
          <p className="text-gray-600">The requested member could not be found. Please check the member ID and try again.</p>
        </div>
      </AppLayout>
    );
  }
  
  return (
    <AppLayout 
      title={`Member: ${memberDetails.user.name}`} 
      description="Viewing member details and activity"
      adminRequired
    >
      <div className="space-y-6">
        {/* Member profile header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="bg-gray-100 p-4 rounded-full">
                <UserIcon className="h-16 w-16 text-gray-700" />
              </div>
              
              <div className="space-y-1 flex-1">
                <h2 className="text-2xl font-bold text-gray-900">{memberDetails.user.name}</h2>
                <div className="flex items-center text-gray-500 space-x-1">
                  <MailIcon className="h-4 w-4" />
                  <span>{memberDetails.user.email}</span>
                </div>
                <div className="flex items-center text-gray-500 space-x-1 mt-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Member since {memberDetails.user.createdAt ? format(new Date(memberDetails.user.createdAt), "MMMM d, yyyy") : "Unknown"}</span>
                </div>
                
                <div className="mt-4">
                  <Badge className="bg-primary-50 text-primary border-primary-100">
                    {memberDetails.user.role}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg">
                  <div className="text-sm font-medium">Total Savings</div>
                  <div className="text-2xl font-bold">${metrics.totalSavings.toFixed(2)}</div>
                </div>
                
                <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg">
                  <div className="text-sm font-medium">Outstanding Loans</div>
                  <div className="text-2xl font-bold">${metrics.loanBalance.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs for different sections */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="savings">Savings</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <WalletIcon className="h-5 w-5 mr-2 text-primary" />
                    Total Savings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${metrics.totalSavings.toFixed(2)}</div>
                  <p className="text-xs text-gray-500 mt-1">From {memberDetails.savings && Array.isArray(memberDetails.savings.deposits) ? memberDetails.savings.deposits.length : 0} deposits</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <ArrowDownIcon className="h-5 w-5 mr-2 text-green-600" />
                    Total Deposits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${metrics.totalDeposits.toFixed(2)}</div>
                  <p className="text-xs text-gray-500 mt-1">Lifetime deposits</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <ArrowUpIcon className="h-5 w-5 mr-2 text-orange-600" />
                    Total Withdrawals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">${metrics.totalWithdrawals.toFixed(2)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {memberDetails.savings && Array.isArray(memberDetails.savings.withdrawals) 
                      ? memberDetails.savings.withdrawals.filter(w => w.status === 'APPROVED').length 
                      : 0} approved withdrawals
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <BanknoteIcon className="h-5 w-5 mr-2 text-blue-600" />
                    Loan Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">${metrics.loanBalance.toFixed(2)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {Array.isArray(memberDetails.loans) ? memberDetails.loans.filter(loan => loan.status === 'APPROVED').length : 0} active loans
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Recent Transactions */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>The member's most recent financial activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {allTransactions.length > 0 ? (
                    <DataTable 
                      data={allTransactions.slice(0, 5)}
                      columns={transactionColumns}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No transaction history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Member Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Financial Health</CardTitle>
                  <CardDescription>Member's financial status summary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Savings Goal</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Loan Repayment</span>
                      <span className="font-medium">
                        {metrics.loanBalance > 0 
                          ? `${Math.min(Math.round((metrics.loanRepayments / (metrics.loanBalance + metrics.loanRepayments)) * 100), 100)}%` 
                          : '100%'}
                      </span>
                    </div>
                    <Progress 
                      value={metrics.loanBalance > 0 
                        ? Math.min(Math.round((metrics.loanRepayments / (metrics.loanBalance + metrics.loanRepayments)) * 100), 100)
                        : 100} 
                      className="h-2" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Activity Score</span>
                      <span className="font-medium">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Account Activity</h4>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Regular Deposits</span>
                      </div>
                      <span>Yes</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-orange-500 mr-2"></div>
                        <span>Loan Defaults</span>
                      </div>
                      <span>None</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                        <span>On-time Payments</span>
                      </div>
                      <span>100%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Complete record of all financial transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {allTransactions.length > 0 ? (
                  <DataTable 
                    data={allTransactions}
                    columns={transactionColumns}
                    searchable
                    searchPlaceholder="Search transactions..."
                  />
                ) : (
                  <div className="text-center py-16">
                    <p className="text-gray-500">No transaction history available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Savings Tab */}
          <TabsContent value="savings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Savings Account</CardTitle>
                <CardDescription>
                  {memberDetails.savings 
                    ? `Account #${memberDetails.savings.id} • Current Balance: $${parseFloat(memberDetails.savings.balance).toFixed(2)}`
                    : 'No savings account found'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!memberDetails.savings ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">This member does not have a savings account yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">${parseFloat(memberDetails.savings.balance).toFixed(2)}</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">${metrics.totalDeposits.toFixed(2)}</div>
                          <p className="text-xs text-gray-500">{memberDetails.savings && Array.isArray(memberDetails.savings.deposits) ? memberDetails.savings.deposits.length : 0} transactions</p>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Total Withdrawals</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-600">${metrics.totalWithdrawals.toFixed(2)}</div>
                          <p className="text-xs text-gray-500">
                            {Array.isArray(memberDetails.savings.withdrawals) 
                              ? memberDetails.savings.withdrawals.filter(w => w.status === 'APPROVED').length 
                              : 0} approved / 
                            {Array.isArray(memberDetails.savings.withdrawals) 
                              ? memberDetails.savings.withdrawals.length 
                              : 0} total
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Deposit History</h3>
                        {memberDetails.savings && Array.isArray(memberDetails.savings.deposits) && memberDetails.savings.deposits.length > 0 ? (
                          <DataTable 
                            data={memberDetails.savings.deposits}
                            columns={[
                              {
                                header: "Amount",
                                accessorKey: "amount",
                                cell: (row: Deposit) => `$${parseFloat(row.amount).toFixed(2)}`,
                                sortable: true,
                              },
                              {
                                header: "Method",
                                accessorKey: "method",
                                cell: (row: Deposit) => <span className="capitalize">{row.method}</span>,
                                sortable: true,
                              },
                              {
                                header: "Date",
                                accessorKey: (row: Deposit) => row.createdAt ? format(new Date(row.createdAt), "yyyy-MM-dd") : "",
                                cell: (row: Deposit) => row.createdAt ? format(new Date(row.createdAt), "MMM dd, yyyy") : "Unknown",
                                sortable: true,
                              },
                              {
                                header: "Notes",
                                accessorKey: "notes",
                                cell: (row: Deposit) => row.notes || "-",
                                sortable: false,
                              },
                            ]}
                          />
                        ) : (
                          <div className="text-center py-8 border rounded-lg bg-gray-50">
                            <p className="text-gray-500">No deposit history available</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Withdrawal History</h3>
                        {memberDetails.savings && Array.isArray(memberDetails.savings.withdrawals) && memberDetails.savings.withdrawals.length > 0 ? (
                          <DataTable 
                            data={memberDetails.savings.withdrawals}
                            columns={[
                              {
                                header: "Amount",
                                accessorKey: "amount",
                                cell: (row: Withdrawal) => `$${parseFloat(row.amount).toFixed(2)}`,
                                sortable: true,
                              },
                              {
                                header: "Method",
                                accessorKey: "method",
                                cell: (row: Withdrawal) => <span className="capitalize">{row.method}</span>,
                                sortable: true,
                              },
                              {
                                header: "Date",
                                accessorKey: (row: Withdrawal) => row.createdAt ? format(new Date(row.createdAt), "yyyy-MM-dd") : "",
                                cell: (row: Withdrawal) => row.createdAt ? format(new Date(row.createdAt), "MMM dd, yyyy") : "Unknown",
                                sortable: true,
                              },
                              {
                                header: "Reason",
                                accessorKey: "reason",
                                cell: (row: Withdrawal) => row.reason || "-",
                                sortable: false,
                              },
                              {
                                header: "Status",
                                accessorKey: "status",
                                cell: (row: Withdrawal) => getStatusBadge(row.status),
                                sortable: true,
                              },
                            ]}
                          />
                        ) : (
                          <div className="text-center py-8 border rounded-lg bg-gray-50">
                            <p className="text-gray-500">No withdrawal history available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Loan History</CardTitle>
                <CardDescription>All loan applications and current status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!memberDetails.loans || memberDetails.loans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">This member has not applied for any loans yet.</p>
                  </div>
                ) : (
                  <DataTable 
                    data={memberDetails.loans}
                    columns={[
                      {
                        header: "Loan ID",
                        accessorKey: "id",
                        cell: (row: Loan) => `#${row.id}`,
                        sortable: true,
                      },
                      {
                        header: "Amount",
                        accessorKey: "amount",
                        cell: (row: Loan) => `$${parseFloat(row.amount).toFixed(2)}`,
                        sortable: true,
                      },
                      {
                        header: "Purpose",
                        accessorKey: "purpose",
                        cell: (row: Loan) => <span className="capitalize">{row.purpose}</span>,
                        sortable: true,
                      },
                      {
                        header: "Term",
                        accessorKey: "term",
                        cell: (row: Loan) => `${row.term} months`,
                        sortable: true,
                      },
                      {
                        header: "Application Date",
                        accessorKey: (row: Loan) => row.createdAt ? format(new Date(row.createdAt), "yyyy-MM-dd") : "",
                        cell: (row: Loan) => row.createdAt ? format(new Date(row.createdAt), "MMM dd, yyyy") : "Unknown",
                        sortable: true,
                      },
                      {
                        header: "Status",
                        accessorKey: "status",
                        cell: (row: Loan) => getStatusBadge(row.status),
                        sortable: true,
                      },
                    ]}
                  />
                )}
                
                {/* Loan Repayments */}
                {memberDetails.loans && memberDetails.loans.some(loan => loan.repayments && loan.repayments.length > 0) && (
                  <div className="pt-4 mt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">Loan Repayments</h3>
                    
                    {memberDetails.loans.map(loan => {
                      if (!loan.repayments || loan.repayments.length === 0) return null;
                      
                      // Calculate total amount paid vs. loan amount
                      const totalPaid = loan.repayments.reduce((sum, repayment) => {
                        return sum + parseFloat(repayment.amount);
                      }, 0);
                      
                      const percentagePaid = Math.min(Math.round((totalPaid / parseFloat(loan.amount)) * 100), 100);
                      
                      return (
                        <div key={loan.id} className="mb-6 bg-gray-50 p-4 rounded-lg">
                          <div className="flex flex-wrap items-center justify-between mb-4">
                            <div>
                              <span className="text-gray-800 font-medium">Loan #{loan.id}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-600">${parseFloat(loan.amount).toFixed(2)}</span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-600 capitalize">{loan.purpose}</span>
                            </div>
                            {getStatusBadge(loan.status)}
                          </div>
                          
                          <div className="space-y-3 mb-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Repayment Progress</span>
                              <span className="font-medium">{percentagePaid}%</span>
                            </div>
                            <Progress value={percentagePaid} className="h-2" />
                            <div className="flex justify-between text-sm">
                              <span>${totalPaid.toFixed(2)} paid</span>
                              <span>${parseFloat(loan.amount).toFixed(2)} total</span>
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">Repayment History</h5>
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                              <thead>
                                <tr>
                                  <th className="px-2 py-2 text-left font-medium text-gray-500">Date</th>
                                  <th className="px-2 py-2 text-left font-medium text-gray-500">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {loan.repayments.map(repayment => (
                                  <tr key={repayment.id}>
                                    <td className="px-2 py-2 whitespace-nowrap">
                                      {repayment.createdAt ? format(new Date(repayment.createdAt), "MMM dd, yyyy") : "Unknown"}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-green-600">
                                      ${parseFloat(repayment.amount).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Member Reports</CardTitle>
                <CardDescription>Financial analysis and reports for this member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Savings Growth */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Savings Growth</h3>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center py-12 px-4">
                          <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h4 className="text-lg font-medium mb-2">Reports Coming Soon</h4>
                          <p className="text-gray-500">
                            Detailed savings growth analysis will be available in a future update.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Loan Summary */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Loan Summary</h3>
                    
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center py-12 px-4">
                          <ClockIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h4 className="text-lg font-medium mb-2">Reports Coming Soon</h4>
                          <p className="text-gray-500">
                            Detailed loan history and repayment analysis will be available in a future update.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}