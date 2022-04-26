export function gimmeMonth(date: Date) {
  return date.toLocaleString("en-GB", { month: "long" });
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "Juli",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function isValidMonth(month) {
  months.filter(gimmeMonth);
}
