'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import styles from '../page.module.css';

type Status = 'verifying' | 'success' | 'error';

export default function MagicLinkVerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams?.get('token');
  const attemptedRef = useRef(false);

  const [status, setStatus] = useState<Status>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    if (!token) {
      setStatus('error');
      setErrorMsg('Missing token. Please request a new sign-in link.');
      return;
    }

    (async () => {
      try {
        // Use NextAuth's signIn with our magic-link provider
        const result = await signIn('magic-link', {
          token,
          redirect: false,
        });

        if (result?.error) {
          setStatus('error');
          setErrorMsg(
            result.error.includes('expired')
              ? 'This link has expired. Please request a new one.'
              : 'Invalid or expired link. Please request a new one.',
          );
          return;
        }

        setStatus('success');

        // Redirect to checkout after a brief success flash
        setTimeout(() => {
          router.replace('/checkout');
        }, 1500);
      } catch {
        setStatus('error');
        setErrorMsg('Something went wrong. Please try again.');
      }
    })();
  }, [token, router]);

  return (
    <div className={styles.page}>
      <div className={styles.maxWidth}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            SELSA
          </Link>
          <p className={styles.headerSub}>Signing you in</p>
        </div>

        <div className={styles.verifyWrapper}>
          <div className={styles.mainPanel}>
            {status === 'verifying' && (
              <div className={styles.successCard}>
                <div className={`${styles.successIcon} ${styles.iconVerifying}`}>
                  <Loader2 size={28} className="animate-spin" />
                </div>
                <h2 className={styles.successTitle}>Verifying your link…</h2>
                <p className={styles.successDesc}>
                  Please wait while we sign you in.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className={styles.successCard}>
                <div className={styles.successIcon}>
                  <Check size={28} />
                </div>
                <h2 className={styles.successTitle}>You&apos;re signed in!</h2>
                <p className={styles.successDesc}>
                  Redirecting you to checkout…
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className={styles.successCard}>
                <div className={`${styles.successIcon} ${styles.iconError}`}>
                  <X size={28} />
                </div>
                <h2 className={styles.successTitle}>Link invalid</h2>
                <p className={styles.successDesc}>{errorMsg}</p>
                <Link href="/checkout/auth" className={styles.retryLink}>
                  Request a new link
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
