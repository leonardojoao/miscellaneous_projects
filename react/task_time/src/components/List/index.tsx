import { Item } from "./Item";
import { ITask } from "../../types/ITask";
import style from "./List.module.scss";

export function List({ tasks }: { tasks: ITask[] }) {
  return (
    <aside className={style.listTasks}>
      <h2>Tasks</h2>
      <ul>
        {tasks.map((task, index) => (
          <Item key={index} {...task} />
        ))}
      </ul>
    </aside>
  );
}
