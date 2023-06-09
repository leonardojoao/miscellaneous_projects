/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';

import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  TouchableOpacity,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [number, setNumber] = useState(0);

  const handleNumber = () => {
    const new_number = Math.floor(Math.random() * 10);

    setNumber(new_number);
  };

  return (
    <SafeAreaView style={styles.sectionContainer}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />

      <Text style={styles.numberRandom}>{number}</Text>

      <TouchableOpacity style={styles.buttonRandom} onPress={handleNumber}>
        <Text style={styles.textButtonRandom}>Generate Number</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#F4F2F1',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberRandom: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#09951C',
  },
  buttonRandom: {
    width: '80%',
    marginTop: 15,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderColor: '#1E22B2',
    borderWidth: 1,
    alignItems: 'center',
  },
  textButtonRandom: {
    fontSize: 20,
    color: '#1E22B2',
  },
});

export default App;
