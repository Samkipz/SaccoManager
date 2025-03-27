import { apiRequest } from "./queryClient";
import { jwtDecode } from "jwt-decode";
import { UserWithSavingsAndLoans } from "@shared/schema";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: "MEMBER" | "ADMIN";
  exp: number;
}

interface AuthState {
  token: string | null;
  user: JwtPayload | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      
      login: async (email: string, password: string) => {
        try {
          const res = await apiRequest("POST", "/api/auth/login", { email, password });
          const data = await res.json();
          
          if (data.token) {
            const decoded = jwtDecode<JwtPayload>(data.token);
            
            set({
              token: data.token,
              user: decoded,
              isAuthenticated: true,
              isAdmin: decoded.role === "ADMIN",
            });
          }
        } catch (error) {
          console.error("Login failed:", error);
          throw error;
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        try {
          await apiRequest("POST", "/api/auth/register", {
            name,
            email,
            password,
          });
          // Successfully registered, now login
          await get().login(email, password);
        } catch (error) {
          console.error("Registration failed:", error);
          throw error;
        }
      },
      
      logout: async () => {
        try {
          await apiRequest("POST", "/api/auth/logout", {});
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isAdmin: false,
          });
        } catch (error) {
          console.error("Logout failed:", error);
          throw error;
        }
      },
    }),
    {
      name: "sacco-auth-storage",
    }
  )
);

// Helper function to get auth token for API requests
export const getAuthToken = (): string | null => {
  return useAuth.getState().token;
};

// Check if current token is valid
export const isTokenValid = (): boolean => {
  const { user } = useAuth.getState();
  if (!user) return false;
  
  // Check if token is expired
  const currentTime = Date.now() / 1000;
  return user.exp > currentTime;
};

// Hook to check current auth status and refresh if needed
export const useAuthCheck = () => {
  const { isAuthenticated, user } = useAuth();
  
  if (isAuthenticated && user) {
    const currentTime = Date.now() / 1000;
    if (user.exp < currentTime) {
      // Token expired, log out
      useAuth.getState().logout();
      return false;
    }
    return true;
  }
  
  return false;
};
