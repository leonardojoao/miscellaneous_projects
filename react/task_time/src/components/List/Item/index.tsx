import { ITask } from "../../../types/ITask";

import style from "./../List.module.scss";

export function Item({ name, time, selected, completed, id }: ITask) {
  return (
    <li className={style.item}>
      <h3>{name}</h3>
      <span>{time}</span>
    </li>
  );
}
