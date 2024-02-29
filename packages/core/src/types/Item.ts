import { UUID } from "crypto";

type TypicalData = Partial<{
  id: string | number | undefined;
  name: string | undefined;
  title: string | undefined;
  categories: string | undefined;
  tags: string | undefined;
  description: string | undefined;
  text: string | undefined;
  author: string | undefined;
  price: string | undefined;
  img: string | undefined;
  imgAlt: string | undefined;
  posted: string | number | Date | undefined;
}>;

export type ItemExtraAttributes = Record<
  string,
  string | number | boolean | undefined
>;

export type Item<T extends ItemExtraAttributes = ItemExtraAttributes> = T &
  TypicalData;

export interface ItemMeta<T extends ItemExtraAttributes = ItemExtraAttributes> {
  /**
   * @description Automatically assigned unique ID
   */
  id: UUID;
  /**
   * @description Page where this item was found at
   */
  page: number;
  /**
   * @description Date when this item was scraped
   */
  posted: Date;
  /**
   * @description Automatically assigned number, corresponding to the latest scraped item plus one
   */
  itemNumber: number;
  /**
   * @description Moment of the session where the item was posted, counted in milliseconds
   */
  moment: number;
  /**
   * @description Whether all the elements of this items were successfully scraped or not
   */
  complete: boolean;
  /**
   * @description Object including all the item's elements where there was an error
   * @example
   * {
   *  title: "[Wrong selector] The item used an invalid selector",
   * }
   */
  errorLog: { _global?: Record<string, string> } & Record<
    keyof Partial<T>,
    string | void
  >;
  /**
   * @description The URL where the item was obtained from
   */
  url: string;
}

export type FullItem<T extends ItemExtraAttributes = ItemExtraAttributes> =
  Item<T> & {
    _meta: ItemMeta;
  };

export type UnknownItem<T = unknown, L = any> = Record<string, T> & {
  _meta?: Record<string, L>;
};
