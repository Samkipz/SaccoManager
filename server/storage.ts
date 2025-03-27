import { 
  User, InsertUser, 
  Savings, InsertSavings, 
  Deposit, InsertDeposit, 
  Withdrawal, InsertWithdrawal, 
  Loan, InsertLoan, 
  Repayment, InsertRepayment,
  users, savings, deposits, withdrawals, loans, repayments
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
      
      console.log("Initial data seeding complete");
    } else {
      console.log("Database already contains data, skipping seed");
    }
  }
}

export const storage = new DatabaseStorage();
