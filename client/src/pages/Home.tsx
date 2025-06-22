import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import EmoticonGrid from "@/components/EmoticonGrid";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");

  return (
    <div className="min-h-screen bg-background">
      <Header 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <div className="flex pt-16">
        <Sidebar 
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedSubcategory={selectedSubcategory}
          setSelectedSubcategory={setSelectedSubcategory}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 lg:ml-0">
          <EmoticonGrid 
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
          />
        </main>
      </div>
    </div>
  );
}
