import Scraper from "./A.init";
import { resolve } from "path";
import { SELECTORS } from "./A.constants";
import { Book, BookDetails } from "./A.types";
import { objectKeys, tryCatch } from "@personal/utils";
import { ITEM_DETAILS } from "../../config/constants";
import { ElementHandle } from "puppeteer";
import { infoMessage } from "@scraper/core/src/logger";

const A = async () => {
  const { afterAll, run } = await Scraper();

  const items = {
    value: [] as ElementHandle<Element>[],
  };

  await run(
    async ({
      page,
      useUtils,
      useItem,
      useAction,
      waitForNavigation,
      useLocation,
      acceptCookies,
      navigateToItem,
    }) => {
      const $i = useItem<Book>({
        autoClean: true,
        autoLogErrors: true,
        initialState: {},
        requiredType: [
          "author",
          "title",
          "description",
          "price",
          "recoPrice",
          "img",
        ],
      });

      const { loop } = useUtils();
      const { $$a, $a } = useAction;
      const { updateLocation, nextPage } = useLocation();

      // PAGE LEVEL
      await loop(async (_pageIndex) => {
        items.value =
          (await $$a(() => page.$$(SELECTORS.ITEMS_LIST.bookLinks)))[0]?.slice(
            2,
          ) ?? [];

        console.log("loop", items.value);

        // ITEM LEVEL
        await loop(
          async (itemIndex) => {
            console.log({ itemIndex });
            await acceptCookies();
            await navigateToItem(items.value, itemIndex);

            // 4.- For each item (li) -> There are two spans, we grab the 1st one as the title and the second one as the content
            const [itemDetails] = await $a(async () => {
              const itemDetails = await page.$$(SELECTORS.ITEM.details);

              const allDetails = itemDetails.flatMap(async (currentDetail) => {
                const key = await currentDetail.$eval("span", (node) =>
                  node.textContent?.trim(),
                );

                const actualKey = objectKeys(ITEM_DETAILS).find(
                  (itemDetailKey) =>
                    key?.toLocaleLowerCase().includes(itemDetailKey),
                );

                return actualKey ? [actualKey, key?.split(":")[1]] : [];
              }, []);

              return await Promise.all(allDetails);
            });

            const cleanDetails = (itemDetails as string[][]).reduce(
              (allDetails, [key, value]) => ({
                ...allDetails,
                [key!]: value,
              }),
              {} as BookDetails,
            );

            $i.setAttributes(cleanDetails);

            const [author] = await $a(
              async () =>
                await page.$eval(
                  SELECTORS.ITEM.author,
                  (node) => node.textContent,
                ),
            );

            $i.setAttributes({ author: author ?? undefined });

            const [title] = await $a(
              async () =>
                await page.$eval(
                  SELECTORS.ITEM.title,
                  (node) => node.textContent,
                ),
            );

            $i.setAttributes({ title: title ?? undefined });

            const [description] = await $a(
              async () =>
                await page.$eval(
                  SELECTORS.ITEM.description,
                  (node) => node.textContent,
                ),
            );

            $i.setAttributes({ description: description ?? undefined });

            const [price] = await $a(
              async () =>
                await page.$eval(
                  SELECTORS.ITEM.price,
                  (node) => node.textContent,
                ),
            );

            $i.setAttributes({ price: price ?? undefined });

            const [recoPrice] = await $a(
              async () =>
                await page.$eval(
                  SELECTORS.ITEM.recoPrice,
                  (node) => node.textContent,
                ),
            );

            $i.setAttributes({ recoPrice: recoPrice ?? undefined });

            const [img] = await $a(
              async () =>
                await page.$eval(
                  SELECTORS.ITEM.img,
                  (node) => (node as HTMLImageElement).src,
                ),
            );

            $i.setAttributes({ img: img ?? undefined });

            const currentValues = $i.get();

            if (currentValues.recoPrice)
              $i.setAttributes({
                recoPrice:
                  currentValues.recoPrice
                    ?.replace("Precio recomendado:", "")
                    .trim()
                    .split("€")[0] ?? "",
              });

            $i.use();

            await $$a(async () => {
              await page.goBack({ waitUntil: "load" });
              updateLocation({ url: page.url() });
            }, 0.3);

            // Needs an update or it won't be able to grab the items
            items.value =
              (
                await $$a(() => page.$$(SELECTORS.ITEMS_LIST.bookLinks))
              )[0]?.slice(2) ?? [];

            infoMessage("Going back to select another product");
          },
          { limit: items.value.length - 1 },
        );

        await $a(async () => {
          infoMessage("Going to next page");
          const nextPageButton = await page.$(SELECTORS.PAGINATION.nextPage);

          await Promise.all([
            await nextPageButton?.click(),
            await waitForNavigation(),
          ]);

          nextPage(page.url());
        }, 0.2);
      });
    },
  );

  return await afterAll(async ({ useConnectors }) => {
    const { saveAsJson } = useConnectors();

    // await tryCatch(
    //   async () =>
    //     await storeInCsv({
    //       path: resolve(__dirname, "../../../.out/data"),
    //       name: "amazon-items",
    //     }),
    // );

    await tryCatch(async () =>
      saveAsJson(
        resolve(__dirname, "../../../.out/tests"),
        new Date() + "amazon",
      ),
    );
  });
};

export default A;
