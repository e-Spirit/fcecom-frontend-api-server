import { FSXAContentMode } from 'fsxa-api';
import { CoreConfig, FSXAConfig } from './config.meta';
import { Logger, Logging, LogLevel } from './logging/Logger';
import { InvalidConfigurationError, MissingDefaultLocaleError } from './errors';
import { set } from 'lodash';
import { get } from 'lodash';
import { validateCoreConfig } from './configValidation';

export namespace EcomConfig {
  /**
   * The current core configuration.
   */
  export let coreConfig: CoreConfig;

  /**
   * Logger provided for this class
   */
  const logger: Logger = new Logger('EcomConfig');

  /**
   * Sets the current configuration.
   *
   * @internal
   * @param config The configuration to set.
   */
  export const applyConfig = (config: CoreConfig) => {
    coreConfig = config;
    sanitizeCoreConfig();

    // LogLevel Default
    if (typeof coreConfig.logLevel === 'undefined') coreConfig.logLevel = LogLevel.INFO;
    Logging.init(coreConfig.logLevel);

    // API Key configuration
    if (!coreConfig?.project?.apiKey) throw new InvalidConfigurationError('API key configuration not found');

    const { master, preview, release } = coreConfig.project.apiKey;

    const previewApikey = preview || master;
    const releaseApikey = release || master;

    coreConfig.project.apiKey = { master, preview: previewApikey, release: releaseApikey };

    const { error } = validateCoreConfig(coreConfig);
    if (error) throw new InvalidConfigurationError('Validation of configuration failed. Please check your config.');
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

  /**
   *
   * @internal
   * @returns Whether the configuration to filter out untranslated sections is active.
   */
  export const isUntranslatedSectionFilterActive = () => {
    const { removeUntranslatedSections } = coreConfig.project;

    return removeUntranslatedSections ?? false;
  };

  /**
   * Several sanitization methods are possible.
   * For now, the removal of all trailing slashes are implemented.
   */
  export const sanitizeCoreConfig = (): void => {
    sanitizeProperty('project.navigationServiceURL', removeAllTrailingSlashes);
    sanitizeProperty('project.caasURL', removeAllTrailingSlashes);
  };

  /**
   * Set the value of a property located at provided path inside the
   *  CoreConfig to a value changed with a provided sanitizeFunction.
   * @param path Path where the property is located inside the CoreConfig object.
   * @param sanitizeFunc A function supplied to change the value of the target property.
   */
  export const sanitizeProperty = (path: string, sanitizeFunc: (property: string) => string) => {
    const originalValue = get(coreConfig, path);
    const sanitizedProperty = sanitizeFunc?.(originalValue);

    if (sanitizedProperty) {
      set(coreConfig, path, sanitizedProperty);
    } else {
      logger.warn(`Sanitizing property '${path}' was not successful`);
      logger.debug('', { originalValue, sanitizedProperty });
    }
  };

  /**
   * Removes all trailing slashes of provided url string.
   * @param url URL to sanitize by removing all trailing slashes.
   */
  export const removeAllTrailingSlashes = (url: string): string => {
    let i: number = url.length;
    while (url[--i] === '/');
    return url.slice(0, i + 1);
  };
}
