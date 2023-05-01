/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {ThemeProvider} from 'styled-components';

import theme from './src/global/styles/theme';
import Dashboard from './src/screens/Dashboard/Dashboard';

function App(): JSX.Element {
  return (
    <ThemeProvider theme={theme}>
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
