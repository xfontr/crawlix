import { useAction, useLocation, useSession } from "@scraper/core";
import { useScraper } from "../hooks";
import { useScraperConfigStore, useSelectorsStore } from "../stores";
import { clickAndNavigate } from "../utils/navigate";
import { ElementHandle } from "puppeteer";

const scrapList = async (
  callback: (item: ElementHandle | undefined) => Promise<unknown>,
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
    return (
      (await $a(() => $p.$$(selectors.allItems!), {
        name: name ?? "Get all list links",
      })) ?? []
    );
  };

  await $a(
    async () => {
      const initialItems = await getAllItems();

      await loop(
        (i) => i === initialItems.length,
        async (index) => {
          if (!clickAndScrapItem) await callback(initialItems[index]);

          if (clickAndScrapItem)
            await $a(
              async () => {
                const items = await getAllItems("Get current item link");

                const afterNavigation = clickAndNavigate(items[index], {
                  name: "Click current item",
                });

                await afterNavigation(async () => {
                  goTo($p.url(), `Item '${index}'`);

                  await callback(items[index]);

                  await $a(
                    async () => {
                      await $p.goBack({ waitUntil: "load" });
                      goBack();
                    },
                    { name: "Go back to item list page" },
                  );
                });
              },
              { name: `Select item '${index}'` },
            );
        },
        { name: "Scrap list loop" },
      );
    },
    { name: "Select all headings and start item loop" },
  );
};

export default scrapList;
