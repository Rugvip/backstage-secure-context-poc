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

const WelcomePage: FC<{}> = () => {
  const alertApi = useApi(alertApiRef);

  const handleClick = () => {
    alertApi.post({ message: 'ACCESS GRANTED' });
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
                Access Secrets
              </Button>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};

export default WelcomePage;
