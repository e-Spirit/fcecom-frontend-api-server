/**
 * Error to represent a missing parameter.
 *
 * @export
 * @class MissingParameterError
 */
export class MissingParameterError extends Error {
  public readonly name = 'MissingParameterError';
}

/**
 * Error to represent an invalid configuration.
 *
 * @export
 * @class MissingParameterError
 */
export class InvalidConfigurationError extends Error {
  public readonly name = 'InvalidConfigurationError';
}
