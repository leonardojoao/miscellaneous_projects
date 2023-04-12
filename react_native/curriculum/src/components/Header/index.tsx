/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';

import {View, Image, Text, Alert, TouchableOpacity} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import profile from './../../assets/profile.png';

import styles from './style';

function Header(props): JSX.Element {
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
    <View style={styles.pictureContainer}>
      <Image style={styles.picture} source={profile} />

      <Text style={styles.name}>{props.name}</Text>
      <Text style={styles.profession}>{props.profession}</Text>

      <View style={styles.platform}>
        <TouchableOpacity onPress={() => handleSocialNetwork('github')}>
          <Icon name="github" size={30} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleSocialNetwork('linkedin')}>
          <Icon name="linkedin" size={30} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Header;
