import { generateRequestMock } from '../integrations/express/testUtils';
import { getApi } from './apiSelector';

const FS_SERVER_ORIGIN = 'http://url';
const previewApiMock = {};
const releaseApiMock = {};
jest.mock('./APIProvider', () => {
  return {
    APIProvider: {
      getPreviewApi: () => previewApiMock,
      getReleaseApi: () => releaseApiMock,
    },
  };
});
jest.mock('./config', () => {
  return {
    getLogger: jest.fn().mockReturnValue({
      debug: jest.fn(),
    }),
    EcomConfig: {
      getCoreConfig: jest.fn().mockImplementation(() => ({
        fsServerOrigin: FS_SERVER_ORIGIN,
      })),
    },
  };
});
let isPreview = false;
jest.mock('./previewDecider', () => {
  return {
    PreviewDecider: {
      isPreview: (req: any) => req.header('x-referrer') === FS_SERVER_ORIGIN,
    },
  };
});

describe('apiSelector', () => {
  describe('getApi()', () => {
    it('returns preview API when referrer matches', async () => {
      // Arrange
      const reqMoq = generateRequestMock();
      reqMoq.header = ((headerName: string) => (headerName === 'x-referrer' ? FS_SERVER_ORIGIN : '')) as any;
      // Act
      const result = getApi(reqMoq);
      // Assert
      await expect(result).resolves.toBe(previewApiMock);
    });
    it('returns release API when referrer does not match', async () => {
      // Arrange
      const reqMoq = generateRequestMock();
      reqMoq.header = ((headerName: string) => (headerName === 'x-referrer' ? 'http://someotherurl' : '')) as any;
      // Act
      const result = getApi(reqMoq);
      // Assert
      await expect(result).resolves.toBe(releaseApiMock);
    });
    it('returns release API as fallback', async () => {
      // Arrange
      const reqMoq = generateRequestMock();
      reqMoq.header = ((headerName: string) => (headerName === 'x-referrer' ? '---TOTALY INVALID URL' : '')) as any;
      // Act
      const result = getApi(reqMoq);
      // Assert
      await expect(result).resolves.toBe(releaseApiMock);
    });
  });
});
