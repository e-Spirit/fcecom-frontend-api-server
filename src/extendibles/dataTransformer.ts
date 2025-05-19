import { getLogger } from '../core/utils/logging/getLogger';
import { set } from 'lodash';
import { FetchResponseItem } from '../core/api/EcomRemoteApi.meta';
import { Dataset, FetchResponse, GCAPage, Image, NavigationData, Page, ProjectProperties } from 'fsxa-api';
import { GetAvailableLocalesResponse } from 'fcecom-frontend-api-client/src/core/api/Remoteservice.meta';

/**
 * A DataTransformer is a namespace provided to transform the responses from
 * `findPage()`, `findElement()`, `fetchNavigation()` and `fetchProjectProperties()`, `fetchByFilter()` and `getAvailableLocales()`.
 */
export namespace DataTransformer {
  const logger = getLogger('Data Transformation');

  const transformers: {
    findPage?: (page: TransformerParameters[Transformer.FIND_PAGE]) => Promise<any>;
    findElement?: (element: TransformerParameters[Transformer.FIND_ELEMENT]) => any;
    fetchNavigation?: (navigation: TransformerParameters[Transformer.FETCH_NAVIGATION]) => any;
    fetchProjectProperties?: (projectProperties: TransformerParameters[Transformer.FETCH_PROJECT_PROPERTIES]) => any;
    fetchByFilter?: (projectProperties: TransformerParameters[Transformer.FETCH_BY_FILTER]) => any;
    getAvailableLocales?: (availableLocales: TransformerParameters[Transformer.GET_AVAILABLE_LOCALES]) => any;
  } = {};

  /**
   * Registers a transformer function to be used in `findPage()`, `findElement()` and `fetchNavigation()`, `fetchProjectProperties()`, `fetchByFilter()` and `getAvailableLocales()`
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
        case 'fetchProjectProperties':
          return transformers.fetchProjectProperties?.(response as TransformerParameters['fetchProjectProperties']);
        case 'fetchByFilter':
          return transformers.fetchByFilter?.(response as TransformerParameters['fetchByFilter']);
        case 'getAvailableLocales':
          return transformers.getAvailableLocales?.(response as TransformerParameters['getAvailableLocales']);
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
  FETCH_PROJECT_PROPERTIES = 'fetchProjectProperties',
  FETCH_BY_FILTER = 'fetchByFilter',
  GET_AVAILABLE_LOCALES = 'getAvailableLocales',
}

/**
 * Provides information on parameters passed to a DataTransformer.
 */
export type TransformerParameters = {
  findPage: FetchResponseItem | null;
  findElement: Page | GCAPage | Dataset | Image | any | null;
  fetchNavigation: NavigationData | null;
  fetchProjectProperties: ProjectProperties | unknown | null;
  fetchByFilter: FetchResponse | null;
  getAvailableLocales: GetAvailableLocalesResponse | null;
};
