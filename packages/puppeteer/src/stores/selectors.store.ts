import { createStore } from "@scraper/core";
import type { Selectors } from "../types";

const useSelectorsStore = createStore(
  "selectors",
  {} as { selectors: Selectors },
  (state) => {
    const setSelectors = <T extends Selectors>(selectors: T) => {
      state.selectors = structuredClone(selectors);
    };

    return { setSelectors };
  },
);

export default useSelectorsStore;
