import type { CustomError, Meta, FullObject } from ".";

export interface ItemMeta<T extends FullObject = FullObject> extends Meta {
  isComplete: boolean;
  completion: number;
  emptyFields?: (keyof T)[];
  errors?: (CustomError | string)[];
}

export type ItemData<T extends FullObject = FullObject> = T & FullObject;

export type Item<T extends FullObject = FullObject> = ItemData<T>;
