import { FSXARemoteApiConfig } from 'fsxa-api';

export interface ApiKeyConfig {
  master: string;
  preview: string;
  release: string;
}

export interface ProjectConfig {
  apiKey: ApiKeyConfig;
  navigationServiceURL: string;
  caasURL: string;
  projectID: string;
  tenantID: string;
}

export type CoreConfig = {
  project: ProjectConfig;
  fsServerOrigin: string;
  logLevel: number;
};

export interface FSXAConfig {
  preview: FSXARemoteApiConfig;
  release: FSXARemoteApiConfig;
}
