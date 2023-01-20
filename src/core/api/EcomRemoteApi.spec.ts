import { ComparisonQueryOperatorEnum, FSXARemoteApi, FSXARemoteApiConfig, LogicalQueryOperatorEnum } from 'fsxa-api';
import { EcomRemoteApi } from './EcomRemoteApi';
import { FetchNavigationParams } from '../integrations/express/handlers/fetchNavigation';
import { FindPageParams } from '../integrations/express/handlers/findPage';
import { EcomConfig } from '../utils/config';
import { coreConfig } from '../utils/config.spec.data';

const config = {
  apikey: 'APIKEY',
  caasURL: 'CAASURL',
  contentMode: 'preview',
  navigationServiceURL: 'NAVIGATIONSERVICE',
  projectID: 'PROJECTID',
  tenantID: 'TENANTID',
} as FSXARemoteApiConfig;

describe('EcomRemoteApi', () => {
  describe('constructor()', () => {
    it('creates an instance', () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);

      // Act
      const result = new EcomRemoteApi(fsxaRemoteApi);

      // Assert
      expect(result).toBeInstanceOf(EcomRemoteApi);
    });
  });

  describe('findPage()', () => {
    it('throws an error if parameter "id" is missing', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchByFilterResult = {};
      const spy = (fsxaRemoteApi.fetchByFilter = jest.fn().mockResolvedValue(fetchByFilterResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        id: undefined,
        locale: 'de',
        type: 'product',
      } as any as FindPageParams;
      // Act
      expect(async () => {
        return api.findPage(params);
        // Assert
      }).rejects.toThrowError('id is undefined');
      expect(spy).not.toHaveBeenCalled();
    });
    it('throws an error if parameter "locale" is missing and no fallback is configured', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchByFilterResult = {};
      const spy = (fsxaRemoteApi.fetchByFilter = jest.fn().mockResolvedValue(fetchByFilterResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      EcomConfig.setConfig({ ...coreConfig, defaultLocale: undefined });

      const params = {
        id: '123',
        locale: undefined,
        type: 'product',
      } as any as FindPageParams;
      // Act
      expect(async () => {
        return api.findPage(params);
        // Assert
      }).rejects.toThrowError('locale is undefined and no fallback is available');
      expect(spy).not.toHaveBeenCalled();
    });
    it('proceeds if parameter "locale" is missing but a fallback is configured', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchByFilterResult = {};
      const spy = (fsxaRemoteApi.fetchByFilter = jest.fn().mockResolvedValue(fetchByFilterResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      EcomConfig.setConfig(coreConfig);

      const params = {
        id: '123',
        locale: undefined,
        type: 'product',
      } as any as FindPageParams;

      // Act
      await api.findPage(params);

      // Assert
      expect(EcomConfig.getCoreConfig().defaultLocale).toBe('de_DE');
      expect(spy).toHaveBeenCalled();
    });
    it('throws an error if parameter "type" is missing', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchByFilterResult = {};
      const spy = (fsxaRemoteApi.fetchByFilter = jest.fn().mockResolvedValue(fetchByFilterResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        id: '123',
        locale: 'de',
        type: undefined,
      } as any as FindPageParams;
      // Act
      expect(async () => {
        return api.findPage(params);
        // Assert
      }).rejects.toThrowError('type is undefined');
      expect(spy).not.toHaveBeenCalled();
    });
    it('uses FSXA API instance to find a page', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchByFilterResult = {};
      const spy = (fsxaRemoteApi.fetchByFilter = jest.fn().mockResolvedValue(fetchByFilterResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        id: '123',
        locale: 'de',
        type: 'product',
      } as FindPageParams;

      // Act
      const result = await api.findPage(params);

      // Assert
      expect(result).toBe(fetchByFilterResult);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          filters: [
            {
              operator: LogicalQueryOperatorEnum.AND,
              filters: [
                {
                  field: 'page.formData.type.value',
                  operator: ComparisonQueryOperatorEnum.EQUALS,
                  value: params.type,
                },
                {
                  field: 'page.formData.id.value',
                  operator: ComparisonQueryOperatorEnum.EQUALS,
                  value: params.id,
                },
              ],
            },
          ],
          locale: params.locale,
        })
      );
    });
  });

  describe('fetchNavigation()', () => {
    it('throws an error if parameter "locale" is missing and no fallback is configured', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchNavigationResult = {};
      const spy = (fsxaRemoteApi.fetchNavigation = jest.fn().mockResolvedValue(fetchNavigationResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      EcomConfig.setConfig({ ...coreConfig, defaultLocale: undefined });

      const params = {
        initialPath: 'path',
        locale: undefined,
      } as any as FetchNavigationParams;
      // Act
      expect(async () => {
        return api.fetchNavigation(params);
      }).rejects.toThrowError('locale is undefined and no fallback is available');
      expect(spy).not.toHaveBeenCalled();
    });
    it('proceeds if parameter "locale" is missing but a fallback is configured', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchNavigationResult = {};
      const spy = (fsxaRemoteApi.fetchNavigation = jest.fn().mockResolvedValue(fetchNavigationResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      EcomConfig.setConfig(coreConfig);

      const params = {
        initialPath: 'path',
        locale: undefined,
      } as any as FetchNavigationParams;

      // Act
      await api.fetchNavigation(params);

      // Assert
      expect(EcomConfig.getCoreConfig().defaultLocale).toBe('de_DE');
      expect(spy).toHaveBeenCalled();
    });
    it('uses FSXA API instance to fetch the navigation', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchNavigationResult = {};
      const spy = (fsxaRemoteApi.fetchNavigation = jest.fn().mockResolvedValue(fetchNavigationResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      // Act
      const params = {
        initialPath: 'path',
        locale: 'de',
      } as FetchNavigationParams;
      const result = await api.fetchNavigation(params);

      // Assert
      expect(result).toBe(fetchNavigationResult);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          locale: params.locale,
          initialPath: params.initialPath,
        })
      );
    });
  });
});
