import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LightbulbIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import the shared financial tips data
import { financialTips } from "./financial-tips-data";

interface FinancialTipPopupProps {
  showInitialDelay?: number; // Time in ms before showing first tip
  frequency?: number; // Time in ms between tips
  autoClose?: number; // Time in ms to auto-close the popup (0 for no auto-close)
}

export function FinancialTipPopup({
  showInitialDelay = 60000, // 1 minute default
  frequency = 1800000, // 30 minutes default
  autoClose = 15000, // 15 seconds default
}: FinancialTipPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTip, setCurrentTip] = useState(financialTips[0]);
  const [hasInitiallyShown, setHasInitiallyShown] = useState(false);
  const [dismissedToday, setDismissedToday] = useState(false);
  const showRandomTipRef = useRef<() => void>(() => {});
  
  // Load dismissed state from localStorage
  useEffect(() => {
    const lastDismissed = localStorage.getItem("financialTipsDismissedDate");
    if (lastDismissed) {
      const lastDismissedDate = new Date(lastDismissed);
      const today = new Date();
      
      // Check if last dismissed is from today
      const isSameDay = 
        lastDismissedDate.getDate() === today.getDate() &&
        lastDismissedDate.getMonth() === today.getMonth() &&
        lastDismissedDate.getFullYear() === today.getFullYear();
      
      setDismissedToday(isSameDay);
    }
  }, []);
  
  // Show initial tip after delay
  useEffect(() => {
    if (!dismissedToday && !hasInitiallyShown) {
      const timer = setTimeout(() => {
        showRandomTip();
        setHasInitiallyShown(true);
      }, showInitialDelay);
      
      return () => clearTimeout(timer);
    }
  }, [dismissedToday, hasInitiallyShown, showInitialDelay]);
  
  // Set up recurring tips
  useEffect(() => {
    if (!dismissedToday && hasInitiallyShown) {
      const interval = setInterval(() => {
        showRandomTip();
      }, frequency);
      
      return () => clearInterval(interval);
    }
  }, [dismissedToday, hasInitiallyShown, frequency]);
  
  // Auto-close timer
  useEffect(() => {
    if (isOpen && autoClose > 0) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, autoClose);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose]);
  
  // Event listener for manual triggering of tips
  useEffect(() => {
    const handleShowTip = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.getAttribute('data-show-tip-now') === 'true') {
        showRandomTip();
      }
    };
    
    document.addEventListener('click', handleShowTip);
    
    return () => {
      document.removeEventListener('click', handleShowTip);
    };
  }, []);
  
  // Assign function to ref for external access
  showRandomTipRef.current = () => {
    const randomIndex = Math.floor(Math.random() * financialTips.length);
    setCurrentTip(financialTips[randomIndex]);
    setIsOpen(true);
  };
  
  const showRandomTip = () => {
    showRandomTipRef.current();
  };
  
  const handleDismiss = () => {
    setIsOpen(false);
  };
  
  const handleDismissToday = () => {
    setIsOpen(false);
    setDismissedToday(true);
    localStorage.setItem("financialTipsDismissedDate", new Date().toISOString());
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Savings":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Budgeting":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Debt Management":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "Investing":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Spending":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "Cost Cutting":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "Banking":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
      case "Organization":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
            >
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary-50 text-primary p-1.5 rounded-full">
                      <LightbulbIcon className="h-5 w-5" />
                    </div>
                    <DialogTitle>Financial Tip</DialogTitle>
                  </div>
                  <Badge className={getCategoryColor(currentTip.category)}>
                    {currentTip.category}
                  </Badge>
                </div>
              </DialogHeader>
              
              <div className="mt-4 mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="text-xl">{currentTip.icon}</span>
                  {currentTip.title}
                </h3>
                <DialogDescription className="text-base">
                  {currentTip.description}
                </DialogDescription>
              </div>
              
              <DialogFooter className="flex items-center justify-between sm:justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDismissToday}
                  className="text-xs"
                >
                  Don't show today
                </Button>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => showRandomTip()}
                    className="px-2"
                  >
                    Next tip
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleDismiss}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Got it
                  </Button>
                </div>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}