import scraper from "@scraper/core/src/services/Scraper";
import ScraperTool from "../../services/ScraperTool";

const Scraper = scraper({
  ScraperTool,
  usageData: false,
});

export default Scraper;
