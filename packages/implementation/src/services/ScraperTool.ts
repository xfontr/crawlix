import type { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type IScraperTool from "@scraper/core/src/types/ScraperTool";
import Puppeteer from "@scraper/core/src/api/Puppeteer";
import t from "@scraper/core/src/i18n";
import { PAGE_LOAD_SPEED_MULTIPLIER } from "../config/constants";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CustomTools = {
  page: Page;
  waitForNavigation: () => Promise<void>;
  addAttributes: <T>(
    attributes: [keyof T, keyof HTMLImageElement][],
    selectors: Record<keyof T, string>,
    callback: (...args: unknown[]) => void,
  ) => void;
};

const ScraperTool: IScraperTool<CustomTools> = async ({
  store,
  useAction: { $$a, $a },
}) => {
  const { offset, taskLength } = store();
  puppeteer.use(StealthPlugin());

  const page = await Puppeteer<Page>(puppeteer);

  await $a(() => page.setViewport({ width: 1920, height: 1080 }));

  const waitForNavigation = async () => {
    t("session_actions.navigation");

    await page.waitForNavigation({
      timeout: PAGE_LOAD_SPEED_MULTIPLIER * taskLength,
    });
  };

  const init = async (): Promise<void> => {
    t("session_actions.navigation");

    await $$a(() => page.goto(offset.url!));
  };

  const addAttributes = <T>(
    attributes: [keyof T, keyof HTMLImageElement][],
    selectors: Record<keyof T, string>,
    callback: (...args: unknown[]) => void,
  ) => {
    attributes.map(async ([attribute, key]) => {
      const [element] = await $a(() =>
        page.$eval(
          selectors[attribute],
          (node) => node?.[key as unknown as keyof typeof node],
        ),
      );

      callback({
        [attribute]: element ? JSON.stringify(element) : undefined,
      });
    });
  };

  return {
    page,
    init,
    waitForNavigation,
    addAttributes,
  };
};

export default ScraperTool;
