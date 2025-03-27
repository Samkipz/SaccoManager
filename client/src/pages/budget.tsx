import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { AppLayout } from '@/components/layouts/app-layout';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, CheckCircle2, PiggyBank, ChevronRight, BarChart3, ArrowUpCircle } from 'lucide-react';

// Budget category form schema
const budgetCategorySchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  notes: z.string().optional(),
});

// Budget recommendation form schema
const budgetRecommendationSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  suggestedAmount: z.string().min(1, { message: "Suggested amount is required" }),
  category: z.string().min(1, { message: "Category is required" }),
  type: z.string().min(1, { message: "Type is required" }),
});

export default function BudgetPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("categories");
  
  // Fetch budget categories
  const { 
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ['/api/budget/categories', user?.id],
    queryFn: () => apiRequest(`/api/budget/categories/${user?.id}`),
    enabled: !!user?.id,
    refetchOnWindowFocus: false
  });
  
  // Fetch budget recommendations
  const { 
    data: recommendations,
    isLoading: isRecommendationsLoading,
    error: recommendationsError
  } = useQuery({
    queryKey: ['/api/budget/recommendations', user?.id],
    queryFn: () => apiRequest(`/api/budget/recommendations/${user?.id}`),
    enabled: !!user?.id,
    refetchOnWindowFocus: false
  });
  
  // Create budget category mutation
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/budget/categories', {
      method: 'POST',
      data: { ...data, userId: user?.id }
    }),
    onSuccess: () => {
      toast({
        title: "Category created",
        description: "Your budget category has been created successfully.",
        variant: "default",
      });
      categoryForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/budget/categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget category.",
        variant: "destructive",
      });
    }
  });
  
  // Create budget recommendation mutation
  const createRecommendationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/budget/recommendations', {
      method: 'POST',
      data: { ...data, userId: user?.id, isImplemented: false }
    }),
    onSuccess: () => {
      toast({
        title: "Recommendation created",
        description: "Your budget recommendation has been created successfully.",
        variant: "default",
      });
      recommendationForm.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/budget/recommendations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create budget recommendation.",
        variant: "destructive",
      });
    }
  });
  
  // Generate recommendations mutation
  const generateRecommendationsMutation = useMutation({
    mutationFn: () => apiRequest(`/api/budget/recommendations/generate/${user?.id}`, {
      method: 'POST'
    }),
    onSuccess: () => {
      toast({
        title: "Recommendations generated",
        description: "Budget recommendations have been generated based on your financial data.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/budget/recommendations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate recommendations.",
        variant: "destructive",
      });
    }
  });
  
  // Implement recommendation mutation
  const implementRecommendationMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/budget/recommendations/${id}/implement`, {
      method: 'PATCH'
    }),
    onSuccess: () => {
      toast({
        title: "Recommendation implemented",
        description: "The budget recommendation has been marked as implemented.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/budget/recommendations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to implement recommendation.",
        variant: "destructive",
      });
    }
  });
  
  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/budget/categories/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast({
        title: "Category deleted",
        description: "The budget category has been deleted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/budget/categories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete category.",
        variant: "destructive",
      });
    }
  });
  
  // Delete recommendation mutation
  const deleteRecommendationMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/budget/recommendations/${id}`, {
      method: 'DELETE'
    }),
    onSuccess: () => {
      toast({
        title: "Recommendation deleted",
        description: "The budget recommendation has been deleted successfully.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/budget/recommendations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete recommendation.",
        variant: "destructive",
      });
    }
  });
  
  // Budget category form
  const categoryForm = useForm<z.infer<typeof budgetCategorySchema>>({
    resolver: zodResolver(budgetCategorySchema),
    defaultValues: {
      category: "",
      amount: "",
      notes: "",
    },
  });
  
  // Budget recommendation form
  const recommendationForm = useForm<z.infer<typeof budgetRecommendationSchema>>({
    resolver: zodResolver(budgetRecommendationSchema),
    defaultValues: {
      title: "",
      description: "",
      suggestedAmount: "",
      category: "",
      type: "",
    },
  });
  
  // Handle category form submission
  function onCategorySubmit(values: z.infer<typeof budgetCategorySchema>) {
    createCategoryMutation.mutate(values);
  }
  
  // Handle recommendation form submission
  function onRecommendationSubmit(values: z.infer<typeof budgetRecommendationSchema>) {
    createRecommendationMutation.mutate(values);
  }
  
  return (
    <AppLayout title="Budget Management" description="Manage your budget categories and recommendations">
      <div className="space-y-6">
        <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="categories">Budget Categories</TabsTrigger>
              <TabsTrigger value="recommendations">Budget Recommendations</TabsTrigger>
            </TabsList>
            
            {activeTab === "recommendations" && (
              <Button 
                onClick={() => generateRecommendationsMutation.mutate()}
                disabled={generateRecommendationsMutation.isPending}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Recommendations
              </Button>
            )}
          </div>
          
          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Budget Categories</CardTitle>
                    <CardDescription>
                      Track your spending by category to better manage your finances
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {isCategoriesLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : categoriesError ? (
                      <div className="text-center py-8 text-destructive">
                        Failed to load budget categories
                      </div>
                    ) : !categories || categories.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No budget categories yet. Create your first category!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Array.isArray(categories) && categories.map((category: any) => (
                          <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <PiggyBank className="h-5 w-5 text-primary" />
                                <h3 className="font-medium">{category.category}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{category.notes}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="font-semibold">${parseFloat(category.amount).toFixed(2)}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteCategoryMutation.mutate(category.id)}
                                disabled={deleteCategoryMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Category</CardTitle>
                    <CardDescription>
                      Create a new budget category to track your expenses
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...categoryForm}>
                      <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-4">
                        <FormField
                          control={categoryForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="HOUSING">Housing</SelectItem>
                                  <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                                  <SelectItem value="FOOD">Food</SelectItem>
                                  <SelectItem value="UTILITIES">Utilities</SelectItem>
                                  <SelectItem value="INSURANCE">Insurance</SelectItem>
                                  <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                                  <SelectItem value="PERSONAL">Personal</SelectItem>
                                  <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                                  <SelectItem value="EDUCATION">Education</SelectItem>
                                  <SelectItem value="SAVINGS">Savings</SelectItem>
                                  <SelectItem value="DEBT">Debt Payment</SelectItem>
                                  <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={categoryForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input placeholder="0.00" {...field} />
                              </FormControl>
                              <FormDescription>
                                Enter the monthly budget for this category
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={categoryForm.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Add additional notes about this budget category"
                                  className="resize-none"
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
                          disabled={createCategoryMutation.isPending}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Category
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Recommendations</CardTitle>
                    <CardDescription>
                      Personalized recommendations to help you improve your financial health
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    {isRecommendationsLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : recommendationsError ? (
                      <div className="text-center py-8 text-destructive">
                        Failed to load budget recommendations
                      </div>
                    ) : !recommendations || recommendations.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No budget recommendations yet. Generate recommendations or create your own!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Array.isArray(recommendations) && recommendations.map((recommendation: any) => (
                          <div key={recommendation.id} className="border rounded-lg overflow-hidden">
                            <div className="p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-medium">{recommendation.title}</h3>
                                    {recommendation.isImplemented && (
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        Implemented
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {recommendation.description}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  {!recommendation.isImplemented && (
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => implementRecommendationMutation.mutate(recommendation.id)}
                                      disabled={implementRecommendationMutation.isPending}
                                    >
                                      <CheckCircle2 className="mr-1 h-4 w-4" />
                                      Implement
                                    </Button>
                                  )}
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    onClick={() => deleteRecommendationMutation.mutate(recommendation.id)}
                                    disabled={deleteRecommendationMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="mt-3 flex justify-between text-sm">
                                <span className="text-muted-foreground">Category: {recommendation.category}</span>
                                <span className="font-medium">Suggested: ${parseFloat(recommendation.suggestedAmount).toFixed(2)}</span>
                              </div>
                            </div>
                            
                            {!recommendation.isImplemented && (
                              <div className="bg-primary/5 p-3 flex justify-between items-center">
                                <span className="text-sm">Implement this recommendation to improve your budget</span>
                                <ChevronRight className="h-4 w-4 text-primary" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Add Custom Recommendation</CardTitle>
                    <CardDescription>
                      Create your own personalized budget recommendation
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Form {...recommendationForm}>
                      <form onSubmit={recommendationForm.handleSubmit(onRecommendationSubmit)} className="space-y-4">
                        <FormField
                          control={recommendationForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Recommendation title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={recommendationForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Detailed description of the recommendation"
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={recommendationForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="SAVING">Saving</SelectItem>
                                    <SelectItem value="SPENDING">Spending</SelectItem>
                                    <SelectItem value="INVESTMENT">Investment</SelectItem>
                                    <SelectItem value="DEBT_REDUCTION">Debt Reduction</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={recommendationForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="HOUSING">Housing</SelectItem>
                                    <SelectItem value="TRANSPORTATION">Transportation</SelectItem>
                                    <SelectItem value="FOOD">Food</SelectItem>
                                    <SelectItem value="UTILITIES">Utilities</SelectItem>
                                    <SelectItem value="INSURANCE">Insurance</SelectItem>
                                    <SelectItem value="HEALTHCARE">Healthcare</SelectItem>
                                    <SelectItem value="PERSONAL">Personal</SelectItem>
                                    <SelectItem value="ENTERTAINMENT">Entertainment</SelectItem>
                                    <SelectItem value="EDUCATION">Education</SelectItem>
                                    <SelectItem value="SAVINGS">Savings</SelectItem>
                                    <SelectItem value="DEBT">Debt Payment</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={recommendationForm.control}
                          name="suggestedAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Suggested Amount</FormLabel>
                              <FormControl>
                                <Input placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={createRecommendationMutation.isPending}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Recommendation
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}