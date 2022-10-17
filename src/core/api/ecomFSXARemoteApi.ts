import { FSXARemoteApi } from 'fsxa-api';
import { getQueryParams } from '../utils/getQueryParams';
import { FSXARemoteApiConfig } from 'fsxa-api/dist/types/types';
import { Logger } from '../utils/Logger';

export class EcomFSXARemoteApi extends FSXARemoteApi {
  fsServerUrl?: string;
  private logger: Logger;

  constructor(config: FSXARemoteApiConfig & { fsServerUrl?: string }) {
    super(config);
    this.fsServerUrl = config.fsServerUrl;
    this.logger = new Logger(this.logLevel, 'EcomFSXARemoteApi');
  }
}
