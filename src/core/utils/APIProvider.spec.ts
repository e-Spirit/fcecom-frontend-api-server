import { APIProvider } from './APIProvider';
import { EcomConfig } from './config';
import { coreConfig } from './config.spec.data';

jest.mock('../api/EcomRemoteApi', () => ({
  EcomRemoteApi: jest.fn(),
}));

describe('APIProvider', () => {
  afterEach(() => APIProvider.clear());
  describe('getPreviewApi()', () => {
    it('throws an error if not initialized', () => {
      // Act
      expect(() => {
        APIProvider.getPreviewApi();
        // Assert
      }).toThrow('APIProvider not initialized');
    });
    describe('positiveCases', () => {
      beforeEach(() => EcomConfig.setConfig(coreConfig));
      it('only creates one instance of the API', () => {
        // Arrange
        APIProvider.init(EcomConfig.getFSXAConfig());
        // Act
        const result1 = APIProvider.getPreviewApi();
        const result2 = APIProvider.getPreviewApi();
        // Assert
        expect(result1).toBe(result2);
      });
      it('logs "preview" as type of the API', () => {
        // Arrange
        APIProvider.init(EcomConfig.getFSXAConfig());
        jest.spyOn(APIProvider, 'logProvidedApi').mockImplementation(jest.fn());
        // Act
        APIProvider.getPreviewApi();
        // Assert
        expect(APIProvider.logProvidedApi).toHaveBeenNthCalledWith(1, 'preview');
      });
    });
  });
  describe('getReleaseApi()', () => {
    it('throws an error if not initialized', () => {
      // Act
      expect(() => {
        APIProvider.getReleaseApi();
        // Assert
      }).toThrow('APIProvider not initialized');
    });
    describe('positiveCases', () => {
      beforeEach(() => EcomConfig.setConfig(coreConfig));
      it('only creates one instance of the API', () => {
        // Arrange
        APIProvider.init(EcomConfig.getFSXAConfig());
        // Act
        const result1 = APIProvider.getReleaseApi();
        const result2 = APIProvider.getReleaseApi();
        // Assert
        expect(result1).toBe(result2);
      });
      it('logs "release" as type of the API', () => {
        // Arrange
        APIProvider.init(EcomConfig.getFSXAConfig());
        jest.spyOn(APIProvider, 'logProvidedApi').mockImplementation(jest.fn());
        // Act
        APIProvider.getReleaseApi();
        APIProvider.getReleaseApi(false);
        // Assert
        expect(APIProvider.logProvidedApi).toHaveBeenNthCalledWith(2, 'release');
      });
      it('logs "release (as fallback)" as type of the API', () => {
        // Arrange
        APIProvider.init(EcomConfig.getFSXAConfig());
        jest.spyOn(APIProvider, 'logProvidedApi').mockImplementation(jest.fn());
        // Act
        APIProvider.getReleaseApi(true);
        // Assert
        expect(APIProvider.logProvidedApi).toHaveBeenNthCalledWith(1, 'release (as fallback)');
      });
    });
  });
});
