import { Request, Response } from 'express';
import { PreviewDecider } from '../../../utils/previewDecider';

/**
 * Handler to use for the ispreview route.
 *
 * @internal
 * @param req Express request object.
 * @param res Express response object.
 * @return {*}
 */
export const isPreview = async (req: Request, res: Response): Promise<Response> =>
  res.json({
    isPreview: await PreviewDecider.isPreview(req),
  });

/**
 * @internal
 */
export const IS_PREVIEW_ROUTE = '/ispreview';
