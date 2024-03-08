import React from "react";
import { v4 as uuidV4 } from "uuid";

import Button from "../Button";
import { ITask } from "../../types/ITask";
import style from "./Form.module.scss";

class Form extends React.Component<{
  setTasks: React.Dispatch<React.SetStateAction<ITask[]>>;
}> {
  state = {
    name: "",
    time: "00:00",
    selected: false,
    completed: false,
    id: "",
  };

  addTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    this.props.setTasks((oldTasks) => [
      ...oldTasks,
      {
        ...this.state,
        id: uuidV4(),
      },
    ]);

    this.setState({
      name: "",
      time: "00:00",
      selected: false,
      completed: false,
      id: "",
    });
  }
  render() {
    return (
      <form className={style.newTask} onSubmit={this.addTask.bind(this)}>
        <div className={style.inputContainer}>
          <label htmlFor="task">Add a new task</label>
          <input
            type="text"
            name="task"
            value={this.state.name}
            onChange={(e) =>
              this.setState({ ...this.state, name: e.target.value })
            }
            id="task"
            placeholder="What do you need to do?"
            required
          />
        </div>
        <div className={style.inputContainer}>
          <label>Time</label>
          <input
            type="time"
            step={"1"}
            name="time"
            value={this.state.time}
            onChange={(e) =>
              this.setState({ ...this.state, time: e.target.value })
            }
            id="time"
            min={"00:00"}
            max={"24:00"}
            required
          />
        </div>
        <Button name="Add" type="submit" />
      </form>
    );
  }
}

export default Form;
