import { Item } from "./Item";
import { ITask } from "../../types/ITask";
import style from "./List.module.scss";

interface Props {
  tasks: ITask[];
  selectTask: (selectTask: ITask) => void;
}

export function List({ tasks, selectTask }: Props) {
  return (
    <aside className={style.listTasks}>
      <h2>Tasks</h2>
      <ul>
        {tasks.map((task, index) => (
          <Item key={index} {...task} selectTask={selectTask} />
        ))}
      </ul>
    </aside>
  );
}
