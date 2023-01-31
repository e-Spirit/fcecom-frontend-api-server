import { ComparisonQueryOperatorEnum, FetchResponse, FSXARemoteApi, LogicalQueryOperatorEnum, NavigationData } from 'fsxa-api';
import { FetchNavigationParams } from '../integrations/express/handlers/fetchNavigation';
import { FindPageParams } from '../integrations/express/handlers/findPage';
import { MissingParameterError } from '../utils/errors';
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
    const { locale, id, type } = params;
    if (typeof id === 'undefined') throw new MissingParameterError('id is undefined');
    if (typeof type === 'undefined') throw new MissingParameterError('type is undefined');

    return this.fsxaRemoteApi.fetchByFilter({
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
      locale: locale ?? EcomConfig.getDefaultLocale(),
    });
  }

  /**
   * Fetches the navigation service.
   *
   * @param params Parameters to use to fetch the service.
   * @return {*} The navigation returned by the navigation service.
   */
  async fetchNavigation(params: FetchNavigationParams): Promise<NavigationData | null> {
    const { locale, initialPath } = params;
    return this.fsxaRemoteApi.fetchNavigation({
      locale: locale ?? EcomConfig.getDefaultLocale(),
      initialPath,
    });
  }

  /**
   * Looks up an element from the CaaS.
   *
   * @param params Parameters to use to find the element.
   * @return {*} Details about the element.
   */
  async findElement(params: FindElementParams): Promise<any> {
    const { locale, id } = params;
    if (typeof id === 'undefined') throw new MissingParameterError('id is undefined');

    return this.fsxaRemoteApi.fetchElement({
      id,
      locale: locale ?? EcomConfig.getDefaultLocale(),
    });
  }
}
