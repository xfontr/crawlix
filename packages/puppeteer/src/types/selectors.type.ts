import type { FullObject } from "@scraper/core";

export interface Selectors extends FullObject {
  cookies?: string;
  nextPage?: string;
  item?: Record<
    string,
    {
      selector: string;
      attribute: "textContent" | "src" | "href";
    }
  >;
  allItems?: string;
}
