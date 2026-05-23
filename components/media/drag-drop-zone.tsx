"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CloudUpload } from "lucide-react";

interface DragDropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  progress?: number; // 0–100
}

export function DragDropZone({
  onFiles,
  disabled = false,
  accept,
  multiple = true,
  progress,
}: DragDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const isUploading = typeof progress === "number" && progress > 0 && progress < 100;

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only clear if leaving the zone entirely (relatedTarget is outside)
    const related = e.relatedTarget as Node | null;
    if (!e.currentTarget.contains(related)) setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) onFiles(files);
    },
    [disabled, onFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      if (files.length > 0) onFiles(files);
      // Reset so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    },
    [onFiles],
  );

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) inputRef.current.click();
  }, [disabled]);

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Upload zone"
      onClick={handleClick}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer select-none",
        isDragOver
          ? "border-[#6366f1] bg-[#6366f1]/10 scale-[1.01]"
          : "border-border bg-[#161b22] hover:border-border-strong hover:bg-[#161b22]/80",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        disabled={disabled}
      />

      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full border border-border transition-colors",
          isDragOver ? "border-[#6366f1]/60 bg-[#6366f1]/20" : "bg-[#0d1117]",
        )}
      >
        <CloudUpload
          className={cn("size-7", isDragOver ? "text-[#6366f1]" : "text-muted-foreground")}
          strokeWidth={1.5}
        />
      </div>

      <div>
        <p className="text-sm font-medium text-foreground">
          {isDragOver ? "Release to upload" : "Drop files here or click to browse"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {isUploading ? "Uploading…" : "Video, Audio, Images supported"}
        </p>
      </div>

      {typeof progress === "number" && progress > 0 && (
        <div className="w-full max-w-xs">
          <div className="h-1.5 overflow-hidden rounded-full bg-[#0d1117]">
            <div
              className="h-full rounded-full bg-[#6366f1] transition-all duration-300"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
          <p className="mt-1 text-center text-xs text-muted-foreground">{progress}%</p>
        </div>
      )}
    </div>
  );
}
