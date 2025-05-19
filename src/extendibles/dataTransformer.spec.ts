import { Logger } from '../core/utils/logging/Logger';
import { DataTransformer, Transformer } from './dataTransformer';

let loggerMock: Logger;
jest.mock('../core/utils/logging/getLogger', () => {
  const getLogger = (name: string) => {
    loggerMock = new Logger(name);
    loggerMock.warn = jest.fn();
    loggerMock.error = jest.fn();
    return loggerMock;
  };
  return { getLogger };
});

describe('DataTransformer', () => {
  describe('registerTransformer()', () => {
    it('warns if transformer already exists', () => {
      // Arrange
      const transformFn = jest.fn().mockResolvedValue('TRANSFORMED_RESULT');
      // Act
      DataTransformer.registerTransformer(Transformer.FIND_PAGE, transformFn);
      DataTransformer.registerTransformer(Transformer.FIND_PAGE, transformFn);
      // Assert
      expect(loggerMock.warn).toHaveBeenCalledWith(`Transformer for '${Transformer.FIND_PAGE}' overridden. Only single transformers are supported.`);
    });
  });
  describe('removeTransformer()', () => {
    it('removes a transformer', async () => {
      // Arrange
      const transformFn = jest.fn().mockResolvedValue('TRANSFORMED_RESULT');
      const response = {} as any; // Use object to later check for equality of reference
      DataTransformer.registerTransformer(Transformer.FIND_PAGE, transformFn);
      // Act
      DataTransformer.removeTransformer(Transformer.FIND_PAGE);
      // Assert
      const result = await DataTransformer.applyTransformer(Transformer.FIND_PAGE, response);
      expect(result).toBe(response);
    });
  });
  describe('applyTransformer()', () => {
    it('returns original value if no transformer is set', async () => {
      // Arrange
      const response = {} as any; // Use object to later check for equality of reference
      // Act
      const result = await DataTransformer.applyTransformer(Transformer.FIND_PAGE, response);
      // Assert
      expect(result).toBe(response);
    });
    it('applies transformer for FIND_PAGE if set ', async () => {
      // Arrange
      const transformFn = jest.fn().mockResolvedValue('TRANSFORMED_RESULT');
      const response = {} as any; // Use object to later check for equality of reference
      DataTransformer.registerTransformer(Transformer.FIND_PAGE, transformFn);
      // Act
      const result = await DataTransformer.applyTransformer(Transformer.FIND_PAGE, response);
      // Assert
      expect(result).toEqual('TRANSFORMED_RESULT');
    });
    it('applies transformer for FIND_ELEMENT if set ', async () => {
      // Arrange
      const transformFn = jest.fn().mockResolvedValue('TRANSFORMED_RESULT');
      const response = {} as any; // Use object to later check for equality of reference
      DataTransformer.registerTransformer(Transformer.FIND_ELEMENT, transformFn);
      // Act
      const result = await DataTransformer.applyTransformer(Transformer.FIND_ELEMENT, response);
      // Assert
      expect(result).toEqual('TRANSFORMED_RESULT');
    });
    it('applies transformer for FETCH_NAVIGATION if set ', async () => {
      // Arrange
      const transformFn = jest.fn().mockResolvedValue('TRANSFORMED_RESULT');
      const response = {} as any; // Use object to later check for equality of reference
      DataTransformer.registerTransformer(Transformer.FETCH_NAVIGATION, transformFn);
      // Act
      const result = await DataTransformer.applyTransformer(Transformer.FETCH_NAVIGATION, response);
      // Assert
      expect(result).toEqual('TRANSFORMED_RESULT');
    });
    it('applies transformer for FETCH_PROJECT_PROPERTIES if set ', async () => {
      // Arrange
      const transformFn = jest.fn().mockResolvedValue('TRANSFORMED_RESULT');
      const response = {} as any; // Use object to later check for equality of reference
      DataTransformer.registerTransformer(Transformer.FETCH_PROJECT_PROPERTIES, transformFn);
      // Act
      const result = await DataTransformer.applyTransformer(Transformer.FETCH_PROJECT_PROPERTIES, response);
      // Assert
      expect(result).toEqual('TRANSFORMED_RESULT');
    });
    it('applies transformer for FETCH_BY_FILTER if set ', async () => {
      // Arrange
      const transformFn = jest.fn().mockResolvedValue('TRANSFORMED_RESULT');
      const response = {} as any; // Use object to later check for equality of reference
      DataTransformer.registerTransformer(Transformer.FETCH_BY_FILTER, transformFn);
      // Act
      const result = await DataTransformer.applyTransformer(Transformer.FETCH_BY_FILTER, response);
      // Assert
      expect(result).toEqual('TRANSFORMED_RESULT');
    });
    it('logs an error on transformation error ', async () => {
      // Arrange
      expect.assertions(2);
      const error = new Error('TRANSFORMATION_ERROR');
      const transformFn = jest.fn().mockImplementation(() => {
        throw error;
      });
      const response = {} as any; // Use object to later check for equality of reference
      DataTransformer.registerTransformer(Transformer.FIND_PAGE, transformFn);
      // Act
      try {
        await DataTransformer.applyTransformer(Transformer.FIND_PAGE, response);
        // Assert
      } catch (err) {
        expect(err).toEqual(error);
        expect(loggerMock.error).toHaveBeenCalledWith(`Problem transforming response of ${Transformer.FIND_PAGE}`, error);
      }
    });
  });
});

