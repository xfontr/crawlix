export const promiseAllSeq = async <T>(
  callback: () => Promise<T> | T,
  breakingCondition: () => boolean,
): Promise<(Promise<T> | T)[]> => {
  const results = [];

  do {
    results.push(await callback());
  } while (breakingCondition() === false);

  return results;
};

export default promiseAllSeq;
