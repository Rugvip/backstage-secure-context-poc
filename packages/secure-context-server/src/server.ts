import fs from 'fs-extra';
import { Router as createRouter } from 'express';
import { dirname, resolve as resolvePath } from 'path';

type Options = {
  plugins: string[];
};

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

    const actions = await fs.readdir(secureActionsDir);

    console.log(
      `Found secure actions for ${pluginName}: ${actions.join(', ')}`,
    );
  }

  return router;
}
