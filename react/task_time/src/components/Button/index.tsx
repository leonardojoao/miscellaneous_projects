import React from "react";

import style from "./Button.module.scss";

export interface ButtonProps {
  name: string;
  type?: "button" | "submit" | "reset" | undefined;
}

class Button extends React.Component<ButtonProps> {
  render() {
    const { type = "button" } = this.props;
    return (
      <button type={type} className={style.button}>
        {this.props.name}
      </button>
    );
  }
}

export default Button;
