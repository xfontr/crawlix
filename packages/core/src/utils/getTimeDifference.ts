const getTimeDifference = (
  startDate: Date | string,
  endDate?: Date | string,
): number => {
  const curatedStartDate =
    typeof startDate === "string" ? new Date(startDate) : startDate;

  const curatedEndDate =
    typeof endDate === "string" ? new Date(endDate) : endDate;

  if (curatedStartDate.toString().toLowerCase() === "invalid date") return 0;

  if (endDate && curatedStartDate.toString().toLowerCase() === "invalid date")
    return 0;

  return (
    (endDate ? curatedEndDate!.getTime() : new Date().getTime()) -
    curatedStartDate.getTime()
  );
};

export default getTimeDifference;
