import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import CategoryMenu from "./CategoryMenu";
import { Search, Clock, Upload } from "lucide-react";
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
}

export default function Sidebar({
  open,
  setOpen,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  searchQuery,
  setSearchQuery
}: SidebarProps) {
  const [recentlyCopied] = useLocalStorage<Emoticon[]>("recently-copied", []);

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 w-80 bg-sidebar border-r border-gray-200 
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
                className="w-full pl-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Recently Copied */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              최근 복사한 이모티콘
            </h3>
            {recentlyCopied.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {recentlyCopied.slice(0, 6).map((emoticon, index) => (
                  <div
                    key={`${emoticon.id}-${index}`}
                    className="aspect-square bg-white rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <img
                      src={emoticon.url}
                      alt={emoticon.title || "Recent emoticon"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">아직 복사한 이모티콘이 없습니다.</p>
            )}
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
              />
            )}
          </div>

          {/* Upload Button Mobile */}
          <div className="md:hidden mt-6">
            <Button className="w-full bg-pinterest-red hover:bg-red-700 text-white rounded-lg">
              <Upload className="h-4 w-4 mr-2" />
              이모티콘 업로드
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
