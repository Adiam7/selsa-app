/**
 * Authentication Challenge Service
 * 
 * Handles additional verification requirements:
 * - Email verification
 * - SMS/OTP verification
 * - 2FA challenges
 * - CAPTCHA
 * - Security questions
 * - Re-authentication prompts
 */

export type ChallengeType = 'email' | 'otp' | 'totp' | 'captcha' | 'security_questions' | 'reauth';

export interface Challenge {
  id: string;
  type: ChallengeType;
  sessionId: string;
  email?: string;
  createdAt: string;
  expiresAt: string;
  isCompleted: boolean;
  completedAt?: string;
  attempts: number;
  maxAttempts: number;
  metadata?: Record<string, any>;
}

export interface ChallengeResponse {
  id: string;
  type: ChallengeType;
  verified: boolean;
  message: string;
  newSessionToken?: string;
}

class AuthChallengeService {
  private challenges: Map<string, Challenge> = new Map();
  private challengeHistory: Challenge[] = [];

  // Configuration
  private readonly CHALLENGE_EXPIRY_MINUTES = 10; // Challenges expire after 10 minutes
  private readonly MAX_ATTEMPTS = 3;
  private readonly EMAIL_COOLDOWN_SECONDS = 60; // Wait 60 seconds before sending another email

  /**
   * Create a new authentication challenge
   */
  createChallenge(
    sessionId: string,
    type: ChallengeType,
    email?: string,
    metadata?: Record<string, any>
  ): Challenge {
    const id = this.generateId();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.CHALLENGE_EXPIRY_MINUTES * 60 * 1000);

    const challenge: Challenge = {
      id,
      type,
      sessionId,
      email,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isCompleted: false,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      metadata,
    };

    this.challenges.set(id, challenge);

    // Send challenge if applicable
    this.sendChallenge(challenge);

    return challenge;
  }

  /**
   * Send challenge to user (email, SMS, etc.)
   */
  private sendChallenge(challenge: Challenge): void {
    switch (challenge.type) {
      case 'email':
        this.sendEmailChallenge(challenge);
        break;
      case 'otp':
        this.sendOtpChallenge(challenge);
        break;
      case 'totp':
        // TOTP uses authenticator app, no delivery needed
        break;
      case 'captcha':
        // CAPTCHA displayed client-side, no delivery needed
        break;
      case 'security_questions':
        // Questions displayed client-side, no delivery needed
        break;
      case 'reauth':
        // Re-auth prompt displayed client-side
        break;
    }
  }

  /**
   * Send email verification challenge
   */
  private sendEmailChallenge(challenge: Challenge): void {
    if (!challenge.email) return;

    // In production, this would send an actual email
    const verificationCode = this.generateCode();
    challenge.metadata = challenge.metadata || {};
    challenge.metadata.verificationCode = verificationCode;

    console.log(`[EMAIL CHALLENGE] Sending code ${verificationCode} to ${challenge.email}`);

    // Store in metadata for verification
    // In real app, this would be sent via email service
  }

  /**
   * Send OTP (One-Time Password) challenge
   */
  private sendOtpChallenge(challenge: Challenge): void {
    const otp = this.generateCode();
    challenge.metadata = challenge.metadata || {};
    challenge.metadata.otp = otp;

    console.log(`[OTP CHALLENGE] OTP: ${otp} (validity: 10 minutes)`);

    // In production, this would send via SMS
  }

  /**
   * Verify a challenge response
   */
  verifyChallengeResponse(challengeId: string, response: string): ChallengeResponse {
    const challenge = this.challenges.get(challengeId);

    if (!challenge) {
      return {
        id: challengeId,
        type: 'email',
        verified: false,
        message: 'Challenge not found or has expired.',
      };
    }

    // Check if expired
    if (new Date(challenge.expiresAt).getTime() < Date.now()) {
      this.challenges.delete(challengeId);
      return {
        id: challengeId,
        type: challenge.type,
        verified: false,
        message: 'Challenge has expired. Please request a new one.',
      };
    }

    // Check if already completed
    if (challenge.isCompleted) {
      return {
        id: challengeId,
        type: challenge.type,
        verified: false,
        message: 'Challenge has already been completed.',
      };
    }

    // Check attempts
    if (challenge.attempts >= challenge.maxAttempts) {
      this.challenges.delete(challengeId);
      return {
        id: challengeId,
        type: challenge.type,
        verified: false,
        message: `Maximum attempts exceeded. Please request a new ${challenge.type} challenge.`,
      };
    }

    challenge.attempts++;

    // Verify based on challenge type
    const isValid = this.verifyResponse(challenge, response);

    if (isValid) {
      challenge.isCompleted = true;
      challenge.completedAt = new Date().toISOString();
      this.challengeHistory.push(challenge);

      return {
        id: challengeId,
        type: challenge.type,
        verified: true,
        message: `${challenge.type} verification successful.`,
        newSessionToken: this.generateSessionToken(),
      };
    } else {
      const attemptsLeft = challenge.maxAttempts - challenge.attempts;
      return {
        id: challengeId,
        type: challenge.type,
        verified: false,
        message: `Invalid ${challenge.type}. ${attemptsLeft} attempt(s) remaining.`,
      };
    }
  }

  /**
   * Verify challenge response based on type
   */
  private verifyResponse(challenge: Challenge, response: string): boolean {
    switch (challenge.type) {
      case 'email':
      case 'otp':
        // Compare against stored code
        const code = challenge.metadata?.verificationCode || challenge.metadata?.otp;
        return response === code;

      case 'totp':
        // In production, verify against TOTP algorithm
        // For now, accept 6-digit codes
        return /^\d{6}$/.test(response);

      case 'captcha':
        // In production, verify via reCAPTCHA API
        // For demo, any response works
        return true;

      case 'security_questions':
        // In production, compare against stored answers
        // For demo, any response works
        return true;

      case 'reauth':
        // Verify password (in production)
        // For demo, any response works
        return true;

      default:
        return false;
    }
  }

  /**
   * Get challenge by ID
   */
  getChallenge(challengeId: string): Challenge | undefined {
    return this.challenges.get(challengeId);
  }

  /**
   * Get active challenges for session
   */
  getActiveChallenges(sessionId: string): Challenge[] {
    return Array.from(this.challenges.values()).filter(
      (c) => c.sessionId === sessionId && !c.isCompleted && new Date(c.expiresAt).getTime() > Date.now()
    );
  }

  /**
   * Resend challenge (e.g., resend email)
   */
  resendChallenge(challengeId: string): ChallengeResponse {
    const challenge = this.challenges.get(challengeId);

    if (!challenge) {
      return {
        id: challengeId,
        type: 'email',
        verified: false,
        message: 'Challenge not found.',
      };
    }

    // Check cooldown
    const timeSinceCreation = (Date.now() - new Date(challenge.createdAt).getTime()) / 1000;
    if (timeSinceCreation < this.EMAIL_COOLDOWN_SECONDS) {
      const waitTime = Math.ceil(this.EMAIL_COOLDOWN_SECONDS - timeSinceCreation);
      return {
        id: challengeId,
        type: challenge.type,
        verified: false,
        message: `Please wait ${waitTime} seconds before requesting again.`,
      };
    }

    // Resend
    this.sendChallenge(challenge);

    return {
      id: challengeId,
      type: challenge.type,
      verified: false,
      message: `${challenge.type} challenge re-sent. Check your ${challenge.email || 'registered'} email.`,
    };
  }

  /**
   * Cancel challenge
   */
  cancelChallenge(challengeId: string): void {
    this.challenges.delete(challengeId);
  }

  /**
   * Get challenge history for session
   */
  getChallengeHistory(sessionId: string): Challenge[] {
    return this.challengeHistory.filter((c) => c.sessionId === sessionId);
  }

  /**
   * Check if user needs additional challenges
   */
  needsChallenge(riskLevel: string, deviceTrusted: boolean): ChallengeType[] {
    const challenges: ChallengeType[] = [];

    switch (riskLevel) {
      case 'critical':
        challenges.push('email', 'otp'); // Email + OTP
        break;
      case 'high':
        challenges.push('email'); // At least email verification
        break;
      case 'medium':
        if (!deviceTrusted) {
          challenges.push('email');
        }
        break;
      case 'low':
        // No additional challenge needed
        break;
    }

    return challenges;
  }

  /**
   * Generate random code (6 digits)
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generate random ID
   */
  private generateId(): string {
    return `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session token
   */
  private generateSessionToken(): string {
    return `st_${Date.now()}_${Math.random().toString(36).substr(2, 20)}`;
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const completed = this.challengeHistory.length;
    const pending = this.challenges.size;
    const byType: Record<ChallengeType, number> = {
      email: 0,
      otp: 0,
      totp: 0,
      captcha: 0,
      security_questions: 0,
      reauth: 0,
    };

    for (const challenge of this.challengeHistory) {
      byType[challenge.type]++;
    }

    return {
      completed,
      pending,
      byType,
      total: completed + pending,
    };
  }

  /**
   * Clear expired challenges
   */
  clearExpired(): void {
    const now = Date.now();
    for (const [id, challenge] of this.challenges) {
      if (new Date(challenge.expiresAt).getTime() < now) {
        this.challenges.delete(id);
      }
    }
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.challenges.clear();
    this.challengeHistory = [];
  }

  /**
   * Export data
   */
  exportData() {
    return {
      activeChallenges: Array.from(this.challenges.values()),
      history: this.challengeHistory,
      statistics: this.getStatistics(),
    };
  }
}

export const authChallenge = new AuthChallengeService();
