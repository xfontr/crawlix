import { useAction, useLocation, useSession } from "@scraper/core";
import { useScraper } from "../hooks";
import { useScraperConfigStore, useSelectorsStore } from "../stores";
import { clickAndNavigate } from "../utils/navigate";
import { ElementHandle } from "puppeteer";

const scrapList = async (
  callback: (
    item: ElementHandle | undefined,
    index: number,
  ) => Promise<unknown>,
  customizeList: (
    items: ElementHandle[],
  ) => Promise<ElementHandle[]> | ElementHandle[],
) => {
  const { $p } = useScraper();
  const { $a } = useAction();
  const { loop } = useSession();
  const { selectors } = useSelectorsStore().current;
  const { goTo, goBack } = useLocation();
  const {
    current: {
      public: { clickAndScrapItem },
    },
  } = useScraperConfigStore();

  const getAllItems = async (name?: string) => {
    const list = await $a(name ?? "Get all list links", () =>
      $p.$$(selectors.allItems!),
    );

    if (customizeList) return await customizeList(list ?? []);

    return list ?? [];
  };

  await $a("Select all headings and start item loop", async () => {
    const initialItems = await getAllItems();

    await loop(
      (i) => i === initialItems.length,
      async (index) => {
        if (!clickAndScrapItem) await callback(initialItems[index], index);

        if (clickAndScrapItem)
          await $a(`Select item '${index}'`, async () => {
            const items = await getAllItems("Get current item link");

            const afterNavigation = clickAndNavigate(
              {
                name: "Click current item",
              },
              items[index],
            );

            await afterNavigation(async () => {
              goTo($p.url(), `Item '${index}'`);

              await callback(items[index], index);

              await $a("Go back to item list page", async () => {
                await $p.goBack({ waitUntil: "load" });
                goBack();
              });
            });
          });
      },
      { name: "Scrap list loop" },
    );
  });
};

export default scrapList;
