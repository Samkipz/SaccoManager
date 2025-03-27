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

interface WithdrawalFormProps {
  savingsId: number;
  availableBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

const withdrawalFormSchema = z.object({
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    { message: "Amount must be a positive number" }
  ),
  method: z.string().min(1, { message: "Please select a withdrawal method" }),
  reason: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

export function WithdrawalForm({
  savingsId,
  availableBalance,
  onClose,
  onSuccess,
}: WithdrawalFormProps) {
  const { toast } = useToast();

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: "",
      method: "bank",
      reason: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(values: WithdrawalFormValues) {
    const amountNumber = parseFloat(values.amount);
    
    if (amountNumber > availableBalance) {
      form.setError("amount", {
        type: "manual",
        message: "Withdrawal amount exceeds available balance",
      });
      return;
    }
    
    try {
      const withdrawalData = {
        savingsId,
        amount: values.amount, // Keep amount as string for database compatibility
        method: values.method,
        reason: values.reason || undefined,
      };

      await apiRequest("POST", "/api/savings/withdrawal", withdrawalData);
      
      toast({
        title: "Withdrawal requested",
        description: "Your withdrawal request has been submitted for approval",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast({
        title: "Withdrawal request failed",
        description: "There was an error submitting your withdrawal request",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Request Withdrawal</h3>
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
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <AmountInput
                    id="withdrawal-amount"
                    placeholder="0.00"
                    disabled={isSubmitting}
                    note={`Available balance: $${availableBalance.toFixed(2)}`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Withdrawal Method</FormLabel>
                <Select
                  disabled={isSubmitting}
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a withdrawal method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                    <SelectItem value="mobile">Mobile Money</SelectItem>
                    <SelectItem value="cash">Cash Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reason (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add a reason for this withdrawal"
                    className="resize-none"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Submit Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
