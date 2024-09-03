import type { Page } from "puppeteer";
import Puppeteer from "../../Puppeteer";
import { VanillaPuppeteer } from "puppeteer-extra";

let $p: Page | undefined;
let browser: Awaited<ReturnType<VanillaPuppeteer["launch"]>> | undefined;

let isInit = false;

const useScraper = (options: Parameters<typeof Puppeteer>[0] = {}) => {
  const init = async () => {
    if (isInit) return;

    const { page, browser: puppeteerBrowser } = await Puppeteer(options);

    $p = page;
    browser = puppeteerBrowser;
  };

  return { init, $p: $p!, browser: browser! };
};

export default useScraper;
