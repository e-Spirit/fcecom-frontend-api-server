import { getLogger } from '../core/utils/logging/getLogger';
import { set } from 'lodash';
import { FetchResponseItem } from '../core/api/EcomRemoteApi.meta';
import { Dataset, GCAPage, Image, NavigationData, Page } from 'fsxa-api';

/**
 * A DataTransformer is a namespace provided to transform the responses from
 * `findPage()`, `findElement()` and `fetchNavigation()`.
 */
export namespace DataTransformer {
  const logger = getLogger('Data Transformation');

  const transformers: {
    findPage?: (page: TransformerParameters[Transformer.FIND_PAGE]) => Promise<any>;
    findElement?: (element: TransformerParameters[Transformer.FIND_ELEMENT]) => any;
    fetchNavigation?: (navigation: TransformerParameters[Transformer.FETCH_NAVIGATION]) => any;
  } = {};

  /**
   * Registers a transformer function to be used in `findPage()`, `findElement()` and `fetchNavigation()`
   * methods inside the EcomRemoteApi.
   *
   * @example
   * ```javascript
   * import { DataTransformer, FetchResponseItem, Transformer  } from 'fcecom-frontend-api-server';
   *
   * DataTransformer.registerTransformer(
   *   Transformer.FIND_PAGE,
   *   async (page: FetchResponseItem | null) => {
   *     return {
   *       myOwnPageProperty: page
   *     }
   *   }
   * )
   * ```
   *
   * Please be sure to remove a transformer before adding it.
   * All set transformers will be overridden by this method.
   *
   * @param transformer type of transformer to be added.
   * @param fn callback function to be called to transform the response provided by EcomRemoteApi functions.
   */
  export const registerTransformer = <T extends Transformer>(transformer: T, fn: (response: TransformerParameters[T]) => Promise<any>): void => {
    if (hasTransformer(transformer)) logger.warn(`Transformer for '${transformer}' overridden. Only single transformers are supported.`);
    set(transformers, transformer, fn);
  };

  /**
   * Remove a transformer of specified type to simply return the raw response provided.
   *
   * @param transformer type of transformer to be removed.
   */
  export const removeTransformer = (transformer: Transformer) => delete transformers[transformer];

  /**
   * Check if a transformer was registered.
   *
   * @internal
   * @param transformer type of transformer to be checked on.
   */
  const hasTransformer = (transformer: Transformer): boolean => !!transformers[transformer];

  /**
   * This hook is executed by the main functions for the EcomRemoteApi.
   *
   * If no transformer was registered for the provided transformer type,
   * the response is just returned without any modification.
   *
   * @internal
   * @param transformer type of transformer to use.
   * @param response Provided FSXA responses or their transformed output.
   */
  export const applyTransformer = async <T extends Transformer>(transformer: T, response: TransformerParameters[T]): Promise<any> => {
    try {
      if (!hasTransformer(transformer)) return response;

      switch (transformer) {
        case 'findPage':
          return transformers.findPage?.(response as TransformerParameters['findPage']);
        case 'findElement':
          return transformers.findElement?.(response as TransformerParameters['findElement']);
        case 'fetchNavigation':
          return transformers.fetchNavigation?.(response as TransformerParameters['fetchNavigation']);
      }
    } catch (err: unknown) {
      logger.error(`Problem transforming response of ${transformer}`, err);
      throw err;
    }
  };
}

/**
 * Maps Transformer types.
 */
export enum Transformer {
  FIND_PAGE = 'findPage',
  FIND_ELEMENT = 'findElement',
  FETCH_NAVIGATION = 'fetchNavigation',
}

/**
 * Provides information on parameters passed to a DataTransformer.
 */
export type TransformerParameters = {
  findPage: FetchResponseItem | null;
  findElement: Page | GCAPage | Dataset | Image | any | null;
  fetchNavigation: NavigationData | null;
};
