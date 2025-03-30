import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";

export default function NotificationsPage() {
  return (
    <AppLayout 
      title="Notifications" 
      description="View and manage your SACCO notifications"
    >
      <div className="text-center py-20">
        <h3 className="text-lg font-semibold">Notifications Center</h3>
        <p className="text-muted-foreground mt-2">
          This feature is coming soon. You'll be able to view all your SACCO notifications here.
        </p>
      </div>
    </AppLayout>
  );
}