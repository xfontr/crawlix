import scraper from "@scraper/core/src/services/Scraper";
import ScraperTool from "./services/ScraperTool";

const Scraper = scraper({
  enabled: false,
  ScraperTool,
  // offset: {
  //   url: "https://www.amazon.es/s?rh=n%3A14177588031&fs=true&ref=lp_14177588031_sar",
  // },
  safeMode: false,
});

export default Scraper;
