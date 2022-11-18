import { generateRequestMock, generateResponseMock } from '../testUtils';
import { isPreview } from './isPreview';

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

    // Act
    await isPreview(reqMock, resMock);

    // Assert
    expect(resMock.json).toBeCalledWith(
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

    // Act
    await isPreview(reqMock, resMock);

    // Assert
    expect(resMock.json).toBeCalledWith(
      expect.objectContaining({
        isPreview: false,
      })
    );
  });
});
