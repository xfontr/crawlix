import { useAction, useLocationStore, useSession } from "@crawlix/core";
import {
  saveSession,
  scrapPage,
  scrapList,
  scrapItem,
  forceNavigate,
} from "@crawlix/puppeteer";
import { resolve } from "path";
import initSelectors from "./selectors.init";

const main = async () => {
  const { $a } = useAction();
  const { afterAll } = useSession().run();

  initSelectors();

  const firstLocation = useLocationStore().current.history.at(-1)!.url;

  afterAll(saveSession(resolve(__dirname, "./data/", "last-session")));

  await $a("Navigate to offset page", async () => {
    const afterNavigation = forceNavigate(firstLocation);

    await afterNavigation(() =>
      scrapPage(() => scrapList((item) => scrapItem(item))),
    );
  });
};

export default main;
