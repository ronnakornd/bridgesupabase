'use client';

import { createClient } from "@/libs/supabase/client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { UserContext } from "@/components/UserContext";
import { useContext } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const { setUser } = useContext(UserContext);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="btn  btn-error text-white float-right"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
} 