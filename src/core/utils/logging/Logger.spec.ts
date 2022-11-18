import { Logger, Logging, LogLevel } from './Logger';

describe('Logger', () => {
  describe('constructor()', () => {
    it('uses fallback log level', () => {
      // Act
      Logging.init(undefined as any);
      // Assert
      expect(Logging.logLevel).toEqual(LogLevel.INFO);
    });
  });

  [
    {
      method: 'debug',
      consoleMethod: 'debug',
      level: LogLevel.DEBUG,
    },
    {
      method: 'log',
      consoleMethod: 'info',
      level: LogLevel.INFO,
    },
    {
      method: 'info',
      consoleMethod: 'info',
      level: LogLevel.INFO,
    },
    {
      method: 'warn',
      consoleMethod: 'warn',
      level: LogLevel.WARNING,
    },
    {
      method: 'error',
      consoleMethod: 'error',
      level: LogLevel.ERROR,
    },
  ].forEach((test) => {
    describe(`${test.method}()`, () => {
      it(`logs to the console if log level is at least ${test.method}`, () => {
        // Arrange
        Logging.init(test.level);
        const logger = new Logger(test.method);
        const spy = jest.fn();
        global.console = { [test.consoleMethod]: spy } as any;
        // Act
        // @ts-ignore - Makes it easier for testing
        logger[test.method]('MY TEST LOG');
        // Assert
        expect(spy).toBeCalled();
      });
      it(`does not log to the console if log level above ${test.method}`, () => {
        // Arrange
        Logging.init(999);
        const logger = new Logger(test.method);
        const spy = jest.fn();
        global.console = { [test.consoleMethod]: spy } as any;
        // Act
        // @ts-ignore - Makes it easier for testing
        logger[test.method]('MY TEST LOG');
        // Assert
        expect(spy).not.toHaveBeenCalled();
      });
    });
  });
});
