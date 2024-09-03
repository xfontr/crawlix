import type {
  CustomError,
  LocationData,
  LocationInstance,
  LocationStamp,
  LocationStore,
} from "../types";
import { createStore } from "../utils/stores";
import EventBus from "../utils/EventBus";
import { useRuntimeConfigStore, useLogStore, useActionStore } from ".";
import { generateDate, generateTimestamp, getMeta } from "../utils/metaData";

const useLocationStore = createStore(
  "location",
  {
    totalLocations: 0,
    history: [],
  } as LocationStore,
  (state) => {
    const { isRelational } = useRuntimeConfigStore();

    const handleMaxPage = (currentPage: number): void => {
      const { page } = useRuntimeConfigStore().current.public.limit;

      if (page === currentPage) EventBus.endSession.emit();
    };

    const getCurrentLocation = <FullInstance extends boolean = false>(
      fullInstance?: FullInstance,
    ) => {
      const { action: lastAction } = useActionStore().current;
      const lastLocation = state.history.at(-1);

      if (!lastLocation) {
        throw new Error(
          "Tried to get current location without having pushed any location first",
        );
      }

      return {
        id: lastLocation.id,
        timestamp: generateTimestamp(state.history[0]!.date),
        lastAction: isRelational() ? lastAction.id : lastAction,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ...(fullInstance || !isRelational() ? lastLocation : {}),
      } as FullInstance extends true ? LocationInstance : LocationStamp;
    };

    const pushLocation = (
      location?:
        | Partial<LocationData>
        | ((current: Omit<LocationData, "name">) => Partial<LocationData>),
      log?: boolean,
    ) => {
      const { action: lastAction } = useActionStore().current;

      state.totalLocations += 1;

      if (typeof location === "function") {
        const { page, url } = getCurrentLocation(true);
        location = location({ page, url });
      }

      const date = generateDate();

      const finalLocation: LocationInstance = {
        ...getMeta(state.totalLocations),
        name: location?.name ?? "",
        url: location?.url ?? getCurrentLocation(true).url,
        page: location?.page ?? getCurrentLocation(true).page,
        timestamp: generateTimestamp(state.history[0]?.date ?? date, date),
        date,
        lastAction: isRelational() ? lastAction.id : lastAction,
      };

      state.history.push(finalLocation);

      useLogStore().logLocation(finalLocation, log);

      handleMaxPage(finalLocation.page);
    };

    const logLocationError = (customError: CustomError): void => {
      const lastLocation = state.history.at(-1)!;
      const error = isRelational() ? customError.id : customError;

      if (!lastLocation.errors) lastLocation.errors = [];

      lastLocation.errors.push(structuredClone(error!));
    };

    const sumItem = () => {
      const lastLocation = state.history.at(-1)!;

      lastLocation.itemCount = lastLocation.itemCount
        ? lastLocation.itemCount + 1
        : 0;
    };

    return {
      logLocationError,
      getCurrentLocation,
      pushLocation,
      sumItem,
    };
  },
);

export default useLocationStore;
