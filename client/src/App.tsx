import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import SavingsPage from "@/pages/savings";
import LoansPage from "@/pages/loans";
import TransactionsPage from "@/pages/transactions";
import MembersPage from "@/pages/admin/members";
import LoanApprovalsPage from "@/pages/admin/loan-approvals";
import ReportsPage from "@/pages/admin/reports";
import { useAuth } from "./lib/auth";

function Router() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={LoginPage} />
      
      {/* Member routes */}
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/savings" component={SavingsPage} />
      <Route path="/loans" component={LoansPage} />
      <Route path="/transactions" component={TransactionsPage} />
      
      {/* Admin routes */}
      <Route path="/admin/members" component={MembersPage} />
      <Route path="/admin/loan-approvals" component={LoanApprovalsPage} />
      <Route path="/admin/reports" component={ReportsPage} />
      
      {/* Redirect to login or dashboard based on auth state */}
      <Route path="/">
        {isAuthenticated ? <DashboardPage /> : <LoginPage />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
