/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

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

const styles = StyleSheet.create({
  card_container: {
    alignItems: 'center',
    width: '100%',
    marginTop: 30,
  },
  card: {
    width: '65%',

    padding: 10,
    borderRadius: 5,
    backgroundColor: '#F8F8FF',
  },
  card_header: {
    marginTop: 0,
  },
  card_header_text: {
    fontWeight: 'bold',
  },
  card_content: {
    marginTop: 20,
  },
  card_content_text: {
    color: '#939393',
    marginBottom: 10,
  },
});

export default Card;
