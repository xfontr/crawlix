import { Session } from "../types/Session.type";
import { SessionStore } from "../types/Store.type";
import { clone, generateId } from "../utils/utils";
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
  };

  const ready = (): void => {
    state.status = "READY";
  };

  const isIDLE = (): boolean => state.status === "IDLE";

  const isSessionComplete = (): boolean => {
    const { completionRateToSuccess } =
      useRuntimeConfigStore().getRuntimeConfig();
    const { fullyCompleteItemsRate } = useItemStore().getItemsStatus();

    return completionRateToSuccess >= fullyCompleteItemsRate;
  };

  const end = (status?: Session["status"]): void => {
    const isComplete = isSessionComplete();

    state.id = generateId();
    state.status = status ?? isComplete ? "SUCCESS" : "INCOMPLETE";
    state.startLocation = getLocationHistory()[0]!;
    state.endLocation = getCurrentLocation();
  };

  const isSessionOver = (): boolean =>
    state.status !== "IDLE" && state.status !== "IN_PROGRESS";

  const isInProgress = (): boolean => state.status === "IN_PROGRESS";

  const output = (): SessionStore => clone(state as SessionStore);

  return { init, isIDLE, isInProgress, ready, end, isSessionOver, output };
};

export default useSessionStore;
