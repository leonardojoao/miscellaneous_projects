import { Typography } from 'antd';
import styled, { css } from 'styled-components';

const { Title } = Typography;

export const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: right;
`;

export const BackgroundImage = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  object-fit: cover;
  z-index: -1;
`;

export const TitleLogin = styled(Title)`
  &.ant-typography {
    ${(props) => css`
      color: ${props.color || '#006397'};
    `}
  }
`;

export const ContainerLogin = styled.div`
  background-color: #d9d9d9;
  width: 100%;
  height: 100vh;
  max-width: 646px;
  z-index: 0;
`;

export const LogoLogin = styled.img`
  width: 202px;
  height: 143px;
`;

export const LimitedContainer = styled.div`
  width: 100%;
  height: 100vh;
  max-width: 498px;
  margin: 0 74px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  /* Devices with screen width less than 768px (mobile) */
  @media (max-width: 768px) {
    margin: 0 22px;
  }
`;
