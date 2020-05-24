# Backstage Secure Context PoC

## Purpose

This [Backstage](https://github.com/spotify/backstage) App is a PoC for how plugins can protect
sensitive actions by executing them in a secure browser context.

Even though Backstage uses modern frameworks and methods that mitigate Cross-site
scripting (XSS) attacks, a plugin may want to take additional security measures
for some sensitive actions. For example, a cluster management plugin may want to protect an
privilegesaction to completely remove a cluster, or a user management plugin may have an
action to grant another user administrative privileges that needs to be protected.

This PoC explores how to create an API that allows plugin authors to define actions
that execute in a secure context. That is, in an isolated iframe or popup window.
It also implements a backend that will only allow requests from that secure context.

## Design Goals

There were two goals with the design of the API, in addition to security:

- It should be easy for plugin authors to add secure actions.
- It should be possible for the integrator to select what level of security they want, i.e. no isolation, iframe isolation, or window isloation.

## Scope

The scope of the PoC is limited in in a couple of ways:

- All backends are expected to be running in a protected environment without public access.
- There's no additional authentication done in the secure context.
- The only attack considered for now is XSS in the app that tries to execute requests to internal services.

## Usage

Start up each of these in a separate terminal:

```bash
yarn start # Backstage App
yarn start-context-server # Serves secure actions
yarn start-vault-server # Mock plugin backend
```

Then go to the app at [localhost:3000](http://localhost:3000) and try deleting the Mona Lisa.

## Structure

The PoC is split into 5 packages:

- packages/app - Example app that wires together the SecureContextApi
- packages/secure-context - Library that provides the SecureContextApi type and a number of implementations of it.
- packages/secure-context-server - A server which serves secure actions from other plugins.
- package/vault-server - A mock plugin backend that has a protected route.
- plugin/welcome - A mock plugin with a secure action.

## Implementation

### Adding a secure action

Actions are defined in TypeScript files with no imports, inside a top-level
`secure/` folder within the plugin package. Each action should export an `id`, `title`, `body`, and `handler`.
The id is used to identify the action, the title and body are displayed to the user
when asking for confirmation, and the handler is executed within the secure context
if the user accepts the action. The action will receive data from the app that can
be displayed via mustashe-like templates in the body, and will be passed to the handler.

For example, the PoC defines the following action:

```ts
export const id = 'delete-vault-item';

export const title = 'Destroy Item in Vault?';

export const body = `Are you sure you want to destroy the following item in your protected vault?

{{ name }}`;

type Data = {
  name: string;
  apiOrigin: string;
};

export const handler = async (data: Data) => {
  const url = new URL(data.apiOrigin);
  url.pathname = `/vault/${data.name}`;

  return fetch(url.href, {
    method: 'DELETE',
  }).then(res => res.json());
};
```

The plugin that defined the action then uses it like this:

```ts
import * as deleteVaultItem from '../../.../../../secure/delete-vault-item';

// inside click handler
await secureContextApi.execute(deleteVaultItem, {
  name: 'mona-lisa',
  apiOrigin: 'http://localhost:3002',
});
```

By using templates for the body, we can ensure that what the user is asked to confirm actually matches
the executed action. For example, if we pass the entire body, this would be possible:

```ts
await secureContextApi.execute(deleteVaultItem, {
  body:
    'Are you sure you want do delete the following item? example-painting-3',
  item: 'mona-lisa',
  apiOrigin: 'http://localhost:3002',
});
```

### API and implementations

The API consumes actions that match the expected exports from an action definition, and looks like this:

```ts
export type SecureAction<Req, Res> = {
  id: string;
  title: string;
  body: string;
  handler: (data: Req) => Promise<Res>;
};

export type SecureContextApi = {
  execute<Req, Res>(action: SecureAction<Req, Res>, data: Req): Promise<Res>;
};
```

The PoC has two implementations of the API, `SecureContextPrompt` and `SecureContextPopup`.

#### SecureContextPrompt

This implementation uses a plain `window.confirm` prompt to ask the user if it's ok to execute the action.
If the user confirms, the action handler is called with the supplied data.

This is an example of a zero-isolation default that doesn't require any additional backend infrastructure.

#### SecureContextPopup

This implementation opens a popup window pointing to a dedicated HTML page for the action. It communicates
the data and result via `postMessage`, keeping the execution of the handler completely isolated from the
rest of the app. The pages for the different actions are pre-compiled and served by a separate backend.

### Protecting Backend Endpoints

Backend endpoints for the secure actions are pretected by verifying the `Origin` header
and the secure action id, parsed from the `Referer` header.

For example, protecting a single route with middleware:

```ts
app.delete('/vault/:item', secureAction(['delete-vault-item']), (req, res) => {
  // ...
});
```
