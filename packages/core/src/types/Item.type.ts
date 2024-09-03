import { CustomError } from "./Error.type";
import type { LocationStamp } from "./Location.type";
import type { Meta } from "./Meta.type";
import type { FullObject } from "./Object.type";

export interface ItemMeta<T extends FullObject = FullObject> extends Meta {
  location: LocationStamp;
  isComplete: boolean;
  completion: number;
  emptyFields?: (keyof T)[];
  errors?: (CustomError | string)[];
}

export type ItemData<T extends FullObject = FullObject> = T & FullObject;

export type Item<T extends FullObject = FullObject> = {
  _meta?: ItemMeta<T>;
} & ItemData<T>;
