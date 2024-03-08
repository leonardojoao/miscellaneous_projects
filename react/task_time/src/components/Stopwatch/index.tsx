import { useEffect, useState } from "react";

import Button from "../Button";
import { Clock } from "./Clock";
import { ITask } from "../../types/ITask";

import style from "./Stopwatch.module.scss";
import { timeToSeconds } from "../../common/utils/time";

interface Props {
  selected: ITask | undefined;
}

export function Stopwatch({ selected }: Props) {
  const [time, setTime] = useState<Number>();

  useEffect(() => {
    if(selected?.time) {
      setTime(timeToSeconds(selected.time));
    }
  }, [selected])

  return (
    <div className={style.stopwatch}>
      <p className={style.title}>Choose a card and start a timer</p>
      Time: {time !== undefined ? time.toString() : ''}
      <div className={style.clockWrapper}>
        <Clock />
      </div>
      <Button name="Start" />
    </div>
  );
}
