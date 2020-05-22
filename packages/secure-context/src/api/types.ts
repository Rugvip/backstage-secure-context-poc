import { ApiRef } from '@backstage/core';

export type SecureAction = {
  id: string;
  title: string | string[];
  body: string | string[];
};

export type SecureContextApi = {
  execute(action: SecureAction, data: any): Promise<any>;
};

export const secureContextApiRef = new ApiRef<SecureContextApi>({
  id: 'core.securecontext',
  description: 'Execute sensitive actions in a secure browser context',
});
