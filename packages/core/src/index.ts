import Scraper from "./helpers/Scraper";
import EventBus from "./utils/EventBus";

const ITEM_DATA = {
  title: ".ct-headline.landingH3",
  categories: ".ct-text-block.etiquetas",
};

void (async () => {
  const scraper = await Scraper(
    { usageData: true, allowDefaultConfigs: true },
    ITEM_DATA,
  )!;

  if (!scraper) return;

  const { run, afterAll } = scraper;

  await run(async ({ scrapItems, changePage }) => {
    await scrapItems("#_dynamic_list-2058-7323 > .ct-div-block");

    await changePage(
      "#_dynamic_list-2058-7323 > div.oxy-repeater-pages-wrap > div > a:nth-child(2)",
    );

    await scrapItems("#_dynamic_list-2058-7323 > .ct-div-block");
  });

  await afterAll(async ({ saveAsJson }) => {
    await saveAsJson();
  });

  EventBus.removeAllListeners("SESSION:LOG");

  process.exit(0);
})();
