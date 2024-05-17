import { Request } from 'express';
import { EcomConfig } from './config';

/**
 * Provide default logic to check if the current session is an iframe,
 * accessed through the FirstSpirit Content Creator.
 *
 * @module DefaultPreviewDecider
 */
export namespace DefaultPreviewDecider {
  /**
   * This function checks if the referrer (iframe parent) is the same as configured
   * in the `CoreConfig.fsServerOrigin`. If this condition is met, the storefront
   * is understood to be accessed through the FirstSpirit Content Creator.
   *
   * @param req Access request data directly from the requesting browser.
   */
  export const isPreview = async (req: Request<any, any, any>): Promise<boolean> => {
    const clientOrigin = extractOrigin(req.header('x-referrer'));
    const previewOrigin = extractOrigin(EcomConfig.getCoreConfig().fsServerOrigin);

    if (!clientOrigin || !previewOrigin) return false;
    return clientOrigin === previewOrigin;
  };

  /**
   * Extracts the origin part of a URL.
   *
   * @internal
   * @param url The full URL
   * @returns Origin of URL or undefined if an error occurred when creating the URL object.
   */
  const extractOrigin = (url: any): string | undefined => {
    try {
      return new URL(url ?? '').origin;
    } catch (err: any) {
      return undefined;
    }
  };
}

export namespace PreviewDecider {
  let customPreviewDecider: PreviewDeciderTemplate | undefined;

  /**
   * Registers a function to decide between preview and release state with custom logic.
   *
   * @example
   * ```typescript
   * import { PreviewDecider, PreviewDeciderTemplate } from 'fcecom-frontend-api-server';
   *
   * class MyCustomPreviewDecider implements PreviewDeciderTemplate {
   *   async isPreview(res: Response<any, any, any>): Promise<boolean> {
   *     return Promise.resolve(false);
   *   }
   * }
   *
   * PreviewDecider.registerDecider(new MyCustomPreviewDecider());
   * ```
   *
   * @param decider callback function to be called to decide if the preview or the release state should be fetched.
   */
  export const registerDecider = (decider: PreviewDeciderTemplate) => (customPreviewDecider = decider);

  /**
   * Remove the custom logic to decide between preview and release state
   * and just use the default behaviour.
   */
  export const useDefaultDecider = () => (customPreviewDecider = undefined);

  /**
   * Decide if the preview or the release state should be fetched.
   * If a custom decider is registered, this decider will be executed.
   * Otherwise, the DefaultPreviewDecider will be used.
   *
   * @internal
   * @param params dynamic params for custom previewDecider implementation.
   *               Uses the first argument for the default PreviewDecider,
   *               assuming it as an express request object.
   */
  export const isPreview = async (...params: any): Promise<boolean> => {
    if (customPreviewDecider?.isPreview) return customPreviewDecider?.isPreview(...params);
    else return DefaultPreviewDecider.isPreview(params[0] as Request<any, any, any>);
  };
}

/**
 * Template for custom and default preview deciders.
 *
 * @interface PreviewDeciderTemplate
 */
export interface PreviewDeciderTemplate {
  isPreview(...params: any): Promise<boolean>;
}
