import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Loan, type Withdrawal } from "@shared/schema";
import { CheckCircle2, XCircle, Clock, ArrowRight, Coins, CircleDollarSign } from "lucide-react";
import { Link } from "wouter";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PendingRequestsCardProps {
  pendingLoans: Partial<Loan>[];
  pendingWithdrawals: Partial<Withdrawal>[];
}

export function PendingRequestsCard({
  pendingLoans,
  pendingWithdrawals
}: PendingRequestsCardProps) {
  const getInitials = (name: string = '') => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Clock className="mr-2 h-5 w-5 text-gray-500" />
          <span>Pending Requests</span>
          <Badge variant="secondary" className="ml-2">
            {pendingLoans.length + pendingWithdrawals.length}
          </Badge>
        </CardTitle>
        <CardDescription>Review and process pending loan and withdrawal requests</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="loans">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="loans" className="flex items-center">
              <Coins className="mr-2 h-4 w-4" />
              Loans
              <Badge variant="secondary" className="ml-2 bg-primary/10">
                {pendingLoans.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="withdrawals" className="flex items-center">
              <CircleDollarSign className="mr-2 h-4 w-4" />
              Withdrawals
              <Badge variant="secondary" className="ml-2 bg-primary/10">
                {pendingWithdrawals.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="loans" className="m-0">
            {pendingLoans.length > 0 ? (
              <div className="space-y-3">
                {pendingLoans.slice(0, 3).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(loan.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{loan.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(loan.amount || '0')} - {loan.product?.name}</p>
                        <p className="text-xs text-muted-foreground">Applied: {formatDate(loan.createdAt || '')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button size="sm" variant="default" className="h-8 px-2">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {pendingLoans.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link href="/admin/loan-approvals">
                      <div className="flex items-center justify-center">
                        View All Pending Loans
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-green-100 p-3 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium">No Pending Loans</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  All loan applications have been processed
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="withdrawals" className="m-0">
            {pendingWithdrawals.length > 0 ? (
              <div className="space-y-3">
                {pendingWithdrawals.slice(0, 3).map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {getInitials(withdrawal.savings?.user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{withdrawal.savings?.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(withdrawal.amount || '0')} - {withdrawal.savings?.product?.name}</p>
                        <p className="text-xs text-muted-foreground">Requested: {formatDate(withdrawal.createdAt || '')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="h-8 px-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button size="sm" variant="default" className="h-8 px-2">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {pendingWithdrawals.length > 3 && (
                  <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                    <Link href="/admin/withdrawal-approvals">
                      <div className="flex items-center justify-center">
                        View All Pending Withdrawals
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-green-100 p-3 mb-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-sm font-medium">No Pending Withdrawals</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  All withdrawal requests have been processed
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}