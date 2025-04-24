import { Notification } from "@/types/notification";
import { createClient } from "@/libs/supabase/client";
import { PostgrestResponse, PostgrestError } from '@supabase/supabase-js';


export async function fetchNotifications(page: number = 1, limit: number = 10): Promise<{ notifications: Notification[], pagination: { currentPage: number, totalPages: number, totalItems: number } }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.error("User not authenticated");
    return { notifications: [], pagination: { currentPage: page, totalPages: 0, totalItems: 0 } };
  }

  try {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit - 1; // Supabase range is inclusive

    // Fetch paginated notifications
    const { data: notificationsData, error: notificationsError }: PostgrestResponse<Notification> = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('timestamp', { ascending: false })
      .range(startIndex, endIndex);

    if (notificationsError) {
      console.error("Error fetching notifications:", notificationsError);
      throw notificationsError;
    }

    const { count, error: countError } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) {
      console.error("Error fetching notification count:", countError);
      throw countError;
    }

    const totalItems = count ?? 0;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      notifications: notificationsData || [],
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems
      }
    };
  } catch (error) {
    console.error("Error in fetchNotifications function:", error);
    return { notifications: [], pagination: { currentPage: page, totalPages: 0, totalItems: 0 } };
  }
}


export async function markNotificationAsRead(id: string): Promise<{ success: boolean, error?: PostgrestError | string | null }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
      console.error("User not authenticated for marking notification");
      return { success: false, error: "User not authenticated" };
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .match({ id: id, user_id: user.id });

    if (error) {
      console.error("Error marking notification as read:", error);
      return { success: false, error: error };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error("Unexpected error in markNotificationAsRead function:", err);
    if (err instanceof Error) {
        return { success: false, error: err.message };
    }
    return { success: false, error: "An unknown error occurred" };
  }
}

/**
 * Fetches the count of unread notifications for the current user
 * @returns A promise that resolves to the number of unread notifications
 */
export async function fetchUnreadNotificationCount(): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.log("User not authenticated for fetching notification count");
    return 0; // Return 0 if not logged in
  }

  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false); // Filter for unread notifications

    if (error) {
      console.error("Error fetching unread notification count:", error);
      return 0; // Return 0 on error
    }

    return count ?? 0;
  } catch (err) {
    console.error("Unexpected error fetching unread notification count:", err);
    return 0; // Return 0 on unexpected error
  }
}
