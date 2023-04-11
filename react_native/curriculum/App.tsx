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
  StyleSheet,
  useColorScheme,
  View,
  Image,
  Text,
  Alert,
  TouchableOpacity
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import Card from './src/components/Card/index';
import profile from './src/assets/profile.png';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  function handleSocialNetwork(social_network) {
    switch (social_network) {
      case 'github':
        Alert.alert('github');
        break;
      case 'linkedin':
        Alert.alert('linkedin');
        break;
      default:
        break;
    }
  }

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
          <View style={styles.pictureContainer}>
            <Image style={styles.picture} source={profile} />

            <Text style={styles.name}>Leonardo João</Text>
            <Text style={styles.profession}>Desenvolvedor Front End</Text>

            <View style={styles.platform}>
              <TouchableOpacity onPress={() => handleSocialNetwork('github')}>
                <Icon name="github" size={30} />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleSocialNetwork('linkedin')}>
                <Icon name="linkedin" size={30} />
              </TouchableOpacity>
            </View>

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pictureContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picture: {
    width: 250,
    height: 250,
    borderRadius: 125,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profession: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  platform: {
    justifyContent: 'space-between',
    flexDirection: 'row',

    marginTop: 20,
    width: '18%',
  },
});

export default App;
