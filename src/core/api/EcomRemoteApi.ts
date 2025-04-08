import {
  ComparisonQueryOperatorEnum,
  Dataset,
  FetchProjectPropertiesParams,
  FSXAApiErrors,
  FSXARemoteApi,
  FSXARemoteApiConfig,
  GCAPage,
  Image,
  LogicalQueryOperatorEnum,
  NavigationData,
  Page,
  ProjectProperties,
  Section,
} from 'fsxa-api';
import { InvalidLocaleError, ItemNotFoundError, MissingParameterError, UnauthorizedError, UnknownError } from '../utils/errors';
import { EcomConfig } from '../utils/config';
import { AvailableLocale, FetchNavigationParams, FetchResponseItem, FindElementParams, FindPageParams } from './EcomRemoteApi.meta';
import { getLogger } from '../utils/logging/getLogger';
import { filterEmptySections } from '../utils/sectionFilter';
import { DataTransformer, Transformer } from '../../extendibles/dataTransformer';
import { FieldsConfig } from '../utils/config.meta';

/**
 * Server module of the Frontend API for Connect for Commerce.
 *
 * @export
 * @class EcomRemoteApi
 */
export class EcomRemoteApi {
  public contentMode: 'release' | 'preview';
  private fsxaRemoteApi: FSXARemoteApi;
  private readonly fsxaConfig: FSXARemoteApiConfig;
  private readonly fieldsConfig: FieldsConfig;

  public constructor(fsxaConfig: FSXARemoteApiConfig & { fields: FieldsConfig }) {
    this.fsxaRemoteApi = new FSXARemoteApi(fsxaConfig);
    this.fsxaConfig = fsxaConfig;
    this.contentMode = fsxaConfig.contentMode;
    this.fieldsConfig = {
      id: fsxaConfig?.fields?.id || 'id',
      type: fsxaConfig?.fields?.type || 'type',
    };
  }

  /**
   * Finds a CaaS page.
   *
   * @param params Parameters to use to find the page
   * @return {*} Details about the page.
   */
  async findPage(params: FindPageParams): Promise<FetchResponseItem | null> {
    const { locale = EcomConfig.getDefaultLocale(), id, type } = params;
    this.validateLocale(locale);
    if (typeof id === 'undefined') throw new MissingParameterError('id is undefined');
    if (typeof type === 'undefined') throw new MissingParameterError('type is undefined');

    try {
      const page =
        ((
          await this.fsxaRemoteApi.fetchByFilter({
            filters: [
              {
                operator: LogicalQueryOperatorEnum.AND,
                filters: [
                  {
                    field: `page.formData.${this.fieldsConfig.type}.value`,
                    operator: ComparisonQueryOperatorEnum.EQUALS,
                    value: type,
                  },
                  {
                    field: `page.formData.${this.fieldsConfig.id}.value`,
                    operator: ComparisonQueryOperatorEnum.EQUALS,
                    value: id,
                  },
                ],
              },
            ],
            locale,
          })
        ).items?.[0] as FetchResponseItem) ?? null;

      if (page && EcomConfig.isUntranslatedSectionFilterActive()) {
        page.children = page.children.map((slot: any) => {
          slot.children = filterEmptySections(slot.children as Section[]);
          return slot;
        });
      }

      return DataTransformer.applyTransformer(Transformer.FIND_PAGE, page);
    } catch (err: unknown) {
      getLogger('EcomRemoteApi').error('Error during findPage', err);
      if (err instanceof Error) {
        if (err.message === FSXAApiErrors.NOT_FOUND) {
          throw new ItemNotFoundError('Failed to find page - not found');
        } else if (err.message === FSXAApiErrors.NOT_AUTHORIZED) {
          throw new UnauthorizedError('Failed to find page - unauthorized');
        }
      }
      throw new UnknownError('Failed to find page');
    }
  }

  /**
   * Fetches the navigation service.
   *
   * @param params Parameters to use to fetch the service.
   * @return {*} The navigation returned by the navigation service.
   */
  async fetchNavigation(params: FetchNavigationParams): Promise<NavigationData | null> {
    const { locale = EcomConfig.getDefaultLocale(), initialPath } = params;
    this.validateLocale(locale);
    try {
      const navigation = await this.fsxaRemoteApi.fetchNavigation({
        initialPath,
        locale,
      });

      return DataTransformer.applyTransformer(Transformer.FETCH_NAVIGATION, navigation);
    } catch (err: unknown) {
      getLogger('EcomRemoteApi').error('Error during fetchNavigation', err);
      if (err instanceof Error) {
        if (err.message === FSXAApiErrors.NOT_FOUND) {
          throw new ItemNotFoundError('Failed to fetch navigation - not found');
        } else if (err.message === FSXAApiErrors.NOT_AUTHORIZED) {
          throw new UnauthorizedError('Failed to fetch navigation - unauthorized');
        }
      }
      throw new UnknownError('Failed to fetch navigation');
    }
  }

  /**
   * Fetches the project properties from CaaS.
   *
   * @param params Parameters to use to fetch project properties.
   * @return {*} The project properties returned by the CaaS.
   */
  async fetchProjectProperties(params: FetchProjectPropertiesParams): Promise<ProjectProperties | null> {
    const { locale = EcomConfig.getDefaultLocale() } = params;
    this.validateLocale(locale);
    try {
      const projectProperties = await this.fsxaRemoteApi.fetchProjectProperties({
        locale,
      });

      return DataTransformer.applyTransformer(Transformer.FETCH_PROJECT_PROPERTIES, projectProperties);
    } catch (err: unknown) {
      getLogger('EcomRemoteApi').error('Error during fetchProjectProperties', err);
      if (err instanceof Error) {
        if (err.message === FSXAApiErrors.NOT_FOUND) {
          throw new ItemNotFoundError('Failed to fetch project properties - not found');
        } else if (err.message === FSXAApiErrors.NOT_AUTHORIZED) {
          throw new UnauthorizedError('Failed to fetch project properties - unauthorized');
        }
      }
      throw new UnknownError('Failed to fetch project properties');
    }
  }

  /**
   * Gets available locales.
   *
   * @return {*} Available locales.
   */
  async getAvailableLocales(): Promise<Array<string>> {
    const { navigationServiceURL, projectID, apikey } = this.fsxaConfig;

    try {
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${apikey}`);

      const queryParam = `${this.contentMode}.${projectID}`;
      const url = `${navigationServiceURL}/?from=${queryParam}&until=${queryParam}`;
      const data = await fetch(url, { method: 'GET', headers }).then((response) => response.json());

      const items: Array<AvailableLocale> = data?._embedded;
      const validItems = items?.filter(({ languageId }) => !!languageId);
      const locales = validItems?.map(({ languageId }) => languageId);
      const uniqueLocales = Array.from(new Set(locales));

      return DataTransformer.applyTransformer(Transformer.GET_AVAILABLE_LOCALES, uniqueLocales);
    } catch (err: unknown) {
      getLogger('EcomRemoteApi').error('Error during getAvailableLocales', err);
      if (err instanceof Error) {
        if (err.message === FSXAApiErrors.NOT_FOUND) {
          throw new ItemNotFoundError('Failed to get available locales - not found');
        } else if (err.message === FSXAApiErrors.NOT_AUTHORIZED) {
          throw new UnauthorizedError('Failed to get available locales - unauthorized');
        }
      }
      throw new UnknownError('Failed to get available locales');
    }
  }

  /**
   * Looks up an element from the CaaS.
   *
   * @param params Parameters to use to find the element.
   * @return {*} Details about the element.
   */
  async findElement<T = Page | GCAPage | Dataset | Image | any | null>(params: FindElementParams): Promise<T> {
    const { locale = EcomConfig.getDefaultLocale(), fsPageId } = params;
    this.validateLocale(locale);
    if (typeof fsPageId === 'undefined') throw new MissingParameterError('fsPageId is undefined');

    try {
      const element = await this.fsxaRemoteApi.fetchElement({
        id: fsPageId,
        locale: locale,
      });

      if (element && element.type === 'Page' && EcomConfig.isUntranslatedSectionFilterActive()) {
        element.children = element.children.map((slot: any) => {
          slot.children = filterEmptySections(slot.children as Section[]);
          return slot;
        });
      }

      return DataTransformer.applyTransformer(Transformer.FIND_ELEMENT, element);
    } catch (err: unknown) {
      getLogger('EcomRemoteApi').error('Error during findElement', err);
      if (err instanceof Error) {
        if (err.message === FSXAApiErrors.NOT_FOUND) {
          throw new ItemNotFoundError('Failed to find element - not found');
        } else if (err.message === FSXAApiErrors.NOT_AUTHORIZED) {
          throw new UnauthorizedError('Failed to find element - unauthorized');
        }
      }
      throw new UnknownError('Failed to find element');
    }
  }

  /**
   * Validates the given locale by checking if it matches the xx_YY format.
   * Throws an error if something invalid is passed.
   *
   * @private
   * @param locale
   * @return {*}
   */
  private validateLocale(locale: string): boolean {
    if (!/[a-z]{2}_[A-Z]{2}/.exec(locale)) {
      throw new InvalidLocaleError(`Given locale '${locale}' is invalid`);
    }
    return true;
  }
}

/**
 * Provides API definition as JavaScript object.
 * This is using the existing `openapi.yaml` file.
 */
// @ts-ignore YAML will be loaded with rollup plugin
export { default as apiDefinition } from '../../../openapi.yaml';
