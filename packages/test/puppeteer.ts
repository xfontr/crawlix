import { useScraper } from "@scraper/puppeteer";

const Scraper = async () => {
  const scraper = useScraper();

  await scraper.init();

  return { $p: scraper.$p };
};

export default Scraper;
