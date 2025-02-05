import { IncomingMessage } from 'http';
import { OutgoingMessage } from 'node:http';
import { ShareViewDecider } from './shareViewDecider';

/**
 * Adds headers to tell the client if a page was loaded in ShareView mode.
 *
 * @internal
 * @param req Express request object.
 * @param res Express response object.
 */
export const addShareViewInfo = async (req: IncomingMessage, res: OutgoingMessage) => {
  res.appendHeader('Access-Control-Expose-Headers', 'shared-preview');
  res.appendHeader('shared-preview', `${await ShareViewDecider.isShareSession(req)}`);
};
