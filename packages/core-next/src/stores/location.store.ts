import type { LocationData, LocationInstance } from "../types/Location.type";
import type { LocationStore } from "../types/Store.type";
import { clone, generateId, generateTimestamp } from "../utils/utils";
import useActionStore from "./action.store";

const state: LocationStore = {
  totalLocations: 0,
  history: [],
};

const useLocationStore = () => {
  const getCurrentLocation = (): LocationInstance => {
    const lastLocation = state.history.at(-1);

    if (!lastLocation) {
      throw new Error(
        "Tried to get current location without having pushed any location first",
      );
    }

    return {
      ...lastLocation,
      timestamp: generateTimestamp(),
    };
  };

  const pushLocation = (location?: Partial<LocationData>): void => {
    const { depth: actionDepth, index: actionIndex } =
      useActionStore().getAction();

    state.totalLocations += 1;

    state.history.push({
      actionIndex,
      actionDepth,
      errors: [],
      index: state.totalLocations,
      timestamp: generateTimestamp(),
      id: generateId(),
      page: location?.page ?? getCurrentLocation().page,
      url: location?.url ?? getCurrentLocation().url,
      name: location?.name ?? "",
    });
  };

  const logLocationError = (errorId: string): void => {
    state.history.at(-1)?.errors.push(errorId);
  };

  const getLocationHistory = (): LocationStore["history"] =>
    clone(state.history);

  const output = (): LocationStore => clone(state);

  return {
    logLocationError,
    getCurrentLocation,
    pushLocation,
    getLocationHistory,
    output,
  };
};

export default useLocationStore;
