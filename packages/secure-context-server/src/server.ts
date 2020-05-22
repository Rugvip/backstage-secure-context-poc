import fs from 'fs-extra';
import { Router as createRouter } from 'express';
import { dirname, resolve as resolvePath } from 'path';
import { transform } from 'sucrase';

type Options = {
  plugins: string[];
};

type Action = {
  id: string;
  title: string;
  body: string;
  script: string;
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

  return {
    id: 'lol',
    title: 'wut',
    body: 'asd',
    script: code,
  };
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
    console.log('DEBUG: actions =', actions);
  }

  return router;
}
