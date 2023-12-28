const curateDate = (date: Date | string | number | undefined) => {
  const curatedDate = typeof date !== "object" ? new Date(date ?? "") : date;

  return curatedDate.toString().toLowerCase() === "invalid date"
    ? 0
    : curatedDate;
};

const getTimeDifference = (
  startDate: Date | string | number,
  endDate?: Date | string | number,
): number => {
  const curatedStartDate = curateDate(startDate);
  const curatedEndDate = curateDate(endDate);

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if ((endDate && !curatedEndDate) || !curatedStartDate) return 0;

  return (
    (endDate ? (curatedEndDate as Date).getTime() : new Date().getTime()) -
    curatedStartDate.getTime()
  );
};

export default getTimeDifference;
