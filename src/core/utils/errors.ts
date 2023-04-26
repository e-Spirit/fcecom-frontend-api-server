/**
 * @module
 * @internal
 */

/**
 * Error to represent a 401 from the FSXA.
 *
 * @export
 * @class EcomError
 */
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EcomError';
    // Fix instanceof in jest, see https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
 * Error to represent a 404 from the FSXA.
 *
 * @export
 * @class ItemNotFoundError
 */
export class ItemNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ItemNotFoundError';
    // Fix instanceof in jest, see https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript
    Object.setPrototypeOf(this, ItemNotFoundError.prototype);
  }
}

/**
 * Error to represent a unknown error from the FSXA.
 *
 * @export
 * @class EcomError
 */
export class UnknownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnknownError';
    // Fix instanceof in jest, see https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript
    Object.setPrototypeOf(this, UnknownError.prototype);
  }
}

/**
 * Error to represent a missing parameter.
 *
 * @export
 * @class MissingParameterError
 * @internal
 */
export class MissingParameterError extends Error {
  public readonly name = 'MissingParameterError';

  constructor(message: string) {
    super(message);
    // Fix instanceof in jest, see https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript
    Object.setPrototypeOf(this, MissingParameterError.prototype);
  }
}

/**
 * Error to represent a missing default locale configuration.
 *
 * @export
 * @class MissingDefaultLocaleError
 * @internal
 */
export class MissingDefaultLocaleError extends Error {
  public readonly name = 'MissingDefaultLocaleError';

  constructor(message: string) {
    super(message);
    // Fix instanceof in jest, see https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript
    Object.setPrototypeOf(this, MissingDefaultLocaleError.prototype);
  }
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

  constructor(message: string) {
    super(message);
    // Fix instanceof in jest, see https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript
    Object.setPrototypeOf(this, InvalidConfigurationError.prototype);
  }
}
