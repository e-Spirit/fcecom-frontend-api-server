// Mock jose package because it doesn't work with jest.
jest.mock('jose', () => {
  const base64url = {
    decode: jest.fn(() => undefined),
  };
  const jwtDecrypt = jest.fn((token, _) => {
    switch (token) {
      case 'jest-token-fs-driven-page':
        return {
          payload: {
            UniversalAllow: false,
            PageId: 'an-id',
            PageType: 'a-type',
            FsDriven: true,
          },
          protectedHeader: {},
        };
      case 'jest-token-shop-driven-page':
        return {
          payload: {
            UniversalAllow: false,
            PageId: 'an-id',
            PageType: 'a-type',
            FsDriven: false,
          },
          protectedHeader: {},
        };
      case 'jest-token-2':
        return {
          payload: {
            UniversalAllow: true,
            PageId: 'another-id',
            PageType: 'another-type',
          },
          protectedHeader: {},
        };
      case 'jest-token-1':
      case 'jest-token-3':
      default:
        return {
          payload: {
            UniversalAllow: false,
            PageId: 'an-id',
            PageType: 'a-type',
          },
          protectedHeader: {},
        };
    }
  });
  return { jwtDecrypt, base64url };
});
