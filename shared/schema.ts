import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, foreignKey, numeric, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['MEMBER', 'ADMIN']);
export const loanStatusEnum = pgEnum('loan_status', ['PENDING', 'APPROVED', 'REJECTED']);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['PENDING', 'APPROVED', 'REJECTED']);
export const budgetCategoryEnum = pgEnum('budget_category', [
  'HOUSING', 'TRANSPORTATION', 'FOOD', 'UTILITIES', 'INSURANCE', 
  'HEALTHCARE', 'PERSONAL', 'ENTERTAINMENT', 'EDUCATION', 'SAVINGS', 'DEBT', 'OTHER'
]);
export const recommendationTypeEnum = pgEnum('recommendation_type', [
  'SAVING', 'SPENDING', 'INVESTMENT', 'DEBT_MANAGEMENT', 'EMERGENCY_FUND'
]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default('MEMBER').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Savings
export const savings = pgTable("savings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  balance: numeric("balance", { precision: 10, scale: 2 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Deposits
export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  savingsId: integer("savings_id").notNull().references(() => savings.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Withdrawals
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  savingsId: integer("savings_id").notNull().references(() => savings.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(),
  reason: text("reason"),
  status: withdrawalStatusEnum("status").default('PENDING').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Loans
export const loans = pgTable("loans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  purpose: text("purpose").notNull(),
  term: integer("term").notNull(), // in months
  description: text("description"),
  status: loanStatusEnum("status").default('PENDING').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Repayments
export const repayments = pgTable("repayments", {
  id: serial("id").primaryKey(),
  loanId: integer("loan_id").notNull().references(() => loans.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Budget Categories for users
export const budgetCategories = pgTable("budget_categories", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  category: budgetCategoryEnum("category").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Budget Recommendations for users
export const budgetRecommendations = pgTable("budget_recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: recommendationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  suggestedAmount: numeric("suggested_amount", { precision: 10, scale: 2 }),
  category: budgetCategoryEnum("category"),
  isImplemented: boolean("is_implemented").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
  savings: one(savings, {
    fields: [users.id],
    references: [savings.userId],
  }),
  loans: many(loans),
  budgetCategories: many(budgetCategories),
  budgetRecommendations: many(budgetRecommendations),
}));

export const savingsRelations = relations(savings, ({ one, many }) => ({
  user: one(users, {
    fields: [savings.userId],
    references: [users.id],
  }),
  deposits: many(deposits),
  withdrawals: many(withdrawals),
}));

export const depositsRelations = relations(deposits, ({ one }) => ({
  savings: one(savings, {
    fields: [deposits.savingsId],
    references: [savings.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  savings: one(savings, {
    fields: [withdrawals.savingsId],
    references: [savings.id],
  }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
  user: one(users, {
    fields: [loans.userId],
    references: [users.id],
  }),
  repayments: many(repayments),
}));

export const repaymentsRelations = relations(repayments, ({ one }) => ({
  loan: one(loans, {
    fields: [repayments.loanId],
    references: [loans.id],
  }),
}));

export const budgetCategoriesRelations = relations(budgetCategories, ({ one }) => ({
  user: one(users, {
    fields: [budgetCategories.userId],
    references: [users.id],
  }),
}));

export const budgetRecommendationsRelations = relations(budgetRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [budgetRecommendations.userId],
    references: [users.id],
  }),
}));

// Zod Schemas for validation

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

// Savings schemas
export const insertSavingsSchema = createInsertSchema(savings).omit({ id: true, createdAt: true });

// Deposit schema
export const insertDepositSchema = createInsertSchema(deposits).omit({ id: true, createdAt: true });

// Withdrawal schema
export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({ id: true, createdAt: true, status: true });

// Loan schemas
export const insertLoanSchema = createInsertSchema(loans).omit({ id: true, createdAt: true, status: true });

// Repayment schema
export const insertRepaymentSchema = createInsertSchema(repayments).omit({ id: true, createdAt: true });

// Budget category schema
export const insertBudgetCategorySchema = createInsertSchema(budgetCategories).omit({ id: true, createdAt: true, updatedAt: true });

// Budget recommendation schema
export const insertBudgetRecommendationSchema = createInsertSchema(budgetRecommendations).omit({ id: true, createdAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;

export type Savings = typeof savings.$inferSelect;
export type InsertSavings = z.infer<typeof insertSavingsSchema>;

export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;

export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;

export type Loan = typeof loans.$inferSelect;
export type InsertLoan = z.infer<typeof insertLoanSchema>;

export type Repayment = typeof repayments.$inferSelect;
export type InsertRepayment = z.infer<typeof insertRepaymentSchema>;

export type BudgetCategory = typeof budgetCategories.$inferSelect;
export type InsertBudgetCategory = z.infer<typeof insertBudgetCategorySchema>;

export type BudgetRecommendation = typeof budgetRecommendations.$inferSelect;
export type InsertBudgetRecommendation = z.infer<typeof insertBudgetRecommendationSchema>;

// Extended types with relationships
export type UserWithSavingsAndLoans = User & {
  savings?: Savings;
  loans?: Loan[];
};

export type UserWithBudget = User & {
  budgetCategories?: BudgetCategory[];
  budgetRecommendations?: BudgetRecommendation[];
};

export type SavingsWithTransactions = Savings & {
  deposits?: Deposit[];
  withdrawals?: Withdrawal[];
};

export type LoanWithRepayments = Loan & {
  repayments?: Repayment[];
  user?: User;
};
