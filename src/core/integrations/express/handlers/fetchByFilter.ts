import { Request, Response } from 'express';
import { getApi } from '../../../utils/apiSelector';
import { getLogger } from '../../../utils/logging/getLogger';
import {
  InvalidLocaleError,
  ItemNotFoundError,
  MissingDefaultLocaleError,
  MissingParameterError,
  UnauthorizedError,
} from '../../../utils/errors';
import { addShareViewInfo } from '../../../utils/addShareViewInfo';
import { FetchByFilterParams } from 'fsxa-api';

/**
 * Handler to use for the fetchByFilter route.
 *
 * @internal
 * @param req Express request object.
 * @param res Express response object.
 * @return {*}
 */
export const fetchByFilter = async (req: Request<any, any>, res: Response): Promise<Response> => {
  const logger = getLogger('Fetch By Filter');

  logger.debug('POST request body', req.body);

  try {
    await addShareViewInfo(req, res);
    return res.json(await (await getApi(req)).fetchByFilter(req.body as FetchByFilterParams));
  } catch (err: unknown) {
    logger.error('Unable to fetch by filter', err);
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
export const FETCH_BY_FILTER_ROUTE = '/fetchByFilter';
