import { tryCatch } from "@personal/utils";
import { Page, launch } from "puppeteer";
import EventBus from "../utils/EventBus";

const Puppeteer = async (): Promise<Page | void> => {
  const [page, error] = await tryCatch<Page>(async () => {
    const browser = await launch({ headless: "new" });
    return await browser.newPage();
  });

  if (error) {
    EventBus.emit("SESSION:ERROR", error, true);
    return;
  }

  return page;
};

export default Puppeteer;
