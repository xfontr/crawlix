import { randomUUID } from "crypto";
import { useRuntimeConfigStore } from "../stores";
import type { Meta } from "../types/Meta.type";
import type { FullObject, ItemMeta } from "../types";

const generateId = (): string => randomUUID();

export const generateTimestamp = (start: number, end?: number): number =>
  (end ?? new Date().getTime()) - new Date(start).getTime();

export const generateDate = (): number => new Date().getTime();

export const getMeta = <T>(index?: T) => {
  const { isMinimal } = useRuntimeConfigStore();

  return (
    isMinimal()
      ? {}
      : {
          id: generateId(),
          ...(index ? { index } : {}),
        }
  ) as Meta;
};

export const getItemMeta = <T, I extends FullObject>(
  index?: T,
  {
    completion,
    isComplete,
    location,
    emptyFields,
    errors,
  }: Partial<ItemMeta<I>> = {},
) => {
  const { isMinimal } = useRuntimeConfigStore();

  return {
    ...getMeta(index),
    ...(isMinimal()
      ? {}
      : {
          completion,
          isComplete,
          location,
          emptyFields,
          errors,
        }),
  } as ItemMeta<I>;
};
