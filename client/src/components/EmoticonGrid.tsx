import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { Copy } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import type { Emoticon } from "@shared/schema";

interface EmoticonGridProps {
  searchQuery: string;
  selectedCategory: string;
  selectedSubcategory: string;
}

export default function EmoticonGrid({ 
  searchQuery, 
  selectedCategory, 
  selectedSubcategory 
}: EmoticonGridProps) {
  const [page, setPage] = useState(0);
  const [allEmoticons, setAllEmoticons] = useState<Emoticon[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [recentlyCopied, setRecentlyCopied] = useLocalStorage<Emoticon[]>("recently-copied", []);
  
  const { copyToClipboard } = useClipboard();
  const { toast } = useToast();

  // Build query parameters
  const queryParams = new URLSearchParams();
  queryParams.set('offset', (page * 20).toString());
  queryParams.set('limit', '20');
  
  if (searchQuery) {
    queryParams.set('search', searchQuery);
  }
  if (selectedCategory) {
    queryParams.set('category', selectedCategory);
  }
  if (selectedSubcategory) {
    queryParams.set('subcategory', selectedSubcategory);
  }

  const { data: emoticons = [], isLoading: queryLoading } = useQuery<Emoticon[]>({
    queryKey: [`/api/emoticons?${queryParams.toString()}`],
    enabled: !isLoading,
  });

  // Reset when filters change
  useEffect(() => {
    setPage(0);
    setAllEmoticons([]);
    setHasMore(true);
  }, [searchQuery, selectedCategory, selectedSubcategory]);

  // Update emoticons when data changes
  useEffect(() => {
    if (emoticons && Array.isArray(emoticons)) {
      if (page === 0) {
        setAllEmoticons(emoticons);
      } else {
        setAllEmoticons(prev => [...prev, ...emoticons]);
      }
      
      if (emoticons.length < 20) {
        setHasMore(false);
      }
      setIsLoading(false);
    }
  }, [emoticons, page]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!queryLoading && hasMore && !isLoading) {
      setIsLoading(true);
      setPage(prev => prev + 1);
    }
  }, [queryLoading, hasMore, isLoading]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        loadMore();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMore]);

  const handleCopyEmoticon = async (emoticon: Emoticon) => {
    try {
      await copyToClipboard(emoticon.url);
      
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
            {searchQuery ? `"${searchQuery}" 검색 결과` : 
             selectedSubcategory ? `${selectedCategory} > ${selectedSubcategory}` :
             selectedCategory ? selectedCategory : '전체 이모티콘'}
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
            {allEmoticons.length}개
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">최신순</span>
        </div>
      </div>

      {/* Emoticon Grid */}
      <div className="emoticon-grid">
        {allEmoticons.map((emoticon) => (
          <div
            key={emoticon.id}
            className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden emoticon-item"
            onClick={() => handleCopyEmoticon(emoticon)}
          >
            <div className="w-full h-full aspect-square relative">
              <img
                src={emoticon.url}
                alt={emoticon.title || "Emoticon"}
                className="w-full h-full object-cover"
                loading="lazy"
                style={{ width: '200px', height: '200px' }}
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
      {(queryLoading || isLoading) && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>더 많은 이모티콘 로딩 중...</span>
          </div>
        </div>
      )}

      {/* No more results */}
      {!hasMore && allEmoticons.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          모든 이모티콘을 불러왔습니다.
        </div>
      )}

      {/* No results */}
      {!queryLoading && allEmoticons.length === 0 && (
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
