import selectorsStore from "./selectors.store";
import scraperConfig from "./scraperConfig.store";

const useSelectorsStore = selectorsStore.private;
const useScraperConfigStore = scraperConfig.private;

export { useSelectorsStore, useScraperConfigStore };
