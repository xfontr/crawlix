import { Selectors } from "@crawlix/puppeteer";
import Item from "../types/Item";

export const SELECTORS: Selectors<Item> = {
  cookies: "#cookies-accept-button",
  nextPage: ".next-page-button",
  item: {
    description: {
      selector: [".description > p"],
      selectAll: true,
    },
    name: ["h2.title", "h2.main-title"],
    url: {
      selector: "a",
      attribute: "href",
    },
    year: { selector: ".year", skip: true },
  },
  allItems: ".article > a",
};
