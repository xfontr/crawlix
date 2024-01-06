import { SessionData } from "../..";

export const promiseAllSeq = async <T>(
  callback: () => Promise<T> | T,
  breakingCondition: () => boolean,
) => {
  const results = [];

  do {
    results.push(await callback());
  } while (breakingCondition() === false);

  return results;
};

export const hasReachedLimit =
  (store: () => SessionData<Record<string, string | number | object>>) =>
  () => {
    const {
      totalItems,
      limit,
      location: { page },
    } = store();

    return totalItems >= limit.items! || !!(limit.page && page >= limit.page);
  };

export default promiseAllSeq;
