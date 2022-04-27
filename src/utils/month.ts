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

// start
