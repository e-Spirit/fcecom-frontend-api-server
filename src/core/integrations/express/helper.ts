import { Request } from 'express';

/**
 * Extracts the parameter from the given request.
 * Does not perform any validation.
 *
 * @internal
 * @template T Type of the parameter to extract.
 * @param req Request to extract parameter from.
 * @return {*} The parameter from the request converted to the given type.
 */
export const extractParamsFromRequest = <T>(req: Request): T => {
  return <T>(req.query as unknown);
};

/**
 * @internal
 */
export enum ExpressRouterIntegrationErrors {
  UNKNOWN_ROUTE = 'Could not map given route and method.',
}
