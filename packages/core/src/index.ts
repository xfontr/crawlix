import Session from "./helpers/Session";
import { launch } from "puppeteer";
import delay from "./helpers/delay";

const session = Session();

void (async () => {
  session.init();

  const browser = await launch({ headless: "new" });

  const page = await browser.newPage();

  await page.goto("https://www.huellalegal.com/publicaciones/");
      await Promise.all([
        page.waitForNavigation(),
        delay(async () => await page.click("#text_block-2314-7323"), 0),
      ]);

  console.log(page.url())

  session.end();
})();
