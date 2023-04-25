import React from 'react';
import {Text, TouchableOpacity, TouchableOpacityProps} from 'react-native';

import Styles from './Styles';

interface SkillCardProps extends TouchableOpacityProps {
  skill: string;
}

function SkillCard({skill, ...rest}: SkillCardProps): JSX.Element {
  return (
    <TouchableOpacity style={Styles.buttonSkill} {...rest}>
      <Text style={Styles.textSkill}>{skill}</Text>
    </TouchableOpacity>
  );
}

export default SkillCard;
