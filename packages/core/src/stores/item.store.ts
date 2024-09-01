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
import { ASCII_CHARS, WHITE_SPACES } from "../configs/constants";

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

    const initItem = <T extends FullObject>(
      attributes: Partial<ItemData<T>> = {},
    ) => {
      const itemInProgress = { value: attributes };

      return {
        addAttribute: (attributes: Partial<ItemData<T>>): void => {
          itemInProgress.value = {
            ...itemInProgress.value,
            ...structuredClone(
              Object.entries(attributes).reduce(
                (all, [key, value]) => ({
                  ...all,
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  [key]:
                    typeof value === "string"
                      ? value
                          .replace(ASCII_CHARS, "")
                          .replace(WHITE_SPACES, " ")
                          .trim()
                      : value,
                }),
                {},
              ),
            ),
          };
        },
        post: (): void => {
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
        },
      };
    };

    return { initItem };
  },
);

export default useItemStore;
