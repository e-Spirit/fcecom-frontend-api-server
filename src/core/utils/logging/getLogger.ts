import { Logger } from './Logger';

export const getLogger = (loggerName: string): Logger => new Logger(loggerName);