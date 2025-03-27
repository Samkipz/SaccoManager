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
  User,
  Bank
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, isAdmin, logout } = useAuth();
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(!isMobile);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="mr-3 text-lg" />,
    },
    {
      title: "Savings",
      href: "/savings",
      icon: <DollarSign className="mr-3 text-lg" />,
    },
    {
      title: "Loans",
      href: "/loans",
      icon: <Coins className="mr-3 text-lg" />,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: <RefreshCw className="mr-3 text-lg" />,
    },
  ];

  const adminNavItems = [
    {
      title: "Members",
      href: "/admin/members",
      icon: <Users className="mr-3 text-lg" />,
    },
    {
      title: "Loan Approvals",
      href: "/admin/loan-approvals",
      icon: <CheckSquare className="mr-3 text-lg" />,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: <FileLineChart className="mr-3 text-lg" />,
    },
  ];

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
          <div className="bg-primary text-white p-1.5 rounded-md">
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
          "fixed inset-y-0 left-0 bg-white shadow-lg z-30 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Bank className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-primary">SACCO</h1>
                <p className="text-xs text-gray-500">Management System</p>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto flex-grow px-3 py-3">
            <div className="mb-4">
              <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Menu
              </p>

              <nav className="mt-2 space-y-1">
                {mainNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeSidebarOnMobile}
                  >
                    <a
                      className={cn(
                        "flex items-center px-3 py-2.5 rounded-lg font-medium group",
                        location === item.href
                          ? "bg-primary-50 text-primary"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {item.icon}
                      {item.title}
                    </a>
                  </Link>
                ))}
              </nav>
            </div>

            {isAdmin && (
              <div className="mb-4">
                <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Admin
                </p>

                <nav className="mt-2 space-y-1">
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeSidebarOnMobile}
                    >
                      <a
                        className={cn(
                          "flex items-center px-3 py-2.5 rounded-lg font-medium group",
                          location === item.href
                            ? "bg-primary-50 text-primary"
                            : "text-gray-700 hover:bg-gray-100"
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </a>
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {isAdmin ? "Admin" : "Member"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
