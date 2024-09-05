import { createStore, type FullObject } from "@scraper/core";
import type { ScraperConfig } from "../types";

const useScraperConfig = createStore(
  "scraperConfig",
  {
    public: {
      clickAndScrapItem: false,
      navigationTimeout: 5_000,
    } as ScraperConfig,
  },
  (state) => {
    const set = <T extends FullObject = FullObject>(
      config?: Partial<ScraperConfig<T>>,
    ) => {
      (state.public as ScraperConfig<T>) = {
        ...state.public,
        ...config,
      };
    };

    return { set };
  },
);

export default useScraperConfig;
