import type { ElementHandle, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import ScraperTool from "@scraper/core/src/types/ScraperTools";
import { infoMessage } from "@scraper/core/src/logger";
import t from "@scraper/core/src/i18n";
import { objectEntries } from "@personal/utils";
import Puppeteer from "@scraper/core/src/api/Puppeteer";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type CustomTools = {
  page: Page;
  getElement: (
    parent: ElementHandle<Element>,
    selector: string,
  ) => Promise<[string | void | undefined, void | Error]>;
  scrapItems: (
    itemData: Record<string, string>,
  ) => (selector: string) => Promise<void>;
  changePage: (selector: string, isNext?: boolean) => Promise<void>;
  changeSPAPage: (
    selector: string,
    waitForSelector: string,
    isNext?: boolean,
  ) => Promise<void>;
};

const ScraperTool: ScraperTool<CustomTools> = async ($s, { $a, $$a }) => {
  const { offset, timeout } = $s.store();

  puppeteer.use(StealthPlugin());

  const page = await Puppeteer<Page>(puppeteer);

  await page.setViewport({ width: 1920, height: 1080 });

  const init = async (): Promise<void> => {
    console.log("offset shit", offset.url);
    await $$a(() => page.goto(offset.url!));
  };

  const getElement = async (parent: ElementHandle<Element>, selector: string) =>
    $a(() =>
      parent.$eval(selector, ({ textContent }) =>
        textContent?.replace("\n", "").replace("\t", "").trim(),
      ),
    );

  const scrapItems =
    (itemData: Record<string, string>) =>
    async (selector: string): Promise<void> => {
      if (!itemData) return;

      const [articles, error] = await $a(() => page.$$(selector));

      if (!articles?.length || error) return;

      const [fullItems] = await $a(() =>
        Promise.all(
          articles.map(
            async (item) =>
              await Promise.all(
                objectEntries(itemData).map(async ([key, itemSelector]) => {
                  const [element, error] = await getElement(item, itemSelector);

                  return [
                    { [key]: element },
                    error ? { [key]: error } : undefined,
                  ];
                }),
              ),
          ),
        ),
      );

      (
        fullItems as [
          Record<string, string>,
          undefined | Record<string, Error>,
        ][][]
      ).forEach((item) => {
        const [finalItem, finalErrors] = item.reduce(
          ([allElements, allErrors], [value, error]) => [
            { ...allElements, ...value },
            { ...allErrors, ...(error ? error : {}) },
          ],
          [{}, {}],
        );

        $s.storeHooks.postItem(finalItem, finalErrors);
      });

      infoMessage(t("session_actions.package_complete"));
    };

  const changePage = async (selector: string, isNext = true): Promise<void> => {
    const response = await $$a(async () => {
      await Promise.all([
        page.click(selector),
        page.waitForNavigation({ timeout }),
      ]);
    }, 7);

    if (response[1]) return;

    $s.storeHooks[isNext ? "nextPage" : "previousPage"](page.url());
    infoMessage(t(`session_actions.page_${isNext ? "up" : "down"}`));
  };

  const changeSPAPage = async (
    selector: string,
    waitForSelector: string,
    isNext = true,
  ): Promise<void> => {
    const response = await $$a(async () => {
      await Promise.all([
        page.click(selector),
        page.waitForSelector(waitForSelector),
      ]);
    }, 7);

    if (response[1]) return;

    $s.storeHooks[isNext ? "nextPage" : "previousPage"](page.url());
    infoMessage(t(`session_actions.page_${isNext ? "up" : "down"}`));
  };

  return {
    changePage,
    changeSPAPage,
    scrapItems,
    getElement,
    page,
    init,
  };
};

export default ScraperTool;
