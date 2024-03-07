import style from "./../List.module.scss";

interface IItem {
  name: string;
  time: string;
}

export function Item({ name, time }: IItem) {
  return (
    <li className={style.item}>
      <h3>{name}</h3>
      <span>{time}</span>
    </li>
  );
}
