export const id = 'vault-item';

export const title = 'Access to Item in Secret Vault';

export const body = `
Do you want to allow access to the following item
in your secret vault?

{{ item.name }}
`;

export const handler = async (data: any) => {
  // eslint-disable-next-line no-console
  console.log(`allowing ${JSON.stringify(data, null, 2)} through!`);
};
