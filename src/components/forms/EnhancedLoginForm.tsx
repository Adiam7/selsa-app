/**
 * Enhanced Login Form with Risk-Based Authentication
 * 
 * Integrates:
 * - Risk assessment on login
 * - Brute force protection
 * - Multi-factor authentication challenges
 * - Session security monitoring
 */

'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Apple,
  X,
  AlertCircle,
  CheckCircle,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { LoginLogo } from '@/components/icons/LoginLogo';
import {
  useRiskBasedLogin,
  useBruteForceDetection,
} from '@/lib/hooks/useRiskBasedAuth';
import {
  RiskAssessmentCard,
  AuthChallengeModal,
  BruteForceAlert,
  RiskWarningBanner,
} from '@/components/auth/RiskBasedAuthUI';
import styles from './LoginForm.module.css';
import type { ChallengeType } from '@/lib/services/authChallenge';
import { authChallenge } from '@/lib/services/authChallenge';

export default function EnhancedLoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const callbackUrl = searchParams?.get('callbackUrl') || searchParams?.get('redirect');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [success, setSuccess] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);

  // Risk-based auth hooks
  const {
    isLoading,
    loginError,
    requiresChallenge,
    riskAssessmentData,
    attemptLogin,
  } = useRiskBasedLogin();

  const { detection: bruteForceStatus } = useBruteForceDetection();

  // Challenge state
  const [showChallenge, setShowChallenge] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [verifyingChallenge, setVerifyingChallenge] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  // Get user's IP and device info
  const [userContext, setUserContext] = useState<any>(null);

  useEffect(() => {
    // Get user IP and device info
    const getContext = async () => {
      try {
        // Get IP address
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();

        setUserContext({
          currentIpAddress: ipData.ip || '127.0.0.1',
          isNewDevice: !localStorage.getItem('device_id'),
          isTrusted: false,
        });
      } catch (error) {
        console.error('Failed to get user context:', error);
        setUserContext({
          currentIpAddress: '127.0.0.1',
          isNewDevice: true,
          isTrusted: false,
        });
      }
    };

    getContext();
  }, []);

  // Validation
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

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
  const strengthColor =
    passwordStrength < 40
      ? 'bg-red-500'
      : passwordStrength < 70
        ? 'bg-yellow-500'
        : 'bg-green-500';

  // Handle login with risk assessment
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!userContext) {
      setErrors({ email: 'Unable to assess security. Please refresh and try again.' });
      return;
    }

    // Attempt login with risk assessment
    const result = await attemptLogin(email, password, {
      deviceId: localStorage.getItem('device_id') || undefined,
      isTrusted: userContext.isTrusted,
      isNewDevice: userContext.isNewDevice,
      currentIpAddress: userContext.currentIpAddress,
    });

    if (result.requiresChallenge) {
      // Need to complete challenge
      setShowChallenge(true);

      // Create email challenge
      const challenge = authChallenge.createChallenge(
        `session_${Date.now()}`,
        'email' as ChallengeType,
        email
      );
      setCurrentChallenge(challenge);
    } else if (result.success) {
      setSuccess(true);

      // Proceed with NextAuth signin
      const authResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (authResult?.ok) {
        setTimeout(() => {
          router.push(callbackUrl || '/');
        }, 500);
      } else {
        setErrors({ email: authResult?.error || 'Authentication failed' });
        setSuccess(false);
      }
    } else {
      setErrors({ email: result.message });
    }
  };

  // Handle challenge verification
  const handleChallengeVerify = async (code: string) => {
    if (!currentChallenge) return;

    setVerifyingChallenge(true);
    setChallengeError(null);

    try {
      const result = authChallenge.verifyChallengeResponse(currentChallenge.id, code);

      if (result.verified) {
        // Challenge passed, proceed with signin
        setShowChallenge(false);
        setSuccess(true);

        const authResult = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (authResult?.ok) {
          setTimeout(() => {
            router.push(callbackUrl || '/');
          }, 500);
        } else {
          setChallengeError(authResult?.error || 'Authentication failed');
          setSuccess(false);
          setShowChallenge(true);
        }
      } else {
        setChallengeError(result.message);
      }
    } finally {
      setVerifyingChallenge(false);
    }
  };

  const handleChallengeResend = () => {
    if (!currentChallenge) return;
    authChallenge.resendChallenge(currentChallenge.id);
  };

  return (
    <div className={styles.loginContainer}>
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
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className="mb-3 flex justify-center"
            >
              <LoginLogo className="justify-center" />
            </motion.div>
            <h1 className={styles.title}>{t('Welcome!')}</h1>
            <p className={styles.subtitle}>{t('Sign in to continue')}</p>
          </motion.div>

          {/* Risk/Brute Force Alerts */}
          {bruteForceStatus?.isAttackDetected && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-4"
            >
              {bruteForceStatus.shouldLockAccount ? (
                <BruteForceAlert
                  failedAttempts={bruteForceStatus.failedAttempts}
                  lockDuration={bruteForceStatus.lockDuration}
                />
              ) : (
                <RiskWarningBanner
                  riskLevel={
                    bruteForceStatus.severity === 'critical'
                      ? 'critical'
                      : bruteForceStatus.severity === 'high'
                        ? 'high'
                        : 'medium'
                  }
                  message={bruteForceStatus.message}
                />
              )}
            </motion.div>
          )}

          {/* Risk Assessment Alert */}
          {riskAssessmentData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-4"
            >
              <RiskAssessmentCard
                assessment={riskAssessmentData}
                onDismiss={() => {}}
              />
            </motion.div>
          )}

          {/* Login Errors */}
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg flex gap-2"
            >
              <AlertCircle className="text-red-600 flex-shrink-0" size={18} />
              <p className="text-sm text-red-800">{loginError}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className={styles.form}>
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              className={styles.fieldGroup}
            >
              <label className={styles.label}>{t('Email')}</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.inputIcon} size={16} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => {
                    if (email && !validateEmail(email)) {
                      setErrors({ ...errors, email: 'Invalid email' });
                    }
                    setFocusedField(null);
                  }}
                  className={`${styles.input} ${
                    errors.email
                      ? styles.inputError
                      : focusedField === 'email'
                        ? styles.inputFocused
                        : styles.inputBlurred
                  }`}
                  disabled={isLoading || success || showChallenge}
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
                <label className={styles.label}>{t('Password')}</label>
                <motion.a
                  whileHover={{ x: 2 }}
                  href="/auth/forgot-password"
                  className={styles.forgotLink}
                >{t('Forgot Password?')}</motion.a>
              </div>
              <div className={styles.inputWrapper}>
                <Lock className={styles.inputIcon} size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className={`${styles.input} ${
                    errors.password
                      ? styles.inputError
                      : focusedField === 'password'
                        ? styles.inputFocused
                        : styles.inputBlurred
                  }`}
                  disabled={isLoading || success || showChallenge}
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.togglePassword}
                  disabled={isLoading || success || showChallenge}
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

            {/* Password Strength */}
            {password && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="space-y-1"
              >
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthColor} transition-all`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {passwordStrength < 40
                      ? 'Weak'
                      : passwordStrength < 70
                        ? 'Fair'
                        : 'Strong'}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Remember Me */}
            <motion.label
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.3 }}
              className={styles.checkboxWrapper}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                disabled={isLoading || success || showChallenge}
              />
              <span className={styles.checkboxLabel}>{t('Keep me signed in')}</span>
            </motion.label>

            {/* Sign In Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.33, duration: 0.3 }}
              type="submit"
              disabled={isLoading || success || showChallenge}
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
                  <CheckCircle size={16} />
                  Done
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.38, duration: 0.3 }}
            className={styles.divider}
          >
            <div className={styles.dividerLine} />
            <div className={styles.dividerText}>OR</div>
          </motion.div>

          {/* Social Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.43, duration: 0.3 }}
            className={styles.socialButtons}
          >
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={async () => {
                setOauthLoading('google');
                await signIn('google', { callbackUrl: callbackUrl || '/' });
              }}
              className={styles.socialButton}
              disabled={isLoading || success || showChallenge}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: '#1f2937' }}
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>{t('Google')}</motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={async () => {
                setOauthLoading('apple');
                await signIn('apple', { callbackUrl: callbackUrl || '/' });
              }}
              className={styles.socialButton}
              disabled={isLoading || success || showChallenge}
            >
              <Apple size={16} />{t('Apple')}</motion.button>
          </motion.div>

          {/* Sign Up Link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.48, duration: 0.3 }}
            className={styles.signUpText}
          >{t('Don\'t have an account?')}{' '}
            <motion.a
              whileHover={{ x: 2 }}
              href="/auth/register"
              className={styles.signUpLink}
            >{t('Sign Up')}</motion.a>
          </motion.p>

          {/* Security Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.53, duration: 0.3 }}
            className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1"
          >
            <ShieldAlert size={14} />{t('Protected by risk-based authentication')}</motion.div>
        </div>
      </motion.div>
      {/* Challenge Modal */}
      {showChallenge && currentChallenge && (
        <AuthChallengeModal
          challenge={currentChallenge}
          onVerify={handleChallengeVerify}
          onResend={handleChallengeResend}
          isVerifying={verifyingChallenge}
          error={challengeError || undefined}
        />
      )}
    </div>
  );
}
