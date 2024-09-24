import type { FullObject } from "@crawlix/core";

export interface ScraperConfig<T extends FullObject = FullObject> {
  navigationTimeout: number;
  clickAndScrapItem: boolean;
  required?: (keyof Partial<T>)[];
}
