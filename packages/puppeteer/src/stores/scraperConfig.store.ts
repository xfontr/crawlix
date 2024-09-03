import { createStore } from "@scraper/core";
import { ScraperConfig } from "../types";

const DEFAULT: ScraperConfig = {
  clickAndScrapItem: false,
  navigationTimeout: 5_000,
};

const useScraperConfig = createStore(
  "scraperConfig",
  { public: DEFAULT },
  (state) => {
    const set = (config: Partial<ScraperConfig>) => {
      state.public = { ...state.public, ...config };
    };

    return { set };
  },
);

export default useScraperConfig;
