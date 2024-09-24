import { createStore, FullObject, type FullFunction } from "@crawlix/core";
import type { Selectors } from "../types";

let cleanUpStack: Record<string, FullFunction> | undefined = undefined;

const useSelectorsStore = createStore(
  "selectors",
  {} as { selectors: Selectors },
  (state) => {
    const setSelectors = <T extends Selectors>(selectors: T) => {
      state.selectors = selectors;
    };

    const defineCleaner = <
      T extends FullObject = FullObject,
      K extends keyof T = keyof T,
    >(
      selectorName: K,
      callback: (value: T[K]) => T[K] | undefined,
    ) => {
      cleanUpStack ??= {};
      cleanUpStack[selectorName as string] = callback;
    };

    const cleanAttribute = <T extends FullObject, C>(
      selectorName: keyof T,
      content: C,
    ) => cleanUpStack?.[selectorName as string]?.(content) ?? content;

    const resetStore = () => {
      // TODO: Check if this works as expected
      cleanUpStack = undefined;
    };

    return { setSelectors, defineCleaner, cleanAttribute, resetStore };
  },
);

export default useSelectorsStore;
