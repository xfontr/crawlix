import {
  useAction,
  useLog,
  useSession,
  useLocationStore,
  useItems,
  useRuntimeConfigStore,
  useLocation,
} from "@scraper/core";
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

  // Uncaught: We want the app to break if the scraper fails to init
  const { page: $p } = await Scraper();

  (await $a(
    async () => {
      await $p.goto(useLocationStore().current.history.at(-1)!.url);
    },
    { name: "BEFORE ALL" },
  ))!;

  afterAll((output) => writeOutput(output, "01"));

  await loop(
    async (index) => {
      const list = await $p.$$(SELECTORS.list.element);

      log(`Looping through the page ${index}. ${list.length} items detected`);

      if (!list.length) {
        throw new Error("Tried to loop through an empty page");
      }

      // Loops through each element
      await loop(
        async (elementIndex) => {
          await $a(
            async () => {
              const currentElement = (await $p.$$(SELECTORS.list.element))[
                elementIndex
              ];

              await Promise.all([
                await currentElement.click(),
                await $p.waitForNavigation({ timeout: NAVIGATION_TIMEOUT }),
              ]);

              location.goTo($p.url(), "Item page");

              const addAttribute = useItems().pushItem();

              const author = await $a(
                async () => {
                  return await $p.$eval(
                    SELECTORS.element.author,
                    (el) => el.textContent,
                  );
                },
                { name: "Author tag" },
              );

              addAttribute({ author });

              const price = await $a(
                async () => {
                  return await $p.$eval(
                    SELECTORS.element.price,
                    (el) => el.textContent,
                  );
                },
                { name: "Price tag" },
              );

              addAttribute({ price });

              const title = await $a(
                async () => {
                  return await $p.$eval(
                    SELECTORS.element.title,
                    (el) => el.textContent,
                  );
                },
                { name: "Title tag" },
              );

              const push = addAttribute({ title });

              push();

              await $a(
                async () => {
                  await $p.goBack({ waitUntil: "load" });
                },
                {
                  name: "Navigating back",
                },
              );

              location.goBack();
            },
            { name: "Navigating to element" },
          );
        },
        (i) => i === list.length,
      );

      await $a(
        async () => {
          const hasNextPage = !!(await $p.$(SELECTORS.pagination.nextPage));

          if (hasNextPage) {
            await $p.click(SELECTORS.pagination.nextPage);
            location.pageUp({ url: $p.url() });
          }
        },
        { name: "Navigating to next page" },
      );
    },
    (i) => i === configs.limit.page,
  );
};

export default test01;
