/**
 * @module
 * @internal
 */

/**
 * Error to represent a missing parameter.
 *
 * @export
 * @class MissingParameterError
 * @internal
 */
export class MissingParameterError extends Error {
  public readonly name = 'MissingParameterError';
}

/**
 * Error to represent an invalid configuration.
 *
 * @export
 * @class MissingParameterError
 * @internal
 */
export class InvalidConfigurationError extends Error {
  public readonly name = 'InvalidConfigurationError';
}
