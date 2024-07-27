import type { Session, SessionStore } from "../types";
import { clone, generateId } from "../utils/utils";
import useActionStore from "./action.store";
import useItemStore from "./item.store";
import useLocationStore from "./location.store";
import useRuntimeConfigStore from "./runtimeConfig.store";

const state: Partial<SessionStore> & Required<Pick<SessionStore, "status">> = {
  status: "IDLE",
};

const useSessionStore = () => {
  const { getCurrentLocation, getLocationHistory } = useLocationStore();

  const init = (): void => {
    if (state.status !== "READY") {
      throw new Error(
        "Session is not ready to be started. This could mean that the consumer hasn't set up the app yet, or that it tried to instantiate the session more than once",
      );
    }

    state.status = "IN_PROGRESS";

    const startLocation = getLocationHistory()[0]!;

    state.id = generateId();
    state.startLocation = {
      id: startLocation.id,
      timestamp: startLocation.timestamp,
      lastActionId: useActionStore().current().id,
    };
  };

  const ready = (): void => {
    state.status = "READY";
  };

  const isIDLE = (): boolean => state.status === "IDLE";

  const isSessionComplete = (): boolean => {
    const { completionRateToSuccess } = useRuntimeConfigStore().configs();
    const { fullyCompleteItemsRate } = useItemStore().getItemsStatus();

    return completionRateToSuccess >= fullyCompleteItemsRate;
  };

  const end = (status?: Session["status"]): void => {
    const isComplete = isSessionComplete();

    state.status = status ?? isComplete ? "SUCCESS" : "INCOMPLETE";
    state.endLocation = getCurrentLocation();
    state.duration =
      +state.endLocation.timestamp - +state.startLocation!.timestamp;
  };

  const isSessionOver = (): boolean =>
    state.status !== "IDLE" && state.status !== "IN_PROGRESS";

  const isInProgress = (): boolean => state.status === "IN_PROGRESS";

  const output = (): SessionStore => clone(state as SessionStore);

  return { init, isIDLE, isInProgress, ready, end, isSessionOver, output };
};

export default useSessionStore;
