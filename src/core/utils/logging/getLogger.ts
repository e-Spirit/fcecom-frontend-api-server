/**
 * @module
 * @internal
 */

import { Logger } from './Logger';

/**
 * Create a logger with a specific name.
 *
 * @internal
 * @param loggerName Name of the logger to create.
 * @returns The created logger instance.
 */
export const getLogger = (loggerName: string): Logger => new Logger(loggerName);
