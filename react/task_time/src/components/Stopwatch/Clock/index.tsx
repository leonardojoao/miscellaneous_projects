import style from "./Clock.module.scss";
// import { timeToSeconds } from "../../../common/utils/time";
// import { timeToSeconds } from "../../../common/utils/time";

interface Props {
  time: number | undefined;
}

export function Clock({ time = 0 }: Props) {
  // console.log("convertion", timeToSeconds("10:10:00"));
  const minute = Math.floor(time / 60);
  const seconds = time % 60;

  // const [minuteLeft, minuteRight] = String(minute).padStart(2, "0");
  const [minuteLeft, minuteRight] = String(minute).padStart(2, "0").split('');
  const [secondsLeft, secondsRight] = String(seconds).padStart(2, "0").split('');
  return (
    <>
      <span className={style.numberClock}>{minuteLeft}</span>
      <span className={style.numberClock}>{minuteRight}</span>
      <span className={style.dividerClock}>:</span>
      <span className={style.numberClock}>{secondsLeft}</span>
      <span className={style.numberClock}>{secondsRight}</span>
    </>
  );
}
