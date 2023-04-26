import { ItemNotFoundError, MissingParameterError, UnauthorizedError } from '../../../utils/errors';
import { Logger, Logging, LogLevel } from '../../../utils/logging/Logger';
import { generateRequestMock, generateResponseMock } from '../testUtils';
import { findElement } from './findElement';

let loggerMock: Logger;
jest.mock('../../../utils/logging/getLogger', () => {
  const getLogger = (name: string) => {
    loggerMock = new Logger(name);
    loggerMock.error = jest.fn();
    return loggerMock;
  };
  return { getLogger };
});
const findElementMock = jest.fn();
jest.mock('../../../utils/apiSelector', () => {
  const getApi = jest.fn(() => {
    return {
      findElement: findElementMock,
    };
  });
  return { getApi };
});

describe('findElement', () => {
  beforeAll(() => Logging.init(LogLevel.NONE));
  it('writes API result to response', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    reqMock.query = { id: 'ID', locale: 'LOCALE' };
    const findElementResult = {};
    findElementMock.mockImplementation(() => findElementResult);

    // Act
    await findElement(reqMock, resMock);

    // Assert
    expect(findElementMock).toBeCalledWith(reqMock.query);
    expect(resMock.json).toBeCalledWith(findElementResult);
  });
  it('handles missing parameter error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new MissingParameterError('ERROR');
    findElementMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await findElement(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to find element', error);
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
    findElementMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await findElement(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to find element', error);
    expect(resMock.status).toBeCalledWith(404);
  });
  it('handles not authorized error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new UnauthorizedError('Not authorized');
    findElementMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await findElement(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to find element', error);
    expect(resMock.status).toBeCalledWith(401);
  });
  it('handles not any other error from API', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    const error = new Error('FATAL');
    findElementMock.mockImplementation(() => {
      throw error;
    });

    // Act
    await findElement(reqMock, resMock);

    // Assert
    expect(loggerMock.error).toBeCalledWith('Unable to find element', error);
    expect(resMock.status).toBeCalledWith(500);
  });
});
