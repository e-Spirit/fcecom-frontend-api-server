import { ItemNotFoundError, MissingParameterError, UnauthorizedError } from '../../../utils/errors';
import { Logger, Logging, LogLevel } from '../../../utils/logging/Logger';
import { generateRequestMock, generateResponseMock } from '../testUtils';
import { findPage } from './findPage';

let loggerMock: Logger;
jest.mock('../../../utils/logging/getLogger', () => {
  const getLogger = (name: string) => {
    loggerMock = new Logger(name);
    loggerMock.error = jest.fn();
    return loggerMock;
  };
  return { getLogger };
});
const findPageMock = jest.fn();
jest.mock('../../../utils/apiSelector', () => {
  const getApi = jest.fn(() => {
    return {
      findPage: findPageMock,
    };
  });
  return { getApi };
});

describe('findPage', () => {
  beforeAll(() => Logging.init(LogLevel.NONE));
  it('writes API result to response', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    reqMock.query = { id: 'ID', locale: 'LOCALE' };
    const findPageResult = {};
    findPageMock.mockImplementation(() => findPageResult);

    // Act
    await findPage(reqMock, resMock);

    // Assert
    expect(findPageMock).toBeCalledWith(reqMock.query);
    expect(resMock.json).toBeCalledWith(findPageResult);
  });
  it('handles missing parameter error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new MissingParameterError('ERROR');
    findPageMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await findPage(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to find page', error);
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
    const error = new ItemNotFoundError('Not found');
    findPageMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await findPage(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to find page', error);
    expect(resMock.status).toBeCalledWith(404);
  });
  it('handles not authorized error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new UnauthorizedError('Not authorized');
    findPageMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await findPage(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to find page', error);
    expect(resMock.status).toBeCalledWith(401);
  });
  it('handles not any other error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new Error('FATAL');
    findPageMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await findPage(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to find page', error);
    expect(resMock.status).toBeCalledWith(500);
  });
});
