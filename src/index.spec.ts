import { getEcomEndpoints } from './core/integrations/express/express';
import { initCoreConfig } from './core/utils/config';
import * as Index from './index';

describe('index', () => {
  it('exports correct functions', () => {
    expect(Index.getEcomEndpoints).toBe(getEcomEndpoints);
    expect(Index.initCoreConfig).toBe(initCoreConfig);
  });
});
