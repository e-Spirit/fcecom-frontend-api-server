import { generateRequestMock } from '../testUtils';
import { DefaultPreviewDecider, PreviewDecider, PreviewDeciderTemplate } from './previewDecider';

const FS_SERVER_ORIGIN = 'http://url';

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

describe('previewDecider', () => {
  describe('DefaultPreviewDecider', () => {
    describe('isPreview()', () => {
      it('returns true if x-referrer matches', async () => {
        // Arrange
        const reqMoq = generateRequestMock();
        reqMoq.headers = { 'x-referrer': FS_SERVER_ORIGIN };
        // Act
        const result = await DefaultPreviewDecider.isPreview(reqMoq);
        // Assert
        expect(result).toBe(true);
      });
      it('returns false when referrer does not match', async () => {
        // Arrange
        const reqMoq = generateRequestMock();
        reqMoq.headers = { 'x-referrer': 'http://someotherurl' };
        // Act
        const result = await DefaultPreviewDecider.isPreview(reqMoq);
        // Assert
        expect(result).toBe(false);
      });
      it('returns false as fallback', async () => {
        // Arrange
        const reqMoq = generateRequestMock();
        reqMoq.headers = { 'x-referrer': '---TOTALLY INVALID URL' };
        // Act
        const result = await DefaultPreviewDecider.isPreview(reqMoq);
        // Assert
        expect(result).toBe(false);
      });
    });
  });
  describe('PreviewDecider', () => {
    describe('isPreview()', () => {
      it('uses registered custom decider', async () => {
        // Arrange
        const defaultPreviewDeciderMock = jest.spyOn(DefaultPreviewDecider, 'isPreview');
        const customIsPreviewMock = jest.fn().mockResolvedValue(true);
        const customDecider = {
          isPreview: customIsPreviewMock,
        } as PreviewDeciderTemplate;
        const reqMoq = generateRequestMock();
        PreviewDecider.registerDecider(customDecider);
        // Act
        const result = await PreviewDecider.isPreview(reqMoq);
        // Assert
        expect(defaultPreviewDeciderMock).not.toHaveBeenCalled();
        expect(customIsPreviewMock).toHaveBeenCalledWith(reqMoq);
        expect(result).toBe(true);
      });
      it('uses registered custom decider with custom arguments amount', async () => {
        // Arrange
        const defaultPreviewDeciderMock = jest.spyOn(DefaultPreviewDecider, 'isPreview');
        const customIsPreviewMock = jest.fn().mockImplementation((req: Request, arg1: string, arg2: string) => false);
        const customDecider = {
          isPreview: customIsPreviewMock,
        } as PreviewDeciderTemplate;
        const reqMoq = generateRequestMock();
        PreviewDecider.registerDecider(customDecider);
        // Act
        const result = await PreviewDecider.isPreview(reqMoq, 'foo', 'bar');
        // Assert
        expect(defaultPreviewDeciderMock).not.toHaveBeenCalled();
        expect(customIsPreviewMock).toHaveBeenCalledWith(reqMoq, 'foo', 'bar');
        expect(result).toBe(false);
      });
    });
    describe('useDefaultDecider()', () => {
      it('removes previously registered custom decider', async () => {
        // Arrange
        const defaultPreviewDeciderMock = jest.spyOn(DefaultPreviewDecider, 'isPreview').mockResolvedValue(true);
        const customIsPreviewMock = jest.fn().mockResolvedValue(true);
        const customDecider = {
          isPreview: customIsPreviewMock,
        } as PreviewDeciderTemplate;
        const reqMoq = generateRequestMock();
        PreviewDecider.registerDecider(customDecider);
        PreviewDecider.useDefaultDecider();
        // Act
        const result = await PreviewDecider.isPreview(reqMoq);
        // Assert
        expect(customIsPreviewMock).not.toHaveBeenCalled();
        expect(defaultPreviewDeciderMock).toHaveBeenCalledWith(reqMoq);
        expect(result).toBe(true);
      });
    });
  });
});
