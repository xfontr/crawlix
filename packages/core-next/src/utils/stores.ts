/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { RuntimeConfigStore } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store: Record<string, any> = {};

const createStore = <T, R extends object = object>(
  name: string,
  value: T,
  callback: (state: T) => R,
) => {
  if (store[name]) {
    // TODO: WARNING THAT A STORE WITH THE SAME NAME WILL BE OVERWRITTEN
  }

  store[name] = value;

  const current: T = new Proxy(store[name], {
    get: (target, key) => {
      const targetValue = target[key];
      typeof targetValue === "object"
        ? structuredClone(targetValue)
        : targetValue;
    },
    set: () => false,
  });

  return () => ({
    current,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    ...callback(store[name]),
  });
};

export const outputStores = (
  storeContent: RuntimeConfigStore["storeContent"],
): string =>
  JSON.stringify(
    storeContent.reduce(
      (allStores, currentStore) => ({
        ...allStores,
        [currentStore]: store[currentStore as keyof typeof store],
      }),
      {},
    ),
  );

export const cleanUpStores = (): void => {
  for (const key of Object.getOwnPropertyNames(store)) {
    delete store[key];
  }
};

export default createStore;
