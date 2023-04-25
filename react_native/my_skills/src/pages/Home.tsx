import React, {useState, useEffect} from 'react';
import {SafeAreaView, View, Text, TextInput, FlatList} from 'react-native';

import Button from './components/Button/Button';
import SkillCard from './components/SkillCard/SkillCard';

import Styles from './Styles';

function Home(): JSX.Element {
  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkill] = useState<string[]>([]);
  const [gretting, setGretting] = useState('');

  function handleAddNewSkill() {
    setSkill(oldState => [...oldState, newSkill]);
  }

  useEffect(() => {
    const currentHour = new Date().getHours();

    if (currentHour < 12) {
      setGretting('Good Morning!');
    } else if (currentHour >= 12 && currentHour < 18) {
      setGretting('Good Afternoon');
    } else {
      setGretting('Good Night');
    }
  }, [gretting]);

  return (
    <SafeAreaView style={Styles.container}>
      <View>
        <Text style={Styles.title}>Welcome, Leonardo</Text>
        <Text style={Styles.gretting}>{gretting}</Text>
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
