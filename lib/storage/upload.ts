import { createClient } from "@/lib/supabase/client";

export const STORAGE_BUCKETS = {
  horses: "horse-photos",
  clubs: "club-assets",
  avatars: "avatars",
  gallery: "gallery",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

function sanitizeExt(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
  return ALLOWED_EXTENSIONS.has(ext) ? ext : "jpg";
}

export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Please choose an image file (JPG, PNG, WebP, or GIF).";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_EXTENSIONS.has(ext)) return "Supported formats: JPG, PNG, WebP, GIF.";
  if (file.size > MAX_BYTES) return "Each image must be under 5 MB.";
  return null;
}

export async function uploadImage(
  file: File,
  bucket: StorageBucket,
  folder?: string
): Promise<{ url: string | null; error: string | null }> {
  const validationError = validateImageFile(file);
  if (validationError) return { url: null, error: validationError };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "Sign in to upload images." };

  const ext = sanitizeExt(file.name);
  const path = `${folder ?? user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || `image/${ext === "jpg" ? "jpeg" : ext}`,
  });

  if (error) return { url: null, error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, error: null };
}

export async function uploadImages(
  files: File[],
  bucket: StorageBucket,
  folder?: string
): Promise<{ urls: string[]; error: string | null }> {
  const urls: string[] = [];
  for (const file of files) {
    const { url, error } = await uploadImage(file, bucket, folder);
    if (error) return { urls, error };
    if (url) urls.push(url);
  }
  return { urls, error: null };
}

export function parsePhotoList(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string" && v.length > 0);
  if (typeof value === "string") return value ? [value] : [];
  return [];
}

export function firstPhoto(value: unknown, fallback?: string): string | null {
  const photos = parsePhotoList(value);
  if (photos.length > 0) return photos[0];
  return fallback ?? null;
}
