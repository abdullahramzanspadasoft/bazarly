"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Upload, Clipboard, ImageIcon, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUploader({ value, onChange, label = "Product Image" }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pasteActive, setPasteActive] = useState(false);

  const uploadImage = async (file: File | Blob, filename?: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file, filename || "pasted-image.png");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Upload failed");
        return;
      }

      onChange(data.url);
      toast.success("Image uploaded!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) await uploadImage(file, "pasted.png");
          return;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const enablePaste = () => {
    setPasteActive(true);
    document.addEventListener("paste", handlePaste);
    toast.success("Paste mode on — Ctrl+V to paste image", { duration: 3000 });
    setTimeout(() => {
      setPasteActive(false);
      document.removeEventListener("paste", handlePaste);
    }, 10000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, file.name);
    e.target.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">{label}</label>

      {value ? (
        <div className="relative w-full aspect-video bg-muted border border-border mb-3">
          <Image src={value} alt="Preview" fill className="object-contain" unoptimized />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 bg-background border border-border hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "border-2 border-dashed border-border p-6 text-center mb-3 transition-colors",
            pasteActive && "border-foreground bg-muted"
          )}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">No image selected</p>
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 text-xs border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          <Upload className="w-3.5 h-3.5" /> Gallery / File
        </button>
        <button
          type="button"
          onClick={enablePaste}
          disabled={uploading}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 text-xs border transition-colors disabled:opacity-50",
            pasteActive
              ? "border-foreground bg-foreground text-background"
              : "border-border hover:bg-muted"
          )}
        >
          <Clipboard className="w-3.5 h-3.5" /> Copy Paste
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <p className="text-[10px] text-muted-foreground mt-2">
        Gallery se select karo ya Copy Paste click karke Ctrl+V se image paste karo
      </p>
    </div>
  );
}
