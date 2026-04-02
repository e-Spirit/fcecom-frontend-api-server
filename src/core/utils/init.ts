import { APIProvider } from './APIProvider';
import { EcomConfig } from './config';
import { CoreConfig } from './config.meta';
import { CaasChangeStreamManager } from './CaasChangeStreamManager';

/**
 * Initializes the API with the given core configuration.
 *
 * @param config Core configuration to set.
 */
export const initCoreConfig = (config: CoreConfig) => {
  EcomConfig.applyConfig(config);
  APIProvider.init(EcomConfig.getFSXAConfig());
  CaasChangeStreamManager.getInstance().start();
};
