'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyPayment } from '@/api/stripe';
import { CheckCircle2, Loader2 } from 'lucide-react';

import Link from 'next/link';

export default function PaymentSuccessPage() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifySession = async () => {
      if (!searchParams) {
        setError('Invalid search parameters');
        setIsVerifying(false);
        return;
      }

      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setError('No session ID found');
        setIsVerifying(false);
        return;
      }

      try {
        const { data, error: verifyError } = await verifyPayment(sessionId);
        
        if (verifyError || !data) {
          throw new Error(typeof verifyError === 'string' ? verifyError : 'Failed to verify payment');
        }

        // Wait for 3 seconds before redirecting to show success message
        setTimeout(() => {
          router.push(`/course/${data.metadata.courseId}`);
        }, 3000);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Payment verification failed');
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [searchParams, router]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-lg">Verifying your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-error mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-4">Payment Verification Failed</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <CheckCircle2 className="w-16 h-16 text-success mb-4" />
      <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. You will be redirected to your course shortly.
      </p>
      <div className="flex gap-4">
        <Link href="/" className="btn btn-ghost">
          Return to Home
        </Link>
        <Link href="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
} 