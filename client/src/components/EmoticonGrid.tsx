import { useInfiniteQuery } from "@tanstack/react-query";
import React, { useMemo, useCallback, useRef, useEffect, useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { useClipboard } from "@/hooks/useClipboard";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import type { Emoticon } from "@shared/schema";

interface EmoticonGridProps {
  searchQuery: string;
  selectedCategory: string;
  selectedSubcategory: string;
  showRecentlyCopied: boolean;
  sortOrder: "newest" | "oldest" | "copied";
  setSortOrder: (order: "newest" | "oldest" | "copied") => void;
}

export default function EmoticonGrid({ 
  searchQuery, 
  selectedCategory, 
  selectedSubcategory,
  showRecentlyCopied,
  sortOrder,
  setSortOrder
}: EmoticonGridProps) {
  const [recentlyCopied, setRecentlyCopied] = useLocalStorage<Emoticon[]>("recently-copied", []);
  
  const { copyToClipboard } = useClipboard();
  const { toast } = useToast();

  // Build query parameters
  const baseParams = useMemo(() => {
    const params: Record<string, string> = {
      limit: '20', // Change to 20 per page for infinite scroll
      sort: sortOrder,
    };
    
    if (searchQuery) {
      params.search = searchQuery;
    }
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    if (selectedSubcategory) {
      params.subcategory = selectedSubcategory;
    }
    
    return params;
  }, [searchQuery, selectedCategory, selectedSubcategory, sortOrder]);

  // Infinite query for API emoticons
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['/api/emoticons', baseParams],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams({
        ...baseParams,
        offset: pageParam.toString(),
      });
      
      const response = await fetch(`/api/emoticons?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch emoticons');
      }
      
      const emoticons: Emoticon[] = await response.json();
      return emoticons;
    },
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer than 20 items, we've reached the end
      if (lastPage.length < 20) return undefined;
      // Otherwise, return the offset for the next page
      return allPages.length * 20;
    },
    initialPageParam: 0,
    enabled: !showRecentlyCopied, // Only fetch from API when not showing recently copied
  });

  // Flatten all pages of API emoticons
  const apiEmoticons = useMemo(() => {
    return data?.pages.flatMap(page => page) || [];
  }, [data]);

  // Use recently copied emoticons when showRecentlyCopied is true
  const emoticons = showRecentlyCopied ? recentlyCopied : apiEmoticons;

  // Infinite scroll implementation
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showRecentlyCopied) return; // Don't use infinite scroll for recently copied

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
      }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, showRecentlyCopied]);

  const handleCopyEmoticon = async (emoticon: Emoticon) => {
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);

    // On mobile, don't trigger copy - let user select image instead
    if (isMobile) {
      return;
    }

    try {
      const imageUrl = `/api/emoticons/${emoticon.id}/image`;
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

  // Handle sort order cycling
  const handleSortClick = () => {
    if (showRecentlyCopied) return; // Don't change sort for recently copied
    
    const nextOrder = {
      newest: "oldest" as const,
      oldest: "copied" as const,
      copied: "newest" as const,
    };
    
    setSortOrder(nextOrder[sortOrder]);
  };

  // Get sort display text
  const getSortText = () => {
    if (showRecentlyCopied) return '복사순';
    
    switch (sortOrder) {
      case 'newest': return '최신순';
      case 'oldest': return '오래된순';
      case 'copied': return '복사순';
      default: return '최신순';
    }
  };

  return (
    <div className="p-4 lg:p-6">
      {/* Filter Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {showRecentlyCopied ? '최근 복사한 이모티콘' :
             searchQuery ? `"${searchQuery}" 검색 결과` : 
             selectedSubcategory ? `${selectedCategory} > ${selectedSubcategory}` :
             selectedCategory ? selectedCategory : '전체 이모티콘'}
          </span>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-600 dark:text-gray-300">
            {emoticons.length}개
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span 
            className={`text-sm transition-colors ${
              showRecentlyCopied 
                ? 'text-gray-600 dark:text-gray-400' 
                : 'text-primary hover:text-primary/80 cursor-pointer font-medium'
            }`}
            onClick={handleSortClick}
          >
            {getSortText()}
          </span>
        </div>
      </div>

      {/* Emoticon Grid */}
      <div className="emoticon-grid">
        {emoticons.map((emoticon) => {
          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                           ('ontouchstart' in window) || 
                           (navigator.maxTouchPoints > 0);

          return (
            <div
              key={emoticon.id}
              className={`group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden emoticon-item ${
                isMobile ? '' : 'cursor-pointer active:scale-95'
              }`}
              onClick={isMobile ? undefined : () => handleCopyEmoticon(emoticon)}
            >
              <div className="w-full relative">
                <img
                  src={`/api/emoticons/${emoticon.id}/image`}
                  alt={emoticon.title || "Emoticon"}
                  className={`w-full h-auto object-contain ${
                    isMobile ? 'select-all pointer-events-auto' : 'select-none'
                  }`}
                  loading="lazy"
                  style={isMobile ? { userSelect: 'all', WebkitUserSelect: 'all' } : {}}
                />
                {!isMobile && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-200">
                      <div className="bg-white rounded-full p-2 shadow-lg">
                        <Copy className="h-4 w-4 pinterest-red" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite Scroll Trigger */}
      {!showRecentlyCopied && !isLoading && emoticons.length > 0 && (
        <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
          {isFetchingNextPage && (
            <div className="flex items-center space-x-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>더 많은 이모티콘 로딩 중...</span>
            </div>
          )}
        </div>
      )}

      {/* Initial Loading Indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center space-x-2 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>이모티콘 로딩 중...</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && emoticons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
          <div className="text-6xl mb-4">😔</div>
          <p className="text-lg font-medium mb-2">이모티콘이 없습니다</p>
          <p className="text-sm">
            {showRecentlyCopied 
              ? "아직 복사한 이모티콘이 없습니다" 
              : searchQuery 
                ? "검색 결과가 없습니다" 
                : "이 카테고리에 이모티콘이 없습니다"}
          </p>
        </div>
      )}

      {/* End of Data Indicator */}
      {!showRecentlyCopied && !isLoading && !hasNextPage && emoticons.length > 0 && (
        <div className="flex justify-center items-center py-6 text-gray-400">
          <span className="text-sm">모든 이모티콘을 불러왔습니다</span>
        </div>
      )}
    </div>
  );
}
