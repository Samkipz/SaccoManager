import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, foreignKey, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum('role', ['MEMBER', 'ADMIN']);
export const loanStatusEnum = pgEnum('loan_status', ['PENDING', 'APPROVED', 'REJECTED']);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['PENDING', 'APPROVED', 'REJECTED']);

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

// Extended types with relationships
export type UserWithSavingsAndLoans = User & {
  savings?: Savings;
  loans?: Loan[];
};

export type SavingsWithTransactions = Savings & {
  deposits?: Deposit[];
  withdrawals?: Withdrawal[];
};

export type LoanWithRepayments = Loan & {
  repayments?: Repayment[];
  user?: User;
};
