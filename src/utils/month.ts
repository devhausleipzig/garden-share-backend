import { getDaysInMonth } from "date-fns";

// create array for every day of month
export function getDayzInMonth(year: number, month: number) {
  const daysCount = getDaysInMonth(new Date(year, month));
  const days = [...Array(daysCount).keys()].map(
    (day) => new Date(year, month, day + 2)
  );
  return days;
}
