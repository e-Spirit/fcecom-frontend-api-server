import { ComparisonQueryOperatorEnum, FetchResponse, FSXAApiErrors, FSXARemoteApi, LogicalQueryOperatorEnum, NavigationData } from 'fsxa-api';
import { FetchNavigationParams } from '../integrations/express/handlers/fetchNavigation';
import { FindPageParams } from '../integrations/express/handlers/findPage';
import { ItemNotFoundError, MissingParameterError, UnauthorizedError, UnknownError } from '../utils/errors';
import { EcomConfig } from '../utils/config';
import { FindElementParams } from '../integrations/express/handlers/findElement';

/**
 * Server module of the Frontend API for Connect for Commerce.
 *
 * @export
 * @class EcomRemoteApi
 */
export class EcomRemoteApi {
  public contentMode: 'release' | 'preview';
  private fsxaRemoteApi: FSXARemoteApi;

  public constructor(fsxaRemoteApi: FSXARemoteApi) {
    this.fsxaRemoteApi = fsxaRemoteApi;
    this.contentMode = fsxaRemoteApi.contentMode;
  }

  /**
   * Finds a CaaS page.
   *
   * @param params Parameters to use to find the page
   * @return {*} Details about the page.
   */
  async findPage(params: FindPageParams): Promise<FetchResponse> {
    const { locale = EcomConfig.getDefaultLocale(), id, type } = params;
    if (typeof id === 'undefined') throw new MissingParameterError('id is undefined');
    if (typeof type === 'undefined') throw new MissingParameterError('type is undefined');

    try {
      return await this.fsxaRemoteApi.fetchByFilter({
        filters: [
          {
            operator: LogicalQueryOperatorEnum.AND,
            filters: [
              {
                field: 'page.formData.type.value',
                operator: ComparisonQueryOperatorEnum.EQUALS,
                value: type,
              },
              {
                field: 'page.formData.id.value',
                operator: ComparisonQueryOperatorEnum.EQUALS,
                value: id,
              },
            ],
          },
        ],
        locale,
      });
    } catch (err: unknown) {
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
    try {
      return await this.fsxaRemoteApi.fetchNavigation({
        initialPath,
        locale,
      });
    } catch (err: unknown) {
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
   * Looks up an element from the CaaS.
   *
   * @param params Parameters to use to find the element.
   * @return {*} Details about the element.
   */
  async findElement(params: FindElementParams): Promise<any> {
    const { locale = EcomConfig.getDefaultLocale(), fsPageId } = params;
    if (typeof fsPageId === 'undefined') throw new MissingParameterError('fsPageId is undefined');

    try {
      return await this.fsxaRemoteApi.fetchElement({
        id: fsPageId,
        locale: locale,
      });
    } catch (err: unknown) {
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
}
