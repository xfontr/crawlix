import { ElementHandle } from "puppeteer";
import Scraper from "./A.init";
import { resolve } from "path";
import { SELECTORS } from "./A.constants";
import { Book } from "./A.types";
import { infoMessage } from "@scraper/core/src/logger";
import { tryCatch } from "@personal/utils";

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
            });

            // 3.- We loop the product details
            if (index === 1) {
              throw new Error("abort");
            }
            // 4.- For each item (li) -> There are two spans, we grab the 1st one as the title and the second one as the content
            const [itemDetails] = await $a(async () => {
              const itemDetails = await page.$$(SELECTORS.ITEM.details);

              const allDetails = itemDetails.map(
                async (currentDetail, index) => {
                  const detail = await currentDetail.$$eval("span", (e) =>
                    e?.map((d) => d?.textContent),
                  );

                  return [detail[0] ?? `unknown-${index}`, detail[1] ?? ""];
                },
                [],
              );

              return await Promise.all(allDetails);
            });

            $i.setAttributes({ details: JSON.stringify(itemDetails) });

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
            debugger;
            $i.use();

            await $a(async () => {
              await page.goBack();
              await waitForNavigation();
            });
          },
          { limit: 1 ?? items.value.length },
        );
      });
    },
  );

  return await afterAll(async ({ useConnectors }) => {
    const { saveAsJson, saveItemsLocally } = useConnectors();

    await tryCatch(
      async () => await saveItemsLocally(resolve(__dirname, "../../../.out/")),
    );

    await tryCatch(async () =>
      saveAsJson(resolve(__dirname, "../../../.out/tests"), "amazon"),
    );
  });
};

export default A;
