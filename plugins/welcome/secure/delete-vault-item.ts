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
