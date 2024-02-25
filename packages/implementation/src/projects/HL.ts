import { resolve } from "path";
import Scraper from "../scraper.init";

const ITEM_DATA = {
  title: ".ct-headline.landingH3",
  categories: ".ct-text-block.etiquetas",
};

const NEXT_PAGE = ".next.page-numbers";

const HL = async () => {
  const { runInLoop, afterAll } = await Scraper();

  await runInLoop(async ({ scrapItems, changePage }) => {
    await scrapItems(ITEM_DATA)("#_dynamic_list-2058-7323 > .ct-div-block");

    await changePage(NEXT_PAGE);
  });

  await afterAll(async ({ saveAsJson }) => {
    await saveAsJson(resolve(__dirname, "../../data"));
  });
};

export default HL;
