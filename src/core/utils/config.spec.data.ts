import { LogLevel } from './logging/Logger';
import { CoreConfig } from './config.meta';

/**
 * @internal
 */
export const coreConfig = {
  fsServerOrigin: 'https://example.org/FSServerOrigin',
  logLevel: LogLevel.DEBUG,
  project: {
    apiKey: {
      master: '0b099fe4-f040-405b-b0cf-5e6af08c0593',
      preview: '029d0d93-76c1-44f0-b362-e3386e8540b9',
      release: 'f87e7fb3-c04d-4bff-a372-ae52aaf32c80',
    },
    caasURL: 'https://example.org/CaaS',
    navigationServiceURL: 'https://example.org/NavigationService',
    projectID: 'cd63ae7a-b481-40a5-865e-afc1d34f6a54',
    tenantID: 'tenant-id',
  },
} as CoreConfig;
