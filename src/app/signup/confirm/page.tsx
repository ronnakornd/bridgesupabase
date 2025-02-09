'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/libs/supabase/client';
import { useRouter } from 'next/navigation';

export default function EmailConfirmation() {
  const router = useRouter();
  const [message, setMessage] = useState<string>('Confirming your email...');

  useEffect(() => {
    const confirmEmail = async () => {
      const { error } = await supabase.auth.getSession();

      if (error) {
        setMessage(`Error confirming email: ${error.message}`);
      } else {
        setMessage('Email confirmed successfully! Redirecting...');
        setTimeout(() => {
          router.push('/login'); // Redirect to login or dashboard after confirmation
        }, 3000);
      }
    };

    confirmEmail();
  }, [router]);

  return (
    <div className='bg-base-200 min-h-screen'>
      <h1 className='font-opun'>{message}</h1>
    </div>
  );
}
