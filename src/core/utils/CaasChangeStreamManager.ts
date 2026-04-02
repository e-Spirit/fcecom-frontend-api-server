/**
 * @internal
 * @module CaasChangeStreamManager
 */

import EventEmitter from 'events';
import { EcomConfig } from './config';
import { getLogger } from './logging/getLogger';

const RECONNECT_DELAY_MS = 1000;
const PING_INTERVAL_MS = 30000;

/**
 * Represents a single change event received from the CaaS change stream.
 *
 * @internal
 */
export type CaasChangeEvent = {
  /**
   * The CaaS document ID of the changed document.
   */
  documentId: string;

  /**
   * The type of change, e.g. 'insert', 'update', 'replace', 'delete'.
   */
  changeType: string;
};

/**
 * Manages the WebSocket connection to the CaaS change stream and broadcasts
 * incoming change events to all registered subscribers.
 *
 * Based on the implementation in fcecom-frontend-api-backend.
 *
 * @internal
 */
export class CaasChangeStreamManager {
  private static instance: CaasChangeStreamManager;
  private readonly emitter = new EventEmitter();
  private readonly logger = getLogger('CaasChangeStreamManager');
  private started = false;

  private constructor() {}

  /**
   * Returns the singleton instance of the CaasChangeStreamManager.
   */
  static getInstance(): CaasChangeStreamManager {
    if (!CaasChangeStreamManager.instance) {
      CaasChangeStreamManager.instance = new CaasChangeStreamManager();
    }
    return CaasChangeStreamManager.instance;
  }

  /**
   * Starts the WebSocket connection to the CaaS change stream using the current
   * core configuration. Silently skips if required config is missing.
   */
  start(): void {
    if (this.started) return;

    const { caasURL, tenantID, projectID, apiKey } = EcomConfig.getCoreConfig().project;

    if (!caasURL || !tenantID || !projectID) {
      this.logger.warn('CaaS change stream skipped: caasURL, tenantID, or projectID not configured.');
      return;
    }

    const key = apiKey.preview || apiKey.master;
    if (!key) {
      this.logger.warn('CaaS change stream skipped: No API key (preview or master) configured.');
      return;
    }

    this.started = true;

    const baseUrl = caasURL.replace(/\/$/, '');
    const previewCollectionUrl = new URL(`${baseUrl}/${tenantID}/${projectID}.preview.content`);
    this.connect(previewCollectionUrl, key);
  }

  /**
   * Registers a listener to receive CaaS change events.
   *
   * @param listener Function called with each incoming CaasChangeEvent.
   */
  subscribe(listener: (event: CaasChangeEvent) => void): void {
    this.emitter.on('change', listener);
  }

  /**
   * Removes a previously registered listener.
   *
   * @param listener The listener to remove.
   */
  unsubscribe(listener: (event: CaasChangeEvent) => void): void {
    this.emitter.off('change', listener);
  }

  private async connect(previewCollectionUrl: URL, apiKey: string): Promise<void> {
    const tenantID = previewCollectionUrl.pathname.split('/')[1];

    let token: string;
    try {
      const tokenUrl = new URL(`_logic/securetoken?tenant=${tenantID}`, previewCollectionUrl.origin);
      const response = await fetch(tokenUrl.href, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { securetoken: string };
      token = data.securetoken;
    } catch (error) {
      this.logger.error('CaaS change stream: Failed to retrieve secure token', error);
      this.logger.warn(`Retrying in ${RECONNECT_DELAY_MS / 1000}s...`);
      setTimeout(() => this.connect(previewCollectionUrl, apiKey), RECONNECT_DELAY_MS);
      return;
    }

    const wsUrl = `wss://${previewCollectionUrl.host}${previewCollectionUrl.pathname}/_streams/crud?securetoken=${token}`;
    this.logger.info('CaaS change stream: Connecting...');

    let ws: any;
    try {
      const { default: WebSocket } = await import('ws');
      ws = new WebSocket(wsUrl);
    } catch {
      this.logger.warn('CaaS change stream: ws package not available. Change stream disabled.');
      return;
    }

    let pingInterval: ReturnType<typeof setInterval>;

    ws.on('open', () => {
      this.logger.info('CaaS change stream: Connected.');
      pingInterval = setInterval(() => ws.ping(), PING_INTERVAL_MS);
    });

    ws.on('message', (data: Buffer) => {
      try {
        const {
          documentKey: { _id: documentId },
          operationType: changeType,
        } = JSON.parse(data.toString());

        const event: CaasChangeEvent = { documentId, changeType };
        this.logger.debug(`CaaS event: ${changeType} on '${documentId}'`);
        this.emitter.emit('change', event);
      } catch {
        this.logger.warn('CaaS change stream: Received unparseable message');
      }
    });

    ws.on('close', (code: number) => {
      clearInterval(pingInterval);
      this.logger.warn(`CaaS change stream: Connection closed (code ${code}). Reconnecting in ${RECONNECT_DELAY_MS / 1000}s...`);
      setTimeout(() => this.connect(previewCollectionUrl, apiKey), RECONNECT_DELAY_MS);
    });

    ws.on('error', (error: Error) => {
      this.logger.error('CaaS change stream: WebSocket error', error.message);
    });
  }
}
