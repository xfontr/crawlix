import type { FullObject } from "@crawlix/core";

export type SelectorModel = {
  selector: string | string[];
  /**
   * @description When automatically scraping items, if set as true, selects all items
   * with a matching selector
   */
  selectAll?: boolean;
  attribute?: "textContent" | "src" | "href";
  skip?: boolean;
};

export type SingleSelectorModel = SelectorModel & { selector: string };

export type Selector = SelectorModel | string | string[];

export interface Selectors<T extends FullObject = FullObject>
  extends FullObject {
  /**
   * @description Get all elements with a given selector. These will be scraped
   * individually after
   */
  allItems?: string;
  /**
   * @description Cookies accept button. If set, tries to find and click it
   */
  cookies?: string;
  /**
   * @description Next page button. If set, tries to find and click it
   */
  nextPage?: string;
  /**
   * @description Item fields
   */
  item?: Record<string, Selector> & Record<keyof T, Selector>;
}
