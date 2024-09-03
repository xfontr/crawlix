import {
  type ActionCustomData,
  type FullFunction,
  useAction,
} from "@scraper/core";
import { useScraper } from "../hooks";
import { useScraperConfigStore } from "../stores";
import { ElementHandle } from "puppeteer";

interface NavigateOptions extends ActionCustomData {
  forceWait?: number | undefined;
}

export const clickAndNavigate = (
  item: ElementHandle | undefined | null,
  options: NavigateOptions = {},
) => {
  const { $p } = useScraper();
  const { $a } = useAction();
  const { navigationTimeout } = useScraperConfigStore().current.public;

  return async (callback?: FullFunction) => {
    return await $a(async () => {
      await Promise.all([
        await item?.click.bind(item).call(item),
        await $p.waitForNavigation({ timeout: navigationTimeout }),
      ]);

      return await callback?.();
    }, options);
  };
};

export const forceNavigate = (url: string, options: NavigateOptions = {}) => {
  const { $p } = useScraper();
  const { $a } = useAction();

  return async (callback?: FullFunction) => {
    return await $a(async () => {
      await $p.goto(url);

      if (options.forceWait) {
        await new Promise((r) => setTimeout(r, options.forceWait));
      }

      return await callback?.();
    }, options);
  };
};
