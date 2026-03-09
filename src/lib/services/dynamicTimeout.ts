/**
 * Dynamic Timeout Service
 * 
 * Adjusts session timeout based on risk factors:
 * - Risk level
 * - Device trust status
 * - Location/geography
 * - User behavior patterns
 */

import type { RiskLevel } from './riskAssessment';

export interface TimeoutConfig {
  baseTimeout: number;           // Minutes
  adjustedTimeout: number;       // Minutes, after risk calculation
  tokenRefreshInterval: number;  // Minutes
  inactivityWarning: number;     // Minutes before timeout
  maxSessionDuration: number;    // Minutes, hard limit
  riskLevel: RiskLevel;
  factors: string[];             // What factors affected timeout
}

class DynamicTimeoutService {
  // Base timeouts (in minutes)
  private readonly DEFAULT_SESSION_TIMEOUT = 1440; // 24 hours
  private readonly DEFAULT_TOKEN_REFRESH = 720; // 12 hours
  private readonly DEFAULT_INACTIVITY_WARNING = 60; // 1 hour before timeout

  // Risk-adjusted timeouts
  private readonly TIMEOUT_MULTIPLIERS = {
    low: 1.0,       // 24 hours
    medium: 0.33,   // 8 hours
    high: 0.08,     // 2 hours
    critical: 0.01, // 15 minutes
  };

  // Timeout adjustments
  private activeTimeouts: Map<string, TimeoutConfig> = new Map();
  private inactivityTimers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Calculate optimal timeout based on risk and context
   */
  calculateTimeout(
    sessionId: string,
    riskLevel: RiskLevel,
    context?: {
      isTrustedDevice?: boolean;
      isNewDevice?: boolean;
      isUnusualLocation?: boolean;
      isVpnDetected?: boolean;
      deviceAge?: number; // Days
    }
  ): TimeoutConfig {
    const baseTimeout = this.DEFAULT_SESSION_TIMEOUT;
    const multiplier = this.TIMEOUT_MULTIPLIERS[riskLevel];
    const adjustedTimeout = Math.ceil(baseTimeout * multiplier);

    // Apply additional adjustments
    let finalTimeout = adjustedTimeout;
    const factors: string[] = [`Risk level: ${riskLevel}`];

    // Device-based adjustments
    if (context?.isTrustedDevice) {
      finalTimeout = Math.ceil(finalTimeout * 1.2);
      factors.push('Trusted device bonus (+20%)');
    } else if (context?.isNewDevice) {
      finalTimeout = Math.ceil(finalTimeout * 0.7);
      factors.push('New device reduction (-30%)');
    }

    // Device age adjustment
    if (context?.deviceAge !== undefined && context.deviceAge > 180) {
      finalTimeout = Math.ceil(finalTimeout * 1.15);
      factors.push('Long-term device bonus (+15%)');
    }

    // Location-based adjustment
    if (context?.isUnusualLocation) {
      finalTimeout = Math.ceil(finalTimeout * 0.5);
      factors.push('Unusual location reduction (-50%)');
    }

    // VPN detection adjustment
    if (context?.isVpnDetected) {
      finalTimeout = Math.ceil(finalTimeout * 0.8);
      factors.push('VPN detected reduction (-20%)');
    }

    // Hard maximum limits
    finalTimeout = Math.min(finalTimeout, 1440); // Never more than 24 hours
    finalTimeout = Math.max(finalTimeout, 15);   // Never less than 15 minutes

    // Calculate derived values
    const tokenRefreshInterval = Math.floor(finalTimeout / 2); // Refresh halfway through
    const inactivityWarning = Math.max(15, Math.floor(finalTimeout / 4)); // Warning at 1/4 remaining

    const config: TimeoutConfig = {
      baseTimeout,
      adjustedTimeout: finalTimeout,
      tokenRefreshInterval,
      inactivityWarning,
      maxSessionDuration: finalTimeout,
      riskLevel,
      factors,
    };

    this.activeTimeouts.set(sessionId, config);
    return config;
  }

  /**
   * Get current timeout for session
   */
  getTimeout(sessionId: string): TimeoutConfig | undefined {
    return this.activeTimeouts.get(sessionId);
  }

  /**
   * Set up inactivity timer for session
   */
  setupInactivityTimer(
    sessionId: string,
    config: TimeoutConfig,
    onTimeout: () => void
  ): void {
    // Clear existing timer if any
    if (this.inactivityTimers.has(sessionId)) {
      clearTimeout(this.inactivityTimers.get(sessionId));
    }

    // Set new timer (subtract warning time from total timeout)
    const timeoutMs = (config.adjustedTimeout - config.inactivityWarning) * 60 * 1000;
    const timer = setTimeout(() => {
      onTimeout();
    }, timeoutMs);

    this.inactivityTimers.set(sessionId, timer);
  }

  /**
   * Reset inactivity timer on user activity
   */
  resetActivityTimer(sessionId: string, config: TimeoutConfig, onTimeout: () => void): void {
    this.setupInactivityTimer(sessionId, config, onTimeout);
  }

  /**
   * Clear timer for session
   */
  clearTimer(sessionId: string): void {
    const timer = this.inactivityTimers.get(sessionId);
    if (timer) {
      clearTimeout(timer);
      this.inactivityTimers.delete(sessionId);
    }
  }

  /**
   * Get time remaining in minutes
   */
  getTimeRemaining(sessionId: string, startTime: Date): number {
    const config = this.getTimeout(sessionId);
    if (!config) return 0;

    const elapsedMs = Date.now() - startTime.getTime();
    const totalMs = config.adjustedTimeout * 60 * 1000;
    const remainingMs = Math.max(0, totalMs - elapsedMs);

    return Math.ceil(remainingMs / 1000 / 60);
  }

  /**
   * Check if session should warn about inactivity
   */
  shouldWarn(sessionId: string, startTime: Date): boolean {
    const remaining = this.getTimeRemaining(sessionId, startTime);
    const config = this.getTimeout(sessionId);

    if (!config) return false;

    return remaining <= config.inactivityWarning;
  }

  /**
   * Check if session has expired
   */
  hasExpired(sessionId: string, startTime: Date): boolean {
    return this.getTimeRemaining(sessionId, startTime) <= 0;
  }

  /**
   * Extend session timeout (for user action during warning)
   */
  extendSession(sessionId: string, extensionMinutes?: number): TimeoutConfig | undefined {
    const config = this.getTimeout(sessionId);
    if (!config) return undefined;

    // Extend by 25% of original timeout or specified amount
    const extension = extensionMinutes || Math.ceil(config.adjustedTimeout * 0.25);
    const newTimeout = config.adjustedTimeout + extension;

    // Update config
    const updatedConfig: TimeoutConfig = {
      ...config,
      adjustedTimeout: newTimeout,
      maxSessionDuration: newTimeout,
      factors: [...config.factors, `Session extended by ${extension} minutes`],
    };

    this.activeTimeouts.set(sessionId, updatedConfig);
    return updatedConfig;
  }

  /**
   * Force session expiry
   */
  expireSession(sessionId: string): void {
    this.clearTimer(sessionId);
    this.activeTimeouts.delete(sessionId);
  }

  /**
   * Get all active timeouts
   */
  getAllTimeouts(): Array<[string, TimeoutConfig]> {
    return Array.from(this.activeTimeouts.entries());
  }

  /**
   * Export timeout data
   */
  exportData() {
    return {
      activeTimeouts: Array.from(this.activeTimeouts.entries()).map(([sessionId, config]) => ({
        sessionId,
        ...config,
      })),
      statistics: {
        activeSessions: this.activeTimeouts.size,
        averageTimeout: this.calculateAverageTimeout(),
        riskDistribution: this.calculateRiskDistribution(),
      },
    };
  }

  /**
   * Calculate average timeout
   */
  private calculateAverageTimeout(): number {
    if (this.activeTimeouts.size === 0) return 0;

    const total = Array.from(this.activeTimeouts.values()).reduce(
      (sum, config) => sum + config.adjustedTimeout,
      0
    );

    return Math.round(total / this.activeTimeouts.size);
  }

  /**
   * Calculate distribution of risk levels
   */
  private calculateRiskDistribution(): Record<RiskLevel, number> {
    const distribution: Record<RiskLevel, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const config of this.activeTimeouts.values()) {
      distribution[config.riskLevel]++;
    }

    return distribution;
  }

  /**
   * Clear all data (for testing)
   */
  clear(): void {
    for (const timer of this.inactivityTimers.values()) {
      clearTimeout(timer);
    }
    this.inactivityTimers.clear();
    this.activeTimeouts.clear();
  }
}

export const dynamicTimeout = new DynamicTimeoutService();
