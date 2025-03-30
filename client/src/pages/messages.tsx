import React from "react";
import { AppLayout } from "@/components/layouts/app-layout";

export default function MessagesPage() {
  return (
    <AppLayout 
      title="Messages" 
      description="Communicate with SACCO administrators and other members"
    >
      <div className="text-center py-20">
        <h3 className="text-lg font-semibold">Messages & Communications</h3>
        <p className="text-muted-foreground mt-2">
          This feature is coming soon. You'll be able to communicate with administrators and members.
        </p>
      </div>
    </AppLayout>
  );
}