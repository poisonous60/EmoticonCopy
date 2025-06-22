import { useQuery } from "@tanstack/react-query";
import React, { useMemo } from "react";
import { Copy } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import type { Emoticon } from "@shared/schema";

interface EmoticonGridProps {
  searchQuery: string;
  selectedCategory: string;
  selectedSubcategory: string;
  showRecentlyCopied: boolean;
}

export default function EmoticonGrid({ 
  searchQuery, 
  selectedCategory, 
  selectedSubcategory,
  showRecentlyCopied
}: EmoticonGridProps) {
  const [recentlyCopied, setRecentlyCopied] = useLocalStorage<Emoticon[]>("recently-copied", []);
  
  const { copyToClipboard } = useClipboard();
  const { toast } = useToast();

  // Build query parameters
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    params.set('limit', '100');
    
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }
    if (selectedSubcategory) {
      params.set('subcategory', selectedSubcategory);
    }
    
    return params.toString();
  }, [searchQuery, selectedCategory, selectedSubcategory]);

  const { data: apiEmoticons = [], isLoading } = useQuery<Emoticon[]>({
    queryKey: ['/api/emoticons', queryParams],
    enabled: !showRecentlyCopied, // Only fetch from API when not showing recently copied
  });

  // Use recently copied emoticons when showRecentlyCopied is true
  const emoticons = showRecentlyCopied ? recentlyCopied : apiEmoticons;

  const handleCopyEmoticon = async (emoticon: Emoticon) => {
    try {
      const imageUrl = `/uploads/${emoticon.filename}`;
      await copyToClipboard(imageUrl);
      
      // Add to recently copied (max 20 items)
      setRecentlyCopied(prev => {
        const filtered = prev.filter(item => item.id !== emoticon.id);
        return [emoticon, ...filtered].slice(0, 20);
      });

      toast({
        title: "복사 완료!",
        description: "클립보드에 복사되었습니다.",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "이모티콘을 복사할 수 없습니다.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Filter Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {showRecentlyCopied ? '최근 복사한 이모티콘' :
             searchQuery ? `"${searchQuery}" 검색 결과` : 
             selectedSubcategory ? `${selectedCategory} > ${selectedSubcategory}` :
             selectedCategory ? selectedCategory : '전체 이모티콘'}
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
            {emoticons.length}개
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {showRecentlyCopied ? '복사순' : '최신순'}
          </span>
        </div>
      </div>

      {/* Emoticon Grid */}
      <div className="emoticon-grid">
        {emoticons.map((emoticon) => (
          <div
            key={emoticon.id}
            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md active:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden emoticon-item active:scale-95"
            onClick={() => handleCopyEmoticon(emoticon)}
            onTouchStart={(e) => {
              // Prevent double-tap zoom on mobile
              e.currentTarget.style.transform = 'scale(0.95)';
            }}
            onTouchEnd={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <div className="w-full relative">
              <img
                src={`/uploads/${emoticon.filename}`}
                alt={emoticon.title || "Emoticon"}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200">
                  <div className="bg-white rounded-full p-2 shadow-lg">
                    <Copy className="h-4 w-4 pinterest-red" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>이모티콘 로딩 중...</span>
          </div>
        </div>
      )}

      {/* No results */}
      {!isLoading && emoticons.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Copy className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500">
            다른 키워드로 검색해보세요.
          </p>
        </div>
      )}
    </div>
  );
}
