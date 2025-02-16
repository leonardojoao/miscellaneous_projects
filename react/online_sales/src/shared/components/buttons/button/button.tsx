import { ButtonProps as ButtonPropsAntd } from 'antd';

import { Button as ButtonAntd } from './button.styles';

interface ButtonProps extends ButtonPropsAntd {
  title: string;
  margin?: string;
}

const Button = ({ title, margin, ...props }: ButtonProps) => {
  return (
    title && (
      <ButtonAntd style={{ margin }} {...props}>
        {title}
      </ButtonAntd>
    )
  );
};

export default Button;
