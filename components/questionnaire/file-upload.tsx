"use client";

import { useCallback, useState } from "react";
import { Upload, X, FileText, Image, File, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UploadedFile } from "@/lib/types";

interface FileUploadProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number; // MB
}

export function FileUpload({
  files,
  onFilesChange,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxFiles = 5,
  maxSize = 10,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files);
      handleFiles(droppedFiles);
    },
    [files, maxFiles, maxSize]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      handleFiles(selectedFiles);
      e.target.value = "";
    },
    [files, maxFiles, maxSize]
  );

  const handleFiles = (newFiles: File[]) => {
    setFeedbackMessage("");
    const validFiles = newFiles.filter((file) => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSize;
    });

    const remainingSlots = maxFiles - files.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);
    const rejectedBySize = newFiles.length - validFiles.length;
    const rejectedByCount = Math.max(validFiles.length - filesToAdd.length, 0);

    const uploadedFiles: UploadedFile[] = filesToAdd.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));

    onFilesChange([...files, ...uploadedFiles]);

    if (rejectedBySize > 0 || rejectedByCount > 0) {
      const parts: string[] = [];
      if (rejectedBySize > 0) parts.push(`${rejectedBySize} 个文件超过 ${maxSize}MB`);
      if (rejectedByCount > 0) parts.push(`${rejectedByCount} 个文件超出数量上限`);
      setFeedbackMessage(`已忽略：${parts.join("，")}。`);
    } else if (uploadedFiles.length > 0) {
      setFeedbackMessage(`已添加 ${uploadedFiles.length} 个文件。`);
    }
  };

  const removeFile = (id: string) => {
    if (!confirm("确认删除这个文件吗？")) {
      return;
    }
    onFilesChange(files.filter((f) => f.id !== id));
    setFeedbackMessage("文件已删除。");
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type.includes("pdf") || type.includes("document")) return FileText;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Paperclip className="h-5 w-5 text-foreground" />
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              补充材料（可选）
            </h3>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">
          {files.length} / {maxFiles} 个文件
        </span>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-teal-500 bg-teal-50"
            : "border-border hover:border-teal-300 hover:bg-muted/50",
          files.length >= maxFiles && "pointer-events-none opacity-50"
        )}
      >
        <Upload className={cn(
          "mb-3 h-8 w-8",
          isDragging ? "text-teal-600" : "text-muted-foreground"
        )} />
        <p className="mb-1 text-sm font-medium text-foreground">
          拖拽文件到这里，或点击上传
        </p>
        <p className="text-xs text-muted-foreground">
          支持 PDF、Word、图片，单个文件最大 {maxSize}MB
        </p>
        <input
          type="file"
          accept={accept}
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={files.length >= maxFiles}
        />
      </div>

      {/* File List */}
      {feedbackMessage && (
        <p className="text-xs text-muted-foreground">{feedbackMessage}</p>
      )}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className="flex items-center gap-3 border-b border-border pb-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
