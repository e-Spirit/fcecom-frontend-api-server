import { getNamespace } from 'continuation-local-storage';

export const getQueryParams = () => {
  return getNamespace('request')?.get('queryParams');
};
