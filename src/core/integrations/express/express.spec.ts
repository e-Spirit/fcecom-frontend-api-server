import { getEcomEndpoints } from './express';
import {
  fallbackHandler,
  FETCH_BY_FILTER_ROUTE,
  FETCH_NAVIGATION_ROUTE,
  fetchByFilter,
  fetchNavigation,
  FIND_ELEMENT_ROUTE,
  FIND_PAGE_ROUTE,
  findElement,
  findPage,
  IS_PREVIEW_ROUTE,
  isPreview,
} from './handlers';
import { getTestCoreConfig } from '../../utils/config.spec.data';

const routerMock = {
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  all: jest.fn(),
};

jest.mock('../../utils/init', () => {
  return {
    initCoreConfig: () => {},
  };
});
const expressJsonMock = {};
jest.mock('express', () => {
  return {
    Router: () => routerMock,
    json: () => expressJsonMock,
  };
});
describe('express integration', () => {
  describe('getEcomEndpoints()', () => {
    it('sets all routes and enables json', () => {
      // Arrange & Act
      const coreConfig = getTestCoreConfig();
      const result = getEcomEndpoints(coreConfig);
      // Assert
      expect(result).toBe(routerMock);
      expect(routerMock.use).toHaveBeenCalledWith(expressJsonMock);
      expect(routerMock.get).toHaveBeenCalledWith(FIND_PAGE_ROUTE, findPage);
      expect(routerMock.get).toHaveBeenCalledWith(FETCH_NAVIGATION_ROUTE, fetchNavigation);
      expect(routerMock.post).toHaveBeenCalledWith(FETCH_BY_FILTER_ROUTE, fetchByFilter);
      expect(routerMock.get).toHaveBeenCalledWith(FIND_ELEMENT_ROUTE, findElement);
      expect(routerMock.get).toHaveBeenCalledWith(IS_PREVIEW_ROUTE, isPreview);
      expect(routerMock.all).toHaveBeenCalledWith('*', fallbackHandler);
    });
  });
});
