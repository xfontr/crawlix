import { randomUUID } from "crypto";
import type { ItemMeta, FullItem, Item } from "../../types/Item";

export const mockItemWithoutMeta: Item = {
  author: "tester",
  categories: "one",
  posted: new Date().toString(),
  title: "test",
};

export const mockItemMeta: { _meta: ItemMeta } = {
  _meta: {
    errorLog: {},
    id: randomUUID(),
    complete: true,
    itemNumber: 0,
    moment: 100,
    page: 1,
    posted: new Date(),
    url: "www.test.com",
  },
};

export const mockItem: FullItem = {
  ...mockItemWithoutMeta,
  ...mockItemMeta,
} as FullItem;
