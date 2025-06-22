import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, Upload, User, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import UploadDialog from "./UploadDialog";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen, searchQuery, setSearchQuery }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <header className="fixed top-0 left-0 right-0 bg-background dark:bg-background border-b border-border z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden p-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5 text-foreground" />
          </Button>
          <Link href="/">
            <h1 className="text-xl font-bold pinterest-red cursor-pointer hover:opacity-80 transition-opacity">이모티콘 복사</h1>
          </Link>
        </div>
        
        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative">
            <Input
              type="text"
              placeholder="이모티콘 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 bg-muted dark:bg-muted border-none rounded-full focus:ring-2 focus:ring-primary"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="hidden md:block">
            {categories && <UploadDialog categories={categories} variant="header" />}
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-2"
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-foreground" />
            ) : (
              <Sun className="h-5 w-5 text-foreground" />
            )}
          </Button>
          <Button variant="ghost" size="sm" className="p-2">
            <User className="h-5 w-5 text-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
