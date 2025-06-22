import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, MessageSquare, Tv, MessageCircle, Star } from "lucide-react";

interface CategoryMenuProps {
  categories: Record<string, string[]>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (subcategory: string) => void;
  setShowRecentlyCopied?: (show: boolean) => void;
}

const categoryIcons: Record<string, any> = {
  "디시콘": MessageSquare,
  "아카콘": Tv,
  "카톡이모티콘": MessageCircle,
  "기타": Star,
};

const categoryColors: Record<string, string> = {
  "디시콘": "bg-blue-100 text-blue-600",
  "아카콘": "bg-green-100 text-green-600",
  "카톡이모티콘": "bg-yellow-100 text-yellow-600",
  "기타": "bg-purple-100 text-purple-600",
};

export default function CategoryMenu({
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  setShowRecentlyCopied
}: CategoryMenuProps) {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    const newOpen = new Set(openCategories);
    if (newOpen.has(category)) {
      newOpen.delete(category);
    } else {
      newOpen.add(category);
    }
    setOpenCategories(newOpen);
  };

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("");
      setSelectedSubcategory("");
    } else {
      setSelectedCategory(category);
      setSelectedSubcategory("");
    }
    setShowRecentlyCopied?.(false);
    toggleCategory(category);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    if (selectedSubcategory === subcategory) {
      setSelectedSubcategory("");
    } else {
      setSelectedSubcategory(subcategory);
    }
    setShowRecentlyCopied?.(false);
  };

  return (
    <div className="space-y-2">
      {Object.entries(categories).map(([category, subcategories]) => {
        const Icon = categoryIcons[category];
        const isOpen = openCategories.has(category);
        const isSelected = selectedCategory === category;

        return (
          <Collapsible
            key={category}
            open={isOpen}
            onOpenChange={() => toggleCategory(category)}
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={`
                  w-full justify-between p-3 h-auto border border-gray-200 rounded-lg
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white hover:bg-gray-50'}
                `}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColors[category]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{category}</span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-2 ml-11 space-y-1">
              {subcategories.map((subcategory) => (
                <Button
                  key={subcategory}
                  variant="ghost"
                  size="sm"
                  className={`
                    w-full justify-start text-sm py-2 px-3 rounded-md
                    ${selectedSubcategory === subcategory 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  onClick={() => handleSubcategorySelect(subcategory)}
                >
                  {subcategory}
                </Button>
              ))}
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
}
