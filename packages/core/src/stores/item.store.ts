import type {
  CustomError,
  FullObject,
  Item,
  ItemData,
  ItemStore,
} from "../types";
import { createStore } from "../utils/stores";
import { cleanUpIfText, getPercentage } from "../utils/utils";
import { buildItemMeta } from "../utils/itemMetaData";
import { useLocationStore, useRuntimeConfigStore } from ".";

const useItemStore = createStore(
  "item",
  {
    totalItems: 0,
    incompleteItems: 0,
    fullyCompleteItemsRate: 0, // If 0, it's as if it was disabled
    currentRef: undefined,
    currentRefErrors: undefined,
    items: [],
  } as ItemStore,
  (state) => {
    const { getCurrentLocation, sumItem } = useLocationStore();
    const {
      current: { public: config },
      isRelational,
    } = useRuntimeConfigStore();

    const initItem = <T extends FullObject = FullObject>(
      attributes: Partial<ItemData<T>> = {},
      /**
       * @description Fields that if empty will be used to determine the item completion rate.
       * If unset, every field will be marked as required
       */
      required?: (keyof T)[],
    ) => {
      state.currentRef = structuredClone(attributes);
      state.currentRefErrors = [];

      return {
        addAttribute: (attributes: Partial<ItemData<T>>): void => {
          state.currentRef = {
            ...state.currentRef,
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

          const meta = buildItemMeta<T>(
            state.totalItems + config.offset.index,
            state as unknown as ItemStore<T>,
            getCurrentLocation(),
            config.output.itemWithMetaLayer,
            required,
          );

          const item: Item<T> = {
            ...(state.currentRef as ItemData<T>),
            ...(config.output.itemWithMetaLayer ? { _meta: meta } : meta),
          };

          state.items.push(item as unknown as Item);

          state.currentRef = undefined;
          state.currentRefErrors = undefined;

          sumItem();

          if (meta.isComplete) return;

          state.incompleteItems += 1;
          state.fullyCompleteItemsRate = getPercentage(
            state.totalItems,
            state.incompleteItems,
          );
        },
      };
    };

    const logItemError = (error: CustomError) => {
      if (!state.currentRef || !state.currentRefErrors) return;

      state.currentRefErrors.push(
        isRelational() ? error.id! : structuredClone(error),
      );
    };

    return { initItem, logItemError };
  },
);

export default useItemStore;
