import { FSXARemoteApiConfig, RemoteProjectConfiguration } from 'fsxa-api';
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
   * @Optional Only necessary if either preview or release or both are not set.
   */
  master?: string;

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
   * Specify projects with referenced remote objects.<br>
   * Instructions on configuring remotes can be found in the
   * [documentation for the underlying Content API]((https://github.com/e-Spirit/javascript-content-api-library/blob/a70c41cd3492c818bdbd24c202c624718cf7a7bb/README.md#requirements)).
   */
  remotes?: RemoteProjectConfiguration | null;

  /**
   * The tenant ID of the CaaS project.
   */
  tenantID: string;

  /**
   * Whether untranslated sections should be removed.
   */
  removeUntranslatedSections?: boolean;

  /**
   * Customize several names of form fields.
   */
  fields: FieldsConfig;

  /**
   * Configure a JWT token secret
   */
  shareView: ShareViewConfig;
};

/**
 * Information about the ShareView mode.
 * Contains the JWT secret needed to decrypt and verify a JWT token.
 *
 * @export
 */
export type ShareViewConfig = {

  /**
   * A secret to decrypt and verify a JWT token.
   * It has to be synced with the Connect for Commerce module.
   */
  secret: string;
};

/**
 * Configuration for the core part of the configuration.
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
 * Customize several names of form fields.
 *
 * @export
 * @interface CoreConfig
 */
export type FieldsConfig = {
  /**
   * The ShopID, stored in a FirstSpirit page.
   */
  id: string;

  /**
   * The type of page represented in the template, e.g. category / product / content
   */
  type: string;
};

/**
 * Configuration for the FSXA.
 *
 * @export
 * @interface FSXAConfig
 * @internal
 */
export type FSXAConfig = {
  preview: FSXARemoteApiConfig & { fields: FieldsConfig };
  release: FSXARemoteApiConfig & { fields: FieldsConfig };
};
