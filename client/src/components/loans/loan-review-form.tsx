import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoanWithRepayments } from "@shared/schema";
import { format } from "date-fns";

interface LoanReviewFormProps {
  loan: LoanWithRepayments;
  onClose: () => void;
  onSuccess: () => void;
}

const reviewFormSchema = z.object({
  notes: z.string().optional(),
  decision: z.enum(["approve", "reject"]),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export function LoanReviewForm({
  loan,
  onClose,
  onSuccess,
}: LoanReviewFormProps) {
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      notes: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: ReviewFormValues) {
    try {
      const endpoint = values.decision === "approve" 
        ? `/api/loans/${loan.id}/approve` 
        : `/api/loans/${loan.id}/reject`;
      
      await apiRequest("POST", endpoint, { notes: values.notes });
      
      toast({
        title: `Loan ${values.decision === "approve" ? "approved" : "rejected"}`,
        description: `The loan application has been ${values.decision === "approve" ? "approved" : "rejected"} successfully`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Loan review error:", error);
      toast({
        title: "Review failed",
        description: "There was an error processing the loan review",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Review Loan Application</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={onClose}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-6 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Loan ID</h4>
            <p className="text-base font-medium">#{loan.id}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Date Applied</h4>
            <p className="text-base">{format(new Date(loan.createdAt), "MMM dd, yyyy")}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Member</h4>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-base font-medium">{loan.user?.name}</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Member Since</h4>
            <p className="text-base">{loan.user?.createdAt ? format(new Date(loan.user.createdAt), "MMM dd, yyyy") : "N/A"}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Amount Requested</h4>
            <p className="text-base font-mono font-medium">${parseFloat(loan.amount.toString()).toFixed(2)}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Term</h4>
            <p className="text-base">{loan.term} Months</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Purpose</h4>
            <p className="text-base">{loan.purpose}</p>
          </div>
        </div>
        
        {loan.description && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-1">Additional Information</h4>
            <p className="text-base bg-gray-50 p-3 rounded-lg">{loan.description}</p>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add notes about this decision"
                    className="resize-none"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <h4 className="text-sm font-semibold text-gray-500 mb-2">Decision</h4>
            <div className="flex items-center justify-between space-x-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                disabled={isSubmitting}
                onClick={() => {
                  form.setValue("decision", "reject");
                  form.handleSubmit(onSubmit)();
                }}
              >
                Reject
              </Button>
              <Button
                type="button"
                variant="default"
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
                onClick={() => {
                  form.setValue("decision", "approve");
                  form.handleSubmit(onSubmit)();
                }}
              >
                Approve
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
