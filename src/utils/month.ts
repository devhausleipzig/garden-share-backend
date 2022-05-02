// create array for every day of month
export function getDaysInMonth(year: number, month: number) {
  let date = new Date(year, month, 2);
  let days = [];
  console.log(date);
  console.log(year);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
