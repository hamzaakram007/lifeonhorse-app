import { createClient } from "@/lib/supabase/server";

export async function uploadFile(
  file: File,
  folder: string
): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${folder}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("uploads").upload(path, file, {
    upsert: true,
  });
  if (error) return null;

  const {
    data: { publicUrl },
  } = supabase.storage.from("uploads").getPublicUrl(path);
  return publicUrl;
}

export async function uploadFiles(
  files: FileList | File[],
  folder: string
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of Array.from(files)) {
    const url = await uploadFile(file, folder);
    if (url) urls.push(url);
  }
  return urls;
}
