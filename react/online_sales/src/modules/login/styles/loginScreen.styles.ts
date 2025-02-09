import { Typography } from 'antd';
import styled from 'styled-components';

const { Title } = Typography;

export const LoginContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
`;

export const BackgroundImageContainer = styled.div`
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
`;

export const BackgroundImage = styled.img`
  flex: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const LoginContent = styled.div`
  display: flex;
  flex: 1;

  width: 100%;
  max-width: 646px;
  height: 100vh;

  background-color: #d9d9d9;
`;

export const LoginContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  margin: 0 74px;
`;

export const LogoImage = styled.img`
  width: 202px;
  margin-bottom: 32px;
`;

export const LoginTitle = styled(Title)`
  color: #006397 !important;
`;
