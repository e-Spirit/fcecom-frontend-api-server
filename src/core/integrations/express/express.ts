import express from 'express';
import { fallbackHandler, FETCH_NAVIGATION_ROUTE, fetchNavigation, FIND_PAGE_ROUTE, findPage, IS_PREVIEW_ROUTE, isPreview } from './handlers';
import { CoreConfig } from '../../utils/config.meta';
import { initCoreConfig } from '../../utils/config';
import { getLogger } from '../../utils/logging/getLogger';

/**
 * Generates an Express middleware based on the given project configuration.
 *
 * @param config Core configuration to get middleware for.
 * @returns
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
  router.get(IS_PREVIEW_ROUTE, isPreview);

  router.all('*', fallbackHandler);

  return router;
};
