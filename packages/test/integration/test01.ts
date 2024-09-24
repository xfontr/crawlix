import {
  useAction,
  useLog,
  useSession,
  useLocationStore,
  useItems,
  useRuntimeConfigStore,
  useLocation,
} from "@crawlix/core";
import { writeOutput } from "../utils/writeOutput";
import Scraper from "../puppeteer";
import { SELECTORS } from ".";
import { NAVIGATION_TIMEOUT } from "../configs/constants";

/**
 * [CASE 01]
 *
 * Everything works seamlessly and a full successful session is logged
 */
const test01 = async () => {
  const { loop, afterAll } = useSession().run();
  const configs = useRuntimeConfigStore().current.public;
  const location = useLocation();
  const { $a } = useAction();
  const { log } = useLog();

  const { $p } = await Scraper();

  afterAll((output) => writeOutput(output, "01"));

  (await $a("Before all", async () => {
    await $p.goto(useLocationStore().current.history.at(-1)!.url);
  }))!;

  await loop("Loop through each page", configs.limit.page, async (index) => {
    const list = await $p.$$(SELECTORS.list.element);

    log(`Looping through the page ${index}. ${list.length} items detected`);

    if (!list.length) {
      throw new Error("Tried to loop through an empty page");
    }

    await loop("Loop through each item", list.length, async (elementIndex) => {
      await $a("Navigating to element", async () => {
        const currentElement = (await $p.$$(SELECTORS.list.element))[
          elementIndex
        ];

        await Promise.all([
          await currentElement.click(),
          await $p.waitForNavigation({ timeout: NAVIGATION_TIMEOUT }),
        ]);

        location.goTo($p.url(), "Item page");

        const author = await $a("Author tag", async () => {
          return await $p.$eval(
            SELECTORS.element.author,
            (el) => el.textContent,
          );
        });

        const { addAttribute, post } = useItems().initItem({ author });

        const price = await $a("Price tag", async () => {
          return await $p.$eval(
            SELECTORS.element.price,
            (el) => el.textContent,
          );
        });

        addAttribute({ price });

        const title = await $a("Title tag", async () => {
          return await $p.$eval(
            SELECTORS.element.title,
            (el) => el.textContent,
          );
        });

        addAttribute({ title });

        post();

        await $a("Navigating back", async () => {
          await $p.goBack({ waitUntil: "load" });
        });

        location.goBack();
      });
    });

    await $a("Navigating to next page", async () => {
      const hasNextPage = !!(await $p.$(SELECTORS.pagination.nextPage));

      if (hasNextPage) {
        await $p.click(SELECTORS.pagination.nextPage);
        location.pageUp({ url: $p.url() });
      }
    });
  });
};

export default test01;
