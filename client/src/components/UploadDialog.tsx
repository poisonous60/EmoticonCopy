import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { InsertEmoticon } from "@shared/schema";

interface UploadDialogProps {
  categories: Record<string, string[]>;
}

export default function UploadDialog({ categories }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (emoticon: InsertEmoticon) => {
      return apiRequest("POST", "/api/emoticons", emoticon);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emoticons"] });
      toast({
        title: "업로드 완료!",
        description: "이모티콘이 성공적으로 추가되었습니다.",
      });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "업로드 실패",
        description: "이모티콘 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const validateImageUrl = async (imageUrl: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
    });
  };

  const handleUrlValidation = async () => {
    if (!url.trim()) return;
    
    setIsValidating(true);
    setPreviewUrl(null);
    
    try {
      const isValid = await validateImageUrl(url);
      if (isValid) {
        setPreviewUrl(url);
        toast({
          title: "유효한 이미지 URL",
          description: "이미지를 확인했습니다.",
        });
      } else {
        toast({
          title: "유효하지 않은 URL",
          description: "이미지를 불러올 수 없습니다. URL을 확인해주세요.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "검증 실패",
        description: "URL 검증 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !previewUrl) {
      toast({
        title: "이미지 URL 필요",
        description: "이미지 URL을 입력하고 검증해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Generate a simple title from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0]; // Remove query params for title
    const title = fileName.split('.')[0] || 'emoticon';

    const emoticon: InsertEmoticon = {
      url: url.trim(),
      title: title,
      category: "기타", // Default category
      tags: [title.toLowerCase()],
    };

    uploadMutation.mutate(emoticon);
  };

  const handleClose = () => {
    setOpen(false);
    setUrl("");
    setPreviewUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-pinterest-red hover:bg-red-700 text-white rounded-lg">
          <Upload className="h-4 w-4 mr-2" />
          이모티콘 업로드
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>새 이모티콘 업로드</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">이미지 URL</Label>
            <div className="flex space-x-2">
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleUrlValidation}
                disabled={!url.trim() || isValidating}
                variant="outline"
              >
                {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "검증"}
              </Button>
            </div>
          </div>

          {previewUrl && (
            <div className="space-y-2">
              <Label>미리보기</Label>
              <div className="flex justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-32 max-h-32 object-contain border rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!previewUrl || uploadMutation.isPending}
              className="flex-1"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  업로드 중...
                </>
              ) : (
                "업로드"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}