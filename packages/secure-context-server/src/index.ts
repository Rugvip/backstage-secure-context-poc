import cors from 'cors';
import express from 'express';
import { secureContextServer } from './server';

export async function main() {
  const app = express();

  app.use(cors());

  app.use(
    await secureContextServer({
      plugins: ['plugin-welcome'],
    }),
  );

  await new Promise((resolve, reject) => {
    const server = app.listen(parseInt(process.env.PORT!, 10) || 3001, err => {
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
