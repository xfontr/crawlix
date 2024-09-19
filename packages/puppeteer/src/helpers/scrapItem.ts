import {
  type FullObject,
  useAction,
  useItems,
  useItemStore,
  useLog,
} from "@scraper/core";
import { useField } from "../hooks";
import { useScraperConfigStore, useSelectorsStore } from "../stores";
import type { ElementHandle } from "puppeteer";

type ScrapItemOptions = {
  logResult?: boolean;
};

const scrapItem = async <T extends FullObject>(
  item: ElementHandle | undefined,
  callback?: () => Promise<T> | T,
  options?: ScrapItemOptions,
) => {
  const {
    current: { public: config },
  } = useScraperConfigStore();
  const { log } = useLog();
  const { selectors } = useSelectorsStore().current;
  const { getField } = useField(item);
  const { addAttribute, post } = useItems().initItem<T>({}, config.required);
  const { $a } = useAction();

  const attributes = Object.entries(selectors.item ?? {}).map(
    async ([name, selector]) => {
      if (
        typeof selector === "object" &&
        !Array.isArray(selector) &&
        selector.skip
      )
        return;

      addAttribute({
        [name]: await getField(name, selector, options?.logResult),
      } as Partial<T>);
    },
  );

  await Promise.all(attributes);

  if (callback) addAttribute((await $a("Add custom attributes", callback))!);

  post();

  log({
    category: "SESSION",
    message: `Scraped item '${useItemStore().current.totalItems}'`,
  });
};

export default scrapItem;
