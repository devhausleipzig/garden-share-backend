export function validateMonth(start: Date, end: Date, month: number) {
  const bookedStartMonth = start.getMonth();
  const bookedEndMonth = end.getMonth();
  let bookedMonth: number = 0;
  if (bookedStartMonth === bookedEndMonth) {
    bookedMonth = bookedStartMonth;
  }
  if (bookedMonth === month) {
    return bookedMonth + 1;
  }
}

// create array for every day of month
export function getDaysInMonth(month: number) {
  var date = new Date(month, 1);
  var days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}
