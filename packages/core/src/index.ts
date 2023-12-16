import Session from "./helpers/Session";
import { launch } from "puppeteer";
import ENVIRONMENT from "./configs/environment";
import useAction from "./utils/useAction";

const session = Session({
  offset: {
    page: 1,
  },
});

void (async () => {
  const {
    store,
    hooks: { updateLocation, nextPage, postItem },
    end,
  } = session.init();
  const { taskLength, timeout } = store();

  const { $$a, $a } = useAction(taskLength);

  const browser = await launch({ headless: "new" });
  const page = await browser.newPage();

  await $$a(() => page.goto(ENVIRONMENT.baseUrl));

  const scrapItems = async () => {
    const articles = await $a(() =>
      page.$$("#_dynamic_list-2058-7323 > .ct-div-block"),
    );

    await $a(() =>
      Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        articles!.map(async (item, index) => {
          updateLocation({ item: `.ct-headline.landingH3{i${index}}` });

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
})();
