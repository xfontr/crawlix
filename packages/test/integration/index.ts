import { app } from "@crawlix/core";
import test01 from "./test01";

app.init({
  endProcess: false,
  offset: { page: 0, url: "http://localhost:3000/" },
  limit: { page: 1 },
  output: {
    include: ["action", "error", "item", "location", "session", "log"],
  },
  mockUserPause: {
    duration: 0,
    variationRange: [0, 0],
  },
  logging: { isSimple: ["USER_INPUT"], categories: ["USER_INPUT"] },
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
