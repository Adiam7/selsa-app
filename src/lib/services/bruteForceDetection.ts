/**
 * Brute Force Detection Service
 * 
 * Tracks and detects brute force attacks by:
 * - Monitoring failed login attempts
 * - Tracking attempts by IP and email
 * - Implementing progressive lockout
 * - Detecting distributed attacks
 */

export interface LoginAttempt {
  email: string;
  ipAddress: string;
  timestamp: string;
  success: boolean;
  reason?: string; // Why it failed
  userAgent?: string;
}

export interface AttemptPattern {
  email: string;
  ipAddress: string;
  failedCount: number;
  successCount: number;
  lastAttempt: string;
  isLocked: boolean;
  lockUntil?: string;
  locations: string[];
}

export interface BruteForceDetection {
  isAttackDetected: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  failedAttempts: number;
  successfulAttempts: number;
  shouldLockAccount: boolean;
  lockDuration?: number;    // Minutes
  suggestedAction: string;
  message: string;
}

class BruteForceDetectionService {
  private loginAttempts: LoginAttempt[] = [];
  private lockedAccounts: Map<string, Date> = new Map();
  private ipBlacklist: Map<string, Date> = new Map();

  // Configuration
  private readonly MAX_ATTEMPTS_PER_HOUR = 5;
  private readonly MAX_ATTEMPTS_PER_DAY = 20;
  private readonly MAX_ATTEMPTS_PER_EMAIL = 10;
  private readonly LOCKOUT_DURATION_MINUTES = 15;
  private readonly PROGRESSIVE_LOCKOUT_MULTIPLIER = 2;
  private readonly IP_BLACKLIST_DURATION_HOURS = 24;

  /**
   * Record a login attempt
   */
  recordAttempt(
    email: string,
    ipAddress: string,
    success: boolean,
    userAgent?: string,
    reason?: string
  ): BruteForceDetection {
    const attempt: LoginAttempt = {
      email: email.toLowerCase(),
      ipAddress,
      timestamp: new Date().toISOString(),
      success,
      userAgent,
      reason,
    };

    this.loginAttempts.push(attempt);

    // Clean old attempts (older than 24 hours)
    this.cleanOldAttempts();

    // Check if attack is happening
    return this.detectAttack(email, ipAddress);
  }

  /**
   * Check if a login should be allowed or blocked
   */
  canAttemptLogin(email: string, ipAddress: string): BruteForceDetection {
    email = email.toLowerCase();

    // Check if account is locked
    if (this.isAccountLocked(email)) {
      const lockTime = this.lockedAccounts.get(email);
      const minutesLeft = lockTime
        ? Math.ceil((lockTime.getTime() - Date.now()) / 1000 / 60)
        : 0;

      return {
        isAttackDetected: true,
        severity: 'high',
        failedAttempts: this.getFailedAttempts(email),
        successfulAttempts: this.getSuccessfulAttempts(email),
        shouldLockAccount: true,
        lockDuration: minutesLeft,
        suggestedAction: 'wait',
        message: `Account temporarily locked. Try again in ${minutesLeft} minutes.`,
      };
    }

    // Check if IP is blacklisted
    if (this.isIpBlacklisted(ipAddress)) {
      return {
        isAttackDetected: true,
        severity: 'critical',
        failedAttempts: this.getFailedAttemptsFromIp(ipAddress),
        successfulAttempts: 0,
        shouldLockAccount: false,
        suggestedAction: 'block',
        message: 'IP address temporarily blocked due to suspicious activity.',
      };
    }

    // Check attempt patterns
    return this.detectAttack(email, ipAddress);
  }

  /**
   * Detect brute force attack patterns
   */
  private detectAttack(email: string, ipAddress: string): BruteForceDetection {
    email = email.toLowerCase();

    const emailAttempts = this.getAttemptsForEmail(email);
    const emailFailedLast1h = emailAttempts.last1h.failed;
    const emailFailedLast24h = emailAttempts.last24h.failed;

    const ipAttempts = this.getAttemptsForIp(ipAddress);
    const ipFailedLast1h = ipAttempts.last1h.failed;

    // Calculate severity
    let severity: BruteForceDetection['severity'] = 'none';
    let isAttackDetected = false;
    let shouldLockAccount = false;

    // Email-based detection
    if (emailFailedLast1h >= 5) {
      severity = 'critical';
      isAttackDetected = true;
      shouldLockAccount = true;
      this.lockAccount(email);
      this.blacklistIp(ipAddress);
    } else if (emailFailedLast1h >= 3) {
      severity = 'high';
      isAttackDetected = true;
    } else if (emailFailedLast24h >= 10) {
      severity = 'high';
      isAttackDetected = true;
      shouldLockAccount = true;
      this.lockAccount(email);
    } else if (emailFailedLast1h >= 2) {
      severity = 'medium';
      isAttackDetected = true;
    }

    // IP-based detection (distributed attack)
    if (ipFailedLast1h >= 10) {
      severity = 'critical';
      isAttackDetected = true;
      this.blacklistIp(ipAddress);
    } else if (ipFailedLast1h >= 5) {
      severity = 'high';
      isAttackDetected = true;
    }

    const suggestedAction = shouldLockAccount ? 'lock' : isAttackDetected ? 'challenge' : 'allow';
    const message = this.getAttackMessage(severity, emailFailedLast1h, emailFailedLast24h);

    return {
      isAttackDetected,
      severity,
      failedAttempts: emailFailedLast1h,
      successfulAttempts: emailAttempts.last1h.successful,
      shouldLockAccount,
      lockDuration: shouldLockAccount ? this.LOCKOUT_DURATION_MINUTES : undefined,
      suggestedAction,
      message,
    };
  }

  /**
   * Lock an account temporarily
   */
  private lockAccount(email: string, durationMinutes?: number): void {
    email = email.toLowerCase();
    const lockCount = Array.from(this.lockedAccounts.entries()).filter(
      ([e]) => e === email
    ).length;

    // Progressive lockout: each lock doubles the duration
    const duration = (durationMinutes || this.LOCKOUT_DURATION_MINUTES) * Math.pow(this.PROGRESSIVE_LOCKOUT_MULTIPLIER, lockCount);
    const lockUntil = new Date(Date.now() + duration * 60 * 1000);

    this.lockedAccounts.set(email, lockUntil);
  }

  /**
   * Check if account is currently locked
   */
  private isAccountLocked(email: string): boolean {
    email = email.toLowerCase();
    const lockUntil = this.lockedAccounts.get(email);

    if (!lockUntil) return false;

    if (Date.now() > lockUntil.getTime()) {
      this.lockedAccounts.delete(email);
      return false;
    }

    return true;
  }

  /**
   * Unlock account manually
   */
  unlockAccount(email: string): void {
    this.lockedAccounts.delete(email.toLowerCase());
  }

  /**
   * Blacklist IP address
   */
  private blacklistIp(ipAddress: string, durationHours?: number): void {
    const duration = (durationHours || this.IP_BLACKLIST_DURATION_HOURS) * 60 * 60 * 1000;
    const blacklistUntil = new Date(Date.now() + duration);
    this.ipBlacklist.set(ipAddress, blacklistUntil);
  }

  /**
   * Check if IP is blacklisted
   */
  private isIpBlacklisted(ipAddress: string): boolean {
    const blacklistUntil = this.ipBlacklist.get(ipAddress);

    if (!blacklistUntil) return false;

    if (Date.now() > blacklistUntil.getTime()) {
      this.ipBlacklist.delete(ipAddress);
      return false;
    }

    return true;
  }

  /**
   * Remove IP from blacklist
   */
  removeIpFromBlacklist(ipAddress: string): void {
    this.ipBlacklist.delete(ipAddress);
  }

  /**
   * Get attempt statistics for email
   */
  private getAttemptsForEmail(email: string) {
    email = email.toLowerCase();
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const last1h = this.loginAttempts.filter(
      (a) => a.email === email && new Date(a.timestamp).getTime() > oneHourAgo
    );

    const last24h = this.loginAttempts.filter(
      (a) => a.email === email && new Date(a.timestamp).getTime() > oneDayAgo
    );

    return {
      last1h: {
        failed: last1h.filter((a) => !a.success).length,
        successful: last1h.filter((a) => a.success).length,
      },
      last24h: {
        failed: last24h.filter((a) => !a.success).length,
        successful: last24h.filter((a) => a.success).length,
      },
    };
  }

  /**
   * Get attempt statistics for IP
   */
  private getAttemptsForIp(ipAddress: string) {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const last1h = this.loginAttempts.filter(
      (a) => a.ipAddress === ipAddress && new Date(a.timestamp).getTime() > oneHourAgo
    );

    return {
      last1h: {
        failed: last1h.filter((a) => !a.success).length,
        successful: last1h.filter((a) => a.success).length,
      },
    };
  }

  /**
   * Get failed attempts count for email in last hour
   */
  private getFailedAttempts(email: string): number {
    return this.getAttemptsForEmail(email).last1h.failed;
  }

  /**
   * Get successful attempts count for email in last hour
   */
  private getSuccessfulAttempts(email: string): number {
    return this.getAttemptsForEmail(email).last1h.successful;
  }

  /**
   * Get failed attempts count from IP
   */
  private getFailedAttemptsFromIp(ipAddress: string): number {
    return this.getAttemptsForIp(ipAddress).last1h.failed;
  }

  /**
   * Get user-friendly message about attack severity
   */
  private getAttackMessage(severity: string, last1h: number, last24h: number): string {
    switch (severity) {
      case 'critical':
        return `Your account has been temporarily locked due to ${last1h} failed login attempts. Please try again in 15 minutes or reset your password.`;
      case 'high':
        return `We detected ${last1h} failed login attempts. Your account is being protected.`;
      case 'medium':
        return `${last1h} failed login attempt(s) detected. Please verify your credentials carefully.`;
      default:
        return '';
    }
  }

  /**
   * Clean login attempts older than 24 hours
   */
  private cleanOldAttempts(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.loginAttempts = this.loginAttempts.filter((a) => new Date(a.timestamp).getTime() > oneDayAgo);
  }

  /**
   * Get all attempt patterns
   */
  getAttemptPatterns(): AttemptPattern[] {
    const patterns = new Map<string, AttemptPattern>();

    for (const attempt of this.loginAttempts) {
      const key = `${attempt.email}:${attempt.ipAddress}`;

      if (!patterns.has(key)) {
        patterns.set(key, {
          email: attempt.email,
          ipAddress: attempt.ipAddress,
          failedCount: 0,
          successCount: 0,
          lastAttempt: attempt.timestamp,
          isLocked: this.isAccountLocked(attempt.email),
          locations: [],
        });
      }

      const pattern = patterns.get(key)!;
      if (attempt.success) {
        pattern.successCount++;
      } else {
        pattern.failedCount++;
      }
      pattern.lastAttempt = attempt.timestamp;
    }

    return Array.from(patterns.values());
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const totalAttempts = this.loginAttempts.length;
    const failedAttempts = this.loginAttempts.filter((a) => !a.success).length;
    const successfulAttempts = this.loginAttempts.filter((a) => a.success).length;
    const lockedAccountsCount = this.lockedAccounts.size;
    const blacklistedIpsCount = this.ipBlacklist.size;

    return {
      totalAttempts,
      failedAttempts,
      successfulAttempts,
      successRate: totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0,
      lockedAccountsCount,
      blacklistedIpsCount,
      uniqueEmails: new Set(this.loginAttempts.map((a) => a.email)).size,
      uniqueIps: new Set(this.loginAttempts.map((a) => a.ipAddress)).size,
    };
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    this.loginAttempts = [];
    this.lockedAccounts.clear();
    this.ipBlacklist.clear();
  }

  /**
   * Export data
   */
  exportData() {
    return {
      attempts: this.loginAttempts,
      lockedAccounts: Array.from(this.lockedAccounts.entries()),
      blacklistedIps: Array.from(this.ipBlacklist.entries()),
      patterns: this.getAttemptPatterns(),
      statistics: this.getStatistics(),
    };
  }
}

export const bruteForceDetection = new BruteForceDetectionService();
