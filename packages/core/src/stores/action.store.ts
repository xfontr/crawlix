import type {
  ActionAsyncData,
  ActionData,
  ActionStore,
  ActionSyncInstance,
} from "../types";
import { createStore } from "../utils/stores";
import { generateId } from "../utils/utils";
import { useLocationStore, useLogStore, useSessionStore } from ".";

const useActionStore = createStore(
  "action",
  {
    totalActions: 0,
    totalMockedPausesDuration: 0,
    actionLog: [],
    action: {} as ActionSyncInstance,
  } as ActionStore,
  (state) => {
    const initAction = (action: ActionData, log?: boolean) => {
      let _tempSyncAction: ActionSyncInstance | undefined = undefined;

      if (useSessionStore().isIDLE()) {
        throw new Error(
          "Cannot execute actions before initializing the session",
        );
      }

      state.totalActions += 1;
      state.totalMockedPausesDuration += action.mockedDuration ?? 0;

      const id = generateId();

      _tempSyncAction = {
        index: state.totalActions,
        location: useLocationStore().getCurrentLocation(),
        id,
        ...action,
      };

      state.action = _tempSyncAction;

      useLogStore().logAction(_tempSyncAction, log);

      return (asyncAction: ActionAsyncData): void => {
        state.actionLog.push({
          ..._tempSyncAction!,
          ...asyncAction,
        });
      };
    };

    return { initAction };
  },
);

export default useActionStore;