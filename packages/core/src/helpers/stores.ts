/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {
  FullFunction,
  FullObject,
  RuntimeConfigStore,
  StoreNames,
} from "../types";
import { flattie } from "flattie";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store: Record<string, any> = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storeInitial: Record<string, any> = {};

export const createStore = <
  T,
  R extends FullObject & { resetStore?: FullFunction } = FullObject,
>(
  name: StoreNames,
  value: T,
  callback: (state: T) => R,
) => {
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

const flatify = <T>(item: T): unknown => {
  if (Array.isArray(item)) return item.map(flatify);

  return typeof item === "object" ? flattie(item, "_") : item;
};

const outputStore = (name: StoreNames, flatten?: boolean) =>
  !flatten
    ? store[name]
    : Object.entries(store[name] as FullObject).reduce(
        (all, [name, value]) => ({
          ...all,
          [name]: flatify(value),
        }),
        {},
      );

/**
 * @description Outputs all the stores to a JSON string
 */
export const outputStores = (
  model: string,
  include: RuntimeConfigStore["public"]["output"]["include"],
  flatten?: boolean,
): string =>
  JSON.stringify(
    include.reduce(
      (allStores, current) => ({
        ...allStores,
        [current]: outputStore(current, flatten),
      }),
      { model },
    ),
    null,
    4,
  );

/**
 * @description Resets all the stores. Useful for testing and garbage collection
 */

export const cleanUpStores = (complete: boolean): void => {
  for (const key of Object.getOwnPropertyNames(store)) {
    store[key]?.private?.resetStore();

    if (complete) delete store[key];
    if (!complete) store[key] = storeInitial[key];
  }
};
