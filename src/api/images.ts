import { supabase } from "@/libs/supabase/client";

export async function uploadImage(
  file: File,
  bucket: string
): Promise<
  | {
      data: string;
      error: null;
    }
  | {
      data: null;
      error: unknown;
    }
> {
 const randomString = Math.random().toString(36).substring(2, 15);
  const fileName = `${Date.now()}_${randomString}.${file.name.split(".").pop()}`;
  const {error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);

  const respose = supabase.storage.from(bucket).getPublicUrl(fileName);

  const fullPath = respose.data?.publicUrl;

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  return { data: fullPath, error };
}


export async function deleteImage(
  fileName: string,
  bucket: string
): Promise<
  | {
      data: string;
      error: null;
    }
  | {
      data: null;
      error: unknown;
    } 
> {
  const {error } = await supabase.storage
    .from(bucket)
    .remove([fileName]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }

  return { data: "Image deleted successfully", error };
}
