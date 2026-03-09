"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Dummy user type
type User = {
  username: string;
  email: string;
  avatarUrl?: string;
};

// Dummy auth fetch – replace with your real auth/session logic
const fetchCurrentUser = async (): Promise<User | null> => {
  // Example: check session or call your API
  // Return null if not logged in
  return null; // change to a mock logged-in user to test
};

export default function AccountPage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p className="text-lg text-gray-500">{t('Loading account info...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {user ? (
        // Logged-in view
        (<div className="bg-white shadow rounded p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Image
              src={user.avatarUrl || "/images/default-avatar.png"}
              alt={user.username}
              width={80}
              height={80}
              className="rounded-full border border-gray-300"
            />
            <div>
              <h1 className="text-3xl font-bold">{t('Welcome,')}{user.username}!</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/orders"
              className="block p-4 border rounded hover:bg-gray-50"
            >
              <h2 className="font-semibold">{t('Orders')}</h2>
              <p className="text-gray-500">{t('View your recent orders and reorder items')}</p>
            </Link>
            <Link
              href="/billing"
              className="block p-4 border rounded hover:bg-gray-50"
            >
              <h2 className="font-semibold">{t('Billing & Payment')}</h2>
              <p className="text-gray-500">{t('Manage payment methods and subscriptions')}</p>
            </Link>
            <Link
              href="/profile/edit"
              className="block p-4 border rounded hover:bg-gray-50"
            >
              <h2 className="font-semibold">{t('Profile & Preferences')}</h2>
              <p className="text-gray-500">{t('Update your name, avatar, and notification settings')}</p>
            </Link>
            <Link
              href="/support"
              className="block p-4 border rounded hover:bg-gray-50"
            >
              <h2 className="font-semibold">{t('Support')}</h2>
              <p className="text-gray-500">{t('Get help, manage security, and contact us')}</p>
            </Link>
          </div>
          <div className="flex gap-4">
            <Link
              href="/logout"
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >{t('Logout')}</Link>
            <Link
              href="/"
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >{t('Back to Home')}</Link>
          </div>
        </div>)
      ) : (
        // Guest view
        (<div className="bg-white shadow rounded p-6 text-center space-y-6">
          <h1 className="text-3xl font-bold">{t('Welcome!')}</h1>
          <p className="text-gray-600">{t(
            'To access your orders, subscriptions, and account settings, please log in or create an account.'
          )}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">{t('Continue with :')}<Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 px-6 py-3 border rounded hover:bg-gray-100"
            >{t('Google')}<img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
              <br/>
            </Link>

            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 px-6 py-3 border rounded hover:bg-gray-100"
            >{t('Apple')}<Image src="/icons/apple.svg" alt="Apple" width={20} height={20} className="w-5 h-5" />
              <br/>
            </Link>

            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 px-6 py-3 border rounded hover:bg-gray-100"
            >{t('Facebook')}<img src="/icons/facebook.svg" alt="Facebook" className="w-5 h-5" />
              <br/>
            </Link>
          </div>
          <div className="mt-4">
            <p className="text-gray-500">{t('Or use your email')}</p>
            <Link
              href="/auth/register"
              className="mt-2 inline-block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
            >{t('Sign Up with Email')}</Link>
          </div>
          <p className="text-gray-500 mt-4">{t('Already have an account?')}{" "}
            <Link href="/auth/login" className="text-blue-600 underline">{t('Log in here')}</Link>
          </p>
        </div>)
      )}
    </div>
  );
}
