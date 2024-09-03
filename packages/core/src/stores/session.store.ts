import type { Session, SessionStore } from "../types";
import { createStore } from "../utils/stores";
import {
  useRuntimeConfigStore,
  useLocationStore,
  useItemStore,
  useActionStore,
} from ".";
import { generateTimestamp, getMeta } from "../utils/metaData";

const useSessionStore = createStore(
  "session",
  {
    status: "IDLE",
  } as Partial<SessionStore> & Required<Pick<SessionStore, "status">>,
  (state) => {
    const { getCurrentLocation, current } = useLocationStore();
    const {
      isMinimal,
      isRelational,
      current: {
        public: {
          successCompletionRate,
          offset: { index },
        },
      },
    } = useRuntimeConfigStore();

    const init = (): void => {
      if (state.status !== "READY") {
        throw new Error(
          `Session is not ready to be started. This could mean that the consumer hasn't set up the app yet,
          or that it tried to instantiate the session more than once`,
        );
      }

      state.status = "IN_PROGRESS";

      const startLocation = current.history[0]!;
      const { action: lastAction } = useActionStore().current;

      if (!isMinimal()) state.id = getMeta().id;
      state.startLocation = {
        id: startLocation.id,
        timestamp: startLocation.timestamp,
        lastAction: isRelational() ? lastAction.id : lastAction,
      };
    };

    const ready = (): void => {
      state.status = "READY";
    };

    const isIDLE = (): boolean => state.status === "IDLE";

    const isSessionComplete = (): boolean => {
      const { fullyCompleteItemsRate } = useItemStore().current;

      return successCompletionRate >= fullyCompleteItemsRate;
    };

    const end = (status?: Session["status"]): void => {
      state.status = status ?? isSessionComplete() ? "SUCCESS" : "INCOMPLETE";
      state.endLocation = getCurrentLocation();
      const lastItem = useItemStore().current.totalItems;

      state.duration = generateTimestamp(
        current.history[0]!.date,
        getCurrentLocation(true).date,
      );

      state.itemRange = [index, lastItem + index];
    };

    const isSessionOver = (): boolean =>
      state.status !== "IDLE" && state.status !== "IN_PROGRESS";

    const isInProgress = (): boolean => state.status === "IN_PROGRESS";

    return { init, isIDLE, isInProgress, ready, end, isSessionOver };
  },
);

export default useSessionStore;
