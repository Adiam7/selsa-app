'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { User, ArrowRight, Mail, Check, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

export default function CheckoutAuthGate() {
  const router = useRouter();
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // If already signed in, skip straight to checkout
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/checkout');
    }
  }, [status, router]);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
      const res = await fetch(
        `${backendUrl}/api/accounts/auth/magic-link/request/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmed }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Something went wrong. Please try again.');
      }

      setSent(true);
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Unable to send sign-in link.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setSent(false);
    setError(null);
    // Re-trigger send
    const fakeEvent = { preventDefault: () => {} } as FormEvent;
    await handleSubmit(fakeEvent);
  };

  if (status === 'loading') {
    return (
      <div className={styles.page}>
        <div className={styles.maxWidth}>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.maxWidth}>

        {/* Two-Column Grid */}
        <div className={styles.grid}>
          {/* ── Left Sidebar ── */}
          <aside className={styles.sidebar}>
            <div className={styles.guestBadge}>
              <span className={styles.guestIcon}>
                <User size={16} />
              </span>
              <span className={styles.guestLabel}>Guest</span>
            </div>

            <p className={styles.notSignedIn}>You are not signed in.</p>

            <Link href="/auth/login?callbackUrl=/checkout" className={styles.signInLink}>
              Sign In <ChevronRight size={16} />
            </Link>

            <div className={styles.divider} />

            <Link href="/checkout" className={styles.continueGuest}>
              Continue as Guest <ArrowRight size={16} />
            </Link>
          </aside>

          {/* ── Right Panel ── */}
          <div className={styles.mainPanel}>
            {!sent ? (
              <>
                <h1 className={styles.panelTitle}>Join us or sign in</h1>
                <p className={styles.panelDesc}>
                  Track your orders, checkout faster, and sync your favorites.
                  Just enter your email and we&apos;ll send you a special link
                  that will sign you in instantly.
                  <br />
                  <br />
                  <span className={styles.panelDescHighlight}>
                    An account will be automatically created for you, if you
                    don&apos;t have one yet.
                  </span>
                </p>

                <form onSubmit={handleSubmit}>
                  <div className={styles.formGroup}>
                    <label htmlFor="magic-email" className={styles.label}>
                      Email address
                    </label>
                    <input
                      id="magic-email"
                      type="email"
                      className={styles.emailInput}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={loading}
                  >
                    {loading ? (
                      'Sending…'
                    ) : (
                      <>
                        <Mail size={18} />
                        Get Sign-in Link
                      </>
                    )}
                  </button>

                  {error && <p className={styles.errorMsg}>{error}</p>}
                </form>
              </>
            ) : (
              /* ── Success State ── */
              <div className={styles.successCard}>
                <div className={styles.successIcon}>
                  <Check size={28} />
                </div>
                <h2 className={styles.successTitle}>Check your email</h2>
                <p className={styles.successDesc}>
                  We&apos;ve sent a sign-in link to{' '}
                  <span className={styles.successEmail}>{email}</span>.
                  <br />
                  Click the link in the email to continue to checkout.
                </p>
                <button
                  className={styles.resendBtn}
                  onClick={handleResend}
                  disabled={cooldown > 0}
                >
                  {cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend link'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
