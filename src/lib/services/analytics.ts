/**
 * Analytics Service
 * Tracks user journey: login → browse → add to cart → checkout → logout
 * Provides insights into user behavior and conversion patterns
 */

import { logger } from './logger';

export interface UserJourneyEvent {
  eventId: string;
  eventName: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  category: 'navigation' | 'interaction' | 'conversion' | 'error';
  properties?: Record<string, any>;
  pageUrl?: string;
  referrer?: string;
}

export interface UserJourneySession {
  sessionId: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  events: UserJourneyEvent[];
  totalDuration?: number;
  eventCount: number;
  lastActivity: string;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    browser: string;
  };
}

class AnalyticsService {
  private currentSession: UserJourneySession | null = null;
  private eventBuffer: UserJourneyEvent[] = [];
  private bufferFlushInterval: NodeJS.Timeout | null = null;
  private sessionStorage: UserJourneySession[] = [];
  private eventIdCounter = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeSession();
      this.setupPageVisibilityTracking();
      this.setupUnloadTracking();
    }
  }

  /**
   * Initialize a new analytics session
   */
  private initializeSession(): void {
    if (!this.currentSession) {
      this.currentSession = {
        sessionId: this.generateSessionId(),
        startTime: new Date().toISOString(),
        events: [],
        eventCount: 0,
        lastActivity: new Date().toISOString(),
        deviceInfo: this.getDeviceInfo(),
      };

      logger.user('Session started', {
        sessionId: this.currentSession.sessionId,
      });
    }
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `evt_${++this.eventIdCounter}_${Date.now()}`;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `analytics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get device information
   */
  private getDeviceInfo() {
    if (typeof navigator === 'undefined') return undefined;

    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    const browser = this.detectBrowser();

    return { userAgent, platform, browser };
  }

  /**
   * Detect browser type
   */
  private detectBrowser(): string {
    if (typeof navigator === 'undefined') return 'unknown';

    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Edge')) return 'Edge';
    return 'Other';
  }

  /**
   * Track page visibility changes (when user switches tabs)
   */
  private setupPageVisibilityTracking(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden', 'navigation', {
          reason: 'user_switched_tab_or_minimized',
        });
      } else {
        this.trackEvent('page_visible', 'navigation', {
          reason: 'user_returned_to_tab',
          timeSinceLastActivity: Date.now() - new Date(this.currentSession?.lastActivity || Date.now()).getTime(),
        });
      }
    });
  }

  /**
   * Track when user leaves the site
   */
  private setupUnloadTracking(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeunload', () => {
      if (this.currentSession) {
        this.flushEventBuffer(true);
      }
    });
  }

  /**
   * Track user navigation (page views)
   */
  trackPageView(pageName: string, properties?: Record<string, any>): UserJourneyEvent {
    this.ensureSession();

    return this.trackEvent('page_view', 'navigation', {
      pageName,
      ...properties,
    });
  }

  /**
   * Track product interactions
   */
  trackProductInteraction(
    action: 'viewed' | 'added_to_cart' | 'removed_from_cart' | 'favorited' | 'unfavorited',
    productId: string,
    properties?: Record<string, any>
  ): UserJourneyEvent {
    this.ensureSession();

    return this.trackEvent(`product_${action}`, 'interaction', {
      productId,
      ...properties,
    });
  }

  /**
   * Track checkout events
   */
  trackCheckoutEvent(
    step: 'started' | 'address_entered' | 'payment_entered' | 'completed' | 'abandoned',
    properties?: Record<string, any>
  ): UserJourneyEvent {
    this.ensureSession();

    return this.trackEvent(`checkout_${step}`, 'conversion', {
      checkoutStep: step,
      ...properties,
    });
  }

  /**
   * Track search queries
   */
  trackSearch(query: string, resultsCount?: number): UserJourneyEvent {
    this.ensureSession();

    return this.trackEvent('search', 'interaction', {
      query,
      resultsCount,
    });
  }

  /**
   * Track filter/sort actions
   */
  trackFilterAction(filterType: string, value: string, properties?: Record<string, any>): UserJourneyEvent {
    this.ensureSession();

    return this.trackEvent('filter_applied', 'interaction', {
      filterType,
      value,
      ...properties,
    });
  }

  /**
   * Track authentication events
   */
  trackAuthEvent(
    action: 'login_started' | 'login_completed' | 'login_failed' | 'signup_started' | 'signup_completed' | 'logout',
    properties?: Record<string, any>
  ): UserJourneyEvent {
    this.ensureSession();

    return this.trackEvent(`auth_${action}`, 'navigation', {
      ...properties,
    });
  }

  /**
   * Track error events
   */
  trackErrorEvent(errorMessage: string, errorCode?: string, properties?: Record<string, any>): UserJourneyEvent {
    this.ensureSession();

    return this.trackEvent('error_occurred', 'error', {
      errorMessage,
      errorCode,
      ...properties,
    });
  }

  /**
   * Core event tracking method
   */
  private trackEvent(
    eventName: string,
    category: 'navigation' | 'interaction' | 'conversion' | 'error',
    properties?: Record<string, any>
  ): UserJourneyEvent {
    if (!this.currentSession) {
      this.initializeSession();
    }

    const event: UserJourneyEvent = {
      eventId: this.generateEventId(),
      eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.currentSession!.sessionId,
      category,
      properties,
      pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    };

    // Add to buffer
    this.eventBuffer.push(event);
    this.currentSession!.events.push(event);
    this.currentSession!.eventCount++;
    this.currentSession!.lastActivity = event.timestamp;

    logger.user(`[${eventName}]`, {
      eventId: event.eventId,
      properties,
    });

    // Auto-flush if buffer is large
    if (this.eventBuffer.length >= 10) {
      this.flushEventBuffer();
    }

    // Setup periodic flush if not already done
    if (!this.bufferFlushInterval) {
      this.bufferFlushInterval = setInterval(() => this.flushEventBuffer(), 30000); // Flush every 30 seconds
    }

    return event;
  }

  /**
   * Ensure session exists
   */
  private ensureSession(): void {
    if (!this.currentSession) {
      this.initializeSession();
    }
  }

  /**
   * Flush buffered events (send to backend)
   */
  private async flushEventBuffer(isUnload: boolean = false): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const eventsToSend = [...this.eventBuffer];
    this.eventBuffer = [];

    const analyticsEndpoint =
      process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '/api/analytics/events';
    const payload = JSON.stringify({ events: eventsToSend });

    try {
      logger.debug('Flushing events to analytics backend', {
        eventCount: eventsToSend.length,
        isUnload,
      });

      // Use sendBeacon for unload events (more reliable during page teardown)
      if (isUnload && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const sent = navigator.sendBeacon(
          analyticsEndpoint,
          new Blob([payload], { type: 'application/json' }),
        );
        if (!sent) {
          logger.warn('sendBeacon failed, events may be lost');
        }
        return;
      }

      // Normal flush via fetch (avoid importing apiClient to prevent circular deps)
      const response = await fetch(analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });

      if (!response.ok) {
        logger.warn('Analytics flush returned non-OK status', {
          status: response.status,
        });
      }
    } catch (error) {
      // Re-queue events on failure so they aren't lost
      this.eventBuffer.unshift(...eventsToSend);
      logger.error('Failed to flush analytics events', error, {
        eventCount: eventsToSend.length,
      });
    }
  }

  /**
   * End current session
   */
  endSession(): void {
    if (!this.currentSession) return;

    this.currentSession.endTime = new Date().toISOString();
    this.currentSession.totalDuration =
      new Date(this.currentSession.endTime).getTime() -
      new Date(this.currentSession.startTime).getTime();

    this.sessionStorage.push(this.currentSession);

    logger.user('Session ended', {
      sessionId: this.currentSession.sessionId,
      duration: this.currentSession.totalDuration,
      eventCount: this.currentSession.eventCount,
    });

    this.flushEventBuffer(true);
    this.currentSession = null;

    if (this.bufferFlushInterval) {
      clearInterval(this.bufferFlushInterval);
      this.bufferFlushInterval = null;
    }
  }

  /**
   * Get current session
   */
  getCurrentSession(): UserJourneySession | null {
    return this.currentSession;
  }

  /**
   * Get session history
   */
  getSessionHistory(): UserJourneySession[] {
    if (this.currentSession) {
      return [...this.sessionStorage, this.currentSession];
    }
    return [...this.sessionStorage];
  }

  /**
   * Get user journey for current session
   */
  getUserJourney(): UserJourneyEvent[] {
    return this.currentSession?.events || [];
  }

  /**
   * Get journey events filtered by category
   */
  getJourneyByCategory(category: 'navigation' | 'interaction' | 'conversion' | 'error'): UserJourneyEvent[] {
    return this.getUserJourney().filter(event => event.category === category);
  }

  /**
   * Get conversion funnel data
   */
  getConversionFunnel(): Record<string, number> {
    const events = this.getUserJourney();
    const funnel: Record<string, number> = {};

    events.forEach(event => {
      if (event.category === 'conversion') {
        funnel[event.eventName] = (funnel[event.eventName] || 0) + 1;
      }
    });

    return funnel;
  }

  /**
   * Calculate session metrics
   */
  getSessionMetrics() {
    if (!this.currentSession) return null;

    const startTime = new Date(this.currentSession.startTime);
    const endTime = this.currentSession.endTime ? new Date(this.currentSession.endTime) : new Date();
    const duration = endTime.getTime() - startTime.getTime();

    const eventCounts = {
      navigation: this.currentSession.events.filter(e => e.category === 'navigation').length,
      interaction: this.currentSession.events.filter(e => e.category === 'interaction').length,
      conversion: this.currentSession.events.filter(e => e.category === 'conversion').length,
      error: this.currentSession.events.filter(e => e.category === 'error').length,
    };

    return {
      sessionId: this.currentSession.sessionId,
      duration,
      eventCount: this.currentSession.eventCount,
      eventCounts,
      pageViews: eventCounts.navigation,
      interactions: eventCounts.interaction,
      errors: eventCounts.error,
      isConverted: eventCounts.conversion > 0,
    };
  }

  /**
   * Export session data
   */
  exportSessionData(): string {
    const history = this.getSessionHistory();
    return JSON.stringify({
      exportedAt: new Date().toISOString(),
      sessions: history,
      currentMetrics: this.getSessionMetrics(),
    }, null, 2);
  }
}

// Export singleton instance
export const analytics = new AnalyticsService();

export default analytics;
