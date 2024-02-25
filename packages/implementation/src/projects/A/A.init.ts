import scraper from "@scraper/core/src/services/Scraper";
import ScraperTool from "../../services/ScraperTool";

const Scraper = scraper({
  ScraperTool,
  offset: {
    url: "https://www.amazon.es/s?bbn=599364031&rh=n%3A28166967031&fs=true&ref=lp_28166967031_sar",
    // url: "https://arh.antoinevastel.com/bots/areyouheadless",
    // url: "https://nowsecure.nl/",
  },
  safeMode: false,
  usageData: false,
});

export default Scraper;
