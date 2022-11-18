import { Request, Response } from 'express';
import { FSXAApiErrors } from 'fsxa-api';
import { getLogger } from "../../../utils/logging/getLogger";
import { getApi } from '../../../utils/apiSelector';
import { extractParamsFromRequest } from '../helper';

export interface FetchNavigationParams {
  locale: string;
  initialPath?: string;
}

/**
 * Handler to use for the fetchNavigation route.
 *
 * @param req Express request object.
 * @param res Express response object.
 * @return {*}
 */
export const fetchNavigation = async (req: Request, res: Response): Promise<Response> => {
  const logger = getLogger('Fetch Navigation');

  logger.debug('GET request query', req.query);

  try {
    return res.json(await getApi(req).fetchNavigation(extractParamsFromRequest<FetchNavigationParams>(req)));
  } catch (err: unknown) {
    logger.error('Unable to fetch navigation', err);
    if (err instanceof Error) {
      // TODO: Implement instanceof check · Ticket: FCECOM-503
      if (err.name === 'MissingParameterError') return res.status(400).json({ error: err.message });
      else if (err.message === FSXAApiErrors.NOT_FOUND) return res.status(404).send();
      else if (err.message === FSXAApiErrors.NOT_AUTHORIZED) return res.status(401).send();
    }
    return res.status(500).send();
  }
};

export const FETCH_NAVIGATION_ROUTE = '/fetchNavigation';
