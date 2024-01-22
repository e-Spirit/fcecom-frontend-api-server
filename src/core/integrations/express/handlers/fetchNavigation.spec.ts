import { InvalidLocaleError, ItemNotFoundError, MissingParameterError, UnauthorizedError } from '../../../utils/errors';
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
    expect(fetchNavigationMock).toHaveBeenCalledWith(reqMock.query);
    expect(resMock.json).toHaveBeenCalledWith(fetchNavigationResult);
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
    expect(loggerMock.error).toHaveBeenCalledWith('Unable to fetch navigation', error);
    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'ERROR',
      })
    );
  });
  it('handles invalid locale error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new InvalidLocaleError('ERROR');
    fetchNavigationMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await fetchNavigation(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith('Unable to fetch navigation', error);
    expect(resMock.status).toHaveBeenCalledWith(400);
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'ERROR',
      })
    );
  });
  it('handles not found error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new ItemNotFoundError('Not found');
    fetchNavigationMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await fetchNavigation(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith('Unable to fetch navigation', error);
    expect(resMock.status).toHaveBeenCalledWith(404);
  });
  it('handles not authorized error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new UnauthorizedError('Not authorized');
    fetchNavigationMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await fetchNavigation(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toHaveBeenCalledWith('Unable to fetch navigation', error);
    expect(resMock.status).toHaveBeenCalledWith(401);
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
    expect(loggerMock.error).toHaveBeenCalledWith('Unable to fetch navigation', error);
    expect(resMock.status).toHaveBeenCalledWith(500);
  });
});
