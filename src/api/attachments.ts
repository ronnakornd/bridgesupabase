import { createClient } from "@/libs/supabase/client";
import { Attachment } from "@/types/attachemnt";

// Add types for response
interface UploadResponse {
  data: Attachment | null;
  error: string | null;
}

export const uploadAttachment = async (
  file: File,
  lesson_id: string,
  title: string
): Promise<UploadResponse> => {
  const supabase = createClient();
  try {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${Date.now()}-${cleanFileName}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(fileName, file);

    if (uploadError) {
      return {
        data: null,
        error: `Upload failed: ${uploadError.message}`,
      };
    }
    const response = supabase.storage
      .from("attachments")
      .getPublicUrl(uploadData?.path);

    const { data: attachment, error: dbError } = await supabase
      .from("attachments")
      .insert([
        {
          title: title,
          url: response.data?.publicUrl || "",
          lesson_id,
        },
      ])
      .single();

    if (dbError) {
      return {
        data: null,
        error: `Database error: ${dbError.message}`,
      };
    }

    return {
      data: attachment,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
};

interface DeleteResponse {
  data: string | null;
  error: string | null;
}

export async function deleteAttachment(
  attachment_id: string
): Promise<DeleteResponse> {
  const supabase = createClient();

  try {
    // Get attachment data first
    const { data: attachment, error: fetchError } = await supabase
      .from("attachments")
      .select()
      .eq("id", attachment_id)
      .single();

    if (fetchError) {
      return {
        data: null,
        error: `Failed to fetch attachment: ${fetchError.message}`,
      };
    }

    if (!attachment) {
      return {
        data: null,
        error: "Attachment not found",
      };
    }

    // Extract filename from URL
    const fileName = attachment.url.split("/").pop();
    if (!fileName) {
      return {
        data: null,
        error: "Invalid file name",
      };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("attachments")
      .remove([fileName]);

    if (storageError) {
      return {
        data: null,
        error: `Failed to delete file: ${storageError.message}`,
      };
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("attachments")
      .delete()
      .eq("id", attachment_id);

    if (dbError) {
      return {
        data: null,
        error: `Failed to delete from database: ${dbError.message}`,
      };
    }

    return {
      data: "Attachment deleted successfully",
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

interface AttachmentResponse {
  data: Attachment[] | null;
  error: string | null;
}

export async function fetchAttachmentsByLessonId(
  lesson_id: string
): Promise<AttachmentResponse> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("lesson_id", lesson_id);

    if (error) {
      return {
        data: null,
        error: `Failed to fetch attachments: ${error.message}`,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}

interface UpdateResponse {
  data: Attachment | null;
  error: string | null;
}

export async function updateAttachmentTitle(
  attachment_id: string,
  new_title: string
): Promise<UpdateResponse> {
  const supabase = createClient();

  try {
    // Update the attachment title in the database
    const { data, error } = await supabase
      .from("attachments")
      .update({ title: new_title })
      .eq("id", attachment_id)
      .single();

    if (error) {
      return {
        data: null,
        error: `Failed to update attachment title: ${error.message}`,
      };
    }

    return {
      data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: `Unexpected error: ${(error as Error).message}`,
    };
  }
}
