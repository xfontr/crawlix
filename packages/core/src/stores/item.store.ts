import type {
  CustomError,
  FullObject,
  Item,
  ItemData,
  ItemStore,
} from "../types";
import { createStore } from "../helpers";
import { cleanUpIfText, getPercentage } from "../utils";
import { useLocationStore, useRuntimeConfigStore } from ".";
import { useMeta } from "../hooks";
import EventBus from "../utils/EventBus";

const useItemStore = createStore(
  "item",
  {
    totalItems: 0,
    incompleteItems: 0,
    fullyCompleteItemsRate: 0,
    currentRef: undefined,
    currentRefErrors: undefined,
    items: [],
  } as ItemStore,
  (state) => {
    const { sumItem } = useLocationStore();
    const { limit } = useRuntimeConfigStore().current.public;

    const checkIfMaxItem = () => {
      if (state.totalItems !== limit.items) return;

      EventBus.endSession.emit();
    };

    const initItem = <T extends FullObject = FullObject>(
      attributes: Partial<ItemData<T>> = {},
      /**
       * @description Fields that if empty will be used to determine the item completion rate.
       * If unset, every field will be marked as required
       */
      required?: (keyof Partial<T>)[],
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

          const meta = useMeta().getItemMeta<T>(
            state as unknown as ItemStore<T>,
            required,
          );

          const item: Item<T> = {
            ...(state.currentRef as ItemData<T>),
            ...meta,
          };

          state.items.push(item);

          state.currentRef = undefined;
          state.currentRefErrors = undefined;

          sumItem();

          if (limit.items) checkIfMaxItem();

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

      state.currentRefErrors.push(error.id!);
    };

    return { initItem, logItemError };
  },
);

export default useItemStore;
