export const objectKeys = <T extends object>(item: T): Array<keyof T> =>
  Object.keys(item) as unknown as Array<keyof T>;

export const objectValues = <T extends object>(item: T): Array<T[keyof T]> =>
  Object.values(item) as Array<T[keyof T]>;

export const objectEntries = <T extends object>(
  item: T,
): Array<[keyof T, T[keyof T]]> =>
  Object.entries(item) as Array<[keyof T, T[keyof T]]>;

export const objectFreeze = <T extends object>(item: T) => Object.freeze(item);
