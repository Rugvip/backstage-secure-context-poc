import React, { FC } from 'react';
import { Grid, Button } from '@material-ui/core';
import {
  Content,
  InfoCard,
  Header,
  Page,
  pageTheme,
  ContentHeader,
  SupportButton,
  useApi,
  alertApiRef,
} from '@backstage/core';
import { secureContextApiRef } from 'secure-context';
import secureVaultItem from '../../../secure/vault-item.json';

const WelcomePage: FC<{}> = () => {
  const alertApi = useApi(alertApiRef);
  const secureContextApi = useApi(secureContextApiRef);

  const handleClick = async () => {
    try {
      const monaLisa = await secureContextApi.execute(secureVaultItem, {
        item: {
          name: 'mona-lisa',
        },
      });
      // eslint-disable-next-line no-console
      console.log('We got the Mona Lista!', monaLisa);

      alertApi.post({ message: 'ACCESS GRANTED' });
    } catch {
      alertApi.post({ message: 'ACCESS DENIED', severity: 'error' });
    }
  };

  return (
    <Page theme={pageTheme.home}>
      <Header title="Welcome" />
      <Content>
        <ContentHeader title="Getting Started">
          <SupportButton />
        </ContentHeader>
        <Grid container>
          <Grid item xs={12} md={4}>
            <InfoCard>
              <Button variant="contained" color="primary" onClick={handleClick}>
                Access Vault
              </Button>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export default WelcomePage;
