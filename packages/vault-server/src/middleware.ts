import { Handler } from 'express';

export function createSecureActionMiddleware(secureOrigin: string) {
  const createMiddleware = (allowedActions: string[]) => {
    const middleware: Handler = (req, _res, next) => {
      const { origin, referer = '' } = req.headers;
      console.log(`Request from ${origin}`);

      if (origin !== secureOrigin) {
        next(new Error(`Request not allowed from origin ${origin}`));
        return;
      }

      const actionMatch = referer.match(/\/([^/]+)\.html$/);
      if (!actionMatch) {
        next(
          new Error(`Failed to read secure action ID in referrer '${referer}'`),
        );
        return;
      }

      const action = actionMatch[1];
      if (!allowedActions.includes(action)) {
        next(new Error(`Action '${action}' is not allowed`));
        return;
      }

      console.log(`Allowed secure action '${action}'`);
      next();
    };
    return middleware;
  };

  return createMiddleware;
}
