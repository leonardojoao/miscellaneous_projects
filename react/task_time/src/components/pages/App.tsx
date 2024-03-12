import { useState } from "react";

import Form from "../Form";
import { List } from "../List";
import { Stopwatch } from "../Stopwatch";
import { ITask } from "../../types/ITask";
import style from "./App.module.scss";

function App() {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [selected, setSelected] = useState<ITask>();

  function selectTask(taskSelected: ITask) {
    setSelected(taskSelected);

    setTasks((oldTasks) =>
      oldTasks.map((task) => ({
        ...task,
        selected: task.id === taskSelected.id ? true : false,
      }))
    );
  }

  function endTask() {
    if (selected) {
      setSelected(undefined);
      setTasks((oldTasks) =>
        oldTasks.map((task) => {
          if (task.id === selected.id) {
            return {
              ...task,
              selected: false,
              completed: true,
            };
          }
          return task;
        })
      );
    }
  }

  return (
    <div className={style.AppStyle}>
      <Form setTasks={setTasks} />
      <List tasks={tasks} selectTask={selectTask} />
      <Stopwatch selected={selected} finishTask={endTask} />
    </div>
  );
}

export default App;
