export const promiseLoop = async <T>(
  callback: () => Promise<T> | T,
  breakingCondition: () => boolean,
): Promise<T[]> => {
  const results = [];

  do {
    results.push(await callback());
  } while (breakingCondition() === false);

  return results;
};

export const promiseAllSeq = async <T>(
  ...callbacks: ((index?: number) => Promise<T> | T)[]
): Promise<(Promise<T> | T)[]> => {
  if (!callbacks?.length) return [];

  let index = 0;
  const results = [];

  do {
    results.push(await callbacks[index]!(index));
    index += 1;
  } while (index < callbacks.length);

  return results;
};
