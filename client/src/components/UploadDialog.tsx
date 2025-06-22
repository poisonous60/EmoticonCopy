import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";

interface UploadDialogProps {
  categories: Record<string, string[]>;
  variant?: "header" | "sidebar";
}

export default function UploadDialog({ categories, variant = "sidebar" }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      if (files.length === 1) {
        // Single file upload
        const formData = new FormData();
        formData.append('image', files[0]);
        formData.append('category', '기타');
        formData.append('title', files[0].name.split('.')[0]);
        formData.append('tags', JSON.stringify([files[0].name.split('.')[0].toLowerCase()]));

        const response = await fetch("/api/emoticons", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        return response.json();
      } else {
        // Batch upload
        const formData = new FormData();
        files.forEach(file => {
          formData.append('images', file);
        });
        formData.append('category', '기타');

        const response = await fetch("/api/emoticons/batch", {
          method: "POST",
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Batch upload failed: ${response.statusText}`);
        }
        
        return response.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/emoticons"] });
      
      if (selectedFiles.length === 1) {
        toast({
          title: "성공!",
          description: "이모티콘이 성공적으로 업로드되었습니다.",
        });
      } else {
        const result = data as { success: number; errors: number; errorDetails: any[] };
        toast({
          title: "일괄 업로드 완료!",
          description: `성공: ${result.success}개, 실패: ${result.errors}개`,
        });
        
        if (result.errors > 0) {
          console.warn("Upload errors:", result.errorDetails);
        }
      }
      
      handleClose();
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      toast({
        title: "업로드 실패",
        description: "이모티콘 업로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles: File[] = [];
    const urls: string[] = [];
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "잘못된 파일 형식",
          description: `${file.name}은(는) 이미지 파일이 아닙니다.`,
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "파일이 너무 큽니다",
          description: `${file.name}은(는) 10MB를 초과합니다.`,
          variant: "destructive",
        });
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 100) {
      toast({
        title: "파일 개수 초과",
        description: "최대 100개의 파일만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    // Generate preview URLs for valid files
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        urls.push(e.target?.result as string);
        if (urls.length === validFiles.length) {
          setPreviewUrls(urls);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles(validFiles);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      toast({
        title: "파일을 선택해주세요",
        description: "업로드할 이미지 파일을 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(selectedFiles);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFiles([]);
    setPreviewUrls([]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const triggerButton = variant === "header" ? (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
    >
      <Upload className="h-4 w-4" />
      <span className="hidden sm:inline">업로드</span>
    </Button>
  ) : (
    <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white">
      <Upload className="h-4 w-4" />
      이모티콘 업로드
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>이모티콘 업로드 (최대 100개)</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-blue-400 bg-blue-50 dark:bg-blue-950"
                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              type="file"
              id="file-upload"
              multiple
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center space-y-2"
            >
              <Upload className="h-12 w-12 text-gray-400" />
              <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                이미지를 드래그하거나 클릭하여 선택
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF, WEBP 지원 (최대 10MB, 100개까지)
              </div>
            </label>
          </div>

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">선택된 파일 ({selectedFiles.length}개)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFiles([]);
                    setPreviewUrls([]);
                  }}
                >
                  모두 제거
                </Button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {previewUrls[index] ? (
                        <img
                          src={previewUrls[index]}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate">
                      {file.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={selectedFiles.length === 0 || uploadMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>업로드 ({selectedFiles.length}개)</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}