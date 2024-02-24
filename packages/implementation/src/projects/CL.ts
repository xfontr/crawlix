import Scraper from "../scraper.init";
import { resolve } from "path";

const ELEMENT_SELECTOR = ".compact-product";

const NEXT_PAGE_BUTTON =
  "#app > div.v-application--wrap > main > div > div > div > div:nth-child(6) > div > div.col-md-9.col-12 > div > div:nth-child(4) > div > div > nav > ul > li:nth-child(7) > button";

const ITEM_DATA = {
  title: ".compact-product-title",
  author: ".compact-product-authors",
};

const CL = async () => {
  const { runInLoop, afterAll } = await Scraper();

  await runInLoop(async ({ scrapItems, changeSPAPage }) => {
    await scrapItems(ITEM_DATA)(ELEMENT_SELECTOR);
    await changeSPAPage(NEXT_PAGE_BUTTON, ELEMENT_SELECTOR);
  });

  await afterAll(async ({ saveAsJson }) => {
    await saveAsJson(resolve(__dirname, "../../data"));
  });
};

export default CL;

// const promiseAllSequentially = async <T>(
//   tasks: (() => Promise<T>)[],
//   breakingCondition: () => boolean,
// ) => {
//   const results = [];
//   for (const task of tasks) {
//     results.push(await task());
//     if (breakingCondition()) return;
//   }

//   return results;
// };

// await promiseAllSequentially(
//   new Array<() => Promise<void>>(1 ?? LIMIT_PAGES_MAX).fill(action),
//   () =>
//     store().location.page >= store().limit.page! ||
//     store().totalItems >= store().limit.items!,
// );
