
import { createClient } from '@/libs/supabase/client';
import { User } from '@/types/user';


 export const fetchProfile = async (): Promise<User | null> => {
      const supabase = createClient();
      const user = await supabase.auth.getUser();
      if (!user) {
        return null;
      }
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.data.user?.id)
        .single();
      if (data) {
       return data;
      }
      if (error) {
        console.log("Error fetching user profile:", error);
        return null;
      }
      return null;
};