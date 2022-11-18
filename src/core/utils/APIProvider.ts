import { EcomRemoteApi } from '../api/EcomRemoteApi';
import { FSXARemoteApi } from 'fsxa-api';
import { FSXAConfig } from './config.meta';
import { getLogger } from "./logging/getLogger";

export namespace APIProvider {
  let previewApi: EcomRemoteApi | undefined;
  let releaseApi: EcomRemoteApi | undefined;

  /**
   * Initialize the APIProvider and create the EcomRemoteApi instances.   *
   */
  export const init = (fsxaConfig: FSXAConfig) => {
    previewApi = new EcomRemoteApi(new FSXARemoteApi(fsxaConfig.preview));
    releaseApi = new EcomRemoteApi(new FSXARemoteApi(fsxaConfig.release));
  };

  /**
   * Returns the instance of the preview EcomRemoteApi.
   */
  export const getPreviewApi = () => {
    if (!previewApi) throw new Error('APIProvider not initialized');
    logProvidedApi('preview');
    return previewApi;
  };
  /**
   * Returns the instance of the release EcomRemoteApi.
   */
  export const getReleaseApi = (fallback: boolean = false) => {
    if (!releaseApi) throw new Error('APIProvider not initialized');
    if (fallback) logProvidedApi('release (as fallback)');
    else logProvidedApi('release');
    return releaseApi;
  };

  /**
   * Logs the provided api type for debugging purposes.
   *
   * @internal
   * @param apiType name of the API type
   */
  export const logProvidedApi = (apiType: string) => getLogger('Provide API').debug('using api', apiType);

  /**
   * Clears the API instances.
   */
  export const clear = () => {
    previewApi = undefined;
    releaseApi = undefined;
  };
}
