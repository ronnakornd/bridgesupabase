import { supabase } from "@/libs/supabase/client";


export async function uploadAttachment(
    file: File,
    bucket: string
): Promise<
    | {
            data: string;
            error: null;
        }
    | {
            data: null;
            error: any;
        }
> {
        const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
        if (!allowedTypes.includes(file.type)) {
                throw new Error("Only image or PDF files are allowed.");
        }

        const randomString = Math.random().toString(36).substring(2, 15);
        const fileName = `${Date.now()}_${randomString}.${file.name.split(".").pop()}`;
        const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);
        
        const response = supabase.storage.from(bucket).getPublicUrl(fileName);
        
        const fullPath = response.data?.publicUrl;
        
        if (error) {
                throw new Error(`Failed to upload attachment: ${error.message}`);
        }
        
        return { data: fullPath, error };
}
