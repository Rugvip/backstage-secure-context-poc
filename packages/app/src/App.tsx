import { makeStyles } from '@material-ui/core';
import {
  createApp,
  ApiRegistry,
  alertApiRef,
  AlertApiForwarder,
} from '@backstage/core';
import React, { FC } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import * as plugins from './plugins';
import AlertDisplay from './components/AlertDisplay';

const useStyles = makeStyles(theme => ({
  '@global': {
    html: {
      height: '100%',
      fontFamily: theme.typography.fontFamily,
    },
    body: {
      height: '100%',
      fontFamily: theme.typography.fontFamily,
      'overscroll-behavior-y': 'none',
    },
    a: {
      color: 'inherit',
      textDecoration: 'none',
    },
  },
}));

const apisBuilder = ApiRegistry.builder();

const forwarder = apisBuilder.add(alertApiRef, new AlertApiForwarder());

const apis = apisBuilder.build();

const app = createApp({
  apis,
  plugins: Object.values(plugins),
});

const AppProvider = app.getProvider();
const AppComponent = app.getRootComponent();

const App: FC<{}> = () => {
  useStyles();
  return (
    <AppProvider>
      <AlertDisplay forwarder={forwarder} />
      <Router>
        <AppComponent />
      </Router>
    </AppProvider>
  );
};

export default App;
