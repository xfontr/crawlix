import type { Session, SessionStore } from "../types";
import { createStore } from "../utils/stores";
import { generateId, generateTimestamp } from "../utils/utils";
import {
  useRuntimeConfigStore,
  useLocationStore,
  useItemStore,
  useActionStore,
} from ".";

const useSessionStore = createStore(
  "session",
  {
    status: "IDLE",
  } as Partial<SessionStore> & Required<Pick<SessionStore, "status">>,
  (state) => {
    const { getCurrentLocation, current } = useLocationStore();

    const init = (): void => {
      if (state.status !== "READY") {
        throw new Error(
          `Session is not ready to be started. This could mean that the consumer hasn't set up the app yet,
          or that it tried to instantiate the session more than once`,
        );
      }

      state.status = "IN_PROGRESS";

      const startLocation = current.history[0]!;

      state.id = generateId();
      state.startLocation = {
        id: startLocation.id,
        timestamp: startLocation.timestamp,
        lastActionId: useActionStore().current.action.id,
      };
    };

    const ready = (): void => {
      state.status = "READY";
    };

    const isIDLE = (): boolean => state.status === "IDLE";

    const isSessionComplete = (): boolean => {
      const { successCompletionRate } = useRuntimeConfigStore().current.public;
      const { fullyCompleteItemsRate } = useItemStore().current;

      return successCompletionRate >= fullyCompleteItemsRate;
    };

    const end = (status?: Session["status"]): void => {
      state.status = status ?? isSessionComplete() ? "SUCCESS" : "INCOMPLETE";
      state.endLocation = getCurrentLocation();

      state.duration = generateTimestamp(
        current.history[0]!.date,
        getCurrentLocation<true>(true).date,
      );

      console.log(state.duration);
    };

    const isSessionOver = (): boolean =>
      state.status !== "IDLE" && state.status !== "IN_PROGRESS";

    const isInProgress = (): boolean => state.status === "IN_PROGRESS";

    return { init, isIDLE, isInProgress, ready, end, isSessionOver };
  },
);

export default useSessionStore;
