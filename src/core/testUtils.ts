import { IncomingMessage } from 'http';
import { IncomingHttpHeaders } from 'node:http';

/**
 * @hidden
 */
export const generateRequestMock = () => {
  const reqMock = {
    params: {},
    query: {},
    headers: {} as IncomingHttpHeaders,
    body: '',
  };
  return reqMock as unknown as IncomingMessage;
};
