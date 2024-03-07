import { useState } from "react";

import Form from "../Form";
import { List } from "../List";
import { Stopwatch } from "../Stopwatch";
import style from "./App.module.scss";

interface ITask {
  name: string;
  time: string;
}

function App() {
  const [tasks, setTasks] = useState<ITask[]>([]);

  return (
    <div className={style.AppStyle}>
      <Form setTasks={setTasks} />
      <List tasks={tasks} />
      <Stopwatch />
    </div>
  );
}

export default App;
