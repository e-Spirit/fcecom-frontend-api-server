import { FSXAContentMode } from 'fsxa-api';
import { CoreConfig, FSXAConfig } from './config.meta';
import { Logging, LogLevel } from './logging/Logger';
import { InvalidConfigurationError, MissingDefaultLocaleError } from './errors';
import { APIProvider } from './APIProvider';
import cloneDeep from 'lodash.clonedeep';
import { validateCoreConfig } from './configValidation';


/**
 * Initializes the API with the given core configuration.
 *
 * @param config Core configuration to set.
 */
export const initCoreConfig = (config: CoreConfig) => EcomConfig.setConfig(config);

export namespace EcomConfig {

  /**
   * The current core configuration.
   */
  export let coreConfig: CoreConfig;

  /**
   * Sets the current configuration.
   *
   * @internal
   * @param config The configuration to set.
   */
  export const setConfig = (config: CoreConfig) => {
    coreConfig = cloneDeep(config);

    // LogLevel Default
    if (typeof coreConfig.logLevel === 'undefined') coreConfig.logLevel = LogLevel.INFO;
    Logging.init(coreConfig.logLevel);

    // API Key configuration
    if (!coreConfig?.project?.apiKey) throw new InvalidConfigurationError('API key configuration not found')

    const { master, preview, release } = coreConfig.project.apiKey;

    const previewApikey = preview || master;
    const releaseApikey = release || master;

    coreConfig.project.apiKey = { master, preview: previewApikey, release: releaseApikey };

    const { error } = validateCoreConfig(coreConfig);
    if (error) throw new InvalidConfigurationError('Validation of configuration failed. Please check your config.');

    APIProvider.init(getFSXAConfig());
  };

  /**
   * Gets the current core configuration.
   *
   * @internal
   * @returns The current core configuration.
   */
  export const getCoreConfig = (): CoreConfig => coreConfig;

  /**
   * Gets the current FSXA configuration.
   *
   * @internal
   * @returns The current configuration for the FSXA API.
   */
  export const getFSXAConfig = (): FSXAConfig => {
    const {
      apiKey: { preview: previewApiKey, release: releaseApiKey },
      projectID,
      caasURL,
      navigationServiceURL,
      tenantID,
    } = coreConfig.project;

    const project = { projectID, caasURL, navigationServiceURL, tenantID };
    return {
      preview: { ...project, apikey: previewApiKey, contentMode: FSXAContentMode.PREVIEW, logLevel: coreConfig.logLevel },
      release: { ...project, apikey: releaseApiKey, contentMode: FSXAContentMode.RELEASE, logLevel: coreConfig.logLevel },
    };
  };

  /**
   *
   * @internal
   * @returns The currently configured default locale.
   * @Trows MissingDefaultLocaleError If no default locale is configured.
   */
  export const getDefaultLocale = () => {
    const { defaultLocale } = getCoreConfig();
    if (typeof defaultLocale === 'undefined') throw new MissingDefaultLocaleError('locale is undefined and no fallback is available');
    return defaultLocale;
  };
}
