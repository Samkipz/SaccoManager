import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { 
  LayoutDashboard, 
  DollarSign, 
  Coins, 
  RefreshCw, 
  Users, 
  CheckSquare,
  FileLineChart,
  LogOut,
  Menu,
  ChevronRight,
  Building2 as Bank,
  PiggyBank,
  MessageSquare,
  Bell,
  BarChart3,
  ShieldCheck,
  Settings,
  BanknoteIcon,
  BadgeCheck,
  ArrowRightLeft
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, isAdmin, logout } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);
  const [adminSectionExpanded, setAdminSectionExpanded] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  const toggleAdminSection = () => {
    setAdminSectionExpanded(!adminSectionExpanded);
  };

  // Get current section
  const isAdminPage = location.startsWith('/admin');

  // For the main dashboard items
  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Savings",
      href: "/savings",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Loans",
      href: "/loans",
      icon: <Coins className="h-4 w-4" />,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: <ArrowRightLeft className="h-4 w-4" />,
    },
    {
      title: "Budget",
      href: "/budget",
      icon: <PiggyBank className="h-4 w-4" />,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <MessageSquare className="h-4 w-4" />,
      badge: "5",
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: <Bell className="h-4 w-4" />,
      badge: "3",
    },
  ];

  // For admin items
  const adminNavItems = [
    {
      title: "Admin Dashboard",
      href: "/admin/dashboard",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: "Members",
      href: "/admin/members",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Approvals",
      href: "/admin/approvals",
      icon: <CheckSquare className="h-4 w-4" />,
      badge: "8",
    },
    {
      title: "Savings Products",
      href: "/admin/products/savings",
      icon: <BanknoteIcon className="h-4 w-4" />,
    },
    {
      title: "Loan Products",
      href: "/admin/products/loans",
      icon: <Coins className="h-4 w-4" />,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <FileLineChart className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ];
  
  // Get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm h-16 flex items-center justify-between px-4 z-10 lg:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-1.5 rounded-md">
            <Bank className="h-5 w-5" />
          </div>
          <h1 className="font-bold text-lg text-primary">SACCO</h1>
        </div>
        <div className="w-8"></div>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 bg-gradient-to-b from-gray-50 to-white shadow-lg z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-gray-100",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="h-full flex flex-col">
          <div className="px-4 py-5 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-white p-2 rounded-lg shadow-sm">
                <Bank className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-primary">SACCO</h1>
                <p className="text-xs text-gray-500">Financial Management</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-b border-gray-100">
            <div className="flex items-center">
              <Avatar className="h-10 w-10 mr-3 shadow-sm border border-gray-200">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {user?.name ? getInitials(user.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium truncate">
                  {user?.name || "User"}
                </p>
                <div className="flex items-center space-x-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "px-1.5 py-px text-[10px]", 
                      isAdmin ? "border-amber-500 text-amber-700 bg-amber-50" : "border-primary text-primary bg-primary/5"
                    )}
                  >
                    {isAdmin ? 'Admin' : 'Member'}
                  </Badge>
                  {isAdmin && (
                    <Badge variant="outline" className="px-1.5 py-px text-[10px] border-green-500 text-green-700 bg-green-50">
                      Staff
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto flex-grow py-3">
            <nav className="space-y-0.5 px-2">
              {/* Main Navigation */}
              {(!isAdminPage || !isAdmin) && (
                <>
                  <p className="px-3 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Main Menu
                  </p>
                  
                  {mainNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSidebarOnMobile}
                    >
                      <a
                        className={cn(
                          "flex items-center px-3 py-2 rounded-lg font-medium text-sm group transition-colors",
                          location === item.href
                            ? "bg-primary text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        <div className={cn(
                          "mr-3 rounded-md p-1.5",
                          location === item.href 
                            ? "bg-white/20 text-white" 
                            : "bg-gray-100 text-gray-500 group-hover:text-primary"
                        )}>
                          {item.icon}
                        </div>
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge className="ml-auto" variant={location === item.href ? "outline" : "default"}>
                            {item.badge}
                          </Badge>
                        )}
                      </a>
                    </Link>
                  ))}
                </>
              )}

              {/* Admin Navigation */}
              {isAdmin && (
                <div className="mt-3">
                  <button 
                    className="w-full flex items-center justify-between px-3 pt-2 pb-1 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                    onClick={toggleAdminSection}
                  >
                    <span>Administration</span>
                    <ChevronRight 
                      className={cn(
                        "h-4 w-4 transition-transform", 
                        adminSectionExpanded ? "rotate-90" : ""
                      )}
                    />
                  </button>
                  
                  <AnimatePresence>
                    {(adminSectionExpanded || isAdminPage) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {adminNavItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeSidebarOnMobile}
                          >
                            <a
                              className={cn(
                                "flex items-center px-3 py-2 rounded-lg font-medium text-sm group transition-colors",
                                location === item.href
                                  ? "bg-amber-500 text-white"
                                  : "text-gray-700 hover:bg-gray-100"
                              )}
                            >
                              <div className={cn(
                                "mr-3 rounded-md p-1.5",
                                location === item.href 
                                  ? "bg-white/20 text-white" 
                                  : "bg-gray-100 text-gray-500 group-hover:text-amber-500"
                              )}>
                                {item.icon}
                              </div>
                              <span>{item.title}</span>
                              {item.badge && (
                                <Badge 
                                  className="ml-auto" 
                                  variant={location === item.href ? "outline" : "secondary"}
                                  style={{
                                    ...(location === item.href ? { borderColor: 'rgba(255,255,255,0.5)' } : {})
                                  }}
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </a>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </nav>
          </div>

          <div className="px-2 py-4 mt-auto">
            {/* Support help button */}
            <div className="mb-4 mx-2 bg-gradient-to-r from-violet-100 to-blue-50 p-3 rounded-xl">
              <h4 className="text-sm font-medium text-violet-900 flex items-center">
                <ShieldCheck className="h-4 w-4 mr-1 text-violet-700" />
                Need Support?
              </h4>
              <p className="text-xs text-violet-800 mt-1 mb-2">
                Get help with your account or ask questions
              </p>
              <Button size="sm" variant="secondary" className="w-full bg-white shadow-sm">
                Contact Support
              </Button>
            </div>
            
            {/* Logout button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}