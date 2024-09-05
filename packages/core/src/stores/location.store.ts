import type {
  CustomError,
  LocationData,
  LocationInstance,
  LocationStamp,
  LocationStore,
} from "../types";
import { createStore } from "../helpers/stores";
import EventBus from "../utils/EventBus";
import { useRuntimeConfigStore, useLogStore } from ".";
import { useMeta } from "../hooks";

const useLocationStore = createStore(
  "location",
  {
    totalLocations: 0,
    history: [],
    currentRef: undefined,
  } as LocationStore,
  (state) => {
    const { isRelational, isMinimal } = useRuntimeConfigStore();
    const { getLocationMeta } = useMeta();

    const handleMaxPage = (currentPage: number): void => {
      const { page } = useRuntimeConfigStore().current.public.limit;

      if (page === currentPage) EventBus.endSession.emit();
    };

    const getCurrentLocation = <FullInstance extends boolean = false>(
      fullInstance?: FullInstance,
    ) => {
      if (!state.currentRef)
        throw new Error("[LOCATION] No initial location found");

      const { timestamp, lastAction } = getLocationMeta(state);

      return {
        id: state.currentRef.id,
        ...(timestamp ? { timestamp } : {}),
        ...(lastAction ? { lastAction } : {}),
        ...(fullInstance ? state.currentRef : {}),
      } as FullInstance extends true ? LocationInstance : LocationStamp;
    };

    const pushLocation = (
      location?:
        | Partial<LocationData>
        | ((current: Omit<LocationData, "name">) => Partial<LocationData>),
      log?: boolean,
    ) => {
      state.totalLocations += 1;

      if (typeof location === "function") {
        const { page, url } = getCurrentLocation(true);
        location = location({ page, url });
      }

      state.currentRef = {
        ...getLocationMeta(state),
        name: location?.name ?? "",
        url: location?.url ?? getCurrentLocation(true).url,
        page: location?.page ?? getCurrentLocation(true).page,
      };

      state.history.push(state.currentRef);

      useLogStore().logLocation(state.currentRef, log);

      handleMaxPage(state.currentRef.page);
    };

    const logLocationError = (customError: CustomError): void => {
      if (isMinimal()) return;

      const error = isRelational() ? customError.id : customError;

      const lastLocation = state.history.at(-1)!;

      if (!lastLocation.errors) lastLocation.errors = [];

      lastLocation.errors.push(structuredClone(error!));
    };

    const sumItem = () => {
      if (!state.currentRef) return;

      state.currentRef.itemCount = state.currentRef.itemCount
        ? state.currentRef.itemCount + 1
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
