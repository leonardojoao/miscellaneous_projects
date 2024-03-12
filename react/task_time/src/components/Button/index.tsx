import React from "react";

import style from "./Button.module.scss";

export interface ButtonProps {
  name: string;
  type?: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
}

class Button extends React.Component<ButtonProps> {
  render() {
    const { type = "button", onClick } = this.props;
    return (
      <button type={type} onClick={onClick} className={style.button}>
        {this.props.name}
      </button>
    );
  }
}

export default Button;
