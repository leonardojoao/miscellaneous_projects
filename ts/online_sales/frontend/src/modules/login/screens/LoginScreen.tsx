import Input from '../../../shared/inputs/input/Input';
import {
  BackgroundImage,
  Container,
  ContainerLogin,
  LimitedContainer,
  LogoLogin,
} from '../styles/loginScreen.styles';

const LoginScreen = () => (
  <Container>
    <BackgroundImage src="./../../../../public/backgroundLogin.svg" />;
    <ContainerLogin>
      <LimitedContainer>
        <LogoLogin src="./../../../../public/logo.svg" />

        <Input title="User" />
        <Input title="Password" />
      </LimitedContainer>
    </ContainerLogin>
  </Container>
);

export default LoginScreen;
