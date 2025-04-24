import { createClient } from "@/libs/supabase/client";
import { Cart } from "@/types/cart";
import { Course } from "@/types/course";
import { PostgrestError } from "@supabase/supabase-js";
import { fetchCourseById } from "./courses";
export const addToCart = async (
  courseId: string,
  userId: string
): Promise<{ data: Cart | null; error: PostgrestError | null }> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("carts").insert({
    course_id: courseId,
    user_id: userId,
  });

  return { data, error };
};

export const removeFromCart = async (
  courseId: string,
  userId: string
): Promise<{ data: Cart | null; error: PostgrestError | null }> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("carts").delete().eq("course_id", courseId).eq("user_id", userId);
  return { data, error };
};

export const getCart = async (userId: string): Promise<{ data: Course[] | null; error: PostgrestError | null }> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("carts").select("*").eq("user_id", userId);
  if (data) {
    const courses = await Promise.all(data.map(async (item) => fetchCourseById(item.course_id)));
    return { data: courses as Course[], error };
  }
  return { data: null, error };
};

export const isCourseInCart = async (courseId: string, userId: string): Promise<{ data: boolean | null; error: PostgrestError | null }> => {
  const { data, error } = await getCart(userId);
  return { data: data?.some((item) => item.id === courseId) ?? false, error };
};

export const clearCart = async (userId: string): Promise<{ data: Cart[] | null; error: PostgrestError | null }> => {
  const supabase = createClient();
  const { data, error } = await supabase.from("carts").delete().eq("user_id", userId);
  return { data, error };
};