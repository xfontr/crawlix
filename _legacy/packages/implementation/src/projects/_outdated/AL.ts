import Scraper from "./scraper.init";
import { resolve } from "path";

const ELEMENT_SELECTOR =
  ".sg-col-20-of-24.s-result-item.s-asin.sg-col-0-of-12.sg-col-16-of-20.sg-col.s-widget-spacing-small.sg-col-12-of-16";

// const NEXT_PAGE_BUTTON =
//   "#app > div.v-application--wrap > main > div > div > div > div:nth-child(6) > div > div.col-md-9.col-12 > div > div:nth-child(4) > div > div > nav > ul > li:nth-child(7) > button";

const ITEM_DATA = {
  title: ".a-size-medium.a-color-base.a-text-normal",
  author:
    ".a-size-base.a-link-normal.s-underline-text.s-underline-link-text.s-link-style",
};

const AL = async () => {
  const { runInLoop, afterAll } = await Scraper();

  await runInLoop(async ({ scrapItems, index, hooks: { saveAsJson } }) => {
    await scrapItems(ITEM_DATA)(ELEMENT_SELECTOR);
    // await changeSPAPage(NEXT_PAGE_BUTTON, ELEMENT_SELECTOR);
    await saveAsJson(resolve(__dirname, "../../data"));
    if (index === 1) process.exit(0);
  });

  return await afterAll(async ({ saveAsJson }) => {
    await saveAsJson(resolve(__dirname, "../../data"));
  });
};

export default AL;
