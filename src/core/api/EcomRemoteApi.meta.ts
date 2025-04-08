import { Page } from 'fsxa-api';

export type FetchResponseItem = Page;

export type AvailableLocale = {
  tenantId: string;
  navigationId: string;
  languageId: string;
};

export type GetAvailableLocalesResponse = {
  _embedded: Array<AvailableLocale>;
};

/**
 * Parameters used to fetch project properties.
 *
 * @export
 * @interface FetchProjectPropertiesParams
 */
export type FetchProjectPropertiesParams = {
  /**
   * Value must be ISO conform, both 'en' and 'en_US' are valid
   */
  locale: string;
};

/**
 * Parameters used to find an element.
 *
 * @export
 * @interface FindElementParams
 */
export type FindElementParams = {
  /**
   * ID of the element.
   */
  fsPageId: string;
  /**
   * Locale to get the page in.
   * If omitted, a default locale has to be provided.
   */
  locale?: string;
};

/**
 * Parameters to fetch the navigation.
 *
 * @export
 * @interface FetchNavigationParams
 */
export type FetchNavigationParams = {
  /**
   * Locale to get the navigation in.
   * If omitted, a default locale has to be provided.
   */
  locale?: string;
  /**
   * Initial path to fetch from.
   */
  initialPath?: string;
};

/**
 * Parameters used to find a page.
 *
 * @export
 * @interface FindPageParams
 */
export type FindPageParams = {
  /**
   * ID of the page.
   */
  id: string;
  /**
   * Locale to get the page in.
   * If omitted, a default locale has to be provided.
   */
  locale?: string;
  /**
   * Type of the page.
   */
  type: string;
};
