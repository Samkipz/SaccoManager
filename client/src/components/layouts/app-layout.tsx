import React, { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { useAuth } from "@/lib/auth";
import { Link, Redirect } from "wouter";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { 
  UserCircle2, 
  ChevronDown, 
  Shield, 
  User, 
  Bell, 
  Mail, 
  LogOut, 
  Settings,
  RotateCw
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppLayoutProps {
  children: ReactNode;
  className?: string;
  adminRequired?: boolean;
  title?: string;
  description?: string;
  showUserSwitcher?: boolean;
}

export function AppLayout({
  children,
  className,
  adminRequired = false,
  title,
  description,
  showUserSwitcher = false,
}: AppLayoutProps) {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const [unreadMessages] = useState(5);
  const [unreadNotifications] = useState(3);
  const [isRoleSwitchDialogOpen, setIsRoleSwitchDialogOpen] = useState(false);
  const [currentView, setCurrentView] = useState(isAdmin ? 'admin' : 'member');

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (adminRequired && !isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  // Handle role switching
  const handleSwitchRole = () => {
    setIsRoleSwitchDialogOpen(false);
    
    // In a real app, this would involve updating a session flag
    // and redirecting to the appropriate dashboard
    if (currentView === 'admin') {
      setCurrentView('member');
      window.location.href = '/dashboard';
    } else {
      setCurrentView('admin');
      window.location.href = '/admin/dashboard';
    }
  };

  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center" variant="destructive">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Loan Approved</span>
                      <span className="text-xs text-muted-foreground">Your loan application for $5,000 has been approved</span>
                      <span className="text-xs text-muted-foreground">10 minutes ago</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">Withdrawal Request</span>
                      <span className="text-xs text-muted-foreground">Your withdrawal request is pending approval</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">System Maintenance</span>
                      <span className="text-xs text-muted-foreground">The system will be under maintenance on Sunday night</span>
                      <span className="text-xs text-muted-foreground">1 day ago</span>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="justify-center font-medium">
                  <Link href="/notifications">View all notifications</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Messages */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Mail className="h-5 w-5" />
                  {unreadMessages > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center" variant="destructive">
                      {unreadMessages}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Messages</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-[300px] overflow-auto">
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          JS
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">John Smith</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">Hello, I have a question about my loan...</span>
                        <span className="text-xs text-muted-foreground">5 minutes ago</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-green-100 text-green-700">
                          MN
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">Mary Nelson</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">I'd like to schedule a meeting to discuss...</span>
                        <span className="text-xs text-muted-foreground">1 hour ago</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          DO
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">David Ochieng</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">Thank you for the quick response...</span>
                        <span className="text-xs text-muted-foreground">Yesterday</span>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="justify-center font-medium">
                  <Link href="/messages">View all messages</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="pl-2 pr-1 py-1.5 h-10">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.name ? getInitials(user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-semibold">{user?.name || 'User'}</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="px-1 py-0 h-4 text-[10px] rounded-sm flex items-center">
                          {isAdmin ? 'Admin' : 'Member'}
                        </Badge>
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserCircle2 className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  {isAdmin && showUserSwitcher && (
                    <DropdownMenuItem onClick={() => setIsRoleSwitchDialogOpen(true)}>
                      <RotateCw className="mr-2 h-4 w-4" />
                      <span>Switch to Member View</span>
                    </DropdownMenuItem>
                  )}
                  {!isAdmin && showUserSwitcher && (
                    <DropdownMenuItem onClick={() => setIsRoleSwitchDialogOpen(true)}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Switch to Admin View</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <div className="p-4 sm:p-6 md:p-8">
          <div className={cn("", className)}>{children}</div>
        </div>
      </main>
      <Toaster />
      
      {/* Role switch dialog */}
      <AlertDialog open={isRoleSwitchDialogOpen} onOpenChange={setIsRoleSwitchDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Switch to {currentView === 'admin' ? 'Member' : 'Admin'} View?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {currentView === 'admin' 
                ? "You'll switch to the member interface. Note that as an admin viewing the member interface, you'll have restricted access and won't be able to approve your own requests."
                : "You'll switch to the admin interface with expanded capabilities to manage the SACCO operations."
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSwitchRole}>
              Switch to {currentView === 'admin' ? 'Member' : 'Admin'} View
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
