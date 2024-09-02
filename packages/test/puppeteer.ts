import Puppeteer from "@scraper/puppeteer";

const Scraper = async () => {
  return await Puppeteer({
    abortImages: false,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
};

export default Scraper;
