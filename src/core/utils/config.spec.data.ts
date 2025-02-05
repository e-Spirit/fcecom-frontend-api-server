import { LogLevel } from './logging/Logger';
import { CoreConfig } from './config.meta';

const defaultLocale = 'de_DE';
/**
 * @internal
 */
const coreConfig = {
  fsServerOrigin: 'https://example.org/FSServerOrigin',
  defaultLocale,
  logLevel: LogLevel.DEBUG,
  project: {
    apiKey: {
      master: '0b099fe4-f040-405b-b0cf-5e6af08c0593',
      preview: '029d0d93-76c1-44f0-b362-e3386e8540b9',
      release: 'f87e7fb3-c04d-4bff-a372-ae52aaf32c80',
    },
    remotes: {
      media: {
        locale: defaultLocale,
        id: '39fc8ac9-e4ec-4eab-b541-aea7d8dd2718',
      },
      additionalMedia: {
        locale: defaultLocale,
        id: '718efd80-fa21-4e7a-b735-0da91fbc73dc',
      },
    },
    shareView: {
      secret: 'i-am-a-secret',
    },
    caasURL: 'https://example.org/CaaS',
    navigationServiceURL: 'https://example.org/NavigationService',
    projectID: 'cd63ae7a-b481-40a5-865e-afc1d34f6a54',
    tenantID: 'tenant-id',
  },
} as CoreConfig;

/**
 * @internal
 * @returns A deep copy of the example config.
 */
export const getTestCoreConfig = () => {
  return JSON.parse(JSON.stringify(coreConfig)) as CoreConfig;
};
