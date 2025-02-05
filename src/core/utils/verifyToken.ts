import { base64url, jwtDecrypt } from 'jose';
import { ValidTokenResult } from './verifyToken.meta';

/**
 * Verifies a ShareView token and returns JWTDecryptResult
 * @param token  Encrypted and signed JWT token.
 * @param secret Base64 encoded secret.
 * @returns JWTDecryptResult
 */
export let verifyToken = async (token: string, secret: string): Promise<ValidTokenResult> =>
  await jwtDecrypt(token, base64url.decode(secret), {
    issuer: 'com:crownpeak:ecom:cfc:module',
    subject: 'com:crownpeak:ecom:cfc:storefront:sharePreview',
  });
