import { ElementHandle } from "puppeteer";
import Scraper from "./A.init";
import { resolve } from "path";

const SELECTORS = {
  ITEMS_LIST: {
    bookLinks: "h2 > a",
  },
  ITEM: {
    details: "[data-feature-name='detailBullets'] li",
    title: "#productTitle",
    author: ".author",
    description: "[data-feature-name='productDescription']",
    price: ".priceToPay",
    recoPrice: ".basisPrice",
    img: "#landingImage",
  },
};

// const PAGE_TIMEOUT = 15_000;

const A = async () => {
  const { runInLoop, afterAll } = await Scraper();

  const customStore = {
    books: [] as ElementHandle<Element>[],
  };

  await runInLoop(async ({ page, index, hooks: { postItem, $a, $$a } }) => {
    // await page.waitForNavigation({ timeout: PAGE_TIMEOUT });
    debugger;
    // 1.- We grab all the freaky H2
    customStore.books =
      (await $$a(() => page.$$(SELECTORS.ITEMS_LIST.bookLinks)))[0] ?? [];

    // 2.- For each, we click its inner <a> tag
    await $a(async () => {
      await customStore.books[index]?.click();
      await page.waitForNavigation();
      // 3.- We loop the product details

      // 4.- For each item (li) -> There are two spans, we grab the 1st one as the title and the second one as the content
      const [itemDetails] = await $a(async () => {
        const itemDetails = await page.$$(SELECTORS.ITEM.details);

        const allDetails = itemDetails.map(async (currentDetail, index) => {
          const detail = await currentDetail.$$eval("span", (e) =>
            e?.map((d) => d?.textContent),
          );

          return [detail[0] ?? `unknown-${index}`, detail[1] ?? ""];
        }, []);

        return await Promise.all(allDetails);
      });

      // # 5.- Author -> a span with class ".author"
      const author = await $a(() =>
        page.$eval(SELECTORS.ITEM.author, (t) => t?.textContent),
      );

      // # 6.- Title -> a span with id "#productTitle"
      const title = await $a(() =>
        page.$eval(SELECTORS.ITEM.title, (t) => t?.textContent),
      );

      // # 7.- Description -> There are some divs with weird names. The most explicitly named one is quite high. The selector is -> [data-feature-name='productDescription'].
      // ** Even though the actual content is about 6 divs in, the only text content is the description. So we can take the super high div and do textContent on it
      const description = await $a(() =>
        page.$eval(SELECTORS.ITEM.description, (t) => t?.textContent),
      );

      // # 8.- Price -> span ".priceToPay"
      const price = await $a(() =>
        page.$eval(SELECTORS.ITEM.price, (t) => t?.textContent),
      );

      // # 9.- Recommended price -> a bit trickier, but this should work:
      // ** [node].textContent.replace("Precio recomendado:", "").trim().split("€")[0]
      const recoPrice = await $a(() =>
        page.$eval(
          SELECTORS.ITEM.recoPrice,
          (t) =>
            t?.textContent
              ?.replace("Precio recomendado:", "")
              .trim()
              .split("€")[0],
        ),
      );

      // # 10.- Image url -> img "#landingImg"
      const img = await $a(() =>
        page.$eval(SELECTORS.ITEM.img, (t) => (t as HTMLImageElement)?.src),
      );

      postItem(
        {
          img,
          author,
          description,
          title,
          details: itemDetails,
          price,
          recoPrice,
        },
        {},
      );
    });

    process.abort();
    throw new Error("bye bye");

    await page.goBack();
    await page.waitForNavigation();
  });

  return await afterAll(async ({ saveAsJson }) => {
    await saveAsJson(resolve(__dirname, "../../../data"), "amazon");
  });
};

export default A;
