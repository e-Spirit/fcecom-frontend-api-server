import { removeTrailingSlash } from './helper';

describe('helper', () => {
  describe('removeTrailingSlash()', () => {
    it('removes trailing slashes', () => {
      // Arrange
      const text = 'MYTEXTWITHSLASH/';
      // Act
      const result = removeTrailingSlash(text);
      // Assert
      expect(result).toEqual('MYTEXTWITHSLASH');
    });
  });
});
