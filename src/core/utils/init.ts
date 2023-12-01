import { APIProvider } from './APIProvider';
import { EcomConfig } from './config';
import { CoreConfig } from './config.meta';

/**
 * Initializes the API with the given core configuration.
 *
 * @param config Core configuration to set.
 */
export const initCoreConfig = (config: CoreConfig) => {
  EcomConfig.setConfig(config);
  APIProvider.init(EcomConfig.getFSXAConfig());
};
