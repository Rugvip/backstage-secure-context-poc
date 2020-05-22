import { SecureContextApi, SecureAction } from './types';

export class SecureContextPrompt implements SecureContextApi {
  async execute<Req, Res>(
    action: SecureAction<Req, Res>,
    data: Req,
  ): Promise<Res> {
    const title = this.template(action.title, data);
    const body = this.template(action.body, data);

    // eslint-disable-next-line no-alert
    const allowed = window.confirm(`${title}\n${body}`);
    if (!allowed) {
      throw new Error('You are not welcome here!');
    }

    return action.handler(data);
  }

  template(template: string | string[], data: any) {
    const lookupByPath = ([first, ...rest]: string[], d: any): any => {
      if (!first || !d) {
        return d;
      }
      return lookupByPath(rest, d[first]);
    };

    const str = Array.isArray(template) ? template.join('\n') : template;

    return str.replace(/\{\{(.*?)\}\}/, (_, path) => {
      return lookupByPath(path.trim().split('.'), data);
    });
  }
}
