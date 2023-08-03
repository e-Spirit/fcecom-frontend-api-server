import { Request, Response } from 'express';
import { getApi } from '../../../utils/apiSelector';
import { getLogger } from '../../../utils/logging/getLogger';
import { extractParamsFromRequest } from '../helper';
import { ItemNotFoundError, MissingDefaultLocaleError, MissingParameterError, UnauthorizedError } from '../../../utils/errors';

/**
 * Parameters used to find an element.
 *
 * @export
 * @interface FindElementParams
 */
export type FindElementParams = {
  /**
   * ID of the element.
   */
  fsPageId: string;
  /**
   * Locale to get the page in.
   * If omitted, a default locale has to be provided.
   */
  locale?: string;
};

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
    return res.json(await getApi(req).findElement(extractParamsFromRequest<FindElementParams>(req)));
  } catch (err: unknown) {
    logger.error('Unable to find element', err);
    if (err instanceof UnauthorizedError) {
      return res.status(401).send();
    } else if (err instanceof ItemNotFoundError) {
      return res.status(404).send();
    } else if (err instanceof MissingDefaultLocaleError || err instanceof MissingParameterError) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).send();
  }
};

/**
 * @internal
 */
export const FIND_ELEMENT_ROUTE = '/findElement';
