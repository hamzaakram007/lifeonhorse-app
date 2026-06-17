"use client";

import { useRef, useState } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Label } from "@/components/ui/Input";
import { uploadVideo, type StorageBucket } from "@/lib/storage/upload";
import { cn } from "@/lib/utils";

type MediaUploadProps = {
  imageBucket: StorageBucket;
  photos: string[];
  onPhotosChange: (urls: string[]) => void;
  videoUrl?: string;
  onVideoChange?: (url: string) => void;
  maxImages?: number;
  imageLabel?: string;
  showVideo?: boolean;
  className?: string;
};

export function MediaUpload({
  imageBucket,
  photos,
  onPhotosChange,
  videoUrl = "",
  onVideoChange,
  maxImages = 10,
  imageLabel = "Photos",
  showVideo = true,
  className,
}: MediaUploadProps) {
  const videoRef = useRef<HTMLInputElement>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoError, setVideoError] = useState("");

  async function handleVideo(fileList: FileList | null) {
    if (!fileList?.length || !onVideoChange) return;
    setVideoError("");
    setUploadingVideo(true);
    const { url, error } = await uploadVideo(fileList[0], imageBucket);
    if (error) setVideoError(error);
    else if (url) onVideoChange(url);
    setUploadingVideo(false);
    if (videoRef.current) videoRef.current.value = "";
  }

  return (
    <div className={cn("space-y-4", className)}>
      <ImageUpload
        bucket={imageBucket}
        label={imageLabel}
        hint={`Up to ${maxImages} images · JPG, PNG, WebP, GIF · max 5 MB each`}
        multiple
        maxFiles={maxImages}
        value={photos}
        onChange={onPhotosChange}
      />

      {showVideo && onVideoChange && (
        <div className="space-y-2">
          <Label>Video (optional)</Label>
          <p className="text-xs text-stone-500">MP4, WebM, or MOV · max 50 MB</p>
          {videoUrl ? (
            <div className="space-y-2">
              <video src={videoUrl} controls className="max-h-48 w-full rounded-lg bg-black" />
              <button
                type="button"
                onClick={() => onVideoChange("")}
                className="text-sm text-red-600 hover:underline"
              >
                Remove video
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-center transition hover:border-amber-600 hover:bg-amber-50/50">
              <input
                ref={videoRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                className="sr-only"
                disabled={uploadingVideo}
                onChange={(e) => handleVideo(e.target.files)}
              />
              <span className="text-sm font-medium text-stone-700">
                {uploadingVideo ? "Uploading video…" : "Add video"}
              </span>
            </label>
          )}
          {videoError && <p className="text-sm text-red-600">{videoError}</p>}
        </div>
      )}
    </div>
  );
}
