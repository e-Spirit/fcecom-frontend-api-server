import { Request, Response } from 'express';
import { getApi } from '../../../utils/apiSelector';
import { getLogger } from '../../../utils/logging/getLogger';
import { extractParamsFromRequest } from '../helper';
import { InvalidLocaleError, ItemNotFoundError, MissingDefaultLocaleError, MissingParameterError, UnauthorizedError } from '../../../utils/errors';
import { FindElementParams } from '../../../api/EcomRemoteApi.meta';

/**
 * Handler to use for the findElement route.
 *
 * @internal
 * @param req Express request object.
 * @param res Express response object.
 * @return {*}
 */
export const findElement = async (req: Request<any, any>, res: Response): Promise<Response> => {
  const logger = getLogger('Find Element');

  logger.debug('GET request query', req.query);

  try {
    return res.json(await (await getApi(req)).findElement(extractParamsFromRequest<FindElementParams>(req)));
  } catch (err: unknown) {
    logger.error('Unable to find element', err);
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
export const FIND_ELEMENT_ROUTE = '/findElement';
