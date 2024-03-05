import Scraper from "./HL.init";

const HL = async () => {
  const { run, afterAll } = await Scraper();

  await run(async ({ page, moveMouse }) => {
    const elements: [number, number][] = await page.$$eval(
      "#headline-2065-7323",
      (e) =>
        e.map((a) => {
          const { y, x } = a.getBoundingClientRect();
          return [y, x] as [number, number];
        }),
    );

    console.log(performance.now());
    const result = await moveMouse(elements[0]!, elements[1], {
      clickWhenDone: true,
    });
    console.log(performance.now());

    return result;
  });

  await afterAll(({ store }) => {
    console.log(store().errorLog);
  });
};

export default HL;
