import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { insertUserSchema, userLoginSchema, insertDepositSchema, insertWithdrawalSchema, insertLoanSchema } from "@shared/schema";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "sacco_secret_key";
const JWT_EXPIRY = "24h";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // Auth Middleware
  const authenticateUser = (req: any, res: any, next: any) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };

  // Admin Middleware
  const ensureAdmin = (req: any, res: any, next: any) => {
    if (req.user && req.user.role === "ADMIN") {
      next();
    } else {
      return res.status(403).json({ message: "Admin access required" });
    }
  };

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: validationResult.error.errors });
      }

      const { name, email, password } = validationResult.data;

      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        name,
        email,
        password: hashedPassword,
        role: "MEMBER"
      });

      // Create savings account for the user
      await storage.createSavings({
        userId: user.id,
        balance: "0"
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return res.status(201).json({ token });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validationResult = userLoginSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: validationResult.error.errors });
      }

      const { email, password } = validationResult.data;

      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
      );

      return res.status(200).json({ token });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    // For JWT, we don't need server-side logout
    return res.status(200).json({ message: "Logged out successfully" });
  });

  // User Routes
  app.get("/api/users", authenticateUser, ensureAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      
      // Get savings and loans for each user
      const usersWithData = await Promise.all(
        users.map(async (user) => {
          const savings = await storage.getSavingsByUserId(user.id);
          const loans = await storage.getLoansByUserId(user.id);
          return { ...user, savings, loans };
        })
      );
      
      return res.status(200).json(usersWithData);
    } catch (error) {
      console.error("Get users error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/:id", authenticateUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user is requesting own data or is admin
      if (req.user.id !== userId && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get savings and loans
      const savings = await storage.getSavingsByUserId(userId);
      const loans = await storage.getLoansByUserId(userId);
      
      return res.status(200).json({ ...user, savings, loans });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Savings Routes
  app.get("/api/savings/:userId", authenticateUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Check if user is requesting own data or is admin
      if (req.user.id !== userId && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const savings = await storage.getSavingsByUserId(userId);
      if (!savings) {
        return res.status(404).json({ message: "Savings account not found" });
      }
      
      // Get deposits and withdrawals
      const deposits = await storage.getDepositsBySavingsId(savings.id);
      const withdrawals = await storage.getWithdrawalsBySavingsId(savings.id);
      
      return res.status(200).json({ ...savings, deposits, withdrawals });
    } catch (error) {
      console.error("Get savings error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/savings/deposit", authenticateUser, async (req, res) => {
    try {
      const validationResult = insertDepositSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: validationResult.error.errors });
      }

      const { savingsId, amount, method, notes } = validationResult.data;
      
      // Check if savings account exists
      const savings = await storage.getSavings(savingsId);
      if (!savings) {
        return res.status(404).json({ message: "Savings account not found" });
      }
      
      // Check if user is depositing to own account or is admin
      if (savings.userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Create deposit
      const deposit = await storage.createDeposit({
        savingsId,
        amount: amount.toString(),
        method,
        notes
      });
      
      // Update savings balance
      const newBalance = parseFloat(savings.balance) + parseFloat(amount.toString());
      await storage.updateSavingsBalance(savingsId, newBalance.toString());
      
      return res.status(201).json(deposit);
    } catch (error) {
      console.error("Deposit error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/savings/withdrawal", authenticateUser, async (req, res) => {
    try {
      const validationResult = insertWithdrawalSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: validationResult.error.errors });
      }

      const { savingsId, amount, method, reason } = validationResult.data;
      
      // Check if savings account exists
      const savings = await storage.getSavings(savingsId);
      if (!savings) {
        return res.status(404).json({ message: "Savings account not found" });
      }
      
      // Check if user is withdrawing from own account or is admin
      if (savings.userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Check if enough balance (only for member, admin can override)
      if (req.user.role !== "ADMIN" && parseFloat(savings.balance) < parseFloat(amount.toString())) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Create withdrawal request (pending status)
      const withdrawal = await storage.createWithdrawal({
        savingsId,
        amount: amount.toString(),
        method,
        reason
      });
      
      return res.status(201).json(withdrawal);
    } catch (error) {
      console.error("Withdrawal error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Admin endpoints for withdrawal approval/rejection
  app.post("/api/savings/withdrawal/:id/approve", authenticateUser, ensureAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      
      // Get withdrawal
      const withdrawal = await storage.getWithdrawal(withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      // Check if already processed
      if (withdrawal.status !== "PENDING") {
        return res.status(400).json({ message: "Withdrawal already processed" });
      }
      
      // Get savings account
      const savings = await storage.getSavings(withdrawal.savingsId);
      if (!savings) {
        return res.status(404).json({ message: "Savings account not found" });
      }
      
      // Check if enough balance
      if (parseFloat(savings.balance) < parseFloat(withdrawal.amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Update withdrawal status
      await storage.updateWithdrawalStatus(withdrawalId, "APPROVED");
      
      // Update savings balance
      const newBalance = parseFloat(savings.balance) - parseFloat(withdrawal.amount);
      await storage.updateSavingsBalance(withdrawal.savingsId, newBalance.toString());
      
      return res.status(200).json({ message: "Withdrawal approved" });
    } catch (error) {
      console.error("Withdraw approval error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/savings/withdrawal/:id/reject", authenticateUser, ensureAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      
      // Get withdrawal
      const withdrawal = await storage.getWithdrawal(withdrawalId);
      if (!withdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      // Check if already processed
      if (withdrawal.status !== "PENDING") {
        return res.status(400).json({ message: "Withdrawal already processed" });
      }
      
      // Update withdrawal status
      await storage.updateWithdrawalStatus(withdrawalId, "REJECTED");
      
      return res.status(200).json({ message: "Withdrawal rejected" });
    } catch (error) {
      console.error("Withdraw rejection error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Loan Routes
  app.get("/api/loans/user/:userId", authenticateUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Check if user is requesting own data or is admin
      if (req.user.id !== userId && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      const loans = await storage.getLoansByUserId(userId);
      
      // Get repayments for each loan
      const loansWithRepayments = await Promise.all(
        loans.map(async (loan) => {
          const repayments = await storage.getRepaymentsByLoanId(loan.id);
          return { ...loan, repayments };
        })
      );
      
      return res.status(200).json(loansWithRepayments);
    } catch (error) {
      console.error("Get loans error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/loans/apply", authenticateUser, async (req, res) => {
    try {
      const validationResult = insertLoanSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ message: "Invalid input", errors: validationResult.error.errors });
      }

      const { userId, amount, purpose, term, description } = validationResult.data;
      
      // Check if user is applying for own loan or is admin
      if (userId !== req.user.id && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Create loan application (pending status by default in schema)
      const loan = await storage.createLoan({
        userId,
        amount: amount.toString(),
        purpose,
        term,
        description
      });
      
      return res.status(201).json(loan);
    } catch (error) {
      console.error("Loan application error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Admin endpoints for loan applications
  app.get("/api/loans/pending", authenticateUser, ensureAdmin, async (req, res) => {
    try {
      const pendingLoans = await storage.getPendingLoans();
      
      // Get user info and repayments for each loan
      const loansWithDetails = await Promise.all(
        pendingLoans.map(async (loan) => {
          const user = await storage.getUser(loan.userId);
          const repayments = await storage.getRepaymentsByLoanId(loan.id);
          return { ...loan, user, repayments };
        })
      );
      
      return res.status(200).json(loansWithDetails);
    } catch (error) {
      console.error("Get pending loans error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/loans/:id/approve", authenticateUser, ensureAdmin, async (req, res) => {
    try {
      const loanId = parseInt(req.params.id);
      
      // Get loan
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      // Check if already processed
      if (loan.status !== "PENDING") {
        return res.status(400).json({ message: "Loan already processed" });
      }
      
      // Update loan status
      await storage.updateLoanStatus(loanId, "APPROVED");
      
      return res.status(200).json({ message: "Loan approved" });
    } catch (error) {
      console.error("Loan approval error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/loans/:id/reject", authenticateUser, ensureAdmin, async (req, res) => {
    try {
      const loanId = parseInt(req.params.id);
      
      // Get loan
      const loan = await storage.getLoan(loanId);
      if (!loan) {
        return res.status(404).json({ message: "Loan not found" });
      }
      
      // Check if already processed
      if (loan.status !== "PENDING") {
        return res.status(400).json({ message: "Loan already processed" });
      }
      
      // Update loan status
      await storage.updateLoanStatus(loanId, "REJECTED");
      
      return res.status(200).json({ message: "Loan rejected" });
    } catch (error) {
      console.error("Loan rejection error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Transactions Routes
  app.get("/api/transactions/recent", authenticateUser, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Get user's savings account
      const savings = await storage.getSavingsByUserId(userId);
      if (!savings) {
        return res.status(404).json({ message: "Savings account not found" });
      }
      
      // Get deposits and withdrawals
      const deposits = await storage.getDepositsBySavingsId(savings.id);
      const withdrawals = await storage.getWithdrawalsBySavingsId(savings.id);
      
      // Format as transactions
      const depositTransactions = deposits.map(deposit => ({
        id: `dep-${deposit.id}`,
        type: "deposit",
        date: new Date(deposit.createdAt),
        amount: parseFloat(deposit.amount),
        status: "completed"
      }));
      
      const withdrawalTransactions = withdrawals.map(withdrawal => ({
        id: `wdr-${withdrawal.id}`,
        type: "withdrawal",
        date: new Date(withdrawal.createdAt),
        amount: parseFloat(withdrawal.amount),
        status: withdrawal.status.toLowerCase()
      }));
      
      // Get loan repayments
      const loans = await storage.getLoansByUserId(userId);
      let repaymentTransactions = [];
      
      for (const loan of loans) {
        const repayments = await storage.getRepaymentsByLoanId(loan.id);
        const formatted = repayments.map(repayment => ({
          id: `rep-${repayment.id}`,
          type: "loan_repayment",
          date: new Date(repayment.createdAt),
          amount: parseFloat(repayment.amount),
          status: "completed"
        }));
        repaymentTransactions = [...repaymentTransactions, ...formatted];
      }
      
      // Combine and sort by date (most recent first)
      const allTransactions = [...depositTransactions, ...withdrawalTransactions, ...repaymentTransactions]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5); // Limit to most recent 5
      
      return res.status(200).json(allTransactions);
    } catch (error) {
      console.error("Recent transactions error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/transactions/:userId", authenticateUser, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Check if user is requesting own data or is admin
      if (req.user.id !== userId && req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Not authorized" });
      }
      
      // Get user's savings account
      const savings = await storage.getSavingsByUserId(userId);
      if (!savings) {
        return res.status(404).json({ message: "Savings account not found" });
      }
      
      // Get deposits and withdrawals
      const deposits = await storage.getDepositsBySavingsId(savings.id);
      const withdrawals = await storage.getWithdrawalsBySavingsId(savings.id);
      
      // Format as transactions
      const depositTransactions = deposits.map(deposit => ({
        id: `dep-${deposit.id}`,
        type: "deposit",
        date: new Date(deposit.createdAt),
        amount: parseFloat(deposit.amount),
        status: "completed",
        reference: `#TRX-${deposit.id}${Math.floor(Math.random() * 1000)}`
      }));
      
      const withdrawalTransactions = withdrawals.map(withdrawal => ({
        id: `wdr-${withdrawal.id}`,
        type: "withdrawal",
        date: new Date(withdrawal.createdAt),
        amount: parseFloat(withdrawal.amount),
        status: withdrawal.status.toLowerCase(),
        reference: `#TRX-${withdrawal.id}${Math.floor(Math.random() * 1000)}`
      }));
      
      // Get loan repayments
      const loans = await storage.getLoansByUserId(userId);
      let repaymentTransactions = [];
      
      for (const loan of loans) {
        const repayments = await storage.getRepaymentsByLoanId(loan.id);
        const formatted = repayments.map(repayment => ({
          id: `rep-${repayment.id}`,
          type: "loan_repayment",
          date: new Date(repayment.createdAt),
          amount: parseFloat(repayment.amount),
          status: "completed",
          reference: `#TRX-${repayment.id}${Math.floor(Math.random() * 1000)}`
        }));
        repaymentTransactions = [...repaymentTransactions, ...formatted];
      }
      
      // Combine and sort by date (most recent first)
      const allTransactions = [...depositTransactions, ...withdrawalTransactions, ...repaymentTransactions]
        .sort((a, b) => b.date.getTime() - a.date.getTime());
      
      return res.status(200).json(allTransactions);
    } catch (error) {
      console.error("All transactions error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // Reports for Admin
  app.get("/api/reports/summary", authenticateUser, ensureAdmin, async (req, res) => {
    try {
      // Get all users, savings, deposits, withdrawals, loans
      const users = await storage.getAllUsers();
      const memberCount = users.filter(user => user.role === "MEMBER").length;
      
      let totalSavings = 0;
      let totalLoans = 0;
      let loanRecoveryRate = 98.5; // Default for demo
      
      // Calculate total savings and loans
      for (const user of users) {
        const savings = await storage.getSavingsByUserId(user.id);
        if (savings) {
          totalSavings += parseFloat(savings.balance);
        }
        
        const loans = await storage.getLoansByUserId(user.id);
        for (const loan of loans) {
          if (loan.status === "APPROVED") {
            totalLoans += parseFloat(loan.amount);
          }
        }
      }
      
      // Get this month's growth
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get all savings accounts
      const allSavings = await storage.getAllSavings();
      let monthlyGrowth = 0;
      
      for (const savings of allSavings) {
        const deposits = await storage.getDepositsBySavingsId(savings.id);
        const withdrawals = await storage.getWithdrawalsBySavingsId(savings.id);
        
        // Calculate this month's deposits
        const monthDeposits = deposits
          .filter(d => new Date(d.createdAt) >= firstDayOfMonth)
          .reduce((sum, d) => sum + parseFloat(d.amount), 0);
        
        // Calculate this month's withdrawals
        const monthWithdrawals = withdrawals
          .filter(w => w.status === "APPROVED" && new Date(w.createdAt) >= firstDayOfMonth)
          .reduce((sum, w) => sum + parseFloat(w.amount), 0);
        
        monthlyGrowth += (monthDeposits - monthWithdrawals);
      }
      
      // Calculate month-over-month growth
      const growthRate = totalSavings > 0 ? (monthlyGrowth / totalSavings) * 100 : 0;
      
      return res.status(200).json({
        totalSavings,
        totalLoans,
        activeMembers: memberCount,
        loanRecoveryRate,
        monthlyGrowth,
        growthRate
      });
    } catch (error) {
      console.error("Reports summary error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/reports/savings-growth", authenticateUser, ensureAdmin, async (req, res) => {
    try {
      // This would typically fetch historical data from a database
      // For demo, we'll create sample data
      
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Create 6 months of data
      const data = [];
      for (let i = 5; i >= 0; i--) {
        const month = (currentMonth - i + 12) % 12;
        const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
        
        const monthName = new Date(year, month, 1).toLocaleString('en-US', { month: 'short' });
        
        // Generate sample data with growth trend
        const baseAmount = 25000 + (i * 3500);
        const randomFactor = 0.9 + (Math.random() * 0.2); // Random factor between 0.9-1.1
        
        data.push({
          month: `${monthName} ${year}`,
          amount: Math.round(baseAmount * randomFactor)
        });
      }
      
      return res.status(200).json(data);
    } catch (error) {
      console.error("Savings growth report error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/reports/loan-distribution", authenticateUser, ensureAdmin, async (req, res) => {
    try {
      // Get all approved loans
      const allLoans = await storage.getAllLoans();
      const approvedLoans = allLoans.filter(loan => loan.status === "APPROVED");
      
      // Group by purpose
      const purposeGroups = {};
      
      for (const loan of approvedLoans) {
        if (!purposeGroups[loan.purpose]) {
          purposeGroups[loan.purpose] = {
            count: 0,
            amount: 0
          };
        }
        
        purposeGroups[loan.purpose].count += 1;
        purposeGroups[loan.purpose].amount += parseFloat(loan.amount);
      }
      
      // Format for chart
      const data = Object.entries(purposeGroups).map(([purpose, stats]) => ({
        purpose: purpose.charAt(0).toUpperCase() + purpose.slice(1),
        count: stats.count,
        amount: stats.amount
      }));
      
      return res.status(200).json(data);
    } catch (error) {
      console.error("Loan distribution report error:", error);
      return res.status(500).json({ message: "Server error" });
    }
  });

  return httpServer;
}
