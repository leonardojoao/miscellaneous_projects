// import axios from 'axios';
import { useState } from 'react';

import logo from '../../../../public/logo.svg';
import Button from '../../../shared/components/buttons/button/button';
import Input from '../../../shared/components/inputs/input/Input';
import { useGlobalContext } from '../../../shared/hooks/useGlobalContext';
import { useRequests } from '../../../shared/hooks/useRequests';
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
  const { accessToken, setAccessToken, setNotification } = useGlobalContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { postRequest, loading } = useRequests();

  const handleUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handlePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    try {
      await postRequest('http://localhost:8080/auth', {
        email: username,
        password,
      });
      await setNotification('Entrando...', 'success', 'Login realizado com sucesso');

      // setAccessToken(dataRequest.accessToken);
    } catch (error) {
      await setNotification('Erro ao realizar login', 'error', 'Verifique suas credenciais');
    }
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

          <Button
            loading={loading}
            title="ENTRAR"
            margin="64px 0px 16px 0px"
            type="primary"
            onClick={handleLogin}
          />
        </LoginContentWrapper>
      </LoginContent>
    </LoginContainer>
  );
};

export default LoginScreen;
