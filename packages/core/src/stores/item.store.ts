import type {
  FullObject,
  ItemData,
  ItemErrors,
  ItemMeta,
  ItemStore,
} from "../types";
import { createStore } from "../utils/stores";
import { generateId, getPercentage } from "../utils/utils";
import { useLocationStore } from ".";

const useItemStore = createStore(
  "item",
  {
    totalItems: 0,
    incompleteItems: 0,
    fullyCompleteItemsRate: 0, // If 0, it's as if it was disabled
    items: [],
  } as ItemStore,
  (state) => {
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

      const completion = getPercentage(totalErrors, totalAttributes);

      const isComplete = completion === 100;

      return { isComplete, completion };
    };

    const pushItem = <T extends FullObject>() => {
      const itemInProgress = { value: {} as Partial<ItemData<T>> };

      return (attributes: Partial<ItemData<T>>) => {
        itemInProgress.value = {
          ...itemInProgress.value,
          ...structuredClone(attributes),
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

          itemInProgress.value = {};

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

    return {
      pushItem,
    };
  },
);

export default useItemStore;
