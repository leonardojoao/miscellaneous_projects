import { InputProps as InputPropsAntdd } from 'antd';

import { BoxInput, Input as InputAntdd, TitleInput } from './input.styles';

interface InputProps extends InputPropsAntdd {
  title?: string;
  margin?: string;
}
const Input = ({ title, margin, ...props }: InputProps) => {
  return (
    <BoxInput style={{ margin }}>
      {title && <TitleInput>{title}</TitleInput>}
      <InputAntdd {...props} />
    </BoxInput>
  );
};

export default Input;
