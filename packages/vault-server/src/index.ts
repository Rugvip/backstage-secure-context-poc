import cors from 'cors';
import express from 'express';

// We could rely on CORS for this check, but we might be deployed
// on the same domain as the frontend, and then it wouldn't work.
function createSecureOriginMiddleware(secureOrigin: string) {
  const middleware: express.Handler = (req, _res, next) => {
    const { origin } = req.headers;
    console.log(`Request from ${origin}`);

    if (origin !== secureOrigin) {
      const error = new Error(`Request not allowed from origin ${origin}`);
      error.name = 'NotAllowedError';
      (error as any).status = 403;
      next(error);
    } else {
      next();
    }
  };
  return middleware;
}

export async function main() {
  const app = express();

  const secureOrigin = createSecureOriginMiddleware(
    process.env.SECURE_ORIGIN || 'http://localhost:3001',
  );

  app.use(cors());

  app.get('/vault/:item', secureOrigin, (req, res) => {
    res.send({
      secretItem: {
        name: req.params.item,
      },
    });
  });

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
