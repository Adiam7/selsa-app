/**
 * Risk-Based Authentication Hooks
 * 
 * React hooks for implementing risk-based authentication features
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RiskAssessment, RiskLevel } from '@/lib/services/riskAssessment';
import { riskAssessment, type RiskContext } from '@/lib/services/riskAssessment';
import type { BruteForceDetection, LoginAttempt } from '@/lib/services/bruteForceDetection';
import { bruteForceDetection } from '@/lib/services/bruteForceDetection';
import type { TimeoutConfig } from '@/lib/services/dynamicTimeout';
import { dynamicTimeout } from '@/lib/services/dynamicTimeout';
import type { Challenge, ChallengeType, ChallengeResponse } from '@/lib/services/authChallenge';
import { authChallenge } from '@/lib/services/authChallenge';

/**
 * Hook: Risk Assessment
 * Assess risk for a login attempt
 */
export function useRiskAssessment() {
  const [risk, setRisk] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);

  const assessRisk = useCallback((context: RiskContext) => {
    setLoading(true);
    try {
      const assessment = riskAssessment.assess(context);
      setRisk(assessment);
      return assessment;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRiskExplanation = useCallback(() => {
    if (!risk) return '';
    return riskAssessment.getRiskExplanation(risk);
  }, [risk]);

  return {
    risk,
    loading,
    assessRisk,
    getRiskExplanation,
  };
}

/**
 * Hook: Brute Force Detection
 * Monitor and detect brute force attacks
 */
export function useBruteForceDetection() {
  const [detection, setDetection] = useState<BruteForceDetection | null>(null);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [statistics, setStatistics] = useState(bruteForceDetection.getStatistics());

  const recordAttempt = useCallback(
    (email: string, ipAddress: string, success: boolean, userAgent?: string, reason?: string) => {
      const result = bruteForceDetection.recordAttempt(email, ipAddress, success, userAgent, reason);
      setDetection(result);
      setStatistics(bruteForceDetection.getStatistics());
      return result;
    },
    []
  );

  const canAttemptLogin = useCallback((email: string, ipAddress: string) => {
    const result = bruteForceDetection.canAttemptLogin(email, ipAddress);
    setDetection(result);
    return result;
  }, []);

  const unlockAccount = useCallback((email: string) => {
    bruteForceDetection.unlockAccount(email);
    setStatistics(bruteForceDetection.getStatistics());
  }, []);

  const removeIpFromBlacklist = useCallback((ipAddress: string) => {
    bruteForceDetection.removeIpFromBlacklist(ipAddress);
    setStatistics(bruteForceDetection.getStatistics());
  }, []);

  const getPatterns = useCallback(() => {
    return bruteForceDetection.getAttemptPatterns();
  }, []);

  return {
    detection,
    attempts,
    statistics,
    recordAttempt,
    canAttemptLogin,
    unlockAccount,
    removeIpFromBlacklist,
    getPatterns,
  };
}

/**
 * Hook: Dynamic Timeout
 * Manage session timeouts based on risk
 */
export function useDynamicTimeout(sessionId?: string) {
  const [timeout, setTimeout] = useState<TimeoutConfig | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Update remaining time
  useEffect(() => {
    if (!sessionId || !timeout) return;

    const interval = setInterval(() => {
      // In production, you'd track actual session start time
      const startTime = new Date();
      const remaining = dynamicTimeout.getTimeRemaining(sessionId, startTime);
      const shouldWarn = dynamicTimeout.shouldWarn(sessionId, startTime);

      setTimeRemaining(remaining);
      setShowWarning(shouldWarn);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionId, timeout]);

  const calculateTimeout = useCallback(
    (riskLevel: RiskLevel, context?: Parameters<typeof dynamicTimeout.calculateTimeout>[2]) => {
      if (!sessionId) return null;

      const config = dynamicTimeout.calculateTimeout(sessionId, riskLevel, context);
      setTimeout(config);
      return config;
    },
    [sessionId]
  );

  const extendSession = useCallback(
    (extensionMinutes?: number) => {
      if (!sessionId) return null;

      const config = dynamicTimeout.extendSession(sessionId, extensionMinutes);
      setTimeout(config || null);
      return config;
    },
    [sessionId]
  );

  const expireSession = useCallback(() => {
    if (!sessionId) return;
    dynamicTimeout.expireSession(sessionId);
    setTimeout(null);
  }, [sessionId]);

  return {
    timeout,
    timeRemaining,
    showWarning,
    calculateTimeout,
    extendSession,
    expireSession,
  };
}

/**
 * Hook: Authentication Challenge
 * Handle additional verification challenges
 */
export function useAuthChallenge() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<ChallengeResponse | null>(null);

  const createChallenge = useCallback(
    (sessionId: string, type: ChallengeType, email?: string) => {
      const newChallenge = authChallenge.createChallenge(sessionId, type, email);
      setChallenge(newChallenge);
      return newChallenge;
    },
    []
  );

  const createMultipleChallenges = useCallback((sessionId: string, types: ChallengeType[], email?: string) => {
    const newChallenges = types.map((type) => authChallenge.createChallenge(sessionId, type, email));
    setChallenges(newChallenges);
    return newChallenges;
  }, []);

  const verifyChallenge = useCallback(async (challengeId: string, response: string) => {
    setIsVerifying(true);
    try {
      // Simulate async verification
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = authChallenge.verifyChallengeResponse(challengeId, response);
      setVerificationResult(result);
      return result;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const resendChallenge = useCallback((challengeId: string) => {
    const result = authChallenge.resendChallenge(challengeId);
    return result;
  }, []);

  const needsChallenge = useCallback((riskLevel: string, deviceTrusted: boolean) => {
    return authChallenge.needsChallenge(riskLevel, deviceTrusted);
  }, []);

  return {
    challenge,
    challenges,
    isVerifying,
    verificationResult,
    createChallenge,
    createMultipleChallenges,
    verifyChallenge,
    resendChallenge,
    needsChallenge,
  };
}

/**
 * Hook: Risk-Based Login Flow
 * Complete login flow with risk assessment
 */
export function useRiskBasedLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [requiresChallenge, setRequiresChallenge] = useState(false);
  const [riskAssessmentData, setRiskAssessmentData] = useState<RiskAssessment | null>(null);

  const { assessRisk } = useRiskAssessment();
  const { recordAttempt, canAttemptLogin } = useBruteForceDetection();
  const { createMultipleChallenges, needsChallenge } = useAuthChallenge();

  const attemptLogin = useCallback(
    async (email: string, password: string, context: RiskContext) => {
      setIsLoading(true);
      setLoginError(null);

      try {
        // Check brute force
        const bruteForceCheck = canAttemptLogin(email, context.currentIpAddress || '');
        if (!bruteForceCheck.isAttackDetected === false && bruteForceCheck.shouldLockAccount) {
          recordAttempt(email, context.currentIpAddress || '', false, undefined, 'Account locked');
          throw new Error(bruteForceCheck.message);
        }

        // Assess risk
        const risk = assessRisk(context);
        setRiskAssessmentData(risk);

        // For demo: simulate password check (in production, validate against hash)
        const passwordValid = password.length >= 8;

        if (!passwordValid) {
          recordAttempt(email, context.currentIpAddress || '', false, undefined, 'Invalid password');
          throw new Error('Invalid email or password');
        }

        // Check if challenge needed
        const needsChallenges = needsChallenge(risk.riskLevel, context.isTrusted || false);
        if (needsChallenges.length > 0) {
          setRequiresChallenge(true);
          // In production, this would be a real session ID
          createMultipleChallenges('session_' + Date.now(), needsChallenges as ChallengeType[], email);
          return {
            success: false,
            requiresChallenge: true,
            risk,
            message: `Please verify your identity to continue. We've sent a verification code.`,
          };
        }

        // Login successful
        recordAttempt(email, context.currentIpAddress || '', true);
        return {
          success: true,
          requiresChallenge: false,
          risk,
          message: 'Login successful',
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        setLoginError(message);
        recordAttempt(email, context.currentIpAddress || '', false, undefined, message);
        return {
          success: false,
          requiresChallenge: false,
          risk: null,
          message,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [assessRisk, canAttemptLogin, recordAttempt, createMultipleChallenges, needsChallenge]
  );

  return {
    isLoading,
    loginError,
    requiresChallenge,
    riskAssessmentData,
    attemptLogin,
  };
}

/**
 * Hook: Monitor Session Security
 * Continuously monitor session for anomalies
 */
export function useSessionSecurityMonitoring(sessionId?: string) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [sessionHealth, setSessionHealth] = useState<'healthy' | 'warning' | 'critical'>('healthy');

  useEffect(() => {
    if (!sessionId) return;

    setIsMonitoring(true);

    const interval = setInterval(() => {
      // In production, this would check actual session data
      const timeout = dynamicTimeout.getTimeout(sessionId);
      const stats = bruteForceDetection.getStatistics();

      const newAlerts: string[] = [];

      if (stats.failedAttempts > stats.successfulAttempts) {
        newAlerts.push('High ratio of failed login attempts');
      }

      if (timeout && timeout.riskLevel === 'critical') {
        newAlerts.push('Session under critical risk assessment');
      }

      setAlerts(newAlerts);

      // Determine health
      let health: typeof sessionHealth = 'healthy';
      if (newAlerts.length >= 3) {
        health = 'critical';
      } else if (newAlerts.length > 0) {
        health = 'warning';
      }
      setSessionHealth(health);
    }, 5000);

    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [sessionId]);

  return {
    isMonitoring,
    alerts,
    sessionHealth,
  };
}
