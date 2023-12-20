import { Logger, Logging, LogLevel } from '../../../utils/logging/Logger';
import { ExpressRouterIntegrationErrors } from '../helper';
import { generateRequestMock, generateResponseMock } from '../testUtils';
import { fallbackHandler } from './fallbackHandler';

let loggerMock: Logger;
jest.mock('../../../utils/logging/getLogger', () => {
  const getLogger = (name: string) => {
    loggerMock = new Logger(name);
    loggerMock.warn = jest.fn();
    return loggerMock;
  };
  return { getLogger };
});

describe('fallbackHandler', () => {
  beforeAll(() => Logging.init(LogLevel.NONE));
  it('responds with 404', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    reqMock.url = 'URL';

    // Act
    await fallbackHandler(reqMock, resMock);

    // Assert
    expect(loggerMock.warn).toHaveBeenCalledWith('Unknown route requested', reqMock.url);
    expect(resMock.status).toHaveBeenCalledWith(404);
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: ExpressRouterIntegrationErrors.UNKNOWN_ROUTE,
      })
    );
  });
});
