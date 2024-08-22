import Scraper from "./A.init";

const A = async () => {
  const { afterAll, run } = await Scraper();

  await run(({ page }) => {
    console.log("PUPPETEER IS UP");
    console.log(page.url());
  });

  return await afterAll(() => {
    console.log("SCRAPER IS OVER");
  });
};

export default A;
