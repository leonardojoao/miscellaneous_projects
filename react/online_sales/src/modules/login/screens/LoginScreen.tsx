import { useState } from 'react';

import logo from '../../../../public/logo.svg';
import Button from '../../../shared/buttons/button/button';
import Input from '../../../shared/inputs/input/Input';
import {
  BackgroundImage,
  BackgroundImageContainer,
  LoginContainer,
  LoginContent,
  LoginContentWrapper,
  LoginTitle,
  LogoImage,
} from '../styles/loginScreen.styles';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = () => {
    console.log('Login', username, password);
  };

  return (
    <LoginContainer>
      <BackgroundImageContainer>
        <BackgroundImage src="/public/loginBackground.png" alt="Login Background" />
      </BackgroundImageContainer>

      <LoginContent>
        <LoginContentWrapper>
          <LogoImage src={logo} alt="Logo" />

          <LoginTitle level={2}>Login</LoginTitle>

          <Input title="USUÁRIO" margin="32px 0px 0px" onChange={handleUsername} value={username} />
          <Input
            title="PASSWORD"
            type="password"
            margin="32px 0px 0px"
            onChange={handlePassword}
            value={password}
          />

          <Button title="ENTRAR" margin="64px 0px 16px 0px" type="primary" onClick={handleLogin} />
        </LoginContentWrapper>
      </LoginContent>
    </LoginContainer>
  );
};

export default LoginScreen;
