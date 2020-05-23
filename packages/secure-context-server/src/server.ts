import fs from 'fs-extra';
import { Router as createRouter } from 'express';
import { dirname, resolve as resolvePath } from 'path';
import { transform } from 'sucrase';
import { Script } from 'vm';

type Options = {
  plugins: string[];
};

type Action = {
  id: string;
  title: string;
  body: string;
  code: string;
};

export async function readAction(
  dir: string,
  filePath: string,
): Promise<Action> {
  const actionContent = await fs.readFile(resolvePath(dir, filePath), 'utf8');
  const { code } = transform(actionContent, {
    transforms: ['imports', 'typescript'],
    production: true,
    filePath,
  });

  const script = new Script(code);
  const context = { exports: {} };
  script.runInNewContext(context);
  const { id, title, body } = context.exports as any;

  return { id, title, body, code };
}

export async function secureContextServer(options: Options) {
  const router = createRouter();

  for (const pluginName of options.plugins) {
    const pluginPath = dirname(require.resolve(`${pluginName}/package.json`));
    const secureActionsDir = resolvePath(pluginPath, 'secure');

    const secureActionsExist = await fs.pathExists(secureActionsDir);
    if (!secureActionsExist) {
      console.warn(`Plugin ${pluginName} has no secure actions`);
      continue;
    }

    const actionNames = await fs.readdir(secureActionsDir);
    console.log(
      `Found secure actions for ${pluginName}: ${actionNames.join(', ')}`,
    );

    const actions = await Promise.all(
      actionNames.map(filePath => readAction(secureActionsDir, filePath)),
    );

    for (const action of actions) {
      console.log(`Adding ${action.id}`);
      router.get(`/${action.id}/action.html`, (_, res) => {
        console.log('DEBUG: action =', action);
        res.render('secure-context', action);
      });
      router.get(`/${action.id}/action.js`, (_, res) => {
        res.send(action.code);
      });
    }
  }

  return router;
}
