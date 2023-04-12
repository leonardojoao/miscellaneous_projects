import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  pictureContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picture: {
    width: 250,
    height: 250,
    borderRadius: 125,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profession: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  platform: {
    justifyContent: 'space-between',
    flexDirection: 'row',

    marginTop: 20,
    width: '18%',
  },
});

export default styles;
