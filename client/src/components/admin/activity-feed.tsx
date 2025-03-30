import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  Coins, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  ArrowDownLeft, 
  DollarSign, 
  ActivityIcon,
  ArrowRight 
} from "lucide-react";
import { cn, formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";

interface Activity {
  id: number;
  type: 'MEMBER_CREATED' | 'LOAN_CREATED' | 'LOAN_APPROVED' | 'LOAN_REJECTED' | 
         'WITHDRAWAL_CREATED' | 'WITHDRAWAL_APPROVED' | 'WITHDRAWAL_REJECTED' |
         'DEPOSIT_CREATED' | 'SAVINGS_CREATED' | 'REPAYMENT_CREATED';
  entityId: number;
  entityType: 'MEMBER' | 'LOAN' | 'WITHDRAWAL' | 'DEPOSIT' | 'SAVINGS' | 'REPAYMENT';
  timestamp: string;
  meta?: {
    memberName?: string;
    amount?: string;
    productName?: string;
    [key: string]: any;
  };
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (activity: Activity) => {
    switch (activity.type) {
      case 'MEMBER_CREATED':
        return <UserPlus className="h-4 w-4 text-blue-500" />;
      case 'LOAN_CREATED':
        return <Coins className="h-4 w-4 text-amber-500" />;
      case 'LOAN_APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'LOAN_REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'WITHDRAWAL_CREATED':
        return <CreditCard className="h-4 w-4 text-violet-500" />;
      case 'WITHDRAWAL_APPROVED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'WITHDRAWAL_REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'DEPOSIT_CREATED':
        return <ArrowDownLeft className="h-4 w-4 text-emerald-500" />;
      case 'SAVINGS_CREATED':
        return <DollarSign className="h-4 w-4 text-cyan-500" />;
      case 'REPAYMENT_CREATED':
        return <Coins className="h-4 w-4 text-indigo-500" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: Activity) => {
    const { type, meta } = activity;
    
    switch (type) {
      case 'MEMBER_CREATED':
        return `New member ${meta?.memberName || 'Unknown'} joined the SACCO`;
      case 'LOAN_CREATED':
        return `${meta?.memberName || 'A member'} applied for a ${meta?.productName || ''} loan of ${formatCurrency(meta?.amount || '0')}`;
      case 'LOAN_APPROVED':
        return `${meta?.memberName || 'A member'}'s loan of ${formatCurrency(meta?.amount || '0')} was approved`;
      case 'LOAN_REJECTED':
        return `${meta?.memberName || 'A member'}'s loan of ${formatCurrency(meta?.amount || '0')} was rejected`;
      case 'WITHDRAWAL_CREATED':
        return `${meta?.memberName || 'A member'} requested a withdrawal of ${formatCurrency(meta?.amount || '0')}`;
      case 'WITHDRAWAL_APPROVED':
        return `${meta?.memberName || 'A member'}'s withdrawal of ${formatCurrency(meta?.amount || '0')} was approved`;
      case 'WITHDRAWAL_REJECTED':
        return `${meta?.memberName || 'A member'}'s withdrawal of ${formatCurrency(meta?.amount || '0')} was rejected`;
      case 'DEPOSIT_CREATED':
        return `${meta?.memberName || 'A member'} made a deposit of ${formatCurrency(meta?.amount || '0')}`;
      case 'SAVINGS_CREATED':
        return `${meta?.memberName || 'A member'} opened a new ${meta?.productName || 'savings'} account`;
      case 'REPAYMENT_CREATED':
        return `${meta?.memberName || 'A member'} made a loan repayment of ${formatCurrency(meta?.amount || '0')}`;
      default:
        return 'Unknown activity';
    }
  };

  const getActivityLink = (activity: Activity) => {
    const { entityType, entityId } = activity;
    
    switch (entityType) {
      case 'MEMBER':
        return `/admin/members/${entityId}`;
      case 'LOAN':
        return `/admin/loans/${entityId}`;
      case 'WITHDRAWAL':
        return `/admin/withdrawals/${entityId}`;
      case 'DEPOSIT':
        return `/admin/deposits/${entityId}`;
      case 'SAVINGS':
        return `/admin/savings/${entityId}`;
      case 'REPAYMENT':
        return `/admin/repayments/${entityId}`;
      default:
        return '#';
    }
  };

  const getActivityBadge = (activity: Activity) => {
    switch (activity.type) {
      case 'MEMBER_CREATED':
        return <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">New Member</Badge>;
      case 'LOAN_CREATED':
        return <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Loan</Badge>;
      case 'LOAN_APPROVED':
      case 'WITHDRAWAL_APPROVED':
        return <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">Approved</Badge>;
      case 'LOAN_REJECTED':
      case 'WITHDRAWAL_REJECTED':
        return <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">Rejected</Badge>;
      case 'WITHDRAWAL_CREATED':
        return <Badge variant="outline" className="border-violet-200 bg-violet-50 text-violet-700">Withdrawal</Badge>;
      case 'DEPOSIT_CREATED':
        return <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Deposit</Badge>;
      case 'SAVINGS_CREATED':
        return <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">Savings</Badge>;
      case 'REPAYMENT_CREATED':
        return <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">Repayment</Badge>;
      default:
        return <Badge variant="outline">Activity</Badge>;
    }
  };

  // Function to get initials from name
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
          <ActivityIcon className="mr-2 h-5 w-5 text-gray-500" />
          <span>Recent Activities</span>
        </CardTitle>
        <CardDescription>Latest activities across the SACCO</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length > 0 ? (
            <>
              <div className="space-y-4">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="relative mt-1">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={cn(
                          "text-xs",
                          activity.type.includes('LOAN') ? "bg-amber-100 text-amber-700" :
                          activity.type.includes('WITHDRAWAL') ? "bg-violet-100 text-violet-700" :
                          activity.type.includes('DEPOSIT') ? "bg-emerald-100 text-emerald-700" :
                          activity.type.includes('MEMBER') ? "bg-blue-100 text-blue-700" :
                          activity.type.includes('SAVINGS') ? "bg-cyan-100 text-cyan-700" :
                          "bg-gray-100 text-gray-700"
                        )}>
                          {activity.meta?.memberName ? getInitials(activity.meta.memberName) : 'AC'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5">
                        <div className="rounded-full bg-gray-100 p-1">
                          {getActivityIcon(activity)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{getActivityMessage(activity)}</p>
                        {getActivityBadge(activity)}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(activity.timestamp)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs font-medium text-primary"
                          asChild
                        >
                          <a href={getActivityLink(activity)}>
                            View Details
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="/admin/activities">
                  <div className="flex items-center justify-center">
                    View All Activities
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </a>
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-3">
                <ActivityIcon className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-sm font-medium">No Recent Activities</h3>
              <p className="text-xs text-muted-foreground mt-1">
                The activity feed is currently empty
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}