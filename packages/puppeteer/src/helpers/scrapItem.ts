import { type FullObject, useItems, useItemStore, useLog } from "@scraper/core";
import { useField } from "../hooks";
import { useScraperConfigStore, useSelectorsStore } from "../stores";
import type { ElementHandle } from "puppeteer";

const scrapItem = async <T extends FullObject>(item?: ElementHandle) => {
  const {
    current: { public: config },
  } = useScraperConfigStore();
  const { log } = useLog();
  const { selectors } = useSelectorsStore().current;
  const { getField } = useField(item);
  const { addAttribute, post } = useItems().initItem<T>({}, config.required);

  const attributes = Object.entries(selectors.item ?? {}).map(
    async ([name, selector]) =>
      addAttribute({
        [name]: await getField(selector.attribute, name, selector.selector),
      } as Partial<T>),
  );

  await Promise.all(attributes);

  post();

  log({
    category: "SESSION",
    message: `Scraped item '${useItemStore().current.totalItems}'`,
  });
};

export default scrapItem;
