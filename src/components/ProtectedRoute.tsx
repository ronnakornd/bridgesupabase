"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/libs/supabase/client'

export default function ProtectedRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  useEffect(() => {
    const checkUser = async () => {
      const user = await supabase.auth.getUser();
      if (!user.data) {
        router.push('/login');
      }
    };

    checkUser();
  }, [router]);

  return <>{children}</>;
}
