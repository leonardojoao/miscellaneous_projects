import React, {useState} from 'react';
import {SafeAreaView, View, Text, TextInput} from 'react-native';

import Button from './components/Button/Button';

import Styles from './Styles';

function Home(): JSX.Element {
  const [newSkill, setNewSkill] = useState('');
  const [, setSkill] = useState<string[]>([]);

  function handleAddNewSkill() {
    setSkill(oldState => [...oldState, newSkill]);
  }

  return (
    <SafeAreaView style={Styles.container}>
      <View>
        <Text style={Styles.title}>Welcome, Leonardo</Text>
      </View>

      <TextInput
        style={Styles.input}
        placeholder="New skill"
        placeholderTextColor="#555"
        onChangeText={setNewSkill}
      />

      <Button onPress={handleAddNewSkill} />
    </SafeAreaView>
  );
}

export default Home;
