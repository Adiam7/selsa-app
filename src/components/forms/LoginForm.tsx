"use client";

import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Moon, Sun, Eye, EyeOff, Mail, Lock, Apple, ArrowRight, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoginLogo } from "@/components/icons/LoginLogo";
import styles from "./LoginForm.module.css";

export default function LoginPage() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get redirect URL from query params (e.g., ?callbackUrl=/cart or ?redirect=/checkout)
  const callbackUrl = searchParams?.get("callbackUrl") || searchParams?.get("redirect");
  
  const [showPassword, setShowPassword] = useState(false);
  const [dark, setDark] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [success, setSuccess] = useState(false);

  // Email validation regex
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Password strength calculator
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;
    return Math.ceil((strength / 5) * 100);
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColor = passwordStrength < 40 ? "bg-red-500" : passwordStrength < 70 ? "bg-yellow-500" : "bg-green-500";

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

  return (
    <div className={styles.loginContainer}>
      {/* Content card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={styles.modalCard}
      >
        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => router.back()}
          className={styles.closeButton}
          title="Close"
        >
          <X size={20} strokeWidth={3} />
        </motion.button>

        {/* Content */}
        <div className={styles.content}>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className={styles.header}
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="mb-3 flex justify-center"
            >
              <LoginLogo className="justify-center" />
            </motion.div>
            <h1 className={styles.title}>{t('Welcome !')}</h1>
            <p className={styles.subtitle}>{t('Sign in to continue')}</p>
          </motion.div>

          {/* Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const newErrors: { email?: string; password?: string } = {};
              
              if (!email) {
                newErrors.email = "Email is required";
              } else if (!validateEmail(email)) {
                newErrors.email = "Invalid email";
              }
              
              if (!password) {
                newErrors.password = "Password is required";
              }
              
              if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
              }
              
              setIsLoading(true);
              
              try {
                const result = await signIn("credentials", {
                  email,
                  password,
                  redirect: false,
                });
                
                if (result?.ok) {
                  setSuccess(true);
                  setTimeout(() => {
                    router.push(callbackUrl || "/");
                  }, 500);
                } else {
                  setErrors({ email: result?.error || "Invalid credentials" });
                  setIsLoading(false);
                }
              } catch (error) {
                setErrors({ email: "An error occurred. Please try again." });
                setIsLoading(false);
              }
            }}
            className={styles.form}
          >
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className={styles.fieldGroup}
            >
              <label htmlFor="login-email" className={styles.label}>{t('Email')}</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={16} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => {
                    if (email && !validateEmail(email)) {
                      setErrors({ ...errors, email: "Invalid email" });
                    }
                    setFocusedField(null);
                  }}
                  className={`${styles.input} ${
                    errors.email
                      ? styles.inputError
                      : focusedField === "email"
                      ? styles.inputFocused
                      : styles.inputBlurred
                  }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.errorText}
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={styles.fieldGroup}
            >
              <div className={styles.fieldHeader}>
                <label htmlFor="login-password" className={styles.label}>{t('Password')}</label>
                <motion.a
                  whileHover={{ x: 2 }}
                  href="/auth/forgot-password"
                  className={styles.forgotLink}
                >{t('Forgot Password?')}</motion.a>
              </div>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={16} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={`${styles.input} ${
                    errors.password
                      ? styles.inputError
                      : focusedField === "password"
                      ? styles.inputFocused
                      : styles.inputBlurred
                  }`}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </motion.button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={styles.errorText}
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Remember Me */}
            <motion.label
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className={styles.checkboxWrapper}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
              />
              <span className={styles.checkboxLabel}>{t('Keep me signed in')}</span>
            </motion.label>

            {/* Sign In Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              type="submit"
              disabled={isLoading || success}
              className={styles.submitButton}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
              ) : success ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Done
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className={styles.divider}
          >
            <div className={styles.dividerLine} />
            <div className={styles.dividerText}>OR</div>
          </motion.div>

          {/* Social Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className={styles.socialButtons}
          >
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={async () => {
                setOauthLoading("google");
                await signIn("google", { callbackUrl: callbackUrl || "/" });
              }}
              className={styles.socialButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ color: "#1f2937" }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>{t('Google')}</motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={async () => {
                setOauthLoading("apple");
                await signIn("apple", { callbackUrl: callbackUrl || "/" });
              }}
              className={styles.socialButton}
            >
              <Apple size={16} />{t('Apple')}</motion.button>
          </motion.div>

          {/* Sign Up Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.3 }}
            className={styles.signUpText}
          >{t('Don\'t have an account?')}{" "}
            <motion.a
              whileHover={{ x: 2 }}
              href="/auth/register"
              className={styles.signUpLink}
            >{t('Sign Up')}</motion.a>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
