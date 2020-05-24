import cors from 'cors';
import express from 'express';
import { createSecureActionMiddleware } from './middleware';

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
