import { LocationInstance } from "./Location.type";
import { FullObject } from "./Object.type";

export type ItemErrors<T extends FullObject = FullObject> = Record<
  keyof T,
  string
>[];

export interface ItemMeta {
  id: string;
  index: number;
  location: LocationInstance;
  isComplete: boolean;
  itemErrors: ItemErrors;
  completion: number;
}

export type ItemData<T extends FullObject = FullObject> = T;

export type Item<T extends FullObject = FullObject> = {
  _meta: ItemMeta;
} & ItemData<T>;
