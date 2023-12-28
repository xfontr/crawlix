import puppeteer from "puppeteer";
import Scraper from "./helpers/Scraper";
import Email from "./helpers/Email";

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
    async ({ scrapItems, pageUp, store }) => {
      await scrapItems("#_dynamic_list-2058-7323 > .ct-div-block");

      await pageUp(
        "#_dynamic_list-2058-7323 > div.oxy-repeater-pages-wrap > div > a:nth-child(2)",
      );

      await scrapItems("#_dynamic_list-2058-7323 > .ct-div-block");

      const a = await Email(true, store().emailing)("haha", "hoho");
      console.log({ a })
    },
  );

  // process.exit(0);
})();
