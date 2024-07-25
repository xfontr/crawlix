import type { FullObject } from "../types/Object.type";
import type { ItemData, ItemErrors, ItemMeta } from "../types/Item.type";
import type { ItemStore } from "../types/Store.type";
import { clone, generateId, getPercentage } from "../utils/utils";
import useLocationStore from "./location.store";

const state: ItemStore = {
  totalItems: 0,
  incompleteItems: 0,
  fullyCompleteItemsRate: 0, // If 0, it's as if it was disabled
  items: [],
};

const useItemStore = () => {
  const { getCurrentLocation } = useLocationStore();

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

    const completion = getPercentage(totalAttributes, totalErrors);
    const isComplete = completion === 100;

    return { isComplete, completion };
  };

  const pushItem = <T extends FullObject>() => {
    const itemInProgress = { value: {} as Partial<ItemData<T>> };

    return (attributes: Partial<ItemData<T>>) => {
      itemInProgress.value = {
        ...itemInProgress.value,
        ...attributes,
      };

      return (): void => {
        state.totalItems += 1;

        const itemErrors = computeErrors(itemInProgress.value);
        const { completion, isComplete } = computeCompletion(
          itemInProgress.value,
          itemErrors,
        );

        state.items.push({
          ...(itemInProgress.value as ItemData<T>),
          _meta: {
            id: generateId(),
            index: state.totalItems,
            location: getCurrentLocation(),
            itemErrors,
            isComplete,
            completion,
          },
        });

        if (!isComplete) {
          state.incompleteItems += 1;
          state.fullyCompleteItemsRate = getPercentage(
            state.totalItems,
            state.incompleteItems,
          );
        }
      };
    };
  };

  const getItemsStatus = (): Omit<ItemStore, "items"> => ({
    fullyCompleteItemsRate: state.fullyCompleteItemsRate,
    incompleteItems: state.incompleteItems,
    totalItems: state.totalItems,
  });

  const output = (): ItemStore => clone(state);

  return {
    pushItem,
    getItemsStatus,
    output,
  };
};

export default useItemStore;
