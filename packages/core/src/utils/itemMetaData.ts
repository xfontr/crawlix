import type {
  FullObject,
  ItemData,
  ItemMeta,
  ItemStore,
  LocationStamp,
} from "../types";
import { getItemMeta } from "./metaData";
import { getPercentage } from "./utils";

const computeEmptyFields = <T extends FullObject>(
  itemInProgress: Partial<ItemData<T>>,
  required?: (keyof T)[],
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
  index: number,
  { currentRef, currentRefErrors }: ItemStore<T>,
  location: LocationStamp,
  withMetaLayer: boolean,
  required?: (keyof T)[],
) => {
  const emptyFields = computeEmptyFields<T>(currentRef!, required);
  const { completion, isComplete } = computeCompletion(
    currentRef!,
    emptyFields,
  );

  const meta: ItemMeta<T> = getItemMeta(index, {
    location,
    isComplete,
    completion,
    ...(currentRefErrors?.length ? { errors: currentRefErrors } : {}),
    ...(emptyFields.length ? { emptyFields } : {}),
  });

  if (withMetaLayer) return meta;

  return Object.entries(meta).reduce(
    (metaValues, [key, value]) => ({
      ...metaValues,
      [key]: `_${value as string}`,
    }),
    {} as ItemMeta,
  );
};
