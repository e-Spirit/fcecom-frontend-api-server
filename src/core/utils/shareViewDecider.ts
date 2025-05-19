import { getLogger } from './logging/getLogger';
import { IncomingMessage } from 'http';
import { EcomConfig } from './config';
import { verifyToken } from './verifyToken';
import { ValidTokenPayload } from './verifyToken.meta';

/**
 * A Provider to decide if ShareView is on or off on a per-request basis.
 * ShareView mode means fetching Preview CaaS Content without being inside the ContentCreator.
 *
 * @namespace ShareViewDecider
 */
export namespace ShareViewDecider {
  export let logger = getLogger('ShareViewDecider');

  /**
   * Checks if the requested FirstSpirit-driven page is permitted by the token.
   * @param params  URL parameters containing information about the requested page.
   * @param payload Decrypted and verified JWT payload containing information about the FirstSpirit-driven page.
   * @returns Whether the page matches the token permissions
   * @internal
   */
  const matchesFsPage = (params: URLSearchParams, payload: ValidTokenPayload): boolean => {
    const fsPageId = params.get('fsPageId');
    const { PageId, PageType } = payload;

    if (!fsPageId || !PageId || !PageType) return false; // nullish
    return PageId === fsPageId; // equal
  };

  /**
   * Checks if the requested shop-driven page is permitted by the token.
   * @param params  URL parameters containing information about the requested page.
   * @param payload Decrypted and verified JWT payload containing information about the shop-driven page.
   * @returns Whether the page matches the token permissions
   * @internal
   */
  const matchesShopPage = (params: URLSearchParams, payload: ValidTokenPayload): boolean => {
    const id = params.get('id');
    const type = params.get('type');
    const { PageId, PageType } = payload;

    if (!id || !type || !PageId || !PageType) return false; // nullish
    return PageType === type && PageId === id; // equal
  };

  /**
   * This method decrypts, validates and checks a JWT token
   *  to check if a page can be displayed in a shared preview context.
   * @param url   URL of the requested page
   * @param token string holding a JWT token. It has to be encrypted and base64 encoded.
   */
  const checkToken = async ({ search, pathname }: URL, token: string) => {
    // Empty token will never be valid
    if (!token) return false;

    // Get page information
    const params = new URLSearchParams(search);

    try {
      // Decrypt and validate token
      const { secret } = EcomConfig.getCoreConfig().project?.shareView ?? {};
      const { payload } = await verifyToken(token, secret);
      const { UniversalAllow, FsDriven } = payload;

      // Navigation preview if token is valid
      if (pathname.endsWith('fetchNavigation')) return true;

      // Allow all pages with valid token
      if (UniversalAllow) return true;

      // Allow the specific page that is permitted.
      return FsDriven ? matchesFsPage(params, payload) : matchesShopPage(params, payload);
    } catch (err) {
      logger.warn('ShareToken invalid: ', err);
      return false;
    }
  };

  /**
   * Decide if the ShareView mode is on of off.
   * As default, ShareView mode will be kept turned off.
   *
   * @internal
   * @param req
   */
  export const isShareSession = async (req: IncomingMessage): Promise<boolean> => {
    const url = new URL(req.url!!, `https://${req.headers?.host}`);

    // Headers can occur multiple times, we can use a single one or loop over the array of multiple headers.
    const headers = ((req?.headers?.['ecom-share-token'] ?? '') as string).split(', ');

    // Loop over all headers and check them
    const checkHeader = (token: string) => checkToken(url, token);
    const checked = await Promise.all(headers.map(checkHeader));

    // Find token matching the received request
    return checked.some((b) => b);
  };
}
