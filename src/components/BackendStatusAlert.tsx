// components/BackendStatusAlert.tsx
'use client';

import { useEffect, useState } from 'react';
import { checkBackendHealth } from '@/lib/api/health-check';
import styles from './BackendStatusAlert.module.css';

export function BackendStatusAlert() {
  const [status, setStatus] = useState<{
    isHealthy: boolean;
    message: string;
    url: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check backend health on mount after a short delay
    const initialCheckTimer = setTimeout(() => {
      checkBackendHealth().then(setStatus);
    }, 2000); // Wait 2 seconds before first check to avoid startup race conditions

    // Recheck every 60 seconds (reduced frequency to minimize "broken pipe" logs)
    const interval = setInterval(() => {
      checkBackendHealth().then((newStatus) => {
        setStatus(newStatus);
        // If backend becomes healthy, auto-dismiss the alert
        if (newStatus.isHealthy) {
          setDismissed(true);
        }
      });
    }, 60000); // Changed from 30s to 60s

    return () => {
      clearTimeout(initialCheckTimer);
      clearInterval(interval);
    };
  }, []);

  // Don't show anything if dismissed or backend is healthy
  if (dismissed || !status || status.isHealthy) {
    return null;
  }

  return (
    <div className={styles.alert}>
      <div className={styles.content}>
        <div className={styles.body}>
          <div className={styles.header}>
            <span className={styles.icon}>⚠️</span>
            <strong className={styles.title}>Backend Not Connected</strong>
          </div>
          <p className={styles.message}>
            {status.message}
          </p>
          <p className={styles.hint}>
            💡 Start the backend: <code>cd ../selsa-backend && python manage.py runserver</code>
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className={styles.closeButton}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  );
}
