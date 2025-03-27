import { 
  User, InsertUser, 
  Savings, InsertSavings, 
  Deposit, InsertDeposit, 
  Withdrawal, InsertWithdrawal, 
  Loan, InsertLoan, 
  Repayment, InsertRepayment,
  BudgetCategory, InsertBudgetCategory,
  BudgetRecommendation, InsertBudgetRecommendation,
  users, savings, deposits, withdrawals, loans, repayments,
  budgetCategories, budgetRecommendations
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Savings operations
  getSavings(id: number): Promise<Savings | undefined>;
  getSavingsByUserId(userId: number): Promise<Savings | undefined>;
  createSavings(savings: InsertSavings): Promise<Savings>;
  updateSavingsBalance(id: number, balance: string): Promise<Savings>;
  getAllSavings(): Promise<Savings[]>;

  // Deposit operations
  getDeposit(id: number): Promise<Deposit | undefined>;
  getDepositsBySavingsId(savingsId: number): Promise<Deposit[]>;
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;

  // Withdrawal operations
  getWithdrawal(id: number): Promise<Withdrawal | undefined>;
  getWithdrawalsBySavingsId(savingsId: number): Promise<Withdrawal[]>;
  createWithdrawal(withdrawal: InsertWithdrawal): Promise<Withdrawal>;
  updateWithdrawalStatus(id: number, status: "PENDING" | "APPROVED" | "REJECTED"): Promise<Withdrawal>;
  getPendingWithdrawals(): Promise<Withdrawal[]>;

  // Loan operations
  getLoan(id: number): Promise<Loan | undefined>;
  getLoansByUserId(userId: number): Promise<Loan[]>;
  createLoan(loan: InsertLoan): Promise<Loan>;
  updateLoanStatus(id: number, status: "PENDING" | "APPROVED" | "REJECTED"): Promise<Loan>;
  getPendingLoans(): Promise<Loan[]>;
  getAllLoans(): Promise<Loan[]>;

  // Repayment operations
  getRepayment(id: number): Promise<Repayment | undefined>;
  getRepaymentsByLoanId(loanId: number): Promise<Repayment[]>;
  createRepayment(repayment: InsertRepayment): Promise<Repayment>;
  
  // Budget Category operations
  getBudgetCategory(id: number): Promise<BudgetCategory | undefined>;
  getBudgetCategoriesByUserId(userId: number): Promise<BudgetCategory[]>;
  createBudgetCategory(budgetCategory: InsertBudgetCategory): Promise<BudgetCategory>;
  updateBudgetCategory(id: number, data: Partial<InsertBudgetCategory>): Promise<BudgetCategory>;
  deleteBudgetCategory(id: number): Promise<void>;
  
  // Budget Recommendation operations
  getBudgetRecommendation(id: number): Promise<BudgetRecommendation | undefined>;
  getBudgetRecommendationsByUserId(userId: number): Promise<BudgetRecommendation[]>;
  createBudgetRecommendation(budgetRecommendation: InsertBudgetRecommendation): Promise<BudgetRecommendation>;
  updateBudgetRecommendationStatus(id: number, isImplemented: boolean): Promise<BudgetRecommendation>;
  deleteBudgetRecommendation(id: number): Promise<void>;
  generateBudgetRecommendations(userId: number): Promise<BudgetRecommendation[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...userData,
      email: userData.email.toLowerCase()
    }).returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.name);
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<void> {
    // First check if user exists
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    // Get user's savings account
    const savingsAccount = await this.getSavingsByUserId(id);
    
    if (savingsAccount) {
      // Delete all withdrawals related to this savings account
      await db.delete(withdrawals)
        .where(eq(withdrawals.savingsId, savingsAccount.id));
      
      // Delete all deposits related to this savings account
      await db.delete(deposits)
        .where(eq(deposits.savingsId, savingsAccount.id));
      
      // Delete the savings account
      await db.delete(savings)
        .where(eq(savings.id, savingsAccount.id));
    }
    
    // Get user's loans
    const userLoans = await this.getLoansByUserId(id);
    
    for (const loan of userLoans) {
      // Delete all repayments for this loan
      await db.delete(repayments)
        .where(eq(repayments.loanId, loan.id));
    }
    
    // Delete all loans
    await db.delete(loans)
      .where(eq(loans.userId, id));
    
    // Finally delete the user
    await db.delete(users)
      .where(eq(users.id, id));
  }

  // Savings operations
  async getSavings(id: number): Promise<Savings | undefined> {
    const [savingsAccount] = await db.select().from(savings).where(eq(savings.id, id));
    return savingsAccount || undefined;
  }

  async getSavingsByUserId(userId: number): Promise<Savings | undefined> {
    const [savingsAccount] = await db.select().from(savings).where(eq(savings.userId, userId));
    return savingsAccount || undefined;
  }

  async createSavings(savingsData: InsertSavings): Promise<Savings> {
    const [savingsAccount] = await db.insert(savings).values(savingsData).returning();
    return savingsAccount;
  }

  async updateSavingsBalance(id: number, balance: string): Promise<Savings> {
    const [updatedSavings] = await db
      .update(savings)
      .set({ balance })
      .where(eq(savings.id, id))
      .returning();
    
    if (!updatedSavings) {
      throw new Error("Savings not found");
    }
    
    return updatedSavings;
  }

  async getAllSavings(): Promise<Savings[]> {
    return db.select().from(savings);
  }

  // Deposit operations
  async getDeposit(id: number): Promise<Deposit | undefined> {
    const [deposit] = await db.select().from(deposits).where(eq(deposits.id, id));
    return deposit || undefined;
  }

  async getDepositsBySavingsId(savingsId: number): Promise<Deposit[]> {
    return db
      .select()
      .from(deposits)
      .where(eq(deposits.savingsId, savingsId))
      .orderBy(desc(deposits.createdAt));
  }

  async createDeposit(depositData: InsertDeposit): Promise<Deposit> {
    const [deposit] = await db.insert(deposits).values(depositData).returning();
    return deposit;
  }

  // Withdrawal operations
  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    const [withdrawal] = await db.select().from(withdrawals).where(eq(withdrawals.id, id));
    return withdrawal || undefined;
  }

  async getWithdrawalsBySavingsId(savingsId: number): Promise<Withdrawal[]> {
    return db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.savingsId, savingsId))
      .orderBy(desc(withdrawals.createdAt));
  }

  async createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal> {
    // Status is already handled in the schema with a default value
    const [withdrawal] = await db
      .insert(withdrawals)
      .values(withdrawalData)
      .returning();
    return withdrawal;
  }

  async updateWithdrawalStatus(id: number, status: "PENDING" | "APPROVED" | "REJECTED"): Promise<Withdrawal> {
    const [updatedWithdrawal] = await db
      .update(withdrawals)
      .set({ status })
      .where(eq(withdrawals.id, id))
      .returning();
    
    if (!updatedWithdrawal) {
      throw new Error("Withdrawal not found");
    }
    
    return updatedWithdrawal;
  }
  
  async getPendingWithdrawals(): Promise<Withdrawal[]> {
    return db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.status, "PENDING"))
      .orderBy(desc(withdrawals.createdAt));
  }

  // Loan operations
  async getLoan(id: number): Promise<Loan | undefined> {
    const [loan] = await db.select().from(loans).where(eq(loans.id, id));
    return loan || undefined;
  }

  async getLoansByUserId(userId: number): Promise<Loan[]> {
    return db
      .select()
      .from(loans)
      .where(eq(loans.userId, userId))
      .orderBy(desc(loans.createdAt));
  }

  async createLoan(loanData: InsertLoan): Promise<Loan> {
    // Status is already handled in the schema with a default value
    const [loan] = await db
      .insert(loans)
      .values(loanData)
      .returning();
    return loan;
  }

  async updateLoanStatus(id: number, status: "PENDING" | "APPROVED" | "REJECTED"): Promise<Loan> {
    const [updatedLoan] = await db
      .update(loans)
      .set({ status })
      .where(eq(loans.id, id))
      .returning();
    
    if (!updatedLoan) {
      throw new Error("Loan not found");
    }
    
    return updatedLoan;
  }

  async getPendingLoans(): Promise<Loan[]> {
    return db
      .select()
      .from(loans)
      .where(eq(loans.status, "PENDING"))
      .orderBy(desc(loans.createdAt));
  }

  async getAllLoans(): Promise<Loan[]> {
    return db.select().from(loans).orderBy(desc(loans.createdAt));
  }

  // Repayment operations
  async getRepayment(id: number): Promise<Repayment | undefined> {
    const [repayment] = await db.select().from(repayments).where(eq(repayments.id, id));
    return repayment || undefined;
  }

  async getRepaymentsByLoanId(loanId: number): Promise<Repayment[]> {
    return db
      .select()
      .from(repayments)
      .where(eq(repayments.loanId, loanId))
      .orderBy(desc(repayments.createdAt));
  }

  async createRepayment(repaymentData: InsertRepayment): Promise<Repayment> {
    const [repayment] = await db.insert(repayments).values(repaymentData).returning();
    return repayment;
  }
  
  // Budget Category operations
  async getBudgetCategory(id: number): Promise<BudgetCategory | undefined> {
    const [category] = await db.select().from(budgetCategories).where(eq(budgetCategories.id, id));
    return category || undefined;
  }
  
  async getBudgetCategoriesByUserId(userId: number): Promise<BudgetCategory[]> {
    return db
      .select()
      .from(budgetCategories)
      .where(eq(budgetCategories.userId, userId))
      .orderBy(budgetCategories.category);
  }
  
  async createBudgetCategory(budgetCategoryData: InsertBudgetCategory): Promise<BudgetCategory> {
    const [category] = await db.insert(budgetCategories).values(budgetCategoryData).returning();
    return category;
  }
  
  async updateBudgetCategory(id: number, data: Partial<InsertBudgetCategory>): Promise<BudgetCategory> {
    const [updatedCategory] = await db
      .update(budgetCategories)
      .set(data)
      .where(eq(budgetCategories.id, id))
      .returning();
    
    if (!updatedCategory) {
      throw new Error("Budget category not found");
    }
    
    return updatedCategory;
  }
  
  async deleteBudgetCategory(id: number): Promise<void> {
    await db.delete(budgetCategories).where(eq(budgetCategories.id, id));
  }
  
  // Budget Recommendation operations
  async getBudgetRecommendation(id: number): Promise<BudgetRecommendation | undefined> {
    const [recommendation] = await db.select().from(budgetRecommendations).where(eq(budgetRecommendations.id, id));
    return recommendation || undefined;
  }
  
  async getBudgetRecommendationsByUserId(userId: number): Promise<BudgetRecommendation[]> {
    return db
      .select()
      .from(budgetRecommendations)
      .where(eq(budgetRecommendations.userId, userId))
      .orderBy(desc(budgetRecommendations.createdAt));
  }
  
  async createBudgetRecommendation(budgetRecommendationData: InsertBudgetRecommendation): Promise<BudgetRecommendation> {
    const [recommendation] = await db.insert(budgetRecommendations).values(budgetRecommendationData).returning();
    return recommendation;
  }
  
  async updateBudgetRecommendationStatus(id: number, isImplemented: boolean): Promise<BudgetRecommendation> {
    const [updatedRecommendation] = await db
      .update(budgetRecommendations)
      .set({ isImplemented })
      .where(eq(budgetRecommendations.id, id))
      .returning();
    
    if (!updatedRecommendation) {
      throw new Error("Budget recommendation not found");
    }
    
    return updatedRecommendation;
  }
  
  async deleteBudgetRecommendation(id: number): Promise<void> {
    await db.delete(budgetRecommendations).where(eq(budgetRecommendations.id, id));
  }
  
  async generateBudgetRecommendations(userId: number): Promise<BudgetRecommendation[]> {
    // Get user's financial data
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const savings = await this.getSavingsByUserId(userId);
    const loans = await this.getLoansByUserId(userId);
    
    // Get existing budget categories
    const existingCategories = await this.getBudgetCategoriesByUserId(userId);
    
    // Current recommendations
    const recommendations: InsertBudgetRecommendation[] = [];
    
    // Generate recommendations based on financial data
    
    // 1. Savings recommendation - if savings balance is low
    if (!savings || parseFloat(savings.balance) < 1000) {
      recommendations.push({
        userId,
        type: "SAVING",
        title: "Build Your Emergency Fund",
        description: "Start with saving at least $1,000 for emergencies. We recommend setting aside 10% of your income each month until you reach this goal.",
        suggestedAmount: "1000.00",
        category: "SAVINGS",
        isImplemented: false
      });
    }
    
    // 2. Debt management recommendation - if user has loans
    if (loans && loans.length > 0) {
      const approvedLoans = loans.filter(loan => loan.status === "APPROVED");
      
      if (approvedLoans.length > 0) {
        // Calculate total outstanding loans
        const totalLoanAmount = approvedLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
        
        if (totalLoanAmount > 0) {
          recommendations.push({
            userId,
            type: "DEBT_MANAGEMENT",
            title: "Accelerate Your Loan Repayment",
            description: `You have $${totalLoanAmount.toFixed(2)} in outstanding loans. Consider allocating an additional 5-10% of your monthly income towards loan repayment to save on interest.`,
            category: "DEBT",
            isImplemented: false
          });
        }
      }
    }
    
    // 3. Budget allocation recommendation - if no budget categories exist
    if (existingCategories.length === 0) {
      recommendations.push({
        userId,
        type: "SAVING",
        title: "Create A Monthly Budget Plan",
        description: "We recommend following the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.",
        category: "OTHER",
        isImplemented: false
      });
    }
    
    // Check if housing budget exists and is properly allocated
    const housingCategory = existingCategories.find(cat => cat.category === "HOUSING");
    if (!housingCategory) {
      recommendations.push({
        userId,
        type: "SPENDING",
        title: "Set Your Housing Budget",
        description: "Housing costs should ideally be less than 30% of your income. Track your rent/mortgage, utilities, and maintenance in this category.",
        category: "HOUSING",
        isImplemented: false
      });
    }
    
    // Save recommendations to database
    const savedRecommendations: BudgetRecommendation[] = [];
    for (const rec of recommendations) {
      savedRecommendations.push(await this.createBudgetRecommendation(rec));
    }
    
    return savedRecommendations;
  }

  // Seed data for initial database setup
  async seedInitialData(): Promise<void> {
    // Check if admin user exists
    const adminExists = await this.getUserByEmail("admin@sacco.com");
    
    if (!adminExists) {
      // Create admin user
      const admin = await this.createUser({
        name: "Admin User",
        email: "admin@sacco.com",
        password: "$2a$10$qCYw8OMeJDNXvJzUiQlS/ONhRBsXQ7neCPM.qhbP.CWP/VEG2z3.6", // password: admin123
        role: "ADMIN"
      });
      
      console.log("Created admin user:", admin.name);
      
      // Create member user
      const member = await this.createUser({
        name: "John Doe",
        email: "john@example.com",
        password: "$2a$10$hvOIhHwZRVXDI2mbkmng2uO7CBUozC8yveMRGJLe/bgwlh3m12JZm", // password: password123
        role: "MEMBER"
      });
      
      console.log("Created member:", member.name);
      
      // Create savings account
      const memberSavings = await this.createSavings({
        userId: member.id,
        balance: "2450.00"
      });
      
      // Add deposits
      await this.createDeposit({
        savingsId: memberSavings.id,
        amount: "500.00",
        method: "bank",
        notes: "Initial deposit"
      });
      
      await this.createDeposit({
        savingsId: memberSavings.id,
        amount: "1950.00",
        method: "bank",
        notes: "Salary deposit"
      });
      
      // Add withdrawal - we need to directly use db.insert for this since our method doesn't accept status
      await db.insert(withdrawals).values({
        savingsId: memberSavings.id,
        amount: "200.00",
        method: "bank",
        reason: "Emergency expenses",
        status: "PENDING"
      }).returning();
      
      // Add an approved loan - we need to use db.insert directly
      const [loan] = await db.insert(loans).values({
        userId: member.id,
        amount: "1200.00",
        purpose: "business",
        term: 12,
        description: "Need funds to expand my small business",
        status: "APPROVED"
      }).returning();
      
      // Add repayment
      await this.createRepayment({
        loanId: loan.id,
        amount: "150.00"
      });
      
      // Add pending loan - using db.insert directly
      await db.insert(loans).values({
        userId: member.id,
        amount: "500.00",
        purpose: "education",
        term: 6,
        description: "For a short course in web development",
        status: "PENDING"
      }).returning();
      
      // Add sample budget categories
      await this.createBudgetCategory({
        userId: member.id,
        category: "HOUSING",
        amount: "800.00",
        notes: "Rent and utilities"
      });
      
      await this.createBudgetCategory({
        userId: member.id,
        category: "FOOD",
        amount: "350.00",
        notes: "Groceries and eating out"
      });
      
      await this.createBudgetCategory({
        userId: member.id,
        category: "TRANSPORTATION",
        amount: "150.00",
        notes: "Public transport and occasional taxi"
      });
      
      // Add a sample budget recommendation
      await this.createBudgetRecommendation({
        userId: member.id,
        type: "SAVING",
        title: "Increase Your Emergency Fund",
        description: "We recommend saving at least 3-6 months of expenses in your emergency fund.",
        suggestedAmount: "5000.00",
        category: "SAVINGS",
        isImplemented: false
      });
      
      console.log("Initial data seeding complete");
    } else {
      console.log("Database already contains data, skipping seed");
    }
  }
}

export const storage = new DatabaseStorage();
