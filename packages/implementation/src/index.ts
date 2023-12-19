import { Session, useAction } from "@scraper/core";
import { launch } from "puppeteer";

const session = Session({
  offset: {
    page: 1,
  },
  limit: {
    page: 3,
  },
});

const example = async () => {
  const {
    store,
    hooks: { updateLocation, nextPage, postItem },
    end,
  } = session.init();
  const {
    taskLength,
    timeout,
    offset: { url },
  } = store();

  const { $$a, $a } = useAction(taskLength);

  const browser = await launch({ headless: "new" });
  const page = await browser.newPage();

  await $$a(() => page.goto(url!));

  const scrapItems = async () => {
    const articles = await $a(() =>
      page.$$("#_dynamic_list-2058-7323 > .ct-div-block"),
    );

    await $a(() =>
      Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        articles!.map(async (item) => {
          const title = await item.$eval(
            ".ct-headline.landingH3",
            (title) => title.textContent,
          );
          const categories = await item.$eval(
            ".ct-text-block.etiquetas",
            (category) => category.textContent,
          );

          postItem({ title, categories }, ".ct-headline.landingH3");
          updateLocation({ item: title ?? "" });
        }),
      ),
    );
  };

  await scrapItems();

  await Promise.all([
    () => page.waitForNavigation({ timeout }),
    $$a(
      () =>
        page.click(
          "#_dynamic_list-2058-7323 > div.oxy-repeater-pages-wrap > div > a:nth-child(2)",
        ),
      0.2,
    ),
  ]);

  nextPage(page.url());

  await scrapItems();

  end();

  console.log(store());
};

void (async () => {
  await example();
})();
