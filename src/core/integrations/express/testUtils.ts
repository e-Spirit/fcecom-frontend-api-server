/**
 * @module
 * @hidden
 */
import { Request, Response } from 'express';

/**
 * @hidden
 */
export const generateResponseMock = () => {
  const resMock = {
    end: jest.fn(),
  } as any;
  resMock.status = jest.fn().mockReturnValue(resMock);
  resMock.set = jest.fn().mockReturnValue(resMock);
  resMock.json = jest.fn().mockReturnValue(resMock);
  resMock.send = jest.fn().mockReturnValue(resMock);
  resMock.sendStatus = jest.fn().mockReturnValue(resMock);
  resMock.appendHeader = jest.fn();
  return resMock as Response;
};

/**
 * @hidden
 */
export const generateRequestMock = () => {
  const reqMock = {
    params: {},
    query: {},
    body: '',
  };
  return reqMock as Request;
};
