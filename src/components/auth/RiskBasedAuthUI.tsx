/**
 * Risk-Based Authentication UI Components
 * 
 * React components for risk-based authentication UI
 */

'use client';

import React, { useState } from 'react';
import type { RiskAssessment, RiskLevel } from '@/lib/services/riskAssessment';
import type { Challenge, ChallengeType } from '@/lib/services/authChallenge';

// ============================================================================
// Risk Assessment Display
// ============================================================================

interface RiskBadgeProps {
  riskLevel: RiskLevel;
  score?: number;
}

export function RiskBadge({ riskLevel, score }: RiskBadgeProps) {
  const colors: Record<RiskLevel, string> = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300',
  };

  const icons: Record<RiskLevel, string> = {
    low: '✓',
    medium: '⚠',
    high: '⚠️',
    critical: '🚨',
  };

  return (
    <div className={`inline-block px-3 py-1 rounded-full border ${colors[riskLevel]}`}>
      <span className="mr-1">{icons[riskLevel]}</span>
      <span className="font-medium capitalize">{riskLevel}</span>
      {score !== undefined && <span className="ml-1 text-sm">({Math.round(score)})</span>}
    </div>
  );
}

// ============================================================================
// Risk Assessment Card
// ============================================================================

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
  onDismiss?: () => void;
}

export function RiskAssessmentCard({ assessment, onDismiss }: RiskAssessmentCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{t('Risk Assessment')}</h3>
          <p className="text-sm text-gray-600 mt-1">{t('Security analysis of your login attempt')}</p>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600">{t('✕')}</button>
        )}
      </div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{t('Risk Level')}</span>
          <RiskBadge riskLevel={assessment.riskLevel} score={assessment.totalScore} />
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              assessment.riskLevel === 'critical'
                ? 'bg-red-600'
                : assessment.riskLevel === 'high'
                  ? 'bg-orange-600'
                  : assessment.riskLevel === 'medium'
                    ? 'bg-yellow-600'
                    : 'bg-green-600'
            }`}
            style={{ width: `${assessment.totalScore}%` }}
          ></div>
        </div>
      </div>
      {assessment.factors.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">{t('Risk Factors')}</h4>
          <div className="space-y-2">
            {assessment.factors
              .filter((f) => f.score !== 0)
              .map((factor, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 bg-gray-50 rounded">
                  <span className="mt-1 text-lg">
                    {factor.severity === 'critical'
                      ? '🚨'
                      : factor.severity === 'high'
                        ? '⚠️'
                        : factor.severity === 'medium'
                          ? '⚠'
                          : '✓'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{factor.name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{factor.description}</p>
                    {factor.recommendation && (
                      <p className="text-xs text-blue-600 mt-1">{t('💡')}{factor.recommendation}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      {assessment.requiresChallenge && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
          <span className="font-medium">{t('Additional verification required')}</span>
          <p className="mt-1 text-xs">For your security, please verify your identity.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Session Timeout Warning
// ============================================================================

interface SessionTimeoutWarningProps {
  timeRemaining: number; // Minutes
  onExtend: () => void;
  onLogout: () => void;
}

export function SessionTimeoutWarning({ timeRemaining, onExtend, onLogout }: SessionTimeoutWarningProps) {
  const formatTime = (minutes: number) => {
    if (minutes <= 1) return 'less than 1 minute';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow-lg max-w-md">
      <div className="flex items-start gap-3">
        <span className="text-xl">{t('⏱️')}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900">{t('Your session is expiring')}</h3>
          <p className="text-sm text-yellow-800 mt-1">{t('You\'ll be logged out in')}{formatTime(timeRemaining)}{t('. Do you want to stay logged in?')}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onExtend}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm font-medium"
            >{t('Stay Logged In')}</button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white text-yellow-900 border border-yellow-300 rounded hover:bg-yellow-50 text-sm font-medium"
            >{t('Logout')}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Authentication Challenge Modal
// ============================================================================

interface AuthChallengeChallengeModalProps {
  challenge: Challenge;
  onVerify: (code: string) => void;
  onResend: () => void;
  isVerifying?: boolean;
  error?: string;
}

export function AuthChallengeModal({
  challenge,
  onVerify,
  onResend,
  isVerifying,
  error,
}: AuthChallengeChallengeModalProps) {
  const [code, setCode] = useState('');

  const getChallengeText = () => {
    switch (challenge.type) {
      case 'email':
        return `We sent a verification code to ${challenge.email}. Please enter it below.`;
      case 'otp':
        return 'Enter the one-time password sent to your registered phone number.';
      case 'totp':
        return 'Enter the 6-digit code from your authenticator app.';
      case 'captcha':
        return 'Please verify that you are human.';
      case 'security_questions':
        return 'Please answer your security questions to verify your identity.';
      case 'reauth':
        return 'For security, please re-enter your password.';
      default:
        return 'Please complete this verification.';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(code);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <span className="text-4xl">{t('🔐')}</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Verify Your Identity</h2>
          <p className="text-gray-600 text-sm mt-2">{getChallengeText()}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {challenge.type === 'captcha' ? (
            <div className="bg-gray-100 border-2 border-gray-300 rounded p-4 mb-4">
              <p className="text-center text-gray-600">reCAPTCHA widget would appear here</p>
            </div>
          ) : (
            <input
              type="text"
              placeholder={
                challenge.type === 'totp' || challenge.type === 'otp' ? '000000' : 'Enter code'
              }
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-center text-lg tracking-widest mb-4"
              disabled={isVerifying}
              maxLength={6}
            />
          )}

          {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

          <button
            type="submit"
            disabled={isVerifying || (challenge.type !== 'captcha' && !code)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>

          <button
            type="button"
            onClick={onResend}
            className="w-full mt-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium text-sm"
          >
            Didn't receive it? Resend
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">{t('Attempts remaining:')}{challenge.maxAttempts - challenge.attempts}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// Risk Warning Banner
// ============================================================================

interface RiskWarningBannerProps {
  riskLevel: RiskLevel;
  message: string;
  onDismiss?: () => void;
}

export function RiskWarningBanner({ riskLevel, message, onDismiss }: RiskWarningBannerProps) {
  const bgColors: Record<RiskLevel, string> = {
    low: 'bg-green-50 border-green-300',
    medium: 'bg-yellow-50 border-yellow-300',
    high: 'bg-orange-50 border-orange-300',
    critical: 'bg-red-50 border-red-300',
  };

  const textColors: Record<RiskLevel, string> = {
    low: 'text-green-800',
    medium: 'text-yellow-800',
    high: 'text-orange-800',
    critical: 'text-red-800',
  };

  return (
    <div className={`border-l-4 ${bgColors[riskLevel]} p-4 mb-4 flex justify-between items-center`}>
      <div className={`${textColors[riskLevel]} text-sm`}>
        <p className="font-medium">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 ml-4">{t('✕')}</button>
      )}
    </div>
  );
}

// ============================================================================
// Brute Force Protection Alert
// ============================================================================

interface BruteForceAlertProps {
  failedAttempts: number;
  maxAttempts?: number;
  lockDuration?: number;
  onUnlock?: () => void;
}

export function BruteForceAlert({
  failedAttempts,
  maxAttempts = 5,
  lockDuration = 15,
  onUnlock,
}: BruteForceAlertProps) {
  const isLocked = failedAttempts >= maxAttempts;
  const attemptsLeft = Math.max(0, maxAttempts - failedAttempts);

  return (
    <div className="bg-red-50 border border-red-300 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{t('🔒')}</span>
        <div className="flex-1">
          {isLocked ? (
            <>
              <h3 className="font-semibold text-red-900">{t('Account Temporarily Locked')}</h3>
              <p className="text-sm text-red-800 mt-1">{t('Too many failed login attempts. Your account is locked for')}{lockDuration}{t('minutes.')}</p>
              {onUnlock && (
                <button
                  onClick={onUnlock}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
                >{t('Request Early Unlock')}</button>
              )}
            </>
          ) : (
            <>
              <h3 className="font-semibold text-red-900">{t('Multiple Failed Attempts')}</h3>
              <p className="text-sm text-red-800 mt-1">{t('You have')}{attemptsLeft}{t('attempt(s) remaining before your account is locked.')}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Session Health Indicator
// ============================================================================

interface SessionHealthIndicatorProps {
  health: 'healthy' | 'warning' | 'critical';
  alerts?: string[];
}

export function SessionHealthIndicator({ health, alerts = [] }: SessionHealthIndicatorProps) {
  const colors: Record<typeof health, string> = {
    healthy: 'bg-green-100 text-green-900',
    warning: 'bg-yellow-100 text-yellow-900',
    critical: 'bg-red-100 text-red-900',
  };

  const statusText: Record<typeof health, string> = {
    healthy: 'All systems secure',
    warning: 'Some concerns detected',
    critical: 'Immediate attention needed',
  };

  return (
    <div className={`p-4 rounded-lg ${colors[health]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">
          {health === 'healthy' ? '✓' : health === 'warning' ? '⚠' : '🚨'}
        </span>
        <p className="font-medium">{statusText[health]}</p>
      </div>
      {alerts.length > 0 && (
        <ul className="text-sm space-y-1 ml-6">
          {alerts.map((alert, idx) => (
            <li key={idx}>{t('•')}{alert}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
