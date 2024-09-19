import type { FullObject } from "@scraper/core";

export type SelectorModel = {
  selector: string | string[];
  selectAll?: boolean;
  attribute?: "textContent" | "src" | "href";
  skip?: boolean;
  clean?: (element: any) => any;
};

export type SingleSelectorModel = SelectorModel & { selector: string };

export type Selector = SelectorModel | string | string[];

export interface Selectors extends FullObject {
  cookies?: string;
  nextPage?: string;
  item?: Record<string, Selector>;
  allItems?: string;
}
