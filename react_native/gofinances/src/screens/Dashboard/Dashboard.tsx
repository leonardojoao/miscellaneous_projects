import React from 'react';

import {
  Container,
  Header,
  UserWrapper,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  IconMaterialCommunity,
} from './styles';

function Dashboard(): JSX.Element {
  return (
    <Container>
      <Header>
        <UserWrapper>
          <UserInfo>
            <Photo
              source={{
                uri: 'https://avatars.githubusercontent.com/u/15831786?v=4',
              }}
            />

            <User>
              <UserGreeting>Olá,</UserGreeting>
              <UserName>Leonardo</UserName>
            </User>
          </UserInfo>
          <IconMaterialCommunity name="power" />
        </UserWrapper>
      </Header>
    </Container>
  );
}

export default Dashboard;
