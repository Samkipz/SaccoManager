import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { BookmarkIcon, Share2Icon } from "lucide-react";

// Import the shared financial tips data
import { financialTips } from "./financial-tips-data";

interface FinancialTipsGridProps {
  initialCategory?: string;
  onClose?: () => void;
}

export function FinancialTipsGrid({
  initialCategory = "all",
  onClose,
}: FinancialTipsGridProps) {
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [bookmarkedTips, setBookmarkedTips] = useState<number[]>(() => {
    // Load bookmarked tips from localStorage
    const savedBookmarks = localStorage.getItem("bookmarkedFinancialTips");
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });

  // Get unique categories
  const categories = ["all", ...new Set(financialTips.map(tip => tip.category.toLowerCase()))];

  // Filter tips based on active category
  const filteredTips = activeCategory === "all"
    ? financialTips
    : financialTips.filter(tip => tip.category.toLowerCase() === activeCategory);

  const handleBookmark = (tipId: number) => {
    setBookmarkedTips(prev => {
      const newBookmarks = prev.includes(tipId)
        ? prev.filter(id => id !== tipId)
        : [...prev, tipId];
      
      // Save to localStorage
      localStorage.setItem("bookmarkedFinancialTips", JSON.stringify(newBookmarks));
      return newBookmarks;
    });
  };

  const handleShare = (tip: typeof financialTips[0]) => {
    if (navigator.share) {
      navigator.share({
        title: `Financial Tip: ${tip.title}`,
        text: `${tip.title} - ${tip.description}`,
        url: window.location.href,
      }).catch(error => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      const shareText = `${tip.title} - ${tip.description}`;
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Tip copied to clipboard!");
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "savings":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "budgeting":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "debt management":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "investing":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "spending":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "cost cutting":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100";
      case "banking":
        return "bg-cyan-100 text-cyan-800 hover:bg-cyan-100";
      case "organization":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  // Animation variants for staggered list
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Tips Library</h2>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>Close</Button>
        )}
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {categories.map(category => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="capitalize"
            >
              {category === "all" ? "All Tips" : category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredTips.map(tip => (
              <motion.div key={tip.id} variants={item}>
                <Card className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{tip.icon}</span>
                          <CardTitle className="text-lg">{tip.title}</CardTitle>
                        </div>
                        <Badge className={getCategoryColor(tip.category)}>
                          {tip.category}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${bookmarkedTips.includes(tip.id) ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={() => handleBookmark(tip.id)}
                        title={bookmarkedTips.includes(tip.id) ? "Remove bookmark" : "Bookmark tip"}
                      >
                        <BookmarkIcon className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 flex-grow">
                    <CardDescription className="text-base">
                      {tip.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleShare(tip)}
                    >
                      <Share2Icon className="h-3.5 w-3.5 mr-1" />
                      Share
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}