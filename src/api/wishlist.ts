import { createClient } from "@/libs/supabase/client";
import { Wishlist } from "@/types/wishlist";
import { PostgrestError } from "@supabase/supabase-js";


export const addToWishlist = async (courseId: string, userId: string): Promise<{ data: Wishlist | null; error: PostgrestError | null }> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("wishlist").insert({
    course_id: courseId,
    user_id: userId,
  }).select().single();
  
  return { data, error };
};

