/**
 * Return value of decrypted JWT token payload
 */
export type ValidTokenPayload =
  | {
      UniversalAllow: true;

      /**
       * Whether the page is a FirstSpirit- or shop-driven page.
       */
      FsDriven: boolean;

      /**
       * ID of the page permitted, if UniversalAllow is disabled (default).
       */
      PageId?: string;

      /**
       * Type of the page permitted, if UniversalAllow is disabled (default).
       */
      PageType?: string;
    }
  | {
      /**
       * Whether to allow all pages.
       */
      UniversalAllow?: false;

      /**
       * ID of the page permitted, if UniversalAllow is disabled (default).
       */
      PageId: string;

      /**
       * Type of the page permitted, if UniversalAllow is disabled (default).
       */
      PageType: string;

      /**
       * Whether the page is a FirstSpirit- or shop-driven page.
       */
      FsDriven: boolean;
    };

/**
 * Result of token decryption and validation from `jose`.
 */
export type ValidTokenResult = {
  payload: ValidTokenPayload;
  protectedHeader: object;
};
