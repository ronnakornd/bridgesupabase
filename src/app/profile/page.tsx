import { fetchProfile } from "@/app/api/user/fetchprofile";
import { createClient } from "@/libs/supabase/server";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import ProfileContent from "./ProfileContent";

export default async function Profile() {
  const user: User | null = await fetchProfile();
  const supabase = await createClient();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  if (!user) {
    redirect("/login");
  }

  return <ProfileContent user={user} />;
}
