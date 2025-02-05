import { generateRequestMock } from '../testUtils';
import { ShareViewDecider } from './shareViewDecider';
import { addShareViewInfo } from './addShareViewInfo';
import { generateResponseMock } from '../integrations/express/testUtils';
import Mock = jest.Mock;

describe('addShareViewInfo', () => {
  it('returns true if ShareViewDecider returns true', async () => {
    // Arrange
    const reqMoq = generateRequestMock();
    const resMoq = generateResponseMock();

    jest.spyOn(ShareViewDecider, 'isShareSession').mockReturnValue(Promise.resolve(true));

    // Act
    await addShareViewInfo(reqMoq, resMoq);
    // Assert
    expect((resMoq.appendHeader as Mock).mock.calls[0][0]).toBe('Access-Control-Expose-Headers');
    expect((resMoq.appendHeader as Mock).mock.calls[0][1]).toBe('shared-preview');

    expect((resMoq.appendHeader as Mock).mock.calls[1][0]).toBe('shared-preview');
    expect((resMoq.appendHeader as Mock).mock.calls[1][1]).toBe('true');
  });
  it('returns false as fallback', async () => {
    // Arrange
    const reqMoq = generateRequestMock();
    const resMoq = generateResponseMock();

    // Act
    await addShareViewInfo(reqMoq, resMoq);
    // Assert
    expect((resMoq.appendHeader as Mock).mock.calls[0][0]).toBe('Access-Control-Expose-Headers');
    expect((resMoq.appendHeader as Mock).mock.calls[0][1]).toBe('shared-preview');

    expect((resMoq.appendHeader as Mock).mock.calls[1][0]).toBe('shared-preview');
    expect((resMoq.appendHeader as Mock).mock.calls[1][1]).toBe('false');
  });
});
