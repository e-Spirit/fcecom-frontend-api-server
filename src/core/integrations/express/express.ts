import express from 'express';
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
  FETCH_PROJECT_PROPERTIES_ROUTE,
  fetchProjectProperties
} from './handlers';
import { CoreConfig } from '../../utils/config.meta';
import { initCoreConfig } from '../../utils/init';
import { getLogger } from '../../utils/logging/getLogger';

/**
 * Generates an Express middleware based on the given project configuration.
 *
 * @param config Core configuration to get middleware for.
 * @returns Express router handling the Connect-for-Commerce endpoints.
 */
export const getEcomEndpoints = (config: CoreConfig) => {
  const logger = getLogger('Get E-Commerce Endpoints');

  try {
    initCoreConfig(config);
  } catch (error: any) {
    logger.error(error);
    return undefined;
  }

  const router = express.Router();
  router.use(express.json());

  router.get(FIND_PAGE_ROUTE, findPage);
  router.get(FETCH_NAVIGATION_ROUTE, fetchNavigation);
  router.get(FIND_ELEMENT_ROUTE, findElement);
  router.get(IS_PREVIEW_ROUTE, isPreview);
  router.get(FETCH_PROJECT_PROPERTIES_ROUTE, fetchProjectProperties);

  router.all('*', fallbackHandler);

  return router;
};
