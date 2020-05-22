import { ApiRef } from '@backstage/core';

export type SecureAction<Req, Res> = {
  id: string;
  title: string | string[];
  body: string | string[];
  handler: (data: Req) => Promise<Res>;
};

export type SecureContextApi = {
  execute<Req, Res>(action: SecureAction<Req, Res>, data: Req): Promise<Res>;
};

export const secureContextApiRef = new ApiRef<SecureContextApi>({
  id: 'core.securecontext',
  description: 'Execute sensitive actions in a secure browser context',
});
