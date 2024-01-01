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

const runData = {
  run: false,
  afterAll: false,
};

const Scraper = async (
  puppeteer: PuppeteerNode,
  baseConfig: Partial<SessionConfig>,
  itemData: Partial<Record<keyof DefaultItem, string>>,
) => {
  const {
    store,
    storeHooks: { nextPage, postItem, ...hooks },
    end,
    saveAsJson,
    setGlobalTimeout,
    notify,
  } = Session(baseConfig).init();

  const {
    taskLength,
    timeout,
    offset: { url },
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
    notify,
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

  return {
    run: async <R, T extends (scraper: typeof tools) => Promise<R>>(
      callback: T,
    ) => {
      if (runData.run) {
        return;
      }

      runData.run = true;

      return await setGlobalTimeout(async (cleanUp) => {
        await $$a(() => page.goto(url!));
        const result = await callback(tools);
        end(false);
        cleanUp();
        return result;
      });
    },
    afterAll: async <
      R,
      T extends (
        scraper: Pick<typeof tools, "notify"> &
          Pick<typeof tools, "saveAsJson">,
      ) => Promise<R>,
    >(
      callback: T,
    ) => {
      if (runData.afterAll) {
        return;
      }

      infoMessage(t("session_actions.after_all"));

      runData.afterAll = true;

      return await callback({
        notify: tools.notify,
        saveAsJson: tools.saveAsJson,
      });
    },
  };
};

export default Scraper;
