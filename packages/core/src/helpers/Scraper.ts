import type { PuppeteerNode, ElementHandle } from "puppeteer";
import { type DefaultItem, Session, type SessionConfig, useAction } from "../..";
import t from "../i18n";
import { infoMessage } from "../logger";
import { readdir, unlink, writeFile } from "fs/promises";
import { resolve } from "path";
import { objectEntries } from "@personal/utils";

const Scraper = async (
  puppeteer: PuppeteerNode,
  baseConfig: Partial<SessionConfig>,
  itemData: Partial<Record<keyof DefaultItem, string>>,
) => {
  const {
    store,
    hooks: { nextPage, postItem },
    end,
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

  await $$a(() => page.goto(url!));

  // UTILS
  const getElement = async (parent: ElementHandle<Element>, selector: string) =>
    $a(() => parent.$eval(selector, (category) => category.textContent));

  const scrapItems = async (selector: string): Promise<void> => {
    const [articles, error] = await $a(() => page.$$(selector));

    if (!articles || error) return;

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

  const saveSession = async (): Promise<void> => {
    const dataPath = resolve(__dirname, "../../data");

    const dataDir = await readdir(dataPath);

    await writeFile(
      resolve(dataPath, `${Date.now()}.json`),
      JSON.stringify(store()),
    );

    await Promise.all(
      dataDir.map(
        async (file, index, list) =>
          index >= list.length - 3 ?? (await unlink(resolve(dataPath, file))),
      ),
    );
  };

  return {
    pageUp,
    scrapItems,
    saveSession,
    useAction: {
      $$a,
      $a,
    },
    forceEnd: (abrupt = true) => end(abrupt),
    store,
  };
};

export default Scraper;
