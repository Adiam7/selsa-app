"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [dark, setDark] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Email validation regex
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string } = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Call backend API to send reset email
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/accounts/auth/forgot-password/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error?.email?.[0] || data?.error || "Failed to send reset email");
      }

      setSubmitted(true);
      setEmail("");
    } catch (error) {
      console.error("Error details:", error);
      setErrors({
        email:
          error instanceof Error
            ? error.message
            : "Failed to send reset email. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={dark ? "dark" : "light"}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors px-6 py-12">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-300 dark:bg-gray-800 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-200 dark:bg-gray-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        </div>

        {/* Theme toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDark(!dark)}
          className="absolute top-8 right-8 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-sm relative z-10">
          {/* Card */}
          <Card className="rounded-3xl border-2 border-gray-300 dark:border-gray-600 bg-white/95 dark:bg-gray-950 backdrop-blur-2xl shadow-2xl">
            {/* Decorative top gradient */}
            <div className="h-1 bg-gradient-to-r from-gray-400 via-gray-600 to-gray-400 dark:from-gray-500 dark:via-gray-700 dark:to-gray-500"></div>

            <CardContent className="p-10 sm:p-12 overflow-visible">
              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{t('Reset Password')}</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {submitted
                    ? "Check your email for reset instructions"
                    : "Enter your email to receive password reset instructions"}
                </p>
              </motion.div>

              {submitted ? (
                <motion.div
                  variants={itemVariants}
                  className="space-y-4 text-center"
                >
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('Email Sent!')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('We\'ve sent a password reset link to')}<strong>{email}</strong>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">{t(
                      'The link will expire in 1 hour. Check your spam folder if you don\'t see it.'
                    )}</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = "/auth/login")}
                    className="w-full mt-6 py-3 px-4 bg-gray-900 dark:bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-700 transition-all"
                  >{t('Back to Login')}</motion.button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <motion.div variants={itemVariants} className="relative">
                    <motion.div
                      animate={{
                        scale: focusedField === "email" ? 1.02 : 1,
                      }}
                      className="relative"
                    >
                      <Mail
                        size={18}
                        className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                          focusedField === "email"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-400 dark:text-gray-600"
                        }`}
                      />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ email: undefined });
                        }}
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => {
                          if (email && !validateEmail(email)) {
                            setErrors({ email: "Invalid email address" });
                          }
                          setFocusedField(null);
                        }}
                        className={`!pl-10 py-3.5 rounded-xl border-2 transition-all outline-none font-light ${
                          errors.email
                            ? "border-red-500 bg-red-50 dark:bg-red-900/10"
                            : focusedField === "email"
                            ? "border-gray-900 dark:border-white bg-white dark:bg-gray-800/50"
                            : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
                        } text-gray-900 dark:text-white placeholder-gray-700 dark:placeholder-gray-500 focus-visible:ring-0`}
                      />
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-600 dark:text-red-400 mt-1.5 font-medium"
                        >{t('✕')}{errors.email}
                        </motion.p>
                      )}
                    </motion.div>
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div variants={itemVariants} className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-6 bg-black dark:bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Send Reset Link
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </motion.div>

                  {/* Back to Login */}
                  <motion.p
                    variants={itemVariants}
                    className="text-center text-sm text-gray-600 dark:text-gray-400"
                  >
                    <motion.a
                      whileHover={{ color: "#000000" }}
                      href="/auth/login"
                      className="font-semibold text-gray-900 dark:text-white hover:underline transition-colors cursor-pointer"
                    >{t('Back to Login')}</motion.a>
                  </motion.p>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Footer hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-gray-500 dark:text-gray-500 text-xs mt-8 font-medium"
          >{t('Secure • Your data is encrypted')}</motion.p>
        </motion.div>
      </div>
    </div>
  );
}
