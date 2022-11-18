import { Request, Response } from 'express';
import { ExpressRouterIntegrationErrors } from '../helper';
import { getLogger } from "../../../utils/logging/getLogger";

/**
 * Handler to use if no other route matches.
 * Responsible to send 404.
 *
 * @param req Express request object.
 * @param res Express response object.
 * @return {*}
 */
export const fallbackHandler = async (req: Request, res: Response): Promise<Response> => {
  const logger = getLogger('Fallback Handler');

  logger.warn('Unknown route requested', req.url);
  return res.status(404).json({
    error: ExpressRouterIntegrationErrors.UNKNOWN_ROUTE,
  });
};
