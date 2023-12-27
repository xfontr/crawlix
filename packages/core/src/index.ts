import Session from "./helpers/Session";
import { ElementHandle, Page, launch } from "puppeteer";
import useAction from "./utils/useAction";
import { readdir, writeFile, unlink } from "fs/promises";
import { resolve } from "path";
import { objectEntries } from "@personal/utils";
import { infoMessage } from "./logger";
import t from "./i18n";

const session = Session({ usageData: true });

const ITEM_DATA = {
  title: ".ct-headline.landingH3",
  categories: ".ct-text-block.etiquetas",
};

void (async () => {
  const {
    store,
    hooks: { nextPage, postItem },
    end,
  } = session.init();
  const {
    taskLength,
    timeout,
    offset: { url },
  } = store();

  const { $$a, $a } = useAction(taskLength);

  // UTILS
  const getElement = async (parent: ElementHandle<Element>, selector: string) =>
    $a(() => parent.$eval(selector, (category) => category.textContent));

  const scrapItems = async (page: Page, selector: string) => {
    const [articles, error] = await $a(() => page.$$(selector));

    if (!articles || error) return;

    const [fullItems] = await $a(() =>
      Promise.all(
        articles.map(
          async (item) =>
            await Promise.all(
              objectEntries(ITEM_DATA).map(async ([key, itemSelector]) => {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (fullItems as any[]).forEach((item) => {
      const [finalItem, finalErrors] = (
        item as unknown as [
          Record<string, string>,
          undefined | Record<string, Error>,
        ][]
      ).reduce(
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, error] = await $$a(async () => {
      await Promise.all([
        page.click(selector),
        page.waitForNavigation({ timeout }),
      ]);
    }, 0.2);

    if (error) return;
    
    nextPage(page.url());
    infoMessage(t("session_actions.page_up"));
  };

  const init = async () => {
    const browser = await launch({ headless: "new" });
    const page = await browser.newPage();
    await $$a(() => page.goto(url!));

    return page;
  };

  // ACTIONS

  const page = await init();

  await scrapItems(page, "#_dynamic_list-2058-7323 > .ct-div-block");

  await pageUp(
    "#_dynamic_list-2058-7323 > div.oxy-repeater-pages-wrap > div > a:nth-child(2)",
  );

  await scrapItems(page, "#_dynamic_list-2058-7323 > .ct-div-block");

  end(true);

  const dataPath = resolve(__dirname, "../data");

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

  process.exit(0);
})();
