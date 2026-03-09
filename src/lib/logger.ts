/**
 * Logger facade — delegates to the primary logger service.
 * Kept as a lightweight import path for modules that only need basic logging.
 */

export { logger as default } from './services/logger';
