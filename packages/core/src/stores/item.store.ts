import type { FullObject, ItemData, ItemStore } from "../types";
import { createStore } from "../utils/stores";
import { cleanUpIfText, getPercentage } from "../utils/utils";
import { getItemMeta } from "../utils/itemUtils";
import { useLocationStore, useRuntimeConfigStore } from ".";

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
    const { public: config } = useRuntimeConfigStore().current;

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
                  [key]: cleanUpIfText(value),
                }),
                {},
              ),
            ),
          };
        },
        post: (): void => {
          state.totalItems += 1;

          const meta = getItemMeta(
            state.totalItems + config.offset.index,
            itemInProgress.value,
            getCurrentLocation(),
            config.output.itemWithMetaLayer,
          );

          state.items.push({
            ...(itemInProgress.value as ItemData<T>),
            ...(config.output.itemWithMetaLayer
              ? {
                  _meta: meta,
                }
              : meta),
          });

          itemInProgress.value = {};

          if (meta.isComplete) return;

          state.incompleteItems += 1;
          state.fullyCompleteItemsRate = getPercentage(
            state.totalItems,
            state.incompleteItems,
          );
        },
      };
    };

    return { initItem };
  },
);

export default useItemStore;
