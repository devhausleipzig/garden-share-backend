export function checkOneHourApart(start: Date, end: Date) {
  const startTime = start.getHours();
  const endTime = end.getHours();
  return endTime - startTime === 1;
}
