import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, CreditCard } from "lucide-react";

export default function ApprovalsPage() {
  return (
    <AppLayout 
      title="Approvals" 
      description="Manage loan and withdrawal requests"
      adminRequired
      showUserSwitcher
    >
      <Tabs defaultValue="loans" className="w-full">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="loans" className="flex items-center">
            <Coins className="mr-2 h-4 w-4" />
            Loan Approvals
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Withdrawal Approvals
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="loans" className="mt-6">
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold">Loan Approvals</h3>
            <p className="text-muted-foreground mt-2">
              Complete approval interface coming soon. You'll be able to review and process loan applications.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="withdrawals" className="mt-6">
          <div className="text-center py-20">
            <h3 className="text-lg font-semibold">Withdrawal Approvals</h3>
            <p className="text-muted-foreground mt-2">
              Complete approval interface coming soon. You'll be able to review and process withdrawal requests.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}