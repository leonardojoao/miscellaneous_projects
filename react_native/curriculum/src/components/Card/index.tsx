/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {View, Text} from 'react-native';

import styles from './style';

function Card(props): JSX.Element {
  return (
    <View style={styles.card_container}>
      <View style={styles.card}>
        <View style={styles.card_header}>
          <Text style={styles.card_header_text}>{props.title}</Text>
        </View>

        <View style={styles.card_content}>
          <Text style={styles.card_content_text}>{props.experience_first}</Text>
          <Text style={styles.card_content_text}>
            {props.experience_second}
          </Text>
          <Text style={styles.card_content_text}>{props.experience_third}</Text>
        </View>
      </View>
    </View>
  );
}

export default Card;
