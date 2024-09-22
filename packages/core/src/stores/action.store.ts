import type {
  ActionAsyncData,
  ActionData,
  ActionStore,
  ActionSyncInstance,
  CustomError,
} from "../types";
import { createStore } from "../helpers";
import { useLogStore, useSessionStore } from ".";
import { useMeta } from "../hooks";

const useActionStore = createStore(
  "action",
  {
    totalActions: 0,
    totalMockedPausesDuration: 0,
    actionLog: [],
    currentRef: undefined as unknown as ActionSyncInstance,
  } as ActionStore,
  (state) => {
    const initAction = (action: ActionData, forceLog?: boolean) => {
      if (useSessionStore().isIDLE()) {
        throw new Error(
          "Cannot execute actions before initializing the session",
        );
      }

      state.totalActions += 1;
      state.totalMockedPausesDuration += action.mockedDuration;
      state.totalMockedPausesDuration.toFixed(2);

      const { name, ...current } = structuredClone(action);

      state.currentRef = { name } as ActionSyncInstance;

      const { addAsyncMeta, syncMeta } = useMeta().getActionMeta(
        state,
        current,
      );

      state.currentRef = { ...state.currentRef, ...syncMeta };
      let _temp = state.currentRef;
      useLogStore().logAction(state.currentRef as ActionSyncInstance, forceLog);

      return ({
        duration,
        error,
      }: ActionAsyncData & { error?: CustomError }): void => {
        state.actionLog.push({
          ..._temp,
          duration,
          ...addAsyncMeta(error),
        });

        _temp = undefined as unknown as ActionSyncInstance;
      };
    };

    return { initAction };
  },
);

export default useActionStore;
