import type {
  ActionAsyncData,
  ActionData,
  ActionStore,
  ActionSyncInstance,
  CustomError,
} from "../types";
import { createStore } from "../helpers/stores";
import { useLogStore, useSessionStore } from ".";
import useMeta from "../hooks/useMeta";

const useActionStore = createStore(
  "action",
  {
    totalActions: 0,
    totalMockedPausesDuration: 0,
    actionLog: [],
    currentRef: undefined as unknown as ActionSyncInstance,
  } as ActionStore,
  (state) => {
    const initAction = (action: ActionData, log?: boolean) => {
      if (useSessionStore().isIDLE()) {
        throw new Error(
          "Cannot execute actions before initializing the session",
        );
      }

      state.totalActions += 1;
      state.totalMockedPausesDuration += action.mockedDuration ?? 0;

      state.currentRef = structuredClone(action);
      const { addAsyncMeta, syncMeta } = useMeta().getActionMeta(state);

      state.currentRef = {
        ...state.currentRef,
        ...syncMeta,
      };

      useLogStore().logAction(state.currentRef as ActionSyncInstance, log);

      return ({
        duration,
        error,
      }: ActionAsyncData & { error?: CustomError }): void => {
        state.actionLog.push({
          ...(state.currentRef as ActionSyncInstance),
          duration,
          ...addAsyncMeta(error),
        });
      };
    };

    return { initAction };
  },
);

export default useActionStore;
