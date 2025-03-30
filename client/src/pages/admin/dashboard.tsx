import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { PendingRequestsCard } from "@/components/admin/pending-requests-card";
import { ActivityFeed } from "@/components/admin/activity-feed";
import { MemberStatsCard } from "@/components/admin/member-stats-card";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { 
  Users, 
  CreditCard, 
  Clock, 
  BarChart3,
  Bell,
  Wallet,
  ArrowUpDown
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch statistics overview
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats'],
  });
  
  // Fetch pending approvals
  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['/api/admin/pending'],
  });

  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['/api/admin/activity'],
  });

  if (statsLoading || pendingLoading || activityLoading) {
    return (
      <AppLayout title="Admin Dashboard" description="Loading dashboard...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 h-32" />
          ))}
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 h-96" />
          ))}
        </div>
      </AppLayout>
    );
  }

  // Extract statistics
  const totalMembers = statsData?.totalMembers || 0;
  const totalSavings = statsData?.totalSavings || 0;
  const totalLoans = statsData?.totalLoans || 0;
  const monthlyGrowth = statsData?.monthlyGrowth || 0;
  
  const pendingLoans = pendingData?.pendingLoans || [];
  const pendingWithdrawals = pendingData?.pendingWithdrawals || [];
  const recentActivity = activityData?.activities || [];

  // Admin dashboard exclusive tabs
  const tabs = [
    { value: "overview", label: "Overview", icon: <BarChart3 className="h-4 w-4 mr-2" /> },
    { value: "members", label: "Members", icon: <Users className="h-4 w-4 mr-2" /> },
    { value: "approvals", label: "Approvals", icon: <Clock className="h-4 w-4 mr-2" /> }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <AppLayout 
      title="Admin Dashboard" 
      description="SACCO Administration"
      showUserSwitcher={true}
    >
      <div className="flex items-center justify-between mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-fit grid-cols-3">
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center px-4">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/reports" className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/messages" className="flex items-center">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Link>
          </Button>
        </div>
      </div>
      
      <TabsContent value="overview" className="mt-0">
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <SummaryCard
              title="Total Members"
              value={totalMembers}
              icon={<Users className="h-5 w-5" />}
              trend={{ value: `+${statsData?.newMembers || 0} new`, positive: true }}
              linkHref="/admin/members"
              linkText="View Members"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <SummaryCard
              title="Total Savings"
              value={`$${totalSavings.toLocaleString()}`}
              icon={<Wallet className="h-5 w-5" />}
              trend={{ value: `${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth}%`, positive: monthlyGrowth > 0 }}
              linkHref="/admin/savings"
              linkText="Savings Details"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <SummaryCard
              title="Active Loans"
              value={`$${totalLoans.toLocaleString()}`}
              icon={<CreditCard className="h-5 w-5" />}
              trend={{ value: `${pendingLoans.length} pending`, positive: false }}
              linkHref="/admin/loans"
              linkText="View Loans"
            />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <SummaryCard
              title="Pending Requests"
              value={pendingLoans.length + pendingWithdrawals.length}
              icon={<Clock className="h-5 w-5" />}
              trend={{ value: "needs attention", positive: false }}
              linkHref="/admin/approvals"
              linkText="View Requests"
              highlight={true}
            />
          </motion.div>
        </motion.div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <MemberStatsCard 
              totalMembers={totalMembers}
              newMembers={statsData?.newMembers || 0}
              activeMembers={statsData?.activeMembers || 0}
              growth={monthlyGrowth}
            />
          </div>
          <div className="lg:col-span-1">
            <PendingRequestsCard 
              pendingLoans={pendingLoans}
              pendingWithdrawals={pendingWithdrawals}
            />
          </div>
          <div className="lg:col-span-1">
            <ActivityFeed activities={recentActivity} />
          </div>
        </div>
        
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-bold">Quick Links</CardTitle>
              <CardDescription>
                Frequently used administrative tools
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex flex-col justify-center" asChild>
                  <Link href="/admin/members/new">
                    <Users className="h-6 w-6 mb-2" />
                    <span>Add Member</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col justify-center" asChild>
                  <Link href="/admin/products/savings">
                    <Wallet className="h-6 w-6 mb-2" />
                    <span>Savings Products</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col justify-center" asChild>
                  <Link href="/admin/products/loans">
                    <CreditCard className="h-6 w-6 mb-2" />
                    <span>Loan Products</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col justify-center" asChild>
                  <Link href="/admin/transactions">
                    <ArrowUpDown className="h-6 w-6 mb-2" />
                    <span>Transactions</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </TabsContent>
      
      <TabsContent value="members" className="mt-0">
        <div className="text-center py-20">
          <h3 className="text-lg font-semibold">Members Management</h3>
          <p className="text-muted-foreground">
            View and manage all SACCO members from the dedicated page
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/members">Go to Members Section</Link>
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="approvals" className="mt-0">
        <div className="text-center py-20">
          <h3 className="text-lg font-semibold">Pending Approvals</h3>
          <p className="text-muted-foreground">
            Review and process loan applications and withdrawal requests
          </p>
          <Button className="mt-4" asChild>
            <Link href="/admin/approvals">Go to Approvals Section</Link>
          </Button>
        </div>
      </TabsContent>
    </AppLayout>
  );
}