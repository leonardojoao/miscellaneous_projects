/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import Header from './src/components/Header/index';
import Card from './src/components/Card/index';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Header name="Leonardo João" profession="Software Developer" />

          <Card
            title="Professional Experience"
            experience_first="Developer Front End at Compass Uol"
            experience_second="Developer Front End at OS Systems"
            experience_third="Diretor de Produtor at Vantum"
          />

          <Card
            title="Academic Education"
            experience_first="Master Degree at UFPeL"
            experience_second="Graduation at UFPeL"
            experience_third="English at ---"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
