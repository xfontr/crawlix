/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { RuntimeConfigStore, StoreNames } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store: Record<string, any> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storeInitial: Record<string, any> = {};

export const createStore = <T, R extends object = object>(
  name: StoreNames,
  value: T,
  callback: (state: T) => R,
) => {
  if (store[name]) {
    // TODO: WARNING THAT A STORE WITH THE SAME NAME WILL BE OVERWRITTEN
  }

  store[name] = value;
  storeInitial[name] = value;

  const current: T = new Proxy(store[name], {
    get: (target, key) => {
      const targetValue = target[key];
      return typeof targetValue === "object"
        ? structuredClone(targetValue)
        : targetValue;
    },
    set: () => false,
  });

  return {
    public: () => ({
      current,
    }),
    private: () => ({
      current,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...callback(store[name]),
    }),
  };
};

export const outputStores = (
  storeContent: RuntimeConfigStore["public"]["storeContent"],
): string =>
  JSON.stringify(
    storeContent.reduce(
      (allStores, currentStore) => ({
        ...allStores,
        [currentStore]: store[currentStore as keyof typeof store],
      }),
      {},
    ),
    null,
    4,
  );

export const cleanUpStores = (complete: boolean): void => {
  for (const key of Object.getOwnPropertyNames(store)) {
    if (complete) delete store[key];
    if (!complete) store[key] = storeInitial[key];
  }
};
