import { MissingParameterError } from '../../../utils/errors';
import { Logger, Logging, LogLevel } from '../../../utils/logging/Logger';
import { generateRequestMock, generateResponseMock } from '../testUtils';
import { fetchNavigation } from './fetchNavigation';

let loggerMock: Logger;
jest.mock('../../../utils/logging/getLogger', () => {
  const getLogger = (name: string) => {
    loggerMock = new Logger(name);
    loggerMock.error = jest.fn();
    return loggerMock;
  };
  return { getLogger };
});
const fetchNavigationMock = jest.fn();
jest.mock('../../../utils/apiSelector', () => {
  const getApi = jest.fn(() => {
    return {
      fetchNavigation: fetchNavigationMock,
    };
  });
  return { getApi };
});

describe('fetchNavigation', () => {
  beforeAll(() => Logging.init(LogLevel.NONE));
  it('returns writes API result to response', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    reqMock.query = { locale: 'LOCALE' };
    const fetchNavigationResult = {};
    fetchNavigationMock.mockImplementation(() => fetchNavigationResult);

    // Act
    await fetchNavigation(reqMock, resMock);

    // Assert
    expect(fetchNavigationMock).toBeCalledWith(reqMock.query);
    expect(resMock.json).toBeCalledWith(fetchNavigationResult);
  });
  it('handles missing parameter error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new MissingParameterError('ERROR');
    fetchNavigationMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await fetchNavigation(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to fetch navigation', error);
    expect(resMock.status).toBeCalledWith(400);
    expect(resMock.json).toBeCalledWith(
      expect.objectContaining({
        error: 'ERROR',
      })
    );
  });
  it('handles not found error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new Error('Resource could not be found');
    fetchNavigationMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await fetchNavigation(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to fetch navigation', error);
    expect(resMock.status).toBeCalledWith(404);
  });
  it('handles not authorized error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new Error('Your passed ApiKey has no access to the requested resource');
    fetchNavigationMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await fetchNavigation(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to fetch navigation', error);
    expect(resMock.status).toBeCalledWith(401);
  });
  it('handles not any other error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new Error('FATAL');
    fetchNavigationMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await fetchNavigation(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to fetch navigation', error);
    expect(resMock.status).toBeCalledWith(500);
  });
});
