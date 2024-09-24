import {
  type ActionCustomData,
  type FullFunction,
  useAction,
  actionNameToOptions,
} from "@crawlix/core";
import { useScraper } from "../hooks";
import { useScraperConfigStore } from "../stores";
import { ElementHandle } from "puppeteer";

interface NavigateOptions extends ActionCustomData {
  forceWait?: number | undefined;
}

export const clickAndNavigate = (
  options: NavigateOptions | string = {},
  item: ElementHandle | undefined | null,
) => {
  options = actionNameToOptions(options);

  const { $p } = useScraper();
  const { $a } = useAction();
  const { navigationTimeout } = useScraperConfigStore().current.public;

  return async (callback?: FullFunction) => {
    return await $a(options, async () => {
      await Promise.all([
        await item?.click.bind(item).call(item),
        await $p.waitForNavigation({ timeout: navigationTimeout }),
      ]);

      return await callback?.();
    });
  };
};

export const forceNavigate = (
  options: NavigateOptions | string = {},
  url?: string,
) => {
  let navigateOptions: NavigateOptions = {};

  if (typeof options === "string") {
    url = options;
    navigateOptions = {
      name: `Force navigation to ${url}`,
    };
  }

  const { $p } = useScraper();
  const { $a } = useAction();

  return async (callback?: FullFunction) => {
    return await $a(navigateOptions, async () => {
      await $p.goto(url!);

      if (navigateOptions.forceWait)
        await new Promise((r) => setTimeout(r, navigateOptions.forceWait));

      return await callback?.();
    });
  };
};
