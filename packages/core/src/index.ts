import Session from "./helpers/Session";
import { launch } from "puppeteer";
import ENVIRONMENT from "./configs/environment";
import useAction from "./utils/useAction";

const session = Session();

void (async () => {
  const { store } = session.init();
  const { taskLength } = store();

  const { $$a } = useAction(taskLength); // TODO: This is risky, how do we make sure we don't use this somewhere else and wrongly set another length?

  const browser = await launch({ headless: "new" });
  const page = await browser.newPage();

  await $$a(() => page.goto(ENVIRONMENT.baseUrl));

  // await Promise.all([
  //   () => page.waitForNavigation({ timeout }),
  //   $a(() => page.click("#text_block-2314-7323"), 0.2),
  // ]);

  await $$a(() => page.$$(".ct-headline.landingH3"));

  console.log(page.url());

  console.log(store());
})();
