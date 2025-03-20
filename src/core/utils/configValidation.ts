import joi, { ValidationErrorItem, ValidationResult } from 'joi';
import { CoreConfig } from './config.meta';
import { getLogger } from './logging/getLogger';
import {
  KEY_CONFIG_DESCRIPTION,
  KEY_CONFIG_LABEL,
  localePattern,
  MASTER_KEY_DESCRIPTION,
  MASTER_KEY_NAME,
  PREVIEW_KEY_DESCRIPTION,
  PREVIEW_KEY_NAME,
  RELEASE_KEY_DESCRIPTION,
  RELEASE_KEY_NAME,
} from './configValidation.data';

/**
 * Schema to validate the documentation configuration.
 *
 * @internal
 */
const docsSchema = joi.object({
  enabled: joi.boolean().default(false).label('Enable Documentation').description('Whether to serve Swagger UI'),
  basePath: joi.string().label('Documentation Base Path').description('Path on which the Swagger UI should be served'),
});

/**
 * Schema to validate the SSL server configuration.
 *
 * @internal
 */
const sslSchema = joi.object({
  enabled: joi.boolean().default(false).label('SSL Enabled').description('Specifies if the server should use SSL encrypted connection.'),
  key: joi
    .alternatives()
    .conditional('enabled', {
      is: true,
      then: joi.string().required(),
      otherwise: joi.any(),
    })
    .label('SSL Key')
    .description('Path to SSL Key.'),
  cert: joi
    .alternatives()
    .conditional('enabled', {
      is: true,
      then: joi.string().required(),
      otherwise: joi.any(),
    })
    .label('SSL Certificate')
    .description('Path to SSL Certificate.'),
});

/**
 * Schema to validate the server configuration.
 *
 * @internal
 */
export const serverSchema = joi
  .object({
    port: joi.number().port().default(3001).label('Server Port').description('The port on which this backend service is started.'),
    basePath: joi.string().uri({ relativeOnly: true }).default('/api').label('Base Path').description('The path on which this backend service is served.'),
    docs: docsSchema.label('Swagger UI Documentation'),
    ssl: sslSchema.label('SSL Config'),
  })
  .label('Server Config');

/**
 * Schema to validate the API key configuration.
 *
 * @internal
 */
export const apiKeySchema = joi
  .alternatives(
    joi.object({
      // Master key overrides all optional Release / Preview keys.
      master: joi.string().uuid().required().label(MASTER_KEY_NAME).description(MASTER_KEY_DESCRIPTION).strip(),
      release: joi.any().optional().label(RELEASE_KEY_NAME).description(RELEASE_KEY_DESCRIPTION).strip(),
      preview: joi.any().optional().label(PREVIEW_KEY_NAME).description(PREVIEW_KEY_DESCRIPTION).strip(),
    }),
    joi.object({
      // Master key overrides Preview key while having a separate Release key
      master: joi.string().uuid().required().label(MASTER_KEY_NAME).description(MASTER_KEY_DESCRIPTION).strip(),
      release: joi.string().uuid().required().label(RELEASE_KEY_NAME).description(RELEASE_KEY_DESCRIPTION).strip(),
    }),
    joi.object({
      // Master key overrides Release key while having a separate Preview key
      master: joi.string().uuid().required().label(MASTER_KEY_NAME).description(MASTER_KEY_DESCRIPTION).strip(),
      preview: joi.string().uuid().required().label(PREVIEW_KEY_NAME).description(PREVIEW_KEY_DESCRIPTION).strip(),
    }),
    joi.object({
      // Preview / Release keys are set separately, so no master key is needed.
      master: joi.any().optional().label(MASTER_KEY_NAME).description(MASTER_KEY_DESCRIPTION),
      preview: joi.string().uuid().required().label(PREVIEW_KEY_NAME).description(PREVIEW_KEY_DESCRIPTION).strip(),
      release: joi.string().uuid().required().label(RELEASE_KEY_NAME).description(RELEASE_KEY_DESCRIPTION).strip(),
    })
  )
  .label(KEY_CONFIG_LABEL)
  .description(KEY_CONFIG_DESCRIPTION);

/**
 * Schema to validate the remote configuration.
 *
 * @internal
 */
export const remotesSchema = joi
  .object()
  .pattern(
    joi.string(),
    joi.object({
      id: joi.string().uuid().required().label('Remote Project ID').description('The ID of the remote project.'),
      locale: joi
        .string()
        .regex(localePattern) // de_DE
        .label('Remote Project Locale')
        .required()
        .description(`The locale used by the remote project. Make sure to use the master locale. Has to have format like in 'de_DE'`),
    })
  )
  .allow(null)
  .label('Remotes Config');

/**
 * Schema to validate the custom fields configuration.
 *
 * @internal
 */
export const fieldsSchema = joi
  .object({
    id: joi
      .string()
      .allow(null)
      .optional()
      .default('id')
      .label('ShopID')
      .description('The ShopID, stored in a FirstSpirit page.'),
    type: joi
      .string()
      .allow(null)
      .optional()
      .default('type')
      .label('PageType')
      .description('The type of page represented in the template, e.g. category / product / content'),
  })
  .allow(null)
  .label('Fields Config');

/**
 * Schema to validate the project configuration.
 *
 * @internal
 */
export const projectSchema = joi
  .object({
    navigationServiceURL: joi
      .string()
      .uri({ allowRelative: false })
      .invalid(/\/$/)
      .optional()
      .label('Navigation Service URL')
      .description('The URL of the navigation service.'),
    caasURL: joi.string().uri({ allowRelative: false }).required().label('CaaS URL').description('The URL of the CaaS instance.'),
    projectID: joi.string().uuid().required().label('Project ID').description('The ID of the CaaS project.'),
    remotes: remotesSchema.optional(),
    tenantID: joi.string().required().label('Tenant ID').description('The tenant ID of the CaaS project.'),
    apiKey: apiKeySchema.required(),
    removeUntranslatedSections: joi.boolean(),
    fields: fieldsSchema.optional(),
  })
  .label('Project Config');

/**
 * Schema to validate the core configuration.
 *
 * @internal
 */
export const coreSchema = joi
  .object({
    fsServerOrigin: joi
      .string()
      .uri({ allowRelative: false })
      .label('FirstSpirit Server Origin')
      .description('The base URL of the server running the Content Creator.'),
    defaultLocale: joi
      .string()
      .optional()
      .regex(localePattern) // de_DE
      .label('Default Locale')
      .description(`A fallback locale used if any request is received without explicit locale. Has to have format like in 'de_DE'`),
    logLevel: joi
      .number()
      .min(0)
      .max(4)
      .label('Log Verbosity Level')
      .description('Numeric representation of logLevels:\nDEBUG = 0, INFO = 1, WARNING = 2, ERROR = 3, NONE = 4'),
    project: projectSchema.required(),
  })
  .label('Core Config')
  .options({ allowUnknown: true, errors: { label: 'key' } });

/**
 * Schema to validate the configuration.
 *
 * @internal
 */
export const configSchema = joi
  .object({
    server: serverSchema.required(),
    core: coreSchema.required(),
  })
  .options({ allowUnknown: true });

const logConfigProblems = ({ message, path, type }: ValidationErrorItem) => getLogger('Validate Config').error(path.join('.'), message);

/**
 * Validates the core configuration.
 *
 * @internal
 */
export const validateCoreConfig = (config: CoreConfig): ValidationResult<any> => {
  if (parseInt(process.versions.node.split('.')[0]) < 18) {
    getLogger('Validate Config').error('Insufficient node version. Please use a node version of at least 18.');
    process.exit(1);
  }

  const validationResult = coreSchema.validate(config, {
    abortEarly: false,
    errors: {
      stack: false,
      render: true,
      label: 'path',
      language: 'de',
    },
  });

  if (validationResult?.error) validationResult?.error?.details?.forEach(logConfigProblems);
  else getLogger('Validate Config').success('CONFIGURATION VALID');

  return validationResult;
};
