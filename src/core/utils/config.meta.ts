import { FSXARemoteApiConfig } from 'fsxa-api';
import { LogLevel } from './logging/Logger';

/**
 * Configuration for the apiKey part of the configuration.
 *
 * @export
 * @interface ApiKeyConfig
 */
export type ApiKeyConfig = {
  /**
   * Master API key for both viewing modes. All non-set apiKeys will default to this one.
   */
  master: string;

  /**
   * The API key of the CaaS instance for preview viewing mode. Leave blank when providing a master key.
   */
  preview: string;

  /**
   * The API key of the CaaS instance for release viewing mode. Leave blank when providing a master key.
   */
  release: string;
};

/**
 * Configuration for the project part of the configuration.
 *
 * @export
 * @interface ProjectConfig
 */
export type ProjectConfig = {
  /**
   * The API key of the CaaS instance for different viewing modes.
   */
  apiKey: ApiKeyConfig;

  /**
   * The URL of the navigation service.
   */
  navigationServiceURL: string;

  /**
   * The URL of the CaaS instance.
   */
  caasURL: string;

  /**
   * The ID of the CaaS project.
   */
  projectID: string;

  /**
   * The tenant ID of the CaaS project.
   */
  tenantID: string;
};

/**
 *Configuration for the core part of the configuration.
 *
 * @export
 * @interface CoreConfig
 */
export type CoreConfig = {
  project: ProjectConfig;

  /**
   * The base URL of the server running the Content Creator.
   */
  fsServerOrigin: string;

  /**
   * A fallback locale used if any request is received without explicit locale. Has to have format like in 'de_DE'
   */
  defaultLocale?: string;

  /**
   * <b>0</b>: DEBUG<br><b>1</b>: INFO<br><b>2</b>: WARNING<br><b>3</b>: ERROR<br><b>4</b>: NONE<br>
   */
  logLevel: LogLevel;
};

/**
 * Configuration for the FSXA.
 *
 * @export
 * @interface FSXAConfig
 * @internal
 */
export type FSXAConfig = {
  preview: FSXARemoteApiConfig;
  release: FSXARemoteApiConfig;
};
