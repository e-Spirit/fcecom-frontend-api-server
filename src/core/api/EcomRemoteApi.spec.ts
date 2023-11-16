import { ComparisonQueryOperatorEnum, FSXAApiErrors, FSXARemoteApi, FSXARemoteApiConfig, LogicalQueryOperatorEnum } from 'fsxa-api';
import { EcomRemoteApi } from './EcomRemoteApi';
import { FetchNavigationParams } from '../integrations/express/handlers/fetchNavigation';
import { FindPageParams } from '../integrations/express/handlers/findPage';
import { EcomConfig } from '../utils/config';
import { coreConfig } from '../utils/config.spec.data';
import { FindElementParams } from '../integrations/express/handlers/findElement';
import { ItemNotFoundError, UnauthorizedError, UnknownError } from '../utils/errors';

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
      const fetchByFilterResult = {items: []};
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
      expect(result).toBeUndefined();
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
    it('throws an error if FSXA throws 404', async () => {
      expect.assertions(3);
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const error = new Error(FSXAApiErrors.NOT_FOUND);
      const spy = (fsxaRemoteApi.fetchByFilter = jest.fn().mockRejectedValue(error));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        id: '123',
        locale: 'de',
        type: 'product',
      } as FindPageParams;
      // Act
      try {
        await api.findPage(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(ItemNotFoundError);
        expect(err.message).toEqual('Failed to find page - not found');
      }
    });
    it('throws an error if FSXA throws 401', async () => {
      expect.assertions(3);
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const error = new Error(FSXAApiErrors.NOT_AUTHORIZED);
      const spy = (fsxaRemoteApi.fetchByFilter = jest.fn().mockRejectedValue(error));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        id: '123',
        locale: 'de',
        type: 'product',
      } as FindPageParams;
      // Act
      try {
        await api.findPage(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toEqual('Failed to find page - unauthorized');
      }
    });
    it('throws an error if FSXA throws unkown error', async () => {
      expect.assertions(3);
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const error = new Error('UNKNOWN ERROR');
      const spy = (fsxaRemoteApi.fetchByFilter = jest.fn().mockRejectedValue(error));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        id: '123',
        locale: 'de',
        type: 'product',
      } as FindPageParams;
      // Act
      try {
        await api.findPage(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnknownError);
        expect(err.message).toEqual('Failed to find page');
      }
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
    it('throws an error if FSXA throws 404', async () => {
      expect.assertions(3);
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const error = new Error(FSXAApiErrors.NOT_FOUND);
      const spy = (fsxaRemoteApi.fetchNavigation = jest.fn().mockRejectedValue(error));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        initialPath: 'path',
        locale: 'de',
      } as FetchNavigationParams;
      // Act
      try {
        await api.fetchNavigation(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(ItemNotFoundError);
        expect(err.message).toEqual('Failed to fetch navigation - not found');
      }
    });
    it('throws an error if FSXA throws 401', async () => {
      expect.assertions(3);
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const error = new Error(FSXAApiErrors.NOT_AUTHORIZED);
      const spy = (fsxaRemoteApi.fetchNavigation = jest.fn().mockRejectedValue(error));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        initialPath: 'path',
        locale: 'de',
      } as FetchNavigationParams;
      // Act
      try {
        await api.fetchNavigation(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toEqual('Failed to fetch navigation - unauthorized');
      }
    });
    it('throws an error if FSXA throws unkown error', async () => {
      expect.assertions(3);
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const error = new Error('UNKNOWN ERROR');
      const spy = (fsxaRemoteApi.fetchNavigation = jest.fn().mockRejectedValue(error));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        initialPath: 'path',
        locale: 'de_DE',
      } as FetchNavigationParams;
      // Act
      try {
        await api.fetchNavigation(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnknownError);
        expect(err.message).toEqual('Failed to fetch navigation');
      }
    });
  });

  describe('findElement()', () => {
    it('throws an error if parameter "locale" is missing and no fallback is configured', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchElementResult = {};
      const spy = (fsxaRemoteApi.fetchElement = jest.fn().mockResolvedValue(fetchElementResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      EcomConfig.setConfig({ ...coreConfig, defaultLocale: undefined });

      const params = {
        fsPageId: '123',
        locale: undefined,
      } as any as FindElementParams;
      // Act
      expect(async () => {
        return api.findElement(params);
      }).rejects.toThrowError('locale is undefined and no fallback is available');
      expect(spy).not.toHaveBeenCalled();
    });
    it('proceeds if parameter "locale" is missing but a fallback is configured', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchElementResult = {};
      const spy = (fsxaRemoteApi.fetchElement = jest.fn().mockResolvedValue(fetchElementResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      EcomConfig.setConfig(coreConfig);

      const params = {
        fsPageId: '213',
        locale: undefined,
      } as any as FindElementParams;

      // Act
      await api.findElement(params);

      // Assert
      expect(EcomConfig.getCoreConfig().defaultLocale).toBe('de_DE');
      expect(spy).toHaveBeenCalled();
    });
    it('uses FSXA API instance to fetch the navigation', async () => {
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const fetchElementResult = {};
      const spy = (fsxaRemoteApi.fetchElement = jest.fn().mockResolvedValue(fetchElementResult));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      // Act
      const params = {
        fsPageId: '213',
        locale: 'de_DE',
      } as FindElementParams;
      const result = await api.findElement(params);

      // Assert
      expect(result).toBe(fetchElementResult);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          locale: params.locale,
          id: params.fsPageId,
        })
      );
    });
    it('throws an error if FSXA throws 404', async () => {
      expect.assertions(3);
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const error = new Error(FSXAApiErrors.NOT_FOUND);
      const spy = (fsxaRemoteApi.fetchElement = jest.fn().mockRejectedValue(error));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        fsPageId: '123',
        locale: 'de_DE',
      } as FindElementParams;
      // Act
      try {
        await api.findElement(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(ItemNotFoundError);
        expect(err.message).toEqual('Failed to find element - not found');
      }
    });
    it('throws an error if FSXA throws 401', async () => {
      expect.assertions(3);
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const error = new Error(FSXAApiErrors.NOT_AUTHORIZED);
      const spy = (fsxaRemoteApi.fetchElement = jest.fn().mockRejectedValue(error));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        fsPageId: '123',
        locale: 'de_DE',
      } as FindElementParams;
      // Act
      try {
        await api.findElement(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toEqual('Failed to find element - unauthorized');
      }
    });
    it('throws an error if FSXA throws unkown error', async () => {
      expect.assertions(3);
      // Arrange
      const fsxaRemoteApi = new FSXARemoteApi(config);
      const error = new Error('UNKNOWN ERROR');
      const spy = (fsxaRemoteApi.fetchElement = jest.fn().mockRejectedValue(error));
      const api = new EcomRemoteApi(fsxaRemoteApi);

      const params = {
        fsPageId: '123',
        locale: 'de_DE',
      } as FindElementParams;
      // Act
      try {
        await api.findElement(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnknownError);
        expect(err.message).toEqual('Failed to find element');
      }
    });
  });
});
