export function timeToSeconds(time: string) {
  const [hour = "0", minute = "0", second = "0"] = time.split(":");
  return Number(hour) * 3600 + Number(minute) * 60 + Number(second);
}
