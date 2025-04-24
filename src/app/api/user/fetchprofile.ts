import { createClient } from '@/libs/supabase/server';
import { User } from '@/types/user';

export const fetchProfile = async (): Promise<User | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return null;
  }
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();
  if (userError) {
    console.error('Error fetching user data:', userError);
    return null;
  }
  return userData as User;
};
