import puppeteer from "puppeteer";
import Scraper from "./helpers/Scraper";

const ITEM_DATA = {
  title: ".ct-headline.landingH3",
  categories: ".ct-text-block.etiquetas",
};

void (async () => {
  const run = await Scraper(
    puppeteer,
    { usageData: true, allowDefaultConfigs: true },
    ITEM_DATA,
  );

  await run(
    async ({ scrapItems, pageUp }) => {
      await scrapItems("#_dynamic_list-2058-7323 > .ct-div-block");

      await pageUp(
        "#_dynamic_list-2058-7323 > div.oxy-repeater-pages-wrap > div > a:nth-child(2)",
      );

      await scrapItems("#_dynamic_list-2058-7323 > .ct-div-block");
    },
  );

  process.exit(0);
})();
