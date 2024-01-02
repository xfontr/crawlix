import Scraper from "../scraper.init";

const ITEM_DATA = {
  title: ".ct-headline.landingH3",
  categories: ".ct-text-block.etiquetas",
};

const HL = async () => {
  const { run, afterAll } = await Scraper();

  await run(async ({ scrapItems, changePage }) => {
    await scrapItems(ITEM_DATA)("#_dynamic_list-2058-7323 > .ct-div-block");

    await changePage(
      "#_dynamic_list-2058-7323 > div.oxy-repeater-pages-wrap > div > a:nth-child(2)",
    );

    await scrapItems(ITEM_DATA)("#_dynamic_list-2058-7323 > .ct-div-block");
  });

  await afterAll(async ({ saveAsJson }) => {
    await saveAsJson();
  });
};

export default HL;
