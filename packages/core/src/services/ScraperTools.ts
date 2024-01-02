import type { ElementHandle, Page } from "puppeteer";
import { type DefaultItem, Session, useAction } from "../..";
import { infoMessage } from "../logger";
import t from "../i18n";
import { objectEntries } from "@personal/utils";

const ScraperTools = (
  $s: ReturnType<typeof Session>,
  page: Page,
  itemData: Partial<Record<keyof DefaultItem, string>>,
) => {
  const { taskLength, offset, timeout } = $s.store();
  const { $a, $$a } = useAction(taskLength);

  const goToPage = async (url = offset.url!) => await $$a(() => page.goto(url));

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

      $s.storeHooks.postItem(finalItem, finalErrors!);
    });

    infoMessage(t("session_actions.package_complete"));
  };

  const changePage = async (selector: string, isNext = true): Promise<void> => {
    const response = await $$a(async () => {
      await Promise.all([
        page.click(selector),
        page.waitForNavigation({ timeout }),
      ]);
    }, 0.2);

    if (response[1]) return;

    $s.storeHooks[isNext ? "nextPage" : "previousPage"](page.url());
    infoMessage(t(`session_actions.page_${isNext ? "up" : "down"}`));
  };

  return {
    changePage,
    scrapItems,
    goToPage,
    getElement,
    abort: (abrupt = true) => $s.end(abrupt),
    store: $s.store,
    hooks: {
      ...$s.storeHooks,
      saveAsJson: $s.saveAsJson,
      notify: $s.notify,
      $$a,
      $a,
    },
  };
};

export default ScraperTools;
