import { ButtonProps } from 'antd';

import { ButtonAntd } from './button.styles';

interface ButtonCurrentProps extends ButtonProps {
  margin?: string;
}

const Button = ({ margin, ...props }: ButtonCurrentProps) => (
  <ButtonAntd style={{ margin }} {...props} />
);

export default Button;
