import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LightbulbIcon, BookOpenIcon } from "lucide-react";
import { motion } from "framer-motion";

import { FinancialTipPopup } from "@/components/tips/financial-tip-popup";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FinancialTipsGrid } from "@/components/tips/financial-tips-grid";

export function FinancialTipsButton() {
  const [showTipsLibrary, setShowTipsLibrary] = useState(false);
  
  // Force show a tip immediately for demo/testing purposes
  const showTipNow = () => {
    // Access the showRandomTip function by creating a button with a ref
    const tipButton = document.createElement('button');
    tipButton.setAttribute('data-show-tip-now', 'true');
    document.body.appendChild(tipButton);
    tipButton.click();
    document.body.removeChild(tipButton);
  };
  
  return (
    <>
      {/* Financial tip popup that shows periodically */}
      <FinancialTipPopup 
        showInitialDelay={10000} // 10 seconds for demo purposes (normally would be longer)
        frequency={120000} // 2 minutes for demo purposes (normally would be longer)
        autoClose={0} // Don't auto-close
      />
      
      <div className="flex gap-2">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 gap-1.5"
            onClick={showTipNow}
          >
            <LightbulbIcon className="h-4 w-4" />
            Financial Tip
          </Button>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 gap-1.5"
            onClick={() => setShowTipsLibrary(true)}
          >
            <BookOpenIcon className="h-4 w-4" />
            Tips Library
          </Button>
        </motion.div>
      </div>
      
      {/* Tips Library Dialog */}
      <Dialog open={showTipsLibrary} onOpenChange={setShowTipsLibrary}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Financial Education</DialogTitle>
          </DialogHeader>
          <FinancialTipsGrid onClose={() => setShowTipsLibrary(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}