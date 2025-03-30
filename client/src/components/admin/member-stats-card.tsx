import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Users, TrendingUp, UserPlus, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberStatsCardProps {
  totalMembers: number;
  newMembers: number;
  activeMembers: number;
  growth: number;
}

export function MemberStatsCard({
  totalMembers,
  newMembers,
  activeMembers,
  growth
}: MemberStatsCardProps) {
  const formattedGrowth = `${growth >= 0 ? "+" : ""}${growth}%`;
  const isPositiveGrowth = growth >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Users className="mr-2 h-5 w-5 text-gray-500" />
          <span>Member Statistics</span>
        </CardTitle>
        <CardDescription>Overview of member activity and growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Members</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{totalMembers}</p>
              <div 
                className={cn(
                  "ml-2 flex items-center text-xs font-medium",
                  isPositiveGrowth ? "text-green-600" : "text-red-600"
                )}
              >
                {isPositiveGrowth ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
                {formattedGrowth}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">vs last month</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">New Members</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{newMembers}</p>
              <UserPlus className="ml-2 h-4 w-4 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Active Members</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">{activeMembers}</p>
              <TrendingUp className="ml-2 h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Avg. Tenure</p>
            <div className="flex items-center">
              <p className="text-2xl font-bold">18</p>
              <Calendar className="ml-2 h-4 w-4 text-violet-500" />
            </div>
            <p className="text-xs text-muted-foreground">Months</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}