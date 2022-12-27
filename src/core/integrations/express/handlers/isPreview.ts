import { Request, Response } from 'express';
import { getApi } from '../../../utils/apiSelector';

/**
 * Handler to use for the ispreview route.
 *
 * @internal
 * @param req Express request object.
 * @param res Express response object.
 * @return {*}
 */
export const isPreview = async (req: Request, res: Response): Promise<Response> => {
  return res.json({ isPreview: getApi(req).contentMode === 'preview' });
};

/**
 * @internal
 */
export const IS_PREVIEW_ROUTE = '/ispreview';
