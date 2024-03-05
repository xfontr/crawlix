import { ElementHandle } from "puppeteer";
import Scraper from "./A.init";
import { resolve } from "path";
import { SELECTORS } from "./A.constants";
import { Book, BookDetails } from "./A.types";
import { infoMessage } from "@scraper/core/src/logger";
import { objectKeys, tryCatch } from "@personal/utils";
import { ITEM_DETAILS } from "../../config/constants";

const A = async () => {
  const { afterAll, run } = await Scraper();

  const items = {
    value: [] as ElementHandle<Element>[],
  };

  await run(
    async ({ page, useUtils, useItem, useAction, waitForNavigation }) => {
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

      await loop(async (pageIndex) => {
        infoMessage(`Scanning page - ${pageIndex}`);
        // 1.- We grab all the H2
        items.value =
          (await $$a(() => page.$$(SELECTORS.ITEMS_LIST.bookLinks)))[0] ?? [];
        // 2.- For each item
        await loop(
          async (index) => {
            await $a(async () => {
              // 2.1.- We click its inner <a> tag and navigate to the page
              await items.value[index]?.click();
              await waitForNavigation();
            }, 0.2);

            // 3.- We loop the product details
            if (index === 1) {
              throw new Error("abort");
            }
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
            debugger;
            if (currentValues.recoPrice)
              $i.setAttributes({
                recoPrice:
                  currentValues.recoPrice
                    ?.replace("Precio recomendado:", "")
                    .trim()
                    .split("€")[0] ?? "",
              });

            $i.use();

            await $a(async () => {
              await page.goBack();
              await waitForNavigation();
            }, 0.3);
          },
          { limit: 1 ?? items.value.length },
        );
      });
    },
  );

  return await afterAll(async ({ useConnectors }) => {
    const { saveAsJson, storeInCsv } = useConnectors();

    await tryCatch(
      async () =>
        await storeInCsv({
          path: resolve(__dirname, "../../../.out/"),
          name: "amazon-items",
        }),
    );

    await tryCatch(async () =>
      saveAsJson(resolve(__dirname, "../../../.out/tests"), "amazon"),
    );
  });
};

export default A;
