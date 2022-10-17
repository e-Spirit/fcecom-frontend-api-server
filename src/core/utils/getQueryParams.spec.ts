import { getQueryParams } from './getQueryParams';
import { createNamespace } from 'continuation-local-storage';

describe('getQueryParams', () => {
  it('should get the query params from the session', () => {
    const session = createNamespace('request');
    const testString = 'testString';

    let result;
    session.run(() => {
      session.set('queryParams', testString);
      result = getQueryParams();
    });

    expect(result).toEqual(testString);
  });
  it('should return undefined when no session is set', () => {
    const result = getQueryParams();

    expect(result).toBeUndefined();
  });
});
