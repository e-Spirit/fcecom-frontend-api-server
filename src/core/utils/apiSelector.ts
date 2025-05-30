import { EcomRemoteApi } from '../api/EcomRemoteApi';
import { APIProvider } from './APIProvider';
import { PreviewDecider } from './previewDecider';
import { IncomingMessage } from 'http';
import { ShareViewDecider } from './shareViewDecider';

/**
 * Returns the API instance that matches the given request, preview or release.
 * Returns the release API by default.
 *
 * @param req Request to get API instance.
 * @return {*} The API instance for the given request.
 * @internal
 */
export const getApi = async (req: IncomingMessage): Promise<EcomRemoteApi> =>
  (await PreviewDecider.isPreview(req)) || (await ShareViewDecider.isShareSession(req)) ? APIProvider.getPreviewApi() : APIProvider.getReleaseApi();
