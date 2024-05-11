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
      </LimitedContainer>
    </ContainerLogin>
  </Container>
);

export default LoginScreen;
