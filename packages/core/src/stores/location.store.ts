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

      if (page === currentPage) EventBus.endSession.emit();
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
        timestamp: generateTimestamp(state.history[0]!.date),
        lastActionId: useActionStore().current.action.id,
        ...(fullInstance ? lastLocation : {}),
      } as FullInstance extends true ? LocationInstance : LocationStamp;
    };

    const pushLocation = (
      location?:
        | Partial<LocationData>
        | ((current: Omit<LocationData, "name">) => Partial<LocationData>),
      log?: boolean,
    ) => {
      const { id: actionId } = useActionStore().current.action;

      state.totalLocations += 1;

      if (typeof location === "function") {
        const { page, url } = getCurrentLocation<true>(true);
        location = location({ page, url });
      }

      const date = generateDate();

      const finalLocation: LocationInstance = {
        id: generateId(),
        index: state.totalLocations,
        name: location?.name ?? "",
        url: location?.url ?? getCurrentLocation<true>(true).url,
        page: location?.page ?? getCurrentLocation<true>(true).page,
        errors: [],
        timestamp: generateTimestamp(state.history[0]?.date ?? date, date),
        date,
        lastActionId: actionId,
      };

      state.history.push(finalLocation);

      useLogStore().logLocation(finalLocation, log);

      handleMaxPage(finalLocation.page);
    };

    const logLocationError = (errorId: string): void => {
      state.history.at(-1)!.errors.push(errorId);
    };

    return {
      logLocationError,
      getCurrentLocation,
      pushLocation,
    };
  },
);

export default useLocationStore;
