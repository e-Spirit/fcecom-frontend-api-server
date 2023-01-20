import { Request, Response } from 'express';
import { getApi } from '../../../utils/apiSelector';
import { FSXAApiErrors } from 'fsxa-api';
import { getLogger } from "../../../utils/logging/getLogger";
import { extractParamsFromRequest } from '../helper';

/**
 * Parameters used to find a page.
 *
 * @export
 * @interface FindPageParams
 */
export type FindPageParams = {
  /**
   * ID of the page.
   */
  id: string;
  /**
   * Locale to get the page in.
   * If omitted, a default locale has to be provided.
   */
  locale?: string;
  /**
   * Type of the page.
   */
  type: string;
}

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
    return res.json(await getApi(req).findPage(extractParamsFromRequest<FindPageParams>(req)));
  } catch (err: unknown) {
    logger.error('Unable to find page', err);
    if (err instanceof Error) {
      // TODO: Implement instanceof check · Ticket: FCECOM-503
      if (err.name === 'MissingDefaultLocaleError') return res.status(400).json({ error: err.message });
      else if (err.name === 'MissingParameterError') return res.status(400).json({ error: err.message });
      else if (err.message === FSXAApiErrors.NOT_FOUND) return res.status(404).send();
      else if (err.message === FSXAApiErrors.NOT_AUTHORIZED) return res.status(401).send();
    }
    return res.status(500).send();
  }
};

/**
 * @internal
 */
export const FIND_PAGE_ROUTE = '/findPage';
