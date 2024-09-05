export const generateTimestamp = (start: number, end?: number): number =>
  (end ?? new Date().getTime()) - new Date(start).getTime();

export const generateDate = (): number => new Date().getTime();
