export const id = 'delete-vault-item';

export const title = 'Destroy Item in Vault?';

export const body = `Are you sure you want to destroy the following item in your protected vault?

{{ name }}`;

type Data = {
  name: string;
  apiOrigin: string;
};

export const handler = async (data: Data) => {
  return fetch(`${data.apiOrigin}/vault/${data.name}`, {
    method: 'DELETE',
  }).then(res => res.json());
};
