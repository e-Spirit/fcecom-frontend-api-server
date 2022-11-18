import { Request } from 'express';
import { EcomConfig } from './config';
import { EcomRemoteApi } from '../api/EcomRemoteApi';
import { APIProvider } from './APIProvider';

export const getApi = (req: Request<any, any, any>): EcomRemoteApi => {
  const clientOrigin = extractOrigin(req.header('x-referrer'));
  const previewOrigin = extractOrigin(EcomConfig.getCoreConfig().fsServerOrigin);

  if (!clientOrigin || !previewOrigin) return APIProvider.getReleaseApi();
  if (clientOrigin !== previewOrigin) return APIProvider.getReleaseApi();

  return APIProvider.getPreviewApi();
};

/**
 * Extracts the origin part of a URL
 *
 * @internal
 * @exports
 * @param url The full URL
 * @returns Origin of URL or undefined if an error occurred when creating the URL object.
 */
export const extractOrigin = (url: any): string | undefined => {
  try {
    return new URL(url ?? '').origin;
  } catch (err: any) {
    return undefined;
  }
};
