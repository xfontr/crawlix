import { randomUUID } from "crypto";
import { DefaultItem } from "../../..";

export const mockItemWithoutMeta: Omit<DefaultItem, "_meta"> = {
  author: "tester",
  categories: ["one"],
  posted: new Date().toString(),
  title: "test",
  _meta: {},
};

export const mockItem: DefaultItem = {
  ...mockItemWithoutMeta,
  _meta: {
    errorLog: {},
    id: randomUUID(),
    complete: true,
    itemNumber: 0,
    moment: 100,
    page: 1,
    posted: new Date(),
    selector: "h3",
    url: "www.test.com",
  },
};
