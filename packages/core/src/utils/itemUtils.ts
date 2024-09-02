import type {
  FullObject,
  ItemData,
  ItemErrors,
  ItemMeta,
  LocationStamp,
} from "../types";
import { getMeta } from "./metaData";
import { getPercentage } from "./utils";

const computeErrors = <T extends FullObject>(
  itemInProgress: Partial<ItemData<T>>,
): ItemErrors<T> =>
  Object.keys(itemInProgress).reduce(
    (errors, key) => ({
      ...errors,
      ...(itemInProgress[key] ? {} : { [key]: "Empty field" }),
    }),
    {} as ItemErrors<T>,
  );

const computeCompletion = <T extends FullObject>(
  itemInProgress: Partial<ItemData<T>>,
  errors: ItemErrors<T>,
): Pick<ItemMeta, "completion"> & Pick<ItemMeta, "isComplete"> => {
  const { length: totalAttributes } = Object.keys(itemInProgress);
  const { length: totalErrors } = Object.keys(errors);

  const completion = getPercentage(totalErrors, totalAttributes);

  const isComplete = completion === 100;

  return { isComplete, completion };
};

export const getItemMeta = <T extends FullObject>(
  index: number,
  item: Partial<ItemData<T>>,
  location: LocationStamp,
  withMetaLayer: boolean,
) => {
  const itemErrors = computeErrors(item);
  const { completion, isComplete } = computeCompletion(item, itemErrors);

  const meta: ItemMeta = {
    ...getMeta(index),
    location,
    isComplete,
    completion,
    ...(Object.keys(itemErrors).length ? { itemErrors } : {}),
  };

  if (withMetaLayer) return meta;

  return Object.entries(meta).reduce(
    (metaValues, [key, value]) => ({
      ...metaValues,
      [key]: `_${value as string}`,
    }),
    {} as ItemMeta,
  );
};
