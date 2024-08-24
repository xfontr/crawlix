import type {
  LocationData,
  LocationInstance,
  LocationStamp,
  LocationStore,
} from "../types";
import { createStore } from "../utils/stores";
import EventBus from "../utils/EventBus";
import { generateDate, generateId, generateTimestamp } from "../utils/utils";
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
      log?: boolean,
    ): void => {
      const { id: actionId } = useActionStore().current.action;

      state.totalLocations += 1;

      if (typeof location === "function") {
        const { page, url } = getCurrentLocation<true>(true);
        location = location({ page, url });
      }

      const finalLocation: LocationInstance = {
        id: generateId(),
        name: location?.name ?? "",
        url: location?.url ?? getCurrentLocation<true>(true).url,
        page: location?.page ?? getCurrentLocation<true>(true).page,
        errors: [],
        index: state.totalLocations,
        timestamp: generateTimestamp(),
        date: generateDate(),
        lastActionId: actionId,
      };

      state.history.push(finalLocation);

      useLogStore().logLocation(finalLocation, log);

      handleMaxPage(finalLocation.page);
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
