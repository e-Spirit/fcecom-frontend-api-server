import { Request, Response } from 'express';
import { getLogger } from '../../../utils/logging/getLogger';
import { getApi } from '../../../utils/apiSelector';
import { extractParamsFromRequest } from '../helper';
import { InvalidLocaleError, ItemNotFoundError, MissingDefaultLocaleError, MissingParameterError, UnauthorizedError } from '../../../utils/errors';
import { FetchNavigationParams } from '../../../api/EcomRemoteApi.meta';
import { addShareViewInfo } from '../../../utils/addShareViewInfo';

/**
 * Handler to use for the fetchNavigation route.
 *
 * @internal
 * @param req Express request object.
 * @param res Express response object.
 * @return {*}
 */
export const fetchNavigation = async (req: Request, res: Response): Promise<Response> => {
  const logger = getLogger('Fetch Navigation');

  logger.debug('GET request query', req.query);

  try {
    await addShareViewInfo(req, res);
    return res.json(await (await getApi(req)).fetchNavigation(extractParamsFromRequest<FetchNavigationParams>(req)));
  } catch (err: unknown) {
    logger.error('Unable to fetch navigation', err);
    if (err instanceof UnauthorizedError) {
      return res.status(401).send();
    } else if (err instanceof ItemNotFoundError) {
      return res.status(404).send();
    } else if (err instanceof MissingDefaultLocaleError || err instanceof MissingParameterError || err instanceof InvalidLocaleError) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).send();
  }
};

/**
 * @internal
 */
export const FETCH_NAVIGATION_ROUTE = '/fetchNavigation';
