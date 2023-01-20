import joi, { ValidationErrorItem, ValidationResult } from 'joi';
import { CoreConfig } from './config.meta';
import { getLogger } from './logging/getLogger';
import {
  KEY_CONFIG_DESCRIPTION,
  KEY_CONFIG_LABEL,
  MASTER_KEY_DESCRIPTION,
  MASTER_KEY_NAME,
  PREVIEW_KEY_DESCRIPTION,
  PREVIEW_KEY_NAME,
  RELEASE_KEY_DESCRIPTION,
  RELEASE_KEY_NAME,
} from './configValidation.data';

/**
 * Schema to validate the server configuration.
 *
 * @internal
 */
export const serverSchema = joi
  .object({
    port: joi.number().port().default(3001).label('Server Port').description('The port on which this backend service is started.'),
    basePath: joi.string().uri({ relativeOnly: true }).default('/api').label('Base Path').description('The path on which this backend service is served.'),
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
    tenantID: joi.string().required().label('Tenant ID').description('The tenant ID of the CaaS project.'),
    apiKey: apiKeySchema.required(),
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
      .regex(/^[a-z]{2}_[A-Z]{2}$/) // de_DE
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
  .options({ allowUnknown: true });

/**
 * Schema to validate the configuration.
 *
 * @internal
 */
export const configSchema = joi.object({
  server: serverSchema.required(),
  core: coreSchema.required(),
});

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
      label: false,
      language: 'de',
    },
  });

  if (validationResult?.error) validationResult?.error?.details?.forEach(logConfigProblems);
  else getLogger('Validate Config').success('CONFIGURATION VALID');

  return validationResult;
};
