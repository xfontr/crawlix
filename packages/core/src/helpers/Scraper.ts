import type { PuppeteerNode, ElementHandle } from "puppeteer";
import {
  type DefaultItem,
  Session,
  type SessionConfig,
  useAction,
} from "../..";
import t from "../i18n";
import { infoMessage } from "../logger";
import { objectEntries } from "@personal/utils";

const Scraper = async (
  puppeteer: PuppeteerNode,
  baseConfig: Partial<SessionConfig>,
  itemData: Partial<Record<keyof DefaultItem, string>>,
) => {
  const {
    store,
    hooks: { nextPage, postItem, ...hooks },
    end,
    saveAsJson,
    setGlobalTimeout,
  } = Session(baseConfig).init();

  const {
    taskLength,
    timeout,
    offset: { url },
    saveSessionOnError,
  } = store();

  const { $$a, $a } = useAction(taskLength);

  // INIT
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // UTILS
  const getElement = async (parent: ElementHandle<Element>, selector: string) =>
    $a(() => parent.$eval(selector, (category) => category.textContent));

  const scrapItems = async (selector: string): Promise<void> => {
    const [articles, error] = await $a(() => page.$$(selector));

    if (!articles?.length || error) return;

    const [fullItems] = await $a(() =>
      Promise.all(
        articles.map(
          async (item) =>
            await Promise.all(
              objectEntries(itemData).map(async ([key, itemSelector]) => {
                const [element, error] = await getElement(item, itemSelector!);

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

      postItem(finalItem, finalErrors!);
    });

    infoMessage(t("session_actions.package_complete"));
  };

  const pageUp = async (selector: string): Promise<void> => {
    const response = await $$a(async () => {
      await Promise.all([
        page.click(selector),
        page.waitForNavigation({ timeout }),
      ]);
    }, 0.2);

    if (response[1]) return;

    nextPage(page.url());
    infoMessage(t("session_actions.page_up"));
  };

  const tools = {
    pageUp,
    scrapItems,
    saveAsJson,
    useAction: {
      $$a,
      $a,
    },
    forceEnd: (abrupt = true) => end(abrupt),
    store,
    hooks: {
      nextPage,
      postItem,
      ...hooks,
    },
  };

  return async <R, T extends (scraper: typeof tools) => Promise<R>>(
    callback: T,
  ): Promise<void> => {
    const result = await setGlobalTimeout(async (cleanUp) => {
      await $$a(() => page.goto(url!));
      await callback(tools);
      end(false);
      await saveAsJson();
      cleanUp();
    });

    if (result === "ABRUPT_ENDING") {
      saveSessionOnError && (await saveAsJson());
    }
  };
};

export default Scraper;
