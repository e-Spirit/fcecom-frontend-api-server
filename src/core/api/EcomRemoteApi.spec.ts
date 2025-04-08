import { ComparisonQueryOperatorEnum, FSXAApiErrors, FSXARemoteApi, FSXARemoteApiConfig, LogicalQueryOperatorEnum } from 'fsxa-api';
import { EcomRemoteApi } from './EcomRemoteApi';
import { FetchNavigationParams, FetchProjectPropertiesParams, FindElementParams, FindPageParams, GetAvailableLocalesResponse } from './EcomRemoteApi.meta';
import { EcomConfig } from '../utils/config';
import { getTestCoreConfig } from '../utils/config.spec.data';
import { ItemNotFoundError, UnauthorizedError, UnknownError } from '../utils/errors';
import { DataTransformer, Transformer } from '../../extendibles/dataTransformer';
import { FieldsConfig } from '../utils/config.meta';

const fsxaConfig = {
  apikey: 'APIKEY',
  caasURL: 'CAASURL',
  contentMode: 'preview',
  navigationServiceURL: 'NAVIGATIONSERVICE',
  projectID: 'PROJECTID',
  tenantID: 'TENANTID',
} as FSXARemoteApiConfig;

const fieldsConfig = {
  id: 'custom_id',
  type: 'custom_type',
} as FieldsConfig;

const getFsxaConfig = () => {
  return JSON.parse(JSON.stringify(fsxaConfig));
};

const getFieldsConfig = () => {
  return JSON.parse(JSON.stringify(fieldsConfig));
};

const combinedConfig: FSXARemoteApiConfig & { fields: FieldsConfig } = {
  ...getFsxaConfig(),
  fields: getFieldsConfig(),
};

jest.mock('../../extendibles/dataTransformer', () => {
  const DataTransformer = {
    applyTransformer: jest.fn().mockImplementation((_transformer, data) => data),
  };
  const original = jest.requireActual('../../extendibles/dataTransformer');
  return {
    ...original,
    DataTransformer,
  };
});

jest.mock('../utils/config', () => {
  const original = jest.requireActual('../utils/config');
  return {
    EcomConfig: {
      ...original.EcomConfig,
      isUntranslatedSectionFilterActive: () => false,
    },
  };
});

describe('EcomRemoteApi', () => {
  describe('constructor()', () => {
    it('creates an instance', () => {
      // Arrange & Act
      const result = new EcomRemoteApi(combinedConfig);

      // Assert
      expect(result).toBeInstanceOf(EcomRemoteApi);
    });

    it('overrides default fields values if provided', () => {
      // Arrange
      // Act
      const result = new EcomRemoteApi(combinedConfig);

      // Assert
      expect(result['fieldsConfig']).toEqual({
        id: 'custom_id',
        type: 'custom_type',
      });
    });

    it('uses default field values if none are provided', () => {
      // Arrange
      const combinedConfig = {
        ...getFsxaConfig(),
        fields: {},
      };

      // Act
      const result = new EcomRemoteApi(combinedConfig);

      // Assert
      expect(result['fieldsConfig']).toEqual({
        id: 'id',
        type: 'type',
      });
    });
  });

  describe('findPage()', () => {
    it('throws an error if parameter "id" is missing', async () => {
      // Arrange
      const fetchByFilterResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockResolvedValue(fetchByFilterResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        id: undefined,
        locale: 'de_DE',
        type: 'product',
      } as any as FindPageParams;
      // Act
      await expect(async () => {
        return api.findPage(params);
        // Assert
      }).rejects.toThrow('id is undefined');
      expect(spy).not.toHaveBeenCalled();
    });
    it('throws an error if parameter "locale" is missing and no fallback is configured', async () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const fetchByFilterResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockResolvedValue(fetchByFilterResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      EcomConfig.applyConfig({ ...coreConfig, defaultLocale: undefined });

      const params = {
        id: '123',
        locale: undefined,
        type: 'product',
      } as any as FindPageParams;
      // Act
      await expect(async () => {
        return api.findPage(params);
        // Assert
      }).rejects.toThrow('locale is undefined and no fallback is available');
      expect(spy).not.toHaveBeenCalled();
    });
    it('proceeds if parameter "locale" is missing but a fallback is configured', async () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const fetchByFilterResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockResolvedValue(fetchByFilterResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      EcomConfig.applyConfig(coreConfig);

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
      const fetchByFilterResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockResolvedValue(fetchByFilterResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        id: '123',
        locale: 'de_DE',
        type: undefined,
      } as any as FindPageParams;
      // Act
      await expect(async () => {
        return api.findPage(params);
        // Assert
      }).rejects.toThrow('type is undefined');
      expect(spy).not.toHaveBeenCalled();
    });
    it('uses FSXA API instance to find a page (with custom fields)', async () => {
      // Arrange
      const fetchByFilterResultItem = { children: [] };
      const fetchByFilterResult = { items: [fetchByFilterResultItem] };
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockResolvedValue(fetchByFilterResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        id: '123',
        locale: 'de_DE',
        type: 'product',
      } as FindPageParams;

      // Act
      const result = await api.findPage(params);

      // Assert
      expect(result).toBe(fetchByFilterResultItem);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          filters: [
            {
              operator: LogicalQueryOperatorEnum.AND,
              filters: [
                {
                  field: 'page.formData.custom_type.value',
                  operator: ComparisonQueryOperatorEnum.EQUALS,
                  value: params.type,
                },
                {
                  field: 'page.formData.custom_id.value',
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
    it('uses FSXA API instance to find a page (with default fields)', async () => {
      // Arrange
      const combinedConfig = {
        ...getFsxaConfig(),
        fields: {},
      };

      const fetchByFilterResultItem = { children: [] };
      const fetchByFilterResult = { items: [fetchByFilterResultItem] };
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockResolvedValue(fetchByFilterResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        id: '123',
        locale: 'de_DE',
        type: 'product',
      } as FindPageParams;

      // Act
      const result = await api.findPage(params);

      // Assert
      expect(result).toBe(fetchByFilterResultItem);
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
    it('applies data transformation', async () => {
      // Arrange
      const fetchByFilterResultItem = { children: [] };
      const fetchByFilterResult = { items: [fetchByFilterResultItem] };
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockResolvedValue(fetchByFilterResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        id: '123',
        locale: 'de_DE',
        type: 'product',
      } as FindPageParams;

      // Act
      const result = await api.findPage(params);
      // Assert
      expect(result).toEqual(fetchByFilterResultItem);
      expect(spy).toHaveBeenCalled();
      expect(DataTransformer.applyTransformer).toHaveBeenCalledWith(Transformer.FIND_PAGE, fetchByFilterResultItem);
    });
    it('throws an error if FSXA throws 404', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error(FSXAApiErrors.NOT_FOUND);
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockRejectedValue(error as any);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        id: '123',
        locale: 'de_DE',
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
      const error = new Error(FSXAApiErrors.NOT_AUTHORIZED);
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockRejectedValue(error as any);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        id: '123',
        locale: 'de_DE',
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
    it('throws an error if FSXA throws unknown error', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error('UNKNOWN ERROR');
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockRejectedValue(error as any);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        id: '123',
        locale: 'de_DE',
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
    it('returns null if FSXA returns no page (removeUntranslatedSections=true)', async () => {
      // Arrange
      const fetchByFilterResult = { items: [] };
      jest.spyOn(FSXARemoteApi.prototype, 'fetchByFilter').mockResolvedValue(fetchByFilterResult as any);
      const api = new EcomRemoteApi(combinedConfig);
      const coreConfig = getTestCoreConfig();
      coreConfig.project.removeUntranslatedSections = true;
      EcomConfig.applyConfig(coreConfig);

      const params = {
        id: '123',
        locale: 'de_DE',
        type: 'product',
      } as FindPageParams;

      // Act
      const result = await api.findPage(params);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('fetchNavigation()', () => {
    it('throws an error if parameter "locale" is missing and no fallback is configured', async () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const fetchNavigationResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchNavigation').mockResolvedValue(fetchNavigationResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      EcomConfig.applyConfig({ ...coreConfig, defaultLocale: undefined });

      const params = {
        initialPath: 'path',
        locale: undefined,
      } as any as FetchNavigationParams;
      // Act
      await expect(async () => {
        return api.fetchNavigation(params);
      }).rejects.toThrow('locale is undefined and no fallback is available');
      expect(spy).not.toHaveBeenCalled();
    });
    it('proceeds if parameter "locale" is missing but a fallback is configured', async () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const fetchNavigationResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchNavigation').mockResolvedValue(fetchNavigationResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      EcomConfig.applyConfig(coreConfig);

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
      const fetchNavigationResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchNavigation').mockResolvedValue(fetchNavigationResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      // Act
      const params = {
        initialPath: 'path',
        locale: 'de_DE',
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
    it('applies data transformation', async () => {
      // Arrange
      const fetchNavigationResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchNavigation').mockResolvedValue(fetchNavigationResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      // Act
      const params = {
        initialPath: 'path',
        locale: 'de_DE',
      } as FetchNavigationParams;
      const result = await api.fetchNavigation(params);

      // Assert
      expect(result).toEqual(fetchNavigationResult);
      expect(spy).toHaveBeenCalled();
      expect(DataTransformer.applyTransformer).toHaveBeenCalledWith(Transformer.FETCH_NAVIGATION, fetchNavigationResult);
    });
    it('throws an error if FSXA throws 404', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error(FSXAApiErrors.NOT_FOUND);
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchNavigation').mockRejectedValue(error as any);
      const api = new EcomRemoteApi(combinedConfig);

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
        expect(err).toBeInstanceOf(ItemNotFoundError);
        expect(err.message).toEqual('Failed to fetch navigation - not found');
      }
    });
    it('throws an error if FSXA throws 401', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error(FSXAApiErrors.NOT_AUTHORIZED);
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchNavigation').mockRejectedValue(error as any);
      const api = new EcomRemoteApi(combinedConfig);

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
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toEqual('Failed to fetch navigation - unauthorized');
      }
    });
    it('throws an error if FSXA throws unknown error', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error('UNKNOWN ERROR');
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchNavigation').mockRejectedValue(error as any);
      const api = new EcomRemoteApi(combinedConfig);

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

  describe('fetchProjectProperties()', () => {
    it('throws an error if parameter "locale" is missing and no fallback is configured', async () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const fetchProjectPropertiesResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchProjectProperties').mockResolvedValue(fetchProjectPropertiesResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      EcomConfig.applyConfig({ ...coreConfig, defaultLocale: undefined });

      const params = {
        locale: undefined,
      } as any as FetchProjectPropertiesParams;
      // Act
      await expect(async () => {
        return api.fetchProjectProperties(params);
      }).rejects.toThrow('locale is undefined and no fallback is available');
      expect(spy).not.toHaveBeenCalled();
    });
    it('proceeds if parameter "locale" is missing but a fallback is configured', async () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const fetchProjectPropertiesResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchProjectProperties').mockResolvedValue(fetchProjectPropertiesResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      EcomConfig.applyConfig(coreConfig);

      const params = {
        locale: undefined,
      } as any as FetchProjectPropertiesParams;

      // Act
      await api.fetchProjectProperties(params);

      // Assert
      expect(EcomConfig.getCoreConfig().defaultLocale).toBe('de_DE');
      expect(spy).toHaveBeenCalled();
    });
    it('uses FSXA API instance to fetch the projectProperties', async () => {
      // Arrange
      const fetchProjectPropertiesResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchProjectProperties').mockResolvedValue(fetchProjectPropertiesResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      // Act
      const params = {
        locale: 'de_DE',
      } as FetchProjectPropertiesParams;
      const result = await api.fetchProjectProperties(params);

      // Assert
      expect(result).toBe(fetchProjectPropertiesResult);
      expect(spy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          locale: params.locale,
        })
      );
    });
    it('applies data transformation', async () => {
      // Arrange
      const fetchProjectPropertiesResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchProjectProperties').mockResolvedValue(fetchProjectPropertiesResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      // Act
      const params = {
        locale: 'de_DE',
      } as FetchProjectPropertiesParams;
      const result = await api.fetchProjectProperties(params);

      // Assert
      expect(result).toEqual(fetchProjectPropertiesResult);
      expect(spy).toHaveBeenCalled();
      expect(DataTransformer.applyTransformer).toHaveBeenCalledWith(Transformer.FETCH_PROJECT_PROPERTIES, fetchProjectPropertiesResult);
    });
    it('throws an error if FSXA throws 404', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error(FSXAApiErrors.NOT_FOUND);
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchProjectProperties').mockRejectedValue(error);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        locale: 'de_DE',
      } as FetchProjectPropertiesParams;
      // Act
      try {
        await api.fetchProjectProperties(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(ItemNotFoundError);
        expect(err.message).toEqual('Failed to fetch project properties - not found');
      }
    });
    it('throws an error if FSXA throws 401', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error(FSXAApiErrors.NOT_AUTHORIZED);
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchProjectProperties').mockRejectedValue(error);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        locale: 'de_DE',
      } as FetchProjectPropertiesParams;
      // Act
      try {
        await api.fetchProjectProperties(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toEqual('Failed to fetch project properties - unauthorized');
      }
    });
    it('throws an error if FSXA throws unknown error', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error('UNKNOWN ERROR');
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchProjectProperties').mockRejectedValue(error);
      const api = new EcomRemoteApi(combinedConfig);

      const params = {
        locale: 'de_DE',
      } as FetchProjectPropertiesParams;
      // Act
      try {
        await api.fetchProjectProperties(params);
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnknownError);
        expect(err.message).toEqual('Failed to fetch project properties');
      }
    });
  });

  describe('getAvailableLocales()', () => {
    it('applies data transformation', async () => {
      // Arrange
      const getAvailableLocalesResult = ['de_DE', 'en_GB'];
      const spy = jest.spyOn(global, 'fetch').mockImplementation((_) =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              _embedded: [
                {
                  languageId: 'de_DE',
                },
                {
                  languageId: 'en_GB',
                },
              ],
            } as GetAvailableLocalesResponse),
        } as Response)
      );
      const api = new EcomRemoteApi(combinedConfig);

      // Act
      const result = await api.getAvailableLocales();

      // Assert
      expect(result).toEqual(getAvailableLocalesResult);
      expect(spy).toHaveBeenCalled();
      expect(DataTransformer.applyTransformer).toHaveBeenCalledWith(Transformer.GET_AVAILABLE_LOCALES, getAvailableLocalesResult);
    });
    it('throws an error if FSXA throws 404', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error(FSXAApiErrors.NOT_FOUND);
      const spy = jest.spyOn(global, 'fetch').mockImplementation((_) => Promise.reject(error));
      const api = new EcomRemoteApi(combinedConfig);

      // Act
      try {
        await api.getAvailableLocales();
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(ItemNotFoundError);
        expect(err.message).toEqual('Failed to get available locales - not found');
      }
    });
    it('throws an error if FSXA throws 401', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error(FSXAApiErrors.NOT_AUTHORIZED);
      const spy = jest.spyOn(global, 'fetch').mockImplementation((_) => Promise.reject(error));
      const api = new EcomRemoteApi(combinedConfig);

      // Act
      try {
        await api.getAvailableLocales();
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnauthorizedError);
        expect(err.message).toEqual('Failed to get available locales - unauthorized');
      }
    });
    it('throws an error if FSXA throws unknown error', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error('UNKNOWN ERROR');
      const spy = jest.spyOn(global, 'fetch').mockImplementation((_) => Promise.reject(error));
      const api = new EcomRemoteApi(combinedConfig);

      // Act
      try {
        await api.getAvailableLocales();
      } catch (err: any) {
        // Assert
        expect(spy).toHaveBeenCalled();
        expect(err).toBeInstanceOf(UnknownError);
        expect(err.message).toEqual('Failed to get available locales');
      }
    });
  });

  describe('findElement()', () => {
    it('throws an error if parameter "locale" is missing and no fallback is configured', async () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const fetchElementResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchElement').mockResolvedValue(fetchElementResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      EcomConfig.applyConfig({ ...coreConfig, defaultLocale: undefined });

      const params = {
        fsPageId: '123',
        locale: undefined,
      } as any as FindElementParams;
      // Act
      await expect(async () => {
        return api.findElement(params);
      }).rejects.toThrow('locale is undefined and no fallback is available');
      expect(spy).not.toHaveBeenCalled();
    });
    it('throws an error if parameter "locale" is invalid', async () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const fetchElementResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchElement').mockResolvedValue(fetchElementResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      EcomConfig.applyConfig({ ...coreConfig, defaultLocale: undefined });

      const params = {
        fsPageId: '123',
        locale: 'INVALID',
      } as any as FindElementParams;
      // Act
      await expect(async () => {
        return api.findElement(params);
      }).rejects.toThrow(`Given locale '${params.locale}' is invalid`);
      expect(spy).not.toHaveBeenCalled();
    });
    it('proceeds if parameter "locale" is missing but a fallback is configured', async () => {
      // Arrange
      const coreConfig = getTestCoreConfig();
      const fetchElementResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchElement').mockResolvedValue(fetchElementResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      EcomConfig.applyConfig(coreConfig);

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
      const fetchElementResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchElement').mockResolvedValue(fetchElementResult as any);
      const api = new EcomRemoteApi(combinedConfig);

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
    it('applies data transformation', async () => {
      // Arrange
      const fetchElementResult = {};
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchElement').mockResolvedValue(fetchElementResult as any);
      const api = new EcomRemoteApi(combinedConfig);

      // Act
      const params = {
        fsPageId: '213',
        locale: 'de_DE',
      } as FindElementParams;
      const result = await api.findElement(params);

      // Assert
      expect(result).toEqual(fetchElementResult);
      expect(spy).toHaveBeenCalled();
      expect(DataTransformer.applyTransformer).toHaveBeenCalledWith(Transformer.FIND_ELEMENT, fetchElementResult);
    });
    it('throws an error if FSXA throws 404', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error(FSXAApiErrors.NOT_FOUND);
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchElement').mockRejectedValue(error as any);
      const api = new EcomRemoteApi(combinedConfig);

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
      const error = new Error(FSXAApiErrors.NOT_AUTHORIZED);
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchElement').mockRejectedValue(error as any);
      const api = new EcomRemoteApi(combinedConfig);

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
    it('throws an error if FSXA throws unknown error', async () => {
      expect.assertions(3);
      // Arrange
      const error = new Error('UNKNOWN ERROR');
      const spy = jest.spyOn(FSXARemoteApi.prototype, 'fetchElement').mockRejectedValue(error as any);
      const api = new EcomRemoteApi(combinedConfig);

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
    it('returns null if FSXA returns no element (removeUntranslatedSections=true)', async () => {
      // Arrange
      const fetchByFilterResult = null;
      jest.spyOn(FSXARemoteApi.prototype, 'fetchElement').mockResolvedValue(fetchByFilterResult as any);
      const api = new EcomRemoteApi(combinedConfig);
      const coreConfig = getTestCoreConfig();
      coreConfig.project.removeUntranslatedSections = true;
      EcomConfig.applyConfig(coreConfig);

      const params = {
        fsPageId: '123',
        locale: 'de_DE',
      } as FindElementParams;

      // Act
      const result = await api.findElement(params);

      // Assert
      expect(result).toBeNull();
    });
  });
});
