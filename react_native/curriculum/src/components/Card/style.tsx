import {StyleSheet} from 'react-native';

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

export default styles;
