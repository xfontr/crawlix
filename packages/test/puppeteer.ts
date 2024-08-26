import Puppeteer from "@scraper/puppeteer";

const Scraper = async () => {
  return await Puppeteer({
    abortImages: true,
    rotateUserAgent: true,
    executablePath:
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
};

export default Scraper;
