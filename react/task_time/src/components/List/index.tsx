import { Item } from "./Item";
import style from "./List.module.scss";

interface ITask {
  name: string;
  time: string;
}

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
