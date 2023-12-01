import { getEcomEndpoints } from './express';
import {
  fallbackHandler,
  FETCH_NAVIGATION_ROUTE,
  fetchNavigation,
  FIND_PAGE_ROUTE,
  findPage,
  IS_PREVIEW_ROUTE,
  isPreview,
  FIND_ELEMENT_ROUTE,
  findElement,
} from './handlers';
import { coreConfig } from '../../utils/config.spec.data';

const routerMock = {
  use: jest.fn(),
  get: jest.fn(),
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
      const result = getEcomEndpoints(coreConfig);
      // Assert
      expect(result).toBe(routerMock);
      expect(routerMock.use).toBeCalledWith(expressJsonMock);
      expect(routerMock.get).toBeCalledWith(FIND_PAGE_ROUTE, findPage);
      expect(routerMock.get).toBeCalledWith(FETCH_NAVIGATION_ROUTE, fetchNavigation);
      expect(routerMock.get).toBeCalledWith(FIND_ELEMENT_ROUTE, findElement);
      expect(routerMock.get).toBeCalledWith(IS_PREVIEW_ROUTE, isPreview);
      expect(routerMock.all).toBeCalledWith('*', fallbackHandler);
    });
  });
});
