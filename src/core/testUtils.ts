import { IncomingMessage } from 'http';

/**
 * @hidden
 */
export const generateRequestMock = () => {
  const reqMock = {
    params: {},
    query: {},
    body: '',
  };
  return reqMock as unknown as IncomingMessage;
};
