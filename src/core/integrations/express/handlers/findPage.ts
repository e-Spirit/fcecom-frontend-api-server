import { Request, Response } from 'express';
import { getApi } from '../../../utils/apiSelector';
import { getLogger } from '../../../utils/logging/getLogger';
import { extractParamsFromRequest } from '../helper';
import { InvalidLocaleError, ItemNotFoundError, MissingDefaultLocaleError, MissingParameterError, UnauthorizedError } from '../../../utils/errors';
import { FindPageParams } from '../../../api/EcomRemoteApi.meta';
import { addShareViewInfo } from '../../../utils/addShareViewInfo';

/**
 * Handler to use for the findPage route.
 *
 * @internal
 * @param req Express request object.
 * @param res Express response object.
 * @return {*}
 */
export const findPage = async (req: Request<any, any>, res: Response): Promise<Response> => {
  const logger = getLogger('Find Page');

  logger.debug('GET request query', req.query);

  try {
    await addShareViewInfo(req, res);
    return res.json(await (await getApi(req)).findPage(extractParamsFromRequest<FindPageParams>(req)));
  } catch (err: unknown) {
    logger.error('Unable to find page', err);
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
export const FIND_PAGE_ROUTE = '/findPage';
