import cors from 'cors';
import express from 'express';

function createSecureActionMiddleware(secureOrigin: string) {
  const createMiddleware = (allowedActions: string[]) => {
    const middleware: express.Handler = (req, _res, next) => {
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

export async function main() {
  const app = express();

  const secureAction = createSecureActionMiddleware(
    process.env.SECURE_ORIGIN || 'http://localhost:3001',
  );

  app.use(cors());

  app.delete(
    '/vault/:item',
    secureAction(['delete-vault-item']),
    (req, res) => {
      res.send({
        deleted: [
          {
            name: req.params.item,
          },
        ],
      });
    },
  );

  await new Promise((resolve, reject) => {
    const server = app.listen(parseInt(process.env.PORT!, 10) || 3002, err => {
      if (err) {
        reject(new Error(`Failed to listen, ${err}`));
        return;
      }
      console.log(`Listening to port ${(server.address() as any).port}`);
      resolve();
    });
  });
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
