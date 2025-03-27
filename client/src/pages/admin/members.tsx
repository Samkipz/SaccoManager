import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layouts/app-layout";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserWithSavingsAndLoans } from "@shared/schema";
import { format } from "date-fns";
import { Eye, Edit, Search, UserPlus } from "lucide-react";

export default function MembersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all members
  const { data: members, isLoading } = useQuery<UserWithSavingsAndLoans[]>({
    queryKey: ['/api/users'],
  });

  const columns = [
    {
      header: "Member",
      accessorKey: "name",
      cell: (row: UserWithSavingsAndLoans) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: "ID",
      accessorKey: "id",
      cell: (row: UserWithSavingsAndLoans) => (
        <span className="text-sm text-gray-500">#{row.id}</span>
      ),
      sortable: true,
    },
    {
      header: "Savings",
      accessorKey: (row: UserWithSavingsAndLoans) => 
        row.savings?.balance ? parseFloat(row.savings.balance.toString()) : 0,
      cell: (row: UserWithSavingsAndLoans) => {
        const balance = row.savings?.balance 
          ? parseFloat(row.savings.balance.toString())
          : 0;
        
        return (
          <span className="font-mono text-sm font-medium text-gray-900">
            ${balance.toFixed(2)}
          </span>
        );
      },
      sortable: true,
    },
    {
      header: "Loans",
      accessorKey: (row: UserWithSavingsAndLoans) => {
        if (!row.loans) return 0;
        return row.loans
          .filter(loan => loan.status === "APPROVED")
          .reduce((sum, loan) => sum + parseFloat(loan.amount.toString()), 0);
      },
      cell: (row: UserWithSavingsAndLoans) => {
        if (!row.loans) return "$0.00";
        
        const loanAmount = row.loans
          .filter(loan => loan.status === "APPROVED")
          .reduce((sum, loan) => sum + parseFloat(loan.amount.toString()), 0);
        
        return (
          <span className="font-mono text-sm font-medium text-gray-900">
            ${loanAmount.toFixed(2)}
          </span>
        );
      },
      sortable: true,
    },
    {
      header: "Joined",
      accessorKey: (row: UserWithSavingsAndLoans) => new Date(row.createdAt).getTime(),
      cell: (row: UserWithSavingsAndLoans) => (
        <span className="text-sm text-gray-500">
          {format(new Date(row.createdAt), "MMM dd, yyyy")}
        </span>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (row: UserWithSavingsAndLoans) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleViewMember(row.id)}
            className="h-8 w-8 text-primary"
          >
            <Eye className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditMember(row.id)}
            className="h-8 w-8 text-indigo-600"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleViewMember = (id: number) => {
    toast({
      title: "View Member",
      description: `Viewing member details for ID: ${id}`,
    });
    // In a real app, this would navigate to a member details page or open a modal
  };

  const handleEditMember = (id: number) => {
    toast({
      title: "Edit Member",
      description: `Editing member with ID: ${id}`,
    });
    // In a real app, this would open an edit form for the member
  };

  const handleAddMember = () => {
    toast({
      title: "Add Member",
      description: "Adding a new member (not implemented in this demo)",
    });
    // In a real app, this would open a form to add a new member
  };

  return (
    <AppLayout 
      title="Members Management" 
      description="Manage all SACCO members from one place"
      adminRequired
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Members List</h3>
          <div className="flex items-center space-x-3">
            <Button onClick={handleAddMember}>
              <UserPlus className="mr-2 h-4 w-4" /> Add Member
            </Button>
          </div>
        </div>
        
        <div className="p-5">
          <DataTable
            data={members || []}
            columns={columns}
            searchable
            searchPlaceholder="Search members..."
          />
        </div>
      </div>
    </AppLayout>
  );
}
