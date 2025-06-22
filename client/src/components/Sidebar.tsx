import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import CategoryMenu from "./CategoryMenu";
import UploadDialog from "./UploadDialog";
import { Search, Clock, Upload, Trash2 } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Emoticon } from "@shared/schema";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (subcategory: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showRecentlyCopied: boolean;
  setShowRecentlyCopied: (show: boolean) => void;
  deleteMode: boolean;
  setDeleteMode: (deleteMode: boolean) => void;
}

export default function Sidebar({
  open,
  setOpen,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  searchQuery,
  setSearchQuery,
  showRecentlyCopied,
  setShowRecentlyCopied,
  deleteMode,
  setDeleteMode
}: SidebarProps) {
  const [recentlyCopied] = useLocalStorage<Emoticon[]>("recently-copied", []);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 w-80 bg-sidebar dark:bg-sidebar border-r border-border 
      transform transition-transform duration-300 ease-in-out z-40 pt-16 lg:pt-0
      ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="h-full overflow-y-auto sidebar-scroll">
        <div className="p-6">
          {/* Mobile Search */}
          <div className="md:hidden mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="이모티콘 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-background dark:bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Recently Copied */}
          <div className="mb-8">
            <button
              onClick={() => {
                setShowRecentlyCopied(true);
                setSelectedCategory("");
                setSelectedSubcategory("");
                setSearchQuery("");
                setOpen(false); // Close sidebar on mobile
              }}
              className={`w-full text-left text-sm font-semibold mb-3 flex items-center p-2 rounded-lg transition-colors ${
                showRecentlyCopied 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground hover:text-primary hover:bg-muted'
              }`}
            >
              <Clock className="h-4 w-4 mr-2" />
              최근 복사한 이모티콘
            </button>

          </div>

          <Separator className="mb-6" />

          {/* Delete Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="font-medium text-gray-900 dark:text-gray-100">삭제 모드</span>
              </div>
              <Switch
                checked={deleteMode}
                onCheckedChange={setDeleteMode}
              />
            </div>
          </div>

          <Separator className="mb-6" />

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">카테고리</h3>
            {categories && (
              <CategoryMenu
                categories={categories}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubcategory={selectedSubcategory}
                setSelectedSubcategory={setSelectedSubcategory}
                setShowRecentlyCopied={setShowRecentlyCopied}
              />
            )}
          </div>

          {/* Upload Button Mobile */}
          <div className="md:hidden mt-6">
            {categories && (
              <UploadDialog categories={categories} />
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
