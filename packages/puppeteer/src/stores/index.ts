import selectorsStore from "./selectors.store";
import scraperConfig from "./scraperConfig.store";

const useSelectorsStore = selectorsStore.private;
const useScraperConfig = scraperConfig.private;

export { useSelectorsStore, useScraperConfig };
