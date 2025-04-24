"use client";

import { useState, useEffect } from "react";
import { UserContext } from "./UserContext";
import { User } from "@/types/user";
import { Course } from "@/types/course";
import { fetchProfile } from "@/api/users";
import { getCart } from "@/api/cart";

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<Course[] | null>([]);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      setLoading(true);
      const profile = await fetchProfile();
      setUser(profile);
      if (profile) {
        const { data } = await getCart(profile.id);
        if (data) {
          setCart(data);
        }
      }
    } catch (error) {
      console.error("Failed to load user profile:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, cart, loading, setUser, setCart, reloadUser: loadUser }}>
      {children}
    </UserContext.Provider>
  );
}
