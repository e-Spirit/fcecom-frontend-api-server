import { generateRequestMock, generateResponseMock } from '../testUtils';
import { isPreview } from './isPreview';
import { EcomConfig } from '../../../utils/config';
import { CoreConfig } from '../../../utils/config.meta';

let contentMode: string;
jest.mock('../../../utils/apiSelector', () => {
  const getApi = jest.fn(() => {
    return {
      contentMode,
    };
  });
  return { getApi };
});

describe('isPreview', () => {
  it('returns isPreview = true for preview requests', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    contentMode = 'preview';

    EcomConfig['coreConfig'] = {
      fsServerOrigin: 'https://example.com',
    } as CoreConfig;

    // Act
    await isPreview(reqMock, resMock);

    // Assert
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        isPreview: true,
      })
    );
  });
  it('returns isPreview = false for non-preview requests', async () => {
    // Arrange
    const resMock = generateResponseMock();
    const reqMock = generateRequestMock();
    contentMode = 'release';

    EcomConfig['coreConfig'] = {
      fsServerOrigin: 'https://example.com',
    } as CoreConfig;

    // Act
    await isPreview(reqMock, resMock);

    // Assert
    expect(resMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        isPreview: false,
      })
    );
  });
});
