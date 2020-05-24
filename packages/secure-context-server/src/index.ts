import cors from 'cors';
import express from 'express';
import { resolve as resolvePath } from 'path';
import { secureContextServer } from './server';
import mustacheExpress from 'mustache-express';

export async function main() {
  const app = express();

  app.engine('mst', mustacheExpress());
  app.set('view engine', 'mst');
  app.set('views', resolvePath(__dirname, '../views'));

  app.use(cors());
  app.use(express.static(resolvePath(__dirname, '../static')));
  app.use(
    '/actions',
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
