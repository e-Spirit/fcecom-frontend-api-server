import { generateRequestMock } from '../testUtils';
import { ShareViewDecider } from './shareViewDecider';
import { EcomConfig } from './config';
import { CoreConfig } from './config.meta';

describe('addShareViewInfo', () => {
  beforeEach(() => {
    EcomConfig.coreConfig = {
      project: {
        shareView: {
          secret: 'i-am-a-secret',
        },
      },
    } as CoreConfig;
  });
  it('returns true if FS driven page is permitted.', async () => {
    // Arrange
    const fsPageId = 'an-id';
    const type = 'a-type';

    const reqMoq = generateRequestMock();
    reqMoq.url = `https://api.example.com/api/findElement?fsPageId=${fsPageId}&type=${type}`;
    reqMoq.headers.host = 'api.example.com';
    reqMoq.headers['ecom-share-token'] = 'jest-token-fs-driven-page';

    // Act
    const result = await ShareViewDecider.isShareSession(reqMoq);

    // Assert
    expect(result).toBe(true);
  });
  it('returns true if shop driven page is permitted.', async () => {
    // Arrange
    const id = 'an-id';
    const type = 'a-type';

    const reqMoq = generateRequestMock();
    reqMoq.url = `https://api.example.com/api/findElement?id=${id}&type=${type}`;
    reqMoq.headers.host = 'api.example.com';
    reqMoq.headers['ecom-share-token'] = 'jest-token-shop-driven-page';

    // Act
    const result = await ShareViewDecider.isShareSession(reqMoq);

    // Assert
    expect(result).toBe(true);
  });
  it('returns true if token validation was successful and any page is permitted.', async () => {
    // Arrange
    const id = 'an-id';
    const type = 'a-type';

    const reqMoq = generateRequestMock();
    reqMoq.url = `https://api.example.com/api/findElement?id=${id}&type=${type}`;
    reqMoq.headers.host = 'api.example.com';
    reqMoq.headers['ecom-share-token'] = 'jest-token-2';

    EcomConfig.coreConfig = {
      project: {
        shareView: {
          secret: 'i-am-a-secret',
        },
      },
    } as CoreConfig;

    // Act
    const result = await ShareViewDecider.isShareSession(reqMoq);

    // Assert
    expect(result).toBe(true);
  });
  it('returns true if token validation was successful and the requested endpoint is fetch navigation.', async () => {
    // Arrange
    const id = 'an-id';
    const type = 'a-type';

    const reqMoq = generateRequestMock();
    reqMoq.url = `https://api.example.com/api/fetchNavigation?id=${id}&type=${type}`;
    reqMoq.headers.host = 'api.example.com';
    reqMoq.headers['ecom-share-token'] = 'jest-token-3';

    EcomConfig.coreConfig = {
      project: {
        shareView: {
          secret: 'i-am-a-secret',
        },
      },
    } as CoreConfig;

    // Act
    const result = await ShareViewDecider.isShareSession(reqMoq);

    // Assert
    expect(result).toBe(true);
  });
});
