import Session from "./helpers/Session";
import { ElementHandle, Page, launch } from "puppeteer";
import useAction from "./utils/useAction";
import { writeFile } from "fs/promises";
import path from "path";

const session = Session({
  offset: {
    page: 1,
  },
});

void (async () => {
  const {
    store,
    hooks: { nextPage, postItem },
    end,
  } = session.init();
  const {
    taskLength,
    timeout,
    offset: { url },
  } = store();

  const { $$a, $a } = useAction(taskLength);

  // UTILS
  const getElement = async (parent: ElementHandle<Element>, selector: string) =>
    $a(() => parent.$eval(selector, (category) => category.textContent));

  const scrapItems = async (page: Page, selector: string) => {
    const [articles, error] = await $a(() => page.$$(selector));

    if (!articles || error) return;

    await $a(() =>
      Promise.all(
        articles.map(async (item) => {
          const [title, titleError] = await getElement(
            item,
            ".ct-headline.landingH3",
          );
          const [categories, categoriesError] = await getElement(
            item,
            ".ct-text-block.etiquetas",
          );
          const finalItem = { title, categories };

          postItem(
            finalItem,
            {
              title: titleError,
              categories: categoriesError,
            },
            ".ct-headline.landingH3",
          );
        }),
      ),
    );
  };

  const pageUp = async (selector: string) => {
    await Promise.all([
      () => page.waitForNavigation({ timeout }),
      $$a(() => page.click(selector), 0.2),
    ]);

    nextPage(page.url());
  };

  const init = async () => {
    const browser = await launch({ headless: "new" });
    const page = await browser.newPage();
    await $$a(() => page.goto(url!));

    return page;
  };

  // ACTIONS

  const page = await init();

  await scrapItems(page, "#_dynamic_list-2058-7323 > .ct-div-block");

  await pageUp(
    "#_dynamic_list-2058-7323 > div.oxy-repeater-pages-wrap > div > a:nth-child(2)",
  );

  await scrapItems(page, "#_dynamic_list-2058-7323 > .ct-div-block");

  end(true);

  await writeFile(
    path.resolve(__dirname, "../data", `${Date.now()}.json`),
    JSON.stringify(store()),
  );

  process.exit(0);
})();
