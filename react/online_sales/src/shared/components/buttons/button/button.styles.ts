import { Button as ButtonAntd } from 'antd';
import styled from 'styled-components';

export const Button = styled(ButtonAntd)`
  width: 100%;
  max-width: 498px;
  height: 60px;

  border-radius: 4px;
  background-color: #006397;

  font-family: 'Popins', sans-serif;
  font-weight: 700;
  font-size: 24px;
  line-height: 36px;
  letter-spacing: 0%;

  &:hover {
    background-color: #007bb5 !important;
    border-color: #007bb5 !important;
  }
`;
