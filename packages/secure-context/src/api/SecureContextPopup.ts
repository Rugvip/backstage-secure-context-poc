import { SecureContextApi, SecureAction } from './types';

const DEFAULT_WIDTH = 500;
const DEFAULT_HEIGHT = 300;

type Options = {
  secureOrigin: string;
  width?: number;
  height?: number;
};

export class SecureContextPopup implements SecureContextApi {
  constructor(private readonly options: Options) {}

  async execute<Req, Res>(
    action: SecureAction<Req, Res>,
    data: Req,
  ): Promise<Res> {
    const url = `${this.options.secureOrigin}/actions/${action.id}/action.html`;

    const width = this.options.width || DEFAULT_WIDTH;
    const height = this.options.height || DEFAULT_HEIGHT;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const windowOptions = `menubar=no,location=no,resizable=no,scrollbars=no,status=no,width=${width},height=${height},top=${top},left=${left}`;

    return new Promise((resolve, reject) => {
      const popup = window.open(url, 'Secure Context Prompt', windowOptions);

      if (!popup || typeof popup.closed === 'undefined' || popup.closed) {
        reject(new Error('Failed to open popup'));
        return;
      }

      const handleResult = ({ result, payload }: any) => {
        if (result === 'rejected') {
          const error = new Error('Request was rejected');
          error.name = 'RejectedError';
          reject(error);
        } else if (result === 'response') {
          resolve(payload);
        } else if (result === 'error') {
          const error = new Error(payload.message);
          error.name = payload.name || 'UnknownError';
          reject(error);
        } else {
          reject(new Error('Unknown secure context response'));
        }

        done();
      };

      const handleReady = () => {
        popup.postMessage(
          {
            type: 'secure-context-data',
            payload: data,
          },
          this.options.secureOrigin,
        );
      };

      const messageListener = (event: MessageEvent) => {
        if (event.source !== popup) {
          return;
        }
        if (event.origin !== this.options.secureOrigin) {
          return;
        }
        if (event.data.type === 'secure-context-response') {
          handleResult(event.data);
        } else if (event.data.type === 'secure-context-ready') {
          handleReady();
        }
      };

      const intervalId = setInterval(() => {
        if (popup.closed) {
          const error = new Error('Request failed, popup was closed');
          error.name = 'PopupClosedError';
          reject(error);
          done();
        }
      }, 100);

      function done() {
        window.removeEventListener('message', messageListener);
        clearInterval(intervalId);
      }

      window.addEventListener('message', messageListener);
    });
  }
}
