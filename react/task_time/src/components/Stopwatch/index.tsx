import { useEffect, useState } from "react";

import Button from "../Button";
import { Clock } from "./Clock";
import { ITask } from "../../types/ITask";

import style from "./Stopwatch.module.scss";
import { timeToSeconds } from "../../common/utils/time";

interface Props {
  selected: ITask | undefined;
  finishTask: () => void;
}

export function Stopwatch({ selected, finishTask }: Props) {
  const [time, setTime] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (selected?.time) {
      setTime(timeToSeconds(selected.time));
    }
  }, [selected]);

  function regressive(counter: number = 0) {
    setTimeout(() => {
      if (counter > 0) {
        setTime(counter - 1);
        return regressive(counter - 1);
      }
      finishTask()
      return;
    }, 1000);
  }

  return (
    <div className={style.stopwatch}>
      <p className={style.title}>Choose a card and start a timer</p>
      <div className={style.clockWrapper}>
        <Clock time={time} />
      </div>
      <Button name="Start" onClick={() => regressive(time)} />
    </div>
  );
}
