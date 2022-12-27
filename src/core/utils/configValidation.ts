import joi, { ValidationErrorItem, ValidationResult } from 'joi';
import { CoreConfig } from './config.meta';
import { getLogger } from './logging/getLogger';


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
  .object({
    master: joi
      .string()
      .uuid()
      .optional()
      .empty('Master API Key')
      .description('Master API key for both viewing modes. All non-set apiKeys will default to this one.')
      .strip(), // disable echo in logs
    preview: joi
      .string()
      .uuid()
      .required()
      .label('Preview API Key')
      .description('The API key of the CaaS instance for preview viewing mode. Leave blank when providing a master key.')
      .strip(), // disable echo in logs
    release: joi
      .string()
      .uuid()
      .required()
      .label('Release API Key')
      .description('The API key of the CaaS instance for release viewing mode. Leave blank when providing a master key.')
      .strip(), // disable echo in logs
  })
  .label('API Key Config')
  .description('The API key of the CaaS instance for different viewing modes.');

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
    logLevel: joi
      .number()
      .min(0)
      .max(4)
      .label('Log Verbosity Level')
      .description('Numeric representation of logLevels:\nDEBUG = 0, INFO = 1, WARNING = 2, ERROR = 3, NONE = 4'),
    project: projectSchema.required(),
  })
  .label('Core Config');

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
