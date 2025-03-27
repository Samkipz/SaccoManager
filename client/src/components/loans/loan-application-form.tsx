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
import { AmountInput } from "@/components/ui/amount-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface LoanApplicationFormProps {
  userId: number;
  maxEligibleAmount: number;
  onClose: () => void;
  onSuccess: () => void;
}

const loanApplicationSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be a positive number" }
  ),
  purpose: z.string().min(1, { message: "Please select a purpose" }),
  term: z.string().min(1, { message: "Please select a loan term" }),
  description: z.string().optional(),
});

type LoanApplicationValues = z.infer<typeof loanApplicationSchema>;

export function LoanApplicationForm({
  userId,
  maxEligibleAmount,
  onClose,
  onSuccess,
}: LoanApplicationFormProps) {
  const { toast } = useToast();

  const form = useForm<LoanApplicationValues>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      amount: "",
      purpose: "",
      term: "",
      description: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: LoanApplicationValues) {
    const amount = parseFloat(values.amount);
    
    if (amount > maxEligibleAmount) {
      form.setError("amount", {
        type: "manual",
        message: "Loan amount exceeds your eligible amount",
      });
      return;
    }
    
    try {
      const loanData = {
        userId,
        amount,
        purpose: values.purpose,
        term: parseInt(values.term, 10),
        description: values.description || undefined,
      };

      await apiRequest("POST", "/api/loans/apply", loanData);
      
      toast({
        title: "Loan application submitted",
        description: "Your loan application has been submitted for review",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Loan application error:", error);
      toast({
        title: "Application failed",
        description: "There was an error submitting your loan application",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Apply for a Loan</h3>
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

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Amount</FormLabel>
                <FormControl>
                  <AmountInput
                    id="loan-amount"
                    placeholder="0.00"
                    disabled={isSubmitting}
                    note={`Maximum eligible amount: $${maxEligibleAmount.toFixed(2)}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose of Loan</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="term"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loan Term</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="12">12 Months</SelectItem>
                    <SelectItem value="24">24 Months</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Provide details about why you need this loan"
                    className="resize-none"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Alert className="bg-blue-50 text-blue-700 border-blue-200">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Your loan application will be reviewed by administrators. You will be notified of the status within 2-3 business days.
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit Application"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
