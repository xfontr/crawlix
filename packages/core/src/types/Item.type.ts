import type { LocationStamp } from "./Location.type";
import type { Meta } from "./Meta.type";
import type { FullObject } from "./Object.type";

export type ItemErrors<T extends FullObject = FullObject> = Record<
  keyof T,
  string
>[];

export interface ItemMeta extends Meta {
  location: LocationStamp;
  isComplete: boolean;
  completion: number;
  itemErrors?: ItemErrors;
}

export type ItemData<T extends FullObject = FullObject> = T & FullObject;

export type Item<T extends FullObject = FullObject> = {
  _meta?: ItemMeta;
} & ItemData<T>;
