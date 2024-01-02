import Scraper from "./services/Scraper";

const ITEM_DATA = {
  title: ".ct-headline.landingH3",
  categories: ".ct-text-block.etiquetas",
};

void (async () => {
  const { run, afterAll } = await Scraper(
    { allowDefaultConfigs: true },
    ITEM_DATA,
  );

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

  process.exit(0);
})();
