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

const LoginScreen = () => (
  <Container>
    <BackgroundImage src="./../../../../public/backgroundLogin.svg" />;
    <ContainerLogin>
      <LimitedContainer>
        <LogoLogin src="./../../../../public/logo.svg" />

        <TitleLogin level={2}>LOGIN</TitleLogin>

        <Input title="User" />
        <Input title="Password" />

        <Button type="primary" margin="64px 0 16px">
          ENTRAR
        </Button>
      </LimitedContainer>
    </ContainerLogin>
  </Container>
);

export default LoginScreen;
