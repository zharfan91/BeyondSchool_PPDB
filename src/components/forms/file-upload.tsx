"use client";

import { useRef, useState } from "react";
import { Upload, File, X } from "lucide-react";

interface FileUploadProps {
  label: string;
  accept?: string;
  maxSizeMB?: number;
  onUpload?: (file: File) => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  uploading: boolean;
}

export function FileUpload({ label, accept, maxSizeMB = 5, onUpload }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<UploadedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (f: File) => {
    if (maxSizeMB && f.size > maxSizeMB * 1024 * 1024) return;
    const preview = f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined;
    setFile({ file: f, preview, uploading: true });
    onUpload?.(f);
    // Auto-upload to server
    const formData = new FormData();
    formData.append("file", f);
    formData.append("type", label.toLowerCase().replace(/\s+/g, "-"));
    fetch("/api/upload", { method: "POST", body: formData })
      .then((res) => res.json())
      .then(() => setFile((prev) => prev ? { ...prev, uploading: false } : null))
      .catch(() => setFile((prev) => prev ? { ...prev, uploading: false } : null));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const remove = () => {
    if (file?.preview) URL.revokeObjectURL(file.preview);
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {file ? (
        <div className="rounded-lg border border-border bg-white p-4">
          <div className="flex items-center gap-3">
            {file.preview ? (
              <img
                src={file.preview}
                alt="preview"
                className="h-14 w-14 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-dim">
                <File className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.file.name}</p>
              <p className="text-xs text-muted-foreground">{formatSize(file.file.size)}</p>
            </div>
            <button
              onClick={remove}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-surface-dim"
          }`}
        >
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Seret file ke sini atau klik untuk memilih
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Maks {maxSizeMB}MB
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInput}
        className="hidden"
      />
    </div>
  );
}
