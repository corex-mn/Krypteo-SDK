import { retry } from 'async';
import { IFRAME_MESSAGE_ORIGIN_INCLUDES } from '../constants';
import { SignerError } from '../errors/signer-error';
import { Transaction } from '../subproviders/signature';
import { parseResponse } from '../utils/request-utils';

// JSON representation of a transaction
interface JSONTransactionObject {
  transaction: Transaction;
}

/**
 * This class is responsible for signing transactions. It only knows about Bitski's proprietary transaction objects.
 * It is also the only class that knows about the iframe signing implementation.
 */
export class BitskiTransactionSigner {
  // The base URL for bitski's web signer interface
  protected webBaseUrl: string;

  // The base url for bitski's transaction API
  protected apiBaseUrl: string;

  // The HTTP headers to include in each request
  protected defaultHeaders: any;

  // Current Dialog instance
  private currentRequestDialog?: WindowProxy | null;

  // App Callback URL
  private callbackURL?: string;

  // Cache of the current request's callbacks
  private currentRequest?: [(signed: any) => void, (error: Error) => void];

  constructor(
    webBaseUrl: string,
    apiBaseUrl: string,
    defaultHeaders: any,
    callbackURL: string | undefined,
  ) {
    this.webBaseUrl = webBaseUrl;
    this.apiBaseUrl = apiBaseUrl;
    this.defaultHeaders = defaultHeaders;
    this.callbackURL = callbackURL;

    // Watch for new messages on the window.
    window.addEventListener('message', this.receiveMessage.bind(this), false);
  }

  public async sign(transaction: Transaction, accessToken: string): Promise<string> {
    // If we have a callback URL, use the redirect flow
    if (this.callbackURL) {
      const persisted = await this.submitTransaction(transaction, accessToken);
      return this.redirectToCallbackURL(persisted.transaction);
    }

    this.submitTransaction(transaction, accessToken).catch((error) => {
      return this.handleCallback({ error });
    });

    // Show the modal (await response)
    return this.showAuthorizationModal(transaction);
  }

  /**
   * Event listener for callbacks from the iframe
   * @param event MessageEvent received from the browser
   */
  protected receiveMessage(event: MessageEvent): void {
    // Ignore messages from the current window, and from frames that aren't on Bitski.com
    if (
      event.source === window ||
      (!event.origin.includes(IFRAME_MESSAGE_ORIGIN_INCLUDES) &&
        !event.origin.includes('localhost'))
    ) {
      return;
    }
    const data = event.data;

    // Ignore message events that don't actually have data
    if (data === undefined || data === null) {
      return;
    }

    this.handleCallback(data);
  }

  protected handleCallback(callback: any): void {
    // Ignore messages when we don't have a current request in flight
    if (this.currentRequest === undefined) {
      return;
    }

    const [fulfill, reject] = this.currentRequest;

    // Dismiss current dialog
    if (this.currentRequestDialog) {
      this.currentRequestDialog.close();
    }

    // Call the callback to complete the request
    if (callback.error) {
      reject(callback.error);
    } else {
      fulfill(callback.result);
    }

    // Clear state
    this.currentRequest = undefined;
    this.currentRequestDialog = undefined;
  }

  /**
   * Responsible for submitting the Transaction object to the API
   * @param transaction The Transaction object to submit
   * @param accessToken The current user's access token
   */
  protected async submitTransaction(
    transaction: Transaction,
    accessToken: string,
  ): Promise<JSONTransactionObject> {
    const requestBody = { transaction };
    const headers = Object.assign({}, this.defaultHeaders, {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });
    const parsed = await retry({ times: 5 }, async () => {
      const response = await fetch(`${this.apiBaseUrl}/transactions`, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers,
      });

      return parseResponse(response);
    });

    return parsed;
  }

  /**
   * Displays the authorization form in a modal window
   * @param transaction The transaction that has been submitted
   */
  protected showAuthorizationModal(transaction: Transaction): Promise<any> {
    if (this.currentRequestDialog && !this.currentRequestDialog.closed) {
      this.currentRequestDialog.focus();
      return Promise.resolve('');
    }

    return new Promise((fulfill, reject) => {
      const url = `${this.webBaseUrl}/transactions/${transaction.id}`;

      this.currentRequest = [fulfill, reject];

      const left = window.innerWidth / 2;
      const top = window.innerHeight / 2;
      this.currentRequestDialog = window.open(
        url,
        '_blank',
        `width=400,height=400,top=${top - 200},left=${left - 200}`,
      );

      const checkChild = () => {
        if (this.currentRequestDialog && this.currentRequestDialog.closed) {
          reject(SignerError.UserCancelled());
          clearInterval(timer);
        }
      };
      const timer = setInterval(checkChild, 500);

      if (this.currentRequestDialog) {
        this.currentRequestDialog.addEventListener('onunload', () => {
          reject(SignerError.UserCancelled());
        });
      }
    });
  }

  protected redirectToCallbackURL(transaction: Transaction): Promise<string> {
    const url = `${this.webBaseUrl}/transactions/${transaction.id}?redirectURI=${this.callbackURL}`;
    window.location.href = url;
    return Promise.resolve('');
  }
}
