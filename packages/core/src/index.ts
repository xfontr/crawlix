import Session from "./helpers/Session";
import { launch } from "puppeteer";
import action from "./utils/action";

const session = Session();

void (async () => {
  const { store } = session.init();

  const $a = action(store.taskLength); // TODO: This is risky, how do we make sure we don't use this somewhere else and wrongly set another length?

  const browser = await launch({ headless: "new" });
  const page = await browser.newPage();

  await $a(() => page.goto("https://www.huellalegal.com/publicaciones/"), 0);

  await Promise.all([
    () => page.waitForNavigation({ timeout: store.timeout }),
    $a(() => page.click("#text_block-2314-7323"), 0.2),
  ]);

  console.log(page.url());

  session.end();
})();
