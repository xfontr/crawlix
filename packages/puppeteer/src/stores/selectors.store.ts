import { createStore, type FullFunction } from "@scraper/core";
import type { Selectors } from "../types";

let cleanUpStack: Record<string, FullFunction> | undefined = undefined;

const useSelectorsStore = createStore(
  "selectors",
  {} as { selectors: Selectors },
  (state) => {
    const setSelectors = <T extends Selectors>(selectors: T) => {
      state.selectors = selectors;
    };

    const defineCleaner = <T extends Selectors["item"]>(
      selectorName: keyof T | (string & NonNullable<unknown>),
      callback: FullFunction,
    ) => {
      cleanUpStack ??= {};
      cleanUpStack[selectorName as string] = callback;
    };

    const cleanAttribute = <T extends Selectors["item"], C>(
      selectorName: keyof T | (string & NonNullable<unknown>),
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
