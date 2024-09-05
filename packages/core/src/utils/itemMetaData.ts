import type { FullObject, ItemData, ItemMeta, ItemStore } from "../types";
import { getPercentage } from "./utils";

const computeEmptyFields = <T extends FullObject>(
  itemInProgress: Partial<ItemData<T>>,
  required?: (keyof Partial<T>)[],
): NonNullable<ItemMeta<T>["emptyFields"]> =>
  Object.keys(itemInProgress).flatMap((attribute) => {
    if (!required) return itemInProgress[attribute] ? [] : attribute;
    return required.includes(attribute) && !itemInProgress[attribute]
      ? attribute
      : [];
  });

const computeCompletion = <T extends FullObject>(
  itemInProgress: Partial<ItemData<T>>,
  emptyFields: NonNullable<ItemMeta<T>["emptyFields"]>,
): Pick<ItemMeta, "completion"> & Pick<ItemMeta, "isComplete"> => {
  const { length: totalAttributes } = Object.keys(itemInProgress);

  const completion = getPercentage(emptyFields.length, totalAttributes);

  const isComplete = completion === 100;

  return { isComplete, completion };
};

export const buildItemMeta = <T extends FullObject>(
  { currentRef, currentRefErrors }: ItemStore<T>,
  required?: (keyof Partial<T>)[],
): ItemMeta<T> => {
  const emptyFields = computeEmptyFields<T>(currentRef!, required);
  const { completion, isComplete } = computeCompletion(
    currentRef!,
    emptyFields,
  );

  return {
    isComplete,
    completion,
    ...(currentRefErrors?.length ? { errors: currentRefErrors } : {}),
    ...(emptyFields.length ? { emptyFields } : {}),
  };
};
