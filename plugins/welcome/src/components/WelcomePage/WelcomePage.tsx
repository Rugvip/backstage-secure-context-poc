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
import * as deleteVaultItem from '../../.../../../secure/delete-vault-item';

const WelcomePage: FC<{}> = () => {
  const alertApi = useApi(alertApiRef);
  const secureContextApi = useApi(secureContextApiRef);

  const handleClick = async () => {
    try {
      const monaLisa = await secureContextApi.execute(deleteVaultItem, {
        name: 'mona-lisa',
        apiOrigin: 'http://localhost:3002',
      });
      // eslint-disable-next-line no-console
      console.log('We deleted Mona Lista!', monaLisa);

      alertApi.post({ message: 'ACCESS GRANTED' });
    } catch {
      alertApi.post({ message: 'ACCESS DENIED', severity: 'error' });
    }
  };

  return (
    <Page theme={pageTheme.home}>
      <Header title="Welcome" />
      <Content>
        <ContentHeader title="Inventory List">
          <SupportButton />
        </ContentHeader>
        <Grid container>
          <Grid item xs={6} md={4} lg={3}>
            <InfoCard title="Mona Lisa">
              <Button variant="contained" color="primary" onClick={handleClick}>
                Delete Item
              </Button>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export default WelcomePage;
