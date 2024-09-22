import { useSelectorsStore } from "@crawlix/puppeteer";
import { SELECTORS } from "./config/selectors";
import Item from "./types/Item";

const initSelectors = () => {
  const { setSelectors, defineCleaner } = useSelectorsStore();

  setSelectors(SELECTORS);

  defineCleaner<Item>("description", (value) =>
    (value as string | undefined)?.replace("/n", "")?.trim(),
  );
};

export default initSelectors;
