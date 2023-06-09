import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFPercentage, RFValue} from 'react-native-responsive-fontsize';

export const Container = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background};
`;

export const Title = styled.Text`
  font-family: ${({theme}) => theme.fonts.bold};
  font-size: 24px;
  color: ${({theme}) => theme.colors.title};
`;

export const Header = styled.View`
  width: 100%;
  height: ${RFPercentage(42)}px;
  background-color: ${({theme}) => theme.colors.primary};

  justify-content: center;
  align-items: center;
  flex-direction: row;
`;

export const UserWrapper = styled.View`
  width: 100%;

  padding: 0 24px;

  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

export const UserInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const Photo = styled.Image`
  width: ${RFValue(48)}px;
  height: ${RFValue(48)}px;

  border-radius: 10px;
`;

export const User = styled.View`
  margin-left: 17px;
`;

export const UserGreeting = styled.Text`
  color: ${({theme}) => theme.colors.shape};

  font-size: ${RFValue(18)}px;
  font-family: ${({theme}) => theme.fonts.regular};
`;

export const UserName = styled.Text`
  color: ${({theme}) => theme.colors.shape};

  font-size: ${RFValue(18)}px;
  font-family: ${({theme}) => theme.fonts.bold};
`;

export const IconMaterialCommunity = styled(Icon)`
  color: ${({theme}) => theme.colors.secundary};
  font-size: ${RFValue(24)}px;
`;
