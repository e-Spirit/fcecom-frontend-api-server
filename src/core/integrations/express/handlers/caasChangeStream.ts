import { Request, Response } from 'express';
import { CaasChangeEvent, CaasChangeStreamManager } from '../../../utils/CaasChangeStreamManager';
import { getLogger } from '../../../utils/logging/getLogger';

const HEARTBEAT_INTERVAL_MS = 30000;

/**
 * Express handler that exposes the CaaS change stream as a Server-Sent Events (SSE) endpoint.
 * The client (browser) connects to this endpoint and receives CaaS document change events
 * in real time.
 *
 * @internal
 * @param req Express request object.
 * @param res Express response object.
 */
export const caasChangeStream = (req: Request, res: Response): void => {
  const logger = getLogger('CaaS Change Stream Handler');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = (event: CaasChangeEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  const heartbeat = setInterval(() => {
    res.write(': heartbeat\n\n');
  }, HEARTBEAT_INTERVAL_MS);

  CaasChangeStreamManager.getInstance().subscribe(sendEvent);

  req.on('close', () => {
    clearInterval(heartbeat);
    CaasChangeStreamManager.getInstance().unsubscribe(sendEvent);
    logger.debug('SSE client disconnected from CaaS change stream');
  });
};

/**
 * @internal
 */
export const CAAS_CHANGE_STREAM_ROUTE = '/caas-change-stream';
