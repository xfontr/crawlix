import Puppeteer from "@scraper/api";
import type { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const Scraper = async () => {
  puppeteer.use(StealthPlugin());

  return await Puppeteer<Page>(puppeteer, {
    abortImages: true,
    rotateUserAgent: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
};

export default Scraper;
