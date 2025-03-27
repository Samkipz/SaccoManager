import { 
  User, InsertUser, 
  Savings, InsertSavings, 
  Deposit, InsertDeposit, 
  Withdrawal, InsertWithdrawal, 
  Loan, InsertLoan, 
  Repayment, InsertRepayment
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private savings: Map<number, Savings>;
  private deposits: Map<number, Deposit>;
  private withdrawals: Map<number, Withdrawal>;
  private loans: Map<number, Loan>;
  private repayments: Map<number, Repayment>;
  
  private nextUserId: number;
  private nextSavingsId: number;
  private nextDepositId: number;
  private nextWithdrawalId: number;
  private nextLoanId: number;
  private nextRepaymentId: number;

  constructor() {
    this.users = new Map();
    this.savings = new Map();
    this.deposits = new Map();
    this.withdrawals = new Map();
    this.loans = new Map();
    this.repayments = new Map();
    
    this.nextUserId = 1;
    this.nextSavingsId = 1;
    this.nextDepositId = 1;
    this.nextWithdrawalId = 1;
    this.nextLoanId = 1;
    this.nextRepaymentId = 1;
    
    // Initialize with admin user
    this.createUser({
      name: "Admin User",
      email: "admin@sacco.com",
      password: "$2a$10$qCYw8OMeJDNXvJzUiQlS/ONhRBsXQ7neCPM.qhbP.CWP/VEG2z3.6", // password: admin123
      role: "ADMIN"
    });
    
    // Initialize with some member users
    this.seedMemberData();
  }
  
  // Seed some demo data
  private async seedMemberData() {
    // Create a member
    const member = await this.createUser({
      name: "John Doe",
      email: "john@example.com",
      password: "$2a$10$hvOIhHwZRVXDI2mbkmng2uO7CBUozC8yveMRGJLe/bgwlh3m12JZm", // password: password123
      role: "MEMBER"
    });
    
    // Create savings account
    const savings = await this.createSavings({
      userId: member.id,
      balance: "2450.00"
    });
    
    // Add some deposits
    await this.createDeposit({
      savingsId: savings.id,
      amount: "500.00",
      method: "bank",
      notes: "Initial deposit"
    });
    
    await this.createDeposit({
      savingsId: savings.id,
      amount: "1950.00",
      method: "bank",
      notes: "Salary deposit"
    });
    
    // Add a withdrawal
    await this.createWithdrawal({
      savingsId: savings.id,
      amount: "200.00",
      method: "bank",
      reason: "Emergency expenses",
      status: "PENDING"
    });
    
    // Add a loan
    const loan = await this.createLoan({
      userId: member.id,
      amount: "1200.00",
      purpose: "business",
      term: 12,
      description: "Need funds to expand my small business",
      status: "APPROVED"
    });
    
    // Add a loan repayment
    await this.createRepayment({
      loanId: loan.id,
      amount: "150.00"
    });
    
    // Add a pending loan
    await this.createLoan({
      userId: member.id,
      amount: "500.00",
      purpose: "education",
      term: 6,
      description: "For a short course in web development",
      status: "PENDING"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.nextUserId++;
    const now = new Date();
    
    const user: User = {
      id,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Savings operations
  async getSavings(id: number): Promise<Savings | undefined> {
    return this.savings.get(id);
  }

  async getSavingsByUserId(userId: number): Promise<Savings | undefined> {
    for (const savings of this.savings.values()) {
      if (savings.userId === userId) {
        return savings;
      }
    }
    return undefined;
  }

  async createSavings(savingsData: InsertSavings): Promise<Savings> {
    const id = this.nextSavingsId++;
    const now = new Date();
    
    const savings: Savings = {
      id,
      ...savingsData,
      createdAt: now
    };
    
    this.savings.set(id, savings);
    return savings;
  }

  async updateSavingsBalance(id: number, balance: string): Promise<Savings> {
    const savings = await this.getSavings(id);
    if (!savings) {
      throw new Error("Savings not found");
    }
    
    const updatedSavings = {
      ...savings,
      balance
    };
    
    this.savings.set(id, updatedSavings);
    return updatedSavings;
  }

  async getAllSavings(): Promise<Savings[]> {
    return Array.from(this.savings.values());
  }

  // Deposit operations
  async getDeposit(id: number): Promise<Deposit | undefined> {
    return this.deposits.get(id);
  }

  async getDepositsBySavingsId(savingsId: number): Promise<Deposit[]> {
    const result: Deposit[] = [];
    for (const deposit of this.deposits.values()) {
      if (deposit.savingsId === savingsId) {
        result.push(deposit);
      }
    }
    return result;
  }

  async createDeposit(depositData: InsertDeposit): Promise<Deposit> {
    const id = this.nextDepositId++;
    const now = new Date();
    
    const deposit: Deposit = {
      id,
      ...depositData,
      createdAt: now
    };
    
    this.deposits.set(id, deposit);
    return deposit;
  }

  // Withdrawal operations
  async getWithdrawal(id: number): Promise<Withdrawal | undefined> {
    return this.withdrawals.get(id);
  }

  async getWithdrawalsBySavingsId(savingsId: number): Promise<Withdrawal[]> {
    const result: Withdrawal[] = [];
    for (const withdrawal of this.withdrawals.values()) {
      if (withdrawal.savingsId === savingsId) {
        result.push(withdrawal);
      }
    }
    return result;
  }

  async createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal> {
    const id = this.nextWithdrawalId++;
    const now = new Date();
    
    const withdrawal: Withdrawal = {
      id,
      ...withdrawalData,
      createdAt: now
    };
    
    this.withdrawals.set(id, withdrawal);
    return withdrawal;
  }

  async updateWithdrawalStatus(id: number, status: "PENDING" | "APPROVED" | "REJECTED"): Promise<Withdrawal> {
    const withdrawal = await this.getWithdrawal(id);
    if (!withdrawal) {
      throw new Error("Withdrawal not found");
    }
    
    const updatedWithdrawal = {
      ...withdrawal,
      status
    };
    
    this.withdrawals.set(id, updatedWithdrawal);
    return updatedWithdrawal;
  }

  // Loan operations
  async getLoan(id: number): Promise<Loan | undefined> {
    return this.loans.get(id);
  }

  async getLoansByUserId(userId: number): Promise<Loan[]> {
    const result: Loan[] = [];
    for (const loan of this.loans.values()) {
      if (loan.userId === userId) {
        result.push(loan);
      }
    }
    return result;
  }

  async createLoan(loanData: InsertLoan): Promise<Loan> {
    const id = this.nextLoanId++;
    const now = new Date();
    
    const loan: Loan = {
      id,
      ...loanData,
      createdAt: now
    };
    
    this.loans.set(id, loan);
    return loan;
  }

  async updateLoanStatus(id: number, status: "PENDING" | "APPROVED" | "REJECTED"): Promise<Loan> {
    const loan = await this.getLoan(id);
    if (!loan) {
      throw new Error("Loan not found");
    }
    
    const updatedLoan = {
      ...loan,
      status
    };
    
    this.loans.set(id, updatedLoan);
    return updatedLoan;
  }

  async getPendingLoans(): Promise<Loan[]> {
    const result: Loan[] = [];
    for (const loan of this.loans.values()) {
      if (loan.status === "PENDING") {
        result.push(loan);
      }
    }
    return result;
  }

  async getAllLoans(): Promise<Loan[]> {
    return Array.from(this.loans.values());
  }

  // Repayment operations
  async getRepayment(id: number): Promise<Repayment | undefined> {
    return this.repayments.get(id);
  }

  async getRepaymentsByLoanId(loanId: number): Promise<Repayment[]> {
    const result: Repayment[] = [];
    for (const repayment of this.repayments.values()) {
      if (repayment.loanId === loanId) {
        result.push(repayment);
      }
    }
    return result;
  }

  async createRepayment(repaymentData: InsertRepayment): Promise<Repayment> {
    const id = this.nextRepaymentId++;
    const now = new Date();
    
    const repayment: Repayment = {
      id,
      ...repaymentData,
      createdAt: now
    };
    
    this.repayments.set(id, repayment);
    return repayment;
  }
}

export const storage = new MemStorage();
