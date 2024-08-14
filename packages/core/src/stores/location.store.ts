import type {
  LocationData,
  LocationInstance,
  LocationStamp,
  LocationStore,
} from "../types";
import { createStore } from "../utils/stores";
import EventBus from "../utils/EventBus";
import {
  generateDate,
  generateId,
  generateTimestamp,
  stringifyWithKeys,
} from "../utils/utils";
import { useRuntimeConfigStore, useLogStore, useActionStore } from ".";

const useLocationStore = createStore(
  "location",
  {
    totalLocations: 0,
    history: [],
  } as LocationStore,
  (state) => {
    const handleMaxPage = (currentPage: number): void => {
      const { page } = useRuntimeConfigStore().current.public.limit;

      if (page === currentPage) EventBus.emit("SESSION:END");
    };

    const getCurrentLocation = <FullInstance extends boolean = false>(
      fullInstance?: boolean,
    ) => {
      const lastLocation = state.history.at(-1);

      if (!lastLocation) {
        throw new Error(
          "Tried to get current location without having pushed any location first",
        );
      }

      return {
        id: lastLocation.id,
        timestamp: generateTimestamp(),
        lastActionId: useActionStore().current.action.id,
        ...(fullInstance ? lastLocation : {}),
      } as FullInstance extends true ? LocationInstance : LocationStamp;
    };

    const pushLocation = (
      location?:
        | Partial<LocationData>
        | ((current: Omit<LocationData, "name">) => Partial<LocationData>),
      forceLog?: boolean,
    ): void => {
      const { id: actionId } = useActionStore().current.action;
      const { logging } = useRuntimeConfigStore().current.public;

      state.totalLocations += 1;

      const { page: lastPage, url: lastUrl } = getCurrentLocation<true>(true);

      if (typeof location === "function")
        location = location({ page: lastPage, url: lastUrl });

      const id = generateId();
      const page = location?.page ?? lastPage;
      const url = location?.url ?? lastUrl;

      state.history.push({
        id,
        name: location?.name ?? "",
        url,
        page,
        errors: [],
        index: state.totalLocations,
        timestamp: generateTimestamp(),
        date: generateDate(),
        lastActionId: actionId,
      });

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      if (forceLog || logging.locationUpdate) {
        const { pushLog } = useLogStore();

        pushLog({
          name: location?.name
            ? `[LOCATION UPDATE] ${location.name}`
            : "[LOCATION UPDATE]",
          message: stringifyWithKeys({
            id,
            page: location?.page,
            url: location?.url,
          }),
          type: "INFO",
        });
      }

      handleMaxPage(page);
    };

    const logLocationError = (errorId: string): void => {
      state.history.at(-1)?.errors.push(errorId);
    };

    return {
      logLocationError,
      getCurrentLocation,
      pushLocation,
    };
  },
);

export default useLocationStore;
