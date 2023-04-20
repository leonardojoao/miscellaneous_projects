import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

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

      <TouchableOpacity
        style={Styles.button}
        activeOpacity={0.7}
        onPress={handleAddNewSkill}>
        <Text style={Styles.buttonText}>Add</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default Home;
