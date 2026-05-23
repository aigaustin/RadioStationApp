"use client";

import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";

export function UploadBox({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const dz = useDropzone({
    disabled,
    onDrop: (accepted) => onFiles(accepted),
  });

  return (
    <div
      {...dz.getRootProps()}
      className={cn(
        "rounded-xl border-2 border-dashed border-border p-10 text-center transition-colors",
        dz.isDragActive ? "bg-muted/50" : "bg-muted/20",
        disabled && "opacity-60 pointer-events-none",
      )}
    >
      <input {...dz.getInputProps()} />
      <div className="text-sm">
        <div className="font-medium">Drag & drop media files here</div>
        <div className="text-muted-foreground mt-1">or click to browse</div>
      </div>
    </div>
  );
}

