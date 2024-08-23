import { app } from "@scraper/core";
import test01 from "./test01";

app.init({
  endProcessIfOver: false,
  offset: { page: 0, url: "http://localhost:3000/" },
  limit: { page: 1 },
  storeContent: ["action", "error", "item", "location", "session"],
});

export const SELECTORS = {
  list: {
    element: ".element",
  },
  element: {
    title: ".element-title",
    description: ".element-data .description",
    author: ".element-data .author",
    date: ".element-data .date",
    price: ".element-data .price",
  },
  pagination: {
    nextPage: ".navigation .button.next-page",
  },
};

void (async () => {
  await test01();
})();
