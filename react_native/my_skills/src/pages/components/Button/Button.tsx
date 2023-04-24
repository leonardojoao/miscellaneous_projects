import React from 'react';
import {TouchableOpacity, Text} from 'react-native';

import Styles from './Styles';

interface button {
  onPress: () => void;
}

function Button({onPress}: button): JSX.Element {
  return (
    <TouchableOpacity
      style={Styles.button}
      activeOpacity={0.7}
      onPress={onPress}>
      <Text style={Styles.buttonText}>Add</Text>
    </TouchableOpacity>
  );
}

export default Button;
