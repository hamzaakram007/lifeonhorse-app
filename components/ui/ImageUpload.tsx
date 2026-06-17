"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/Input";
import { uploadImage, type StorageBucket } from "@/lib/storage/upload";
import { cn } from "@/lib/utils";

type ImageUploadProps = {
  bucket: StorageBucket;
  label?: string;
  hint?: string;
  required?: boolean;
  multiple?: boolean;
  maxFiles?: number;
  value?: string[];
  onChange: (urls: string[]) => void;
  className?: string;
};

export function ImageUpload({
  bucket,
  label = "Photos",
  hint = "JPG, PNG, WebP, or GIF · max 5 MB each",
  required = false,
  multiple = false,
  maxFiles = 6,
  value = [],
  onChange,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(fileList: FileList | null) {
    if (!fileList?.length) return;
    setError("");
    setUploading(true);

    const files = Array.from(fileList).slice(0, multiple ? maxFiles - value.length : 1);
    const next = [...value];

    for (const file of files) {
      const { url, error: uploadError } = await uploadImage(file, bucket);
      if (uploadError) {
        setError(uploadError);
        break;
      }
      if (url) {
        if (multiple) next.push(url);
        else {
          onChange([url]);
          setUploading(false);
          return;
        }
      }
    }

    if (multiple) onChange(next);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-600"> *</span>}
        </Label>
      )}
      {hint && <p className="text-xs text-stone-500">{hint}</p>}

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-stone-200 bg-stone-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute right-1 top-1 rounded bg-stone-900/70 px-1.5 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {(multiple ? value.length < maxFiles : value.length === 0) && (
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center transition hover:border-amber-600 hover:bg-amber-50/50">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple={multiple}
            className="sr-only"
            disabled={uploading}
            onChange={(e) => handleFiles(e.target.files)}
          />
          <span className="text-sm font-medium text-stone-700">
            {uploading ? "Uploading…" : multiple ? "Add photos" : "Choose image"}
          </span>
          <span className="mt-1 text-xs text-stone-500">{hint}</span>
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
