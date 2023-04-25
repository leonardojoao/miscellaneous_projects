import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

import Styles from './Styles';

interface card {
  key: number;
  skill: string;
}

function SkillCard({key, skill}: card): JSX.Element {
  return (
    <TouchableOpacity key={key} style={Styles.buttonSkill}>
      <Text style={Styles.textSkill}>{skill}</Text>
    </TouchableOpacity>
  );
}

export default SkillCard;
