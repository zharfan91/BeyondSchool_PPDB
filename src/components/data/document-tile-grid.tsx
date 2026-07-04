import { FileText, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentFile {
  name: string;
  type?: "pdf" | "image" | "other";
}

export interface DocumentTileGridProps {
  files: DocumentFile[];
  onSelect?: (file: DocumentFile, index: number) => void;
  className?: string;
}

function getFileType(file: DocumentFile): "pdf" | "image" | "other" {
  if (file.type) return file.type;
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "webp"].includes(extension ?? "")) return "image";
  return "other";
}

function DocumentTileGrid({ files, onSelect, className }: DocumentTileGridProps) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4", className)}>
      {files.map((file, index) => {
        const type = getFileType(file);
        const Icon = type === "image" ? ImageIcon : FileText;
        const iconColor =
          type === "pdf"
            ? "text-danger"
            : type === "image"
              ? "text-info"
              : "text-muted-foreground";

        return (
          <button
            type="button"
            key={file.name + index}
            onClick={() => onSelect?.(file, index)}
            className="group aspect-square bg-surface-container-low rounded-lg border border-border flex flex-col items-center justify-center gap-2 hover:border-primary transition-all p-3"
          >
            <Icon className={cn("h-10 w-10 group-hover:text-primary transition-colors", iconColor)} />
            <p className="text-xs font-bold text-foreground text-center truncate w-full">{file.name}</p>
          </button>
        );
      })}
    </div>
  );
}

export { DocumentTileGrid };
