import React, {useState} from 'react';
import {SafeAreaView, View, Text, TextInput, FlatList} from 'react-native';

import Button from './components/Button/Button';
import SkillCard from './components/SkillCard/SkillCard';

import Styles from './Styles';

function Home(): JSX.Element {
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkill] = useState<string[]>([]);

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

      <Text style={[Styles.title, {marginVertical: 40}]}>My Skills</Text>

      <FlatList
        data={skills}
        keyExtractor={(_item, index) => index.toString()}
        renderItem={({item, index}) => <SkillCard key={index} skill={item} />}
      />
    </SafeAreaView>
  );
}

export default Home;
