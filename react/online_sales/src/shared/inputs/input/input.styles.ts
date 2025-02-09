import { Input as InputAntd } from 'antd';
import styled from 'styled-components';

export const BoxInput = styled.div`
  width: 100%;
`;

export const TitleInput = styled.div`
  display: flex;
  justify-content: left;

  color: #000000;
  font-family: 'Popins', sans-serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 21px;
  margin: 8px;
`;

export const Input = styled(InputAntd)`
  width: 100%;
  max-width: 498px;
  height: 60px;

  border-radius: 4px;
  border-width: 2px;
  border-color: #678fa4;

  background-color: #d9d9d9;
`;
