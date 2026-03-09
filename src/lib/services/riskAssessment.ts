/**
 * Risk Assessment Service
 * 
 * Calculates risk scores based on multiple factors:
 * - Device trust status
 * - Location anomalies
 * - Impossible travel
 * - IP changes
 * - Login attempt frequency
 * - Time of day patterns
 * - Device age
 * - Behavioral patterns
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface RiskFactor {
  name: string;
  score: number;       // 0-100
  severity: RiskLevel; // low, medium, high, critical
  description: string;
  recommendation?: string;
}

export interface RiskAssessment {
  totalScore: number;           // 0-100
  riskLevel: RiskLevel;
  factors: RiskFactor[];
  requiresChallenge: boolean;   // Requires additional verification
  requiresReauth: boolean;      // Requires password entry again
  suggestedTimeout: number;     // Suggested session timeout in minutes
  metadata: Record<string, any>;
  timestamp: string;
}

export interface RiskContext {
  deviceId?: string;
  isTrusted?: boolean;
  userId?: string;
  currentIpAddress?: string;
  previousIpAddress?: string;
  currentLocation?: { latitude: number; longitude: number; country?: string };
  previousLocation?: { latitude: number; longitude: number; country?: string };
  currentTime?: Date;
  deviceAge?: number;               // Days since device registered
  loginAttempts?: number;           // Failed attempts in last hour
  lastLoginTime?: string;
  timeSinceLastLogin?: number;      // Minutes
  isNewDevice?: boolean;
  geolocationChanged?: boolean;
  impossibleTravel?: boolean;
  vpnDetected?: boolean;
  proxyDetected?: boolean;
  tor?: boolean;
  timeOfDay?: number;               // Hour of day (0-23)
  isUnusualTime?: boolean;
  userPattern?: {
    usualTimezones?: string[];
    usualCountries?: string[];
    usualBrowsers?: string[];
  };
}

class RiskAssessmentService {
  private readonly LOW_RISK_TIMEOUT = 1440;      // 24 hours
  private readonly MEDIUM_RISK_TIMEOUT = 480;    // 8 hours
  private readonly HIGH_RISK_TIMEOUT = 120;      // 2 hours
  private readonly CRITICAL_RISK_TIMEOUT = 15;   // 15 minutes

  /**
   * Main method: Calculate overall risk assessment
   */
  assess(context: RiskContext): RiskAssessment {
    const factors: RiskFactor[] = [];

    // Device Trust Assessment (15% weight)
    factors.push(...this.assessDeviceTrust(context));

    // Location Assessment (25% weight)
    factors.push(...this.assessLocation(context));

    // Login Attempt Assessment (20% weight)
    factors.push(...this.assessLoginAttempts(context));

    // Behavioral Pattern Assessment (20% weight)
    factors.push(...this.assessBehavioralPatterns(context));

    // Network Assessment (20% weight)
    factors.push(...this.assessNetwork(context));

    // Calculate weighted score
    const totalScore = this.calculateWeightedScore(factors);

    // Determine risk level
    const riskLevel = this.getRiskLevel(totalScore);

    // Determine if challenge/reauth required
    const requiresChallenge = totalScore >= 40;
    const requiresReauth = totalScore >= 70;
    const suggestedTimeout = this.getSuggestedTimeout(riskLevel);

    return {
      totalScore,
      riskLevel,
      factors,
      requiresChallenge,
      requiresReauth,
      suggestedTimeout,
      metadata: {
        assessmentMethod: 'weighted-scoring',
        factorCount: factors.length,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Assess device trust and security
   */
  private assessDeviceTrust(context: RiskContext): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Untrusted device
    if (context.isTrusted === false) {
      factors.push({
        name: 'Untrusted Device',
        score: 35,
        severity: 'high',
        description: 'User is logging in from a device they have not marked as trusted',
        recommendation: 'Require email verification or 2FA',
      });
    } else if (context.isTrusted === true) {
      factors.push({
        name: 'Trusted Device',
        score: -10,
        severity: 'low',
        description: 'User has previously marked this device as trusted',
      });
    }

    // New device
    if (context.isNewDevice) {
      factors.push({
        name: 'New Device',
        score: 25,
        severity: 'medium',
        description: 'Device has not been used before',
        recommendation: 'Ask user to verify email or enable 2FA',
      });
    }

    // Device age (older is lower risk)
    if (context.deviceAge !== undefined && context.deviceAge > 0) {
      if (context.deviceAge < 1) {
        factors.push({
          name: 'Very New Device',
          score: 15,
          severity: 'medium',
          description: 'Device was registered less than a day ago',
        });
      } else if (context.deviceAge > 180) {
        factors.push({
          name: 'Long-term Device',
          score: -5,
          severity: 'low',
          description: 'Device has been trusted for 6+ months',
        });
      }
    }

    return factors;
  }

  /**
   * Assess geographic and location-based risks
   */
  private assessLocation(context: RiskContext): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Impossible travel detection
    if (context.impossibleTravel) {
      factors.push({
        name: 'Impossible Travel',
        score: 90,
        severity: 'critical',
        description: 'Login from impossible distances in too short time',
        recommendation: 'Require immediate re-authentication and email verification',
      });
    }

    // Geolocation changed
    if (context.geolocationChanged) {
      const distance = this.calculateDistance(context);
      if (distance > 500) {
        factors.push({
          name: 'Large Geographic Change',
          score: 40,
          severity: 'high',
          description: `Location changed by ${distance.toLocaleString()}km since last login`,
          recommendation: 'Request email verification',
        });
      } else if (distance > 100) {
        factors.push({
          name: 'Geographic Change',
          score: 20,
          severity: 'medium',
          description: `Location changed by ${distance.toLocaleString()}km`,
        });
      }
    }

    // Location matches user pattern
    if (context.userPattern?.usualCountries) {
      const currentCountry = context.currentLocation?.country;
      if (currentCountry && !context.userPattern.usualCountries.includes(currentCountry)) {
        factors.push({
          name: 'Unusual Location',
          score: 30,
          severity: 'high',
          description: `Login from ${currentCountry}, which is unusual for this user`,
          recommendation: 'Consider requiring 2FA',
        });
      }
    }

    return factors;
  }

  /**
   * Assess login attempt patterns (brute force detection)
   */
  private assessLoginAttempts(context: RiskContext): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Multiple failed attempts
    if (context.loginAttempts && context.loginAttempts > 0) {
      if (context.loginAttempts >= 5) {
        factors.push({
          name: 'Multiple Failed Attempts',
          score: Math.min(context.loginAttempts * 15, 80),
          severity: 'critical',
          description: `${context.loginAttempts} failed login attempts in the last hour`,
          recommendation: 'Implement rate limiting and account lockout',
        });
      } else if (context.loginAttempts >= 3) {
        factors.push({
          name: 'Several Failed Attempts',
          score: 40,
          severity: 'high',
          description: `${context.loginAttempts} failed login attempts`,
          recommendation: 'Increase verification requirements',
        });
      } else {
        factors.push({
          name: 'Failed Attempt',
          score: 15,
          severity: 'medium',
          description: `${context.loginAttempts} failed login attempt(s)`,
        });
      }
    }

    return factors;
  }

  /**
   * Assess behavioral patterns (unusual times, deviations)
   */
  private assessBehavioralPatterns(context: RiskContext): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Unusual time of day
    if (context.isUnusualTime) {
      factors.push({
        name: 'Unusual Time of Day',
        score: 20,
        severity: 'medium',
        description: 'Login at an unusual time for this user',
        recommendation: 'Consider additional verification',
      });
    }

    // Time since last login
    if (context.timeSinceLastLogin !== undefined) {
      if (context.timeSinceLastLogin > 30 * 24 * 60) {
        // More than 30 days
        factors.push({
          name: 'Extended Absence',
          score: 15,
          severity: 'medium',
          description: 'User has not logged in for more than 30 days',
        });
      }
    }

    return factors;
  }

  /**
   * Assess network-based risks (VPN, proxy, Tor)
   */
  private assessNetwork(context: RiskContext): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Tor usage
    if (context.tor) {
      factors.push({
        name: 'Tor Network',
        score: 45,
        severity: 'high',
        description: 'Login detected from Tor network',
        recommendation: 'Require strong verification (email + 2FA)',
      });
    }

    // VPN usage
    if (context.vpnDetected) {
      factors.push({
        name: 'VPN Detected',
        score: 25,
        severity: 'medium',
        description: 'Login detected from VPN service',
        recommendation: 'Consider requiring additional verification',
      });
    }

    // Proxy usage
    if (context.proxyDetected) {
      factors.push({
        name: 'Proxy Detected',
        score: 20,
        severity: 'medium',
        description: 'Login detected through proxy',
        recommendation: 'Monitor for suspicious patterns',
      });
    }

    // IP address changed
    if (context.currentIpAddress && context.previousIpAddress) {
      if (context.currentIpAddress !== context.previousIpAddress) {
        factors.push({
          name: 'IP Address Changed',
          score: 15,
          severity: 'medium',
          description: `Login from new IP: ${context.currentIpAddress}`,
        });
      }
    }

    return factors;
  }

  /**
   * Calculate weighted score from factors
   * Negative scores reduce risk, positive scores increase it
   */
  private calculateWeightedScore(factors: RiskFactor[]): number {
    if (factors.length === 0) return 0;

    // Critical factors have higher weight
    let totalScore = 0;
    let weightSum = 0;

    for (const factor of factors) {
      const weight = this.getWeight(factor.severity);
      totalScore += factor.score * weight;
      weightSum += weight;
    }

    // Normalize to 0-100 range
    const normalized = totalScore / (weightSum > 0 ? weightSum : 1);
    return Math.max(0, Math.min(100, normalized));
  }

  /**
   * Get weight multiplier for severity level
   */
  private getWeight(severity: RiskLevel): number {
    switch (severity) {
      case 'critical':
        return 2.0;
      case 'high':
        return 1.5;
      case 'medium':
        return 1.0;
      case 'low':
        return 0.5;
      default:
        return 1.0;
    }
  }

  /**
   * Determine risk level from score
   */
  private getRiskLevel(score: number): RiskLevel {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  /**
   * Get suggested session timeout based on risk level
   */
  private getSuggestedTimeout(riskLevel: RiskLevel): number {
    switch (riskLevel) {
      case 'critical':
        return this.CRITICAL_RISK_TIMEOUT;
      case 'high':
        return this.HIGH_RISK_TIMEOUT;
      case 'medium':
        return this.MEDIUM_RISK_TIMEOUT;
      case 'low':
        return this.LOW_RISK_TIMEOUT;
      default:
        return this.LOW_RISK_TIMEOUT;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(context: RiskContext): number {
    if (
      !context.currentLocation ||
      !context.previousLocation ||
      context.currentLocation.latitude === undefined ||
      context.previousLocation.latitude === undefined
    ) {
      return 0;
    }

    const R = 6371; // Earth radius in km
    const lat1 = this.toRad(context.previousLocation.latitude);
    const lat2 = this.toRad(context.currentLocation.latitude);
    const deltaLat = this.toRad(context.currentLocation.latitude - context.previousLocation.latitude);
    const deltaLon = this.toRad(context.currentLocation.longitude - context.previousLocation.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get risk assessment explanation for user
   */
  getRiskExplanation(assessment: RiskAssessment): string {
    const factors = assessment.factors
      .filter((f) => f.score > 10)
      .map((f) => `- ${f.description}`)
      .join('\n');

    return `
Risk Assessment (${assessment.riskLevel.toUpperCase()}):

${factors || 'No significant risk factors detected.'}

Reason: ${
      assessment.riskLevel === 'critical'
        ? 'This login attempt has multiple concerning factors. Please verify your identity.'
        : assessment.riskLevel === 'high'
          ? 'This login appears unusual. Additional verification required.'
          : assessment.riskLevel === 'medium'
            ? 'This login has some unusual characteristics. We may request verification.'
            : 'This login appears normal.'
    }
    `.trim();
  }
}

export const riskAssessment = new RiskAssessmentService();
