import type { Session, SessionStore } from "../types";
import { createStore } from "../helpers/stores";
import { useRuntimeConfigStore, useLocationStore, useItemStore } from ".";
import { useMeta } from "../hooks";
import { generateDate, generateTimestamp } from "../utils/locationUtils";

const useSessionStore = createStore(
  "session",
  {
    status: "IDLE",
  } as Partial<SessionStore> & Required<Pick<SessionStore, "status">>,
  (state) => {
    const { current } = useLocationStore();

    const init = (): void => {
      if (state.status !== "READY") {
        throw new Error(
          `Session is not ready to be started. This could mean that the consumer hasn't set up the app yet,
          or that it tried to instantiate the session more than once`,
        );
      }

      state.status = "IN_PROGRESS";

      state.startLocation = current.history[0]!;
    };

    const ready = (): void => {
      state.status = "READY";
    };

    const isIDLE = (): boolean => state.status === "IDLE";

    const isSessionComplete = (): boolean => {
      const { public: config } = useRuntimeConfigStore().current;
      const { fullyCompleteItemsRate } = useItemStore().current;

      return config.successCompletionRate >= fullyCompleteItemsRate;
    };

    const end = (status?: Session["status"]): void => {
      const { public: config } = useRuntimeConfigStore().current;
      state.status = status ?? isSessionComplete() ? "SUCCESS" : "INCOMPLETE";
      state.endLocation = useMeta().get().location!;

      state.duration = generateTimestamp(
        current.history[0]!.date,
        generateDate(),
      );

      state.itemRange = [
        config.offset.index,
        useItemStore().current.totalItems + config.offset.index,
      ];
    };

    const isSessionOver = (): boolean =>
      state.status !== "IDLE" && state.status !== "IN_PROGRESS";

    const isInProgress = (): boolean => state.status === "IN_PROGRESS";

    return { init, isIDLE, isInProgress, ready, end, isSessionOver };
  },
);

export default useSessionStore;
