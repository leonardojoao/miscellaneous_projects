import style from "./Clock.module.scss";

export function Clock() {
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
