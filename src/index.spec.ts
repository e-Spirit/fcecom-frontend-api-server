import { getEcomEndpoints } from './core/integrations/express/express';
import { initCoreConfig } from './core/utils/init';
import { PreviewDecider } from './core/utils/previewDecider';
import * as Index from './index';

describe('index', () => {
  it('exports correct functions and namespaces', () => {
    expect(Index.getEcomEndpoints).toBe(getEcomEndpoints);
    expect(Index.initCoreConfig).toBe(initCoreConfig);
    expect(Index.PreviewDecider).toBe(PreviewDecider);
  });
});
