import axios from 'axios';
import { useState } from 'react';

import Button from '../../../shared/buttons/button/Button';
import Input from '../../../shared/inputs/input/Input';
import {
  BackgroundImage,
  Container,
  ContainerLogin,
  LimitedContainer,
  LogoLogin,
  TitleLogin,
} from '../styles/loginScreen.styles';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handlePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleLogin = async () => {
    console.log(username, password);

    const returnObject = await axios({
      method: 'POST',
      url: 'http://localhost:8080/auth',
      data: {
        email: username,
        password,
      },
    });

    console.log(returnObject);
  };

  return (
    <Container>
      <BackgroundImage src="./../../../../public/backgroundLogin.svg" />;
      <ContainerLogin>
        <LimitedContainer>
          <LogoLogin src="./../../../../public/logo.svg" />

          <TitleLogin level={2}>LOGIN</TitleLogin>

          <Input margin="27px 0 0 0" title="User" onChange={handleUsername} value={username} />
          <Input
            margin="32px 0 0 0"
            type="password"
            title="Password"
            onChange={handlePassword}
            value={password}
          />

          <Button type="primary" margin="64px 0 16px" onClick={handleLogin}>
            ENTRAR
          </Button>
        </LimitedContainer>
      </ContainerLogin>
    </Container>
  );
};

export default LoginScreen;
