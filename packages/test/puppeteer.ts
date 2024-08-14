import Puppeteer from "@scraper/api";
import type { Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

const Scraper = async () => {
  puppeteer.use(StealthPlugin());
  return await Puppeteer<Page>(puppeteer, { abortImages: true });
};

export default Scraper;
