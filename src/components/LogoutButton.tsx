import { createClient } from '@/libs/supabase/client';

export default function LogoutButton() {
  const supabase = createClient();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return <button onClick={handleLogout}>Logout</button>;
}
