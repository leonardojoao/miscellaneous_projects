import style from "./Clock.module.scss";
// import { timeToSeconds } from "../../../common/utils/time";
import { timeToSeconds } from "../../../common/utils/time";

export function Clock() {
  console.log("convertion", timeToSeconds("10:10:00"));
  return (
    <>
      <span className={style.numberClock}>0</span>
      <span className={style.numberClock}>0</span>
      <span className={style.dividerClock}>:</span>
      <span className={style.numberClock}>0</span>
      <span className={style.numberClock}>0</span>
    </>
  );
}
