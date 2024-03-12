import { ITask } from "../../../types/ITask";

import style from "./../List.module.scss";

interface Props extends ITask {
  selectTask: (selectedTask: ITask) => void;
}

export function Item({
  name,
  time,
  selected,
  completed,
  id,
  selectTask,
}: Props) {
  return (
    <li
      className={`${style.item} ${selected ? style.itemSelected : ""} ${
        completed ? style.itemFinished : ""
      }`}
      onClick={() => !completed && selectTask({ name, time, selected, completed, id })}
    >
      <h3>{name}</h3>
      <span>{time}</span>
      {completed && (
        <span className={style.finished} aria-label="Task finished"></span>
      )}
    </li>
  );
}
