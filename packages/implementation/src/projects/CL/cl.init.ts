import scraper from "@scraper/core/src/services/Scraper";

const Scraper = scraper({
  ScraperTool: () => ({}),
  safeMode: false,
  usageData: true,
});

export default Scraper;
